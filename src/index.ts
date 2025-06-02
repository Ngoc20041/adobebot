// import {renderHtml} from "./renderHtml";
//
// let latestWebhookData: any = null;
//
// export default {
//   async fetch(request: { url: string | URL; method: string; json: () => any }) {
//     const url = new URL(request.url);
//
//     if (url.pathname === '/api/status') {
//       const content = 'Server is running!';
//       const html = renderHtml(content);
//       return new Response(html, {
//         headers: { 'Content-Type': 'text/html' }
//       });
//     }
//
//     if (url.pathname === '/api/paypal/webhook' && request.method === 'POST') {
//       try {
//         latestWebhookData = await request.json(); // Lưu dữ liệu webhook
//         return new Response('render data success', { status: 200 });
//
//       } catch {
//         return new Response('Invalid JSON', { status: 400 });
//       }
//     }
//     if (url.pathname === '/') {
//       const content = 'This is WebSite Of AdobeBot'
//       const html = renderHtml(content);
//       return new Response(html, {
//         headers: { 'Content-Type': 'text/html' }
//       });
//     }
//     if (url.pathname === '/success') {
//       const content =
//           '🎉 Cảm ơn bạn đã thanh toán thành công qua PayPal!\n\nDữ liệu trả về từ PayPal:\n\n' +
//           (latestWebhookData ? JSON.stringify(latestWebhookData, null, 2) : 'Không có dữ liệu nào.');
//       const html = renderHtml(content);
//       return new Response(html, {
//         headers: { 'Content-Type': 'text/html' }
//       });
//     }
//
//     return new Response('Not Found', { status: 404 });
//   }
// };
import { renderHtml } from './renderHtml'; // nếu bạn tách file

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === "POST" && new URL(request.url).pathname === "/api/paypal/webhook") {
      const body = await request.json();

      const formatted = JSON.stringify(body, null, 2); // định dạng đẹp
      const html = renderHtml(formatted);

      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
        status: 200,
      });
    }

    return new Response("Not Found", { status: 404 });
  }
};
