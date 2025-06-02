import {renderHtml} from "./renderHtml";
import {paypalConfig} from "../Config/Config";
import { PaypalWebhookData } from '../Interface/interface';

let latestWebhookData: any = null;
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
//save data to server no sql
export async function sendPaypalWebhookData(data: PaypalWebhookData): Promise<void> {
  const response = await fetch(`${paypalConfig.database_url}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Lỗi khi gửi dữ liệu PayPal:', errorText);
    throw new Error('Gửi dữ liệu thất bại');
  }

  console.log('Gửi dữ liệu PayPal thành công!');
}
// Get Access Token From PayPal
async function getPaypalAccessToken(): Promise<string> {
  const clientId = paypalConfig.clientId;
  const secret = paypalConfig.secret;
  const auth = btoa(`${clientId}:${secret}`); // Sử dụng btoa để mã hóa Base64

  try {
    const response = await fetch(`${paypalConfig.paypal_api_url}/v1/oauth2/token`, {
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

// Excute capture payment
async function capturePayment(orderId: string, accessToken: string): Promise<CaptureResult> {
  try {
    const response = await fetch(`${paypalConfig.paypal_api_url}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({}),
    });

    return await response.json();
  } catch (error) {
    console.error("Lỗi khi capture thanh toán:", error);
    throw error;
  }
}


export default {
  async fetch(request: { url: string | URL; method: string; json: () => any }) {
    const url = new URL(request.url);
    var tokenPaypal = await getPaypalAccessToken();

    //If check status server and token paypal for debug
    if (url.pathname === '/api/status') {
      const content = 'Server is running!';
      const html = renderHtml(content+'\n'+tokenPaypal);
      return new Response(html, {
        headers: { 'Content-Type': 'text/html' }
      });
    }


    //If paypal callback
    if (url.pathname === '/api/paypal/webhook' && request.method === 'POST') {
      try {
        // tokenPaypal = await getPaypalAccessToken();
        // latestWebhookData = await capturePayment(latestWebhookData.resource.id, tokenPaypal);
        latestWebhookData = await request.json(); // Lưu dữ liệu webhook
        await sendPaypalWebhookData(latestWebhookData);
        return new Response('render data success', { status: 200 });

      } catch {
        return new Response('Invalid JSON', { status: 400 });
      }
    }


    //if request is payment success
    if (url.pathname === '/success') {
      console.log(url);
      const content =
          '🎉 Cảm ơn bạn đã thanh toán thành công qua PayPal!\n\nDữ liệu trả về từ PayPal:\n\n' +
          (latestWebhookData ? JSON.stringify(latestWebhookData, null, 2) : 'Không có dữ liệu nào.');
      const html = renderHtml(content);
      return new Response(html, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    //If user canceled the payment
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