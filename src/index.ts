import { renderHtml } from "./renderHtml";

interface WorkerRequest {
  url: string | URL;
  method: string;
  json?: () => Promise<any>;
  headers: Headers;
}

interface Env {
  PAYPAL_WEBHOOK_ID: string;
  PAYPAL_CLIENT_ID: string;
  PAYPAL_SECRET: string;
  BACKEND_URL?: string;
  KV_PAYPAL?: KVNamespace;
}

export default {
  async fetch(request: WorkerRequest, env: Env) {
    const url = new URL(request.url);

    // Endpoint xử lý webhook PayPal
    if (url.pathname === "/webhook" && request.method === "POST") {
      try {
        const body = await request.json?.();
        if (!body) {
          console.error("Không có dữ liệu webhook");
          return new Response("Dữ liệu webhook không hợp lệ", { status: 400 });
        }

        const eventType = body.event_type || "Sự kiện không xác định";
        const resource = body.resource || {};

        // Xác thực webhook
        const isValid = await verifyWebhook(request, body, env.PAYPAL_WEBHOOK_ID);
        if (!isValid) {
          console.error("Xác thực webhook thất bại");
          return new Response("Xác thực webhook không hợp lệ", { status: 401 });
        }

        console.log(`Nhận sự kiện webhook PayPal: ${eventType}`, JSON.stringify(resource));

        // Lưu JSON vào KV
        if (env.KV_PAYPAL) {
          await env.KV_PAYPAL.put("latest_webhook", JSON.stringify(body, null, 2));
        }

        // Chuyển tiếp tới backend C#
        if (env.BACKEND_URL) {
          await fetch(`${env.BACKEND_URL}/api/webhook`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
        }

        return new Response("Webhook đã nhận", { status: 200 });
      } catch (err) {
        console.error("Lỗi xử lý webhook:", err);
        return new Response("Dữ liệu webhook không hợp lệ", { status: 400 });
      }
    }

    // Endpoint xử lý return_url
    if (url.pathname === "/" && request.method === "GET" && url.searchParams.get("token")) {
      try {
        const token = url.searchParams.get("token");
        const payerId = url.searchParams.get("PayerID");

        if (!token || !payerId) {
          return new Response("Thiếu token hoặc PayerID", { status: 400 });
        }

        // Lấy access token từ PayPal
        const auth = btoa(`AegZWyIvAAq9NDPHZ-8fvgfnIhYH4NaJfs1sECYhRLWblaOyV1qCPJF2l6gG2zFyqU0C7MAqQaibPvNY:EBzD7a1HpSO4WuEi555IbyoQQiekgIphtHvOj9LEGEbfgHLoJuD3HfdDSjv_PIYjcw0TntLoNa_nNslj`);
        const tokenResponse = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${auth}`,
          },
          body: "grant_type=client_credentials",
        });

        if (!tokenResponse.ok) {
          const error = await tokenResponse.json();
          console.error("Lỗi lấy access token:", error);
          return new Response(renderHtml(JSON.stringify({ error: "Không thể lấy access token" }, null, 2)), {
            headers: { "content-type": "text/html" },
            status: 500,
          });
        }

        // @ts-ignore
        const { access_token } = await tokenResponse.json();

        // Ghi nhận thanh toán (capture order)
        const captureResponse = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${token}/capture`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
        });

        const captureData = await captureResponse.json();

        if (!captureResponse.ok) {
          console.error("Lỗi capture đơn hàng:", captureData);
          return new Response(renderHtml(JSON.stringify({ error: "Không thể capture đơn hàng", details: captureData }, null, 2)), {
            headers: { "content-type": "text/html" },
            status: 400,
          });
        }

        // Lưu JSON vào KV (tùy chọn)
        if (env.KV_PAYPAL) {
          await env.KV_PAYPAL.put("latest_capture", JSON.stringify(captureData, null, 2));
        }

        // Hiển thị JSON phản hồi
        return new Response(renderHtml(JSON.stringify(captureData, null, 2)), {
          headers: { "content-type": "text/html" },
        });
      } catch (err) {
        console.error("Lỗi xử lý return_url:", err);
        return new Response(renderHtml(JSON.stringify({ error: "Lỗi xử lý thanh toán" }, null, 2)), {
          headers: { "content-type": "text/html" },
          status: 500,
        });
      }
    }

    // Endpoint debug để hiển thị JSON
    if (url.pathname === "/debug" && request.method === "GET") {
      let jsonData = "Chưa có dữ liệu";
      if (env.KV_PAYPAL) {
        const webhookData = await env.KV_PAYPAL.get("latest_webhook");
        const captureData = await env.KV_PAYPAL.get("latest_capture");
        jsonData = JSON.stringify(
            {
              webhook: webhookData ? JSON.parse(webhookData) : null,
              capture: captureData ? JSON.parse(captureData) : null,
            },
            null,
            2
        );
      }

      return new Response(renderHtml(jsonData), {
        headers: { "content-type": "text/html" },
      });
    }

    return new Response("Không tìm thấy", { status: 404 });
  },
};

async function verifyWebhook(request: WorkerRequest, body: any, webhookId: string): Promise<boolean> {
  const headers = {
    transmissionId: request.headers.get("PAYPAL-TRANSMISSION-ID") || "",
    transmissionTime: request.headers.get("PAYPAL-TRANSMISSION-TIME") || "",
    transmissionSig: request.headers.get("PAYPAL-TRANSMISSION-SIG") || "",
    certUrl: request.headers.get("PAYPAL-CERT-URL") || "",
    authAlgo: request.headers.get("PAYPAL-AUTH-ALGO") || "",
  };

  // TODO: Triển khai xác thực chữ ký
  console.log("Webhook headers:", headers);
  return true; // Thay bằng logic xác thực thực tế
}