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
import {renderHtml} from "./renderHtml";

export async function fetch(request: Request): Promise<Response> {
  const url = new URL(request.url);

  if (url.pathname === '/api/paypal/webhook') {
    // Đây là webhook callback, xử lý dữ liệu PayPal gửi về
    return handleWebhook(request);
  }

  if (url.pathname === '/success') {
    // Đây là trang hiển thị khi PayPal redirect người dùng về
    return handleSuccess(request);
  }

  // Các route khác
  return new Response('Not Found', { status: 404 });
}

async function handleWebhook(request: Request): Promise<Response> {
  const contentType = request.headers.get('content-type') || '';
  let data;
  if (contentType.includes('application/json')) {
    data = await request.json();
  } else {
    data = await request.text();
  }

  // Bạn có thể log hoặc xử lý dữ liệu webhook ở đây

  // Hiển thị ra html để xem dữ liệu webhook (cho test)
  return new Response(renderHtml(JSON.stringify(data, null, 2)), {
    headers: { 'content-type': 'text/html;charset=UTF-8' },
  });
}

async function handleSuccess(request: Request): Promise<Response> {
  // Trả về trang thành công, có thể là html đơn giản
  return new Response(`
    <html>
      <body>
        <h1>Thanh toán thành công! Cảm ơn bạn đã mua hàng.</h1>
      </body>
    </html>
  `, {
    headers: { 'content-type': 'text/html;charset=UTF-8' },
  });
}

