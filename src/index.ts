import {renderHtml} from "./renderHtml";

let latestWebhookData: any = null;

export default {
  async fetch(request: { url: string | URL; method: string; json: () => any }) {
    const url = new URL(request.url);

    if (url.pathname === '/api/status') {
      const content = 'Server is running!';
      const html = renderHtml(content);
      return new Response(html, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    if (url.pathname === '/api/paypal/webhook' && request.method === 'POST') {
      try {
        latestWebhookData = await request.json(); // Lưu dữ liệu webhook
        return new Response('render data success', { status: 200 });

      } catch {
        return new Response('Invalid JSON', { status: 400 });
      }
    }
    if (url.pathname === '/success') {
      const content =
          '🎉 Cảm ơn bạn đã thanh toán thành công qua PayPal!\n\nDữ liệu trả về từ PayPal:\n\n' +
          (latestWebhookData ? JSON.stringify(latestWebhookData, null, 2) : 'Không có dữ liệu nào.');
      const html = renderHtml(content);
      return new Response(html, {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    if (url.pathname === '/cancel') {
      const content =
      'You have canceled the payment process.'
      const html = renderHtml(content);
      return new Response(html, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    return new Response('Not Found', { status: 404 });
  }
};
