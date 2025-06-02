import { handlePayPalWebhook, getLastWebhookHtml } from "./paypalWebhook";
import { renderHtml } from "./renderHtml";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // 1. Xử lý webhook từ PayPal
    if (url.pathname === "/api/paypal/webhook" && request.method === "POST") {
      return await handlePayPalWebhook(request);
    }

    // 2. Trang hiển thị dữ liệu webhook mới nhất
    if (url.pathname === "/") {
      const html = renderHtml(getLastWebhookHtml());
      return new Response(html, { headers: { "content-type": "text/html" } });
    }

    return new Response("404 Not Found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
