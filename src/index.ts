import { handlePayPalWebhook, getLastWebhookHtml } from "./paypalWebhook";
import { renderHtml } from "./renderHtml";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/paypal/webhook" && request.method === "POST") {
      return await handlePayPalWebhook(request);
    }

    // 👉 Trang để bạn xem dữ liệu webhook đã nhận
    if (url.pathname === "/") {
      const html = renderHtml(getLastWebhookHtml());
      return new Response(html, { headers: { "content-type": "text/html" } });
    }

    return new Response("404 Not Found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
