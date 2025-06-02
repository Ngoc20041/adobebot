import { renderHtml } from "./renderHtml";

// Định nghĩa kiểu cho dữ liệu webhook và capture
interface WebhookData {
  id: string;
  event_type: string;
  resource: {
    id: string;
    intent?: string;
    status?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface CaptureResult {
  id: string;
  status: string;
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{
        id: string;
        status: string;
        amount: {
          currency_code: string;
          value: string;
        };
      }>;
    };
  }>;
  [key: string]: any;
}

// Biến lưu dữ liệu
let latestWebhookData: WebhookData | null = null;
let captureResult: CaptureResult | null = null;

// Hàm lấy Access Token từ PayPal
async function getPaypalAccessToken(): Promise<string> {
  const clientId = "AegZWyIvAAq9NDPHZ-8fvgfnIhYH4NaJfs1sECYhRLWblaOyV1qCPJF2l6gG2zFyqU0C7MAqQaibPvNY"; // Thay bằng Client ID của bạn
  const secret = "EBzD7a1HpSO4WuEi555IbyoQQiekgIphtHvOj9LEGEbfgHLoJuD3HfdDSjv_PIYjcw0TntLoNa_nNslj"; // Thay bằng Secret của bạn
  const auth = btoa(`${clientId}:${secret}`); // Sử dụng btoa để mã hóa Base64

  try {
    const response = await fetch("https://api.sandbox.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const data = await response.json();
    // @ts-ignore
    if (data.access_token) {
      // @ts-ignore
      return data.access_token;
    } else {
      throw new Error("Không thể lấy access token");
    }
  } catch (error) {
    console.error("Lỗi khi lấy access token:", error);
    throw error;
  }
}

// Hàm thực hiện capture thanh toán
async function capturePayment(orderId: string, accessToken: string): Promise<CaptureResult> {
  try {
    const response = await fetch(`https://api.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({}),
    });

    const data: CaptureResult = await response.json();
    return data;
  } catch (error) {
    console.error("Lỗi khi capture thanh toán:", error);
    throw error;
  }
}

// Định nghĩa kiểu cho request của Cloudflare Workers
interface CustomRequest {
  url: string | URL;
  method: string;
  json: () => Promise<any>;
}

export default {
  async fetch(request: CustomRequest): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/status") {
      const content = "Server is running!";
      const html = renderHtml(content);
      return new Response(html, {
        headers: { "Content-Type": "text/html" },
      });
    }

    if (url.pathname === "/api/paypal/webhook" && request.method === "POST") {
      try {
        latestWebhookData = await request.json();
        console.log("Webhook Data:", JSON.stringify(latestWebhookData, null, 2));

        // Kiểm tra sự kiện CHECKOUT.ORDER.APPROVED
        if (latestWebhookData?.event_type === "CHECKOUT.ORDER.APPROVED") {
          const orderId = latestWebhookData.resource.id;

          try {
            // Lấy access token và thực hiện capture
            const accessToken = await getPaypalAccessToken();
            captureResult = await capturePayment(orderId, accessToken);
            console.log("Capture Result:", JSON.stringify(captureResult, null, 2));
          } catch (error) {
            console.error("Lỗi khi xử lý capture:", error);
            captureResult = { id: "", status: "FAILED", error: "Không thể capture thanh toán" };
          }
        }

        return new Response(JSON.stringify(latestWebhookData, null, 2), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      } catch (error) {
        console.error("Lỗi khi xử lý webhook:", error);
        return new Response("Invalid JSON", { status: 400 });
      }
    }

    if (url.pathname === "/") {
      const content = "Hello This is page by AdobeStock Bot";
      const html = renderHtml(content);
      return new Response(html, {
        headers: { "Content-Type": "text/html" },
      });
    }

    if (url.pathname === "/cancel") {
      const content = "You have canceled the payment";
      const html = renderHtml(content);
      return new Response(html, {
        headers: { "Content-Type": "text/html" },
      });
    }

    if (url.pathname === "/success") {
      let content = "🎉 Cảm ơn bạn đã thanh toán thành công qua PayPal!\n\n";
      content += "Dữ liệu webhook từ PayPal:\n\n";
      content += latestWebhookData
          ? JSON.stringify(latestWebhookData, null, 2)
          : "Không có dữ liệu webhook.";

      content += "\n\nKết quả capture thanh toán:\n\n";
      content += captureResult
          ? JSON.stringify(captureResult, null, 2)
          : "Chưa thực hiện capture hoặc capture thất bại.";

      const html = renderHtml(content);
      return new Response(html, {
        headers: { "Content-Type": "text/html" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
};