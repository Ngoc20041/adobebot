import {renderHtml} from "./renderHtml";

let latestWebhookData: any = null;

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

export default {
  async fetch(request: { url: string | URL; method: string; json: () => any }) {
    const url = new URL(request.url);

    if (url.pathname === '/api/status') {
      const content = 'Server is running!';
      var tokenPaypal = await getPaypalAccessToken();
      const html = renderHtml(content+'\n'+tokenPaypal);
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
