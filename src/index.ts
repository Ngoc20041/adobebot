import { renderHtml } from "./renderHtml";

// Định nghĩa kiểu chính xác hơn cho request
interface WorkerRequest {
  url: string | URL;
  method: string;
  json?: () => Promise<any>;
  headers: Headers; // headers là bắt buộc
}

// Định nghĩa môi trường
interface Env {
  PAYPAL_WEBHOOK_ID: string;
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

        // Ghi log sự kiện
        console.log(`Nhận sự kiện webhook PayPal: ${eventType}`, JSON.stringify(resource));

        // Lưu JSON vào KV để hiển thị sau (tùy chọn)
        if (env.KV_PAYPAL) {
          await env.KV_PAYPAL.put("latest_webhook", JSON.stringify(body, null, 2));
        }

        // Chuyển tiếp tới backend C# (nếu có)
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

    // Endpoint debug để hiển thị JSON webhook
    if (url.pathname === "/debug" && request.method === "GET") {
      let jsonData = "Chưa có dữ liệu webhook";
      if (env.KV_PAYPAL) {
        jsonData = (await env.KV_PAYPAL.get("latest_webhook")) || jsonData;
      }

      return new Response(renderHtml(jsonData), {
        headers: {
          "content-type": "text/html",
        },
      });
    }

    return new Response("Không tìm thấy", { status: 404 });
  },
};

async function verifyWebhook(request: WorkerRequest, body: any, webhookId: string): Promise<boolean> {
  // headers được đảm bảo tồn tại (không cần kiểm tra undefined)
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