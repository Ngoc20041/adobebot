// import {renderHtml} from "./renderHtml";
// import {paypalConfig} from "../Config/Config";
//
// let latestWebhookData: any = null;
// // Định nghĩa kiểu cho dữ liệu webhook và capture
// interface WebhookData {
//   id: string;
//   event_type: string;
//   resource: {
//     id: string;
//     intent?: string;
//     status?: string;
//     [key: string]: any;
//   };
//   [key: string]: any;
// }
//
// interface CaptureResult {
//   id: string;
//   status: string;
//   purchase_units?: Array<{
//     payments?: {
//       captures?: Array<{
//         id: string;
//         status: string;
//         amount: {
//           currency_code: string;
//           value: string;
//         };
//       }>;
//     };
//   }>;
//   [key: string]: any;
// }
//
// // Get Access Token From PayPal
// async function getPaypalAccessToken(): Promise<string> {
//   const clientId = paypalConfig.clientId;
//   const secret = paypalConfig.secret;
//   const auth = btoa(`${clientId}:${secret}`); // Sử dụng btoa để mã hóa Base64
//
//   try {
//     const response = await fetch(paypalConfig.paypal_api_url+"/v1/oauth2/token", {
//       method: "POST",
//       headers: {
//         Authorization: `Basic ${auth}`,
//         "Content-Type": "application/x-www-form-urlencoded",
//       },
//       body: "grant_type=client_credentials",
//     });
//
//     const data = await response.json();
//     // @ts-ignore
//     if (data.access_token) {
//       // @ts-ignore
//       return data.access_token;
//     } else {
//       throw new Error("Không thể lấy access token");
//     }
//   } catch (error) {
//     console.error("Lỗi khi lấy access token:", error);
//     throw error;
//   }
// }
//
// // Excute capture payment
// async function capturePayment(orderId: string, accessToken: string): Promise<CaptureResult> {
//   try {
//     const response = await fetch(paypalConfig.paypal_api_url+`/v2/checkout/orders/${orderId}/capture`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${accessToken}`,
//       },
//       body: JSON.stringify({}),
//     });
//
//     return await response.json();
//   } catch (error) {
//     console.error("Lỗi khi capture thanh toán:", error);
//     throw error;
//   }
// }
//
//
// export default {
//   async fetch(request: { url: string | URL; method: string; json: () => any }) {
//     const url = new URL(request.url);
//     var tokenPaypal = await getPaypalAccessToken();
//
//     //If check status server and token paypal for debug
//     if (url.pathname === '/api/status') {
//       const content = 'Server is running!';
//       const html = renderHtml(content+'\n'+tokenPaypal);
//       return new Response(html, {
//         headers: { 'Content-Type': 'text/html' }
//       });
//     }
//
//
//     //If paypal callback
//     if (url.pathname === '/api/paypal/webhook' && request.method === 'POST') {
//       try {
//         // tokenPaypal = await getPaypalAccessToken();
//         // latestWebhookData = await capturePayment(latestWebhookData.resource.id, tokenPaypal);
//         latestWebhookData = await request.json(); // Lưu dữ liệu webhook
//         return new Response('render data success', { status: 200 });
//
//       } catch {
//         return new Response('Invalid JSON', { status: 400 });
//       }
//     }
//
//
//     //if request is payment success
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
//     //If user canceled the payment
//     if (url.pathname === '/cancel') {
//       const content =
//       'You have canceled the payment process.'
//       const html = renderHtml(content);
//       return new Response(html, {
//         headers: { 'Content-Type': 'text/html' }
//       });
//     }
//
//     return new Response('Not Found', { status: 404 });
//   }
// };
import { renderHtml } from "./renderHtml";
import { paypalConfig } from "../Config/Config";

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
  const clientId = paypalConfig.clientId;
  const secret = paypalConfig.secret;
  const auth = btoa(`${clientId}:${secret}`);

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

// Hàm thực hiện capture thanh toán
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

    const data: CaptureResult = await response.json();
    return data;
  } catch (error) {
    console.error("Lỗi khi capture thanh toán:", error);
    throw error;
  }
}

// Định nghĩa kiểu cho request
interface CustomRequest {
  url: string | URL;
  method: string;
  json: () => Promise<any>;
}

export default {
  async fetch(request: CustomRequest): Promise<Response> {
    const url = new URL(request.url);

    // Endpoint kiểm tra trạng thái server và token
    if (url.pathname === "/api/status") {
      try {
        const tokenPaypal = await getPaypalAccessToken();
        const content = `Server is running!\nPayPal Access Token: ${tokenPaypal}`;
        const html = renderHtml(content);
        return new Response(html, {
          headers: { "Content-Type": "text/html" },
        });
      } catch (error) {
        const content = `Server is running!\nLỗi khi lấy token: ${error}`;
        const html = renderHtml(content);
        return new Response(html, {
          headers: { "Content-Type": "text/html" },
          status: 500,
        });
      }
    }

    // Endpoint xử lý webhook từ PayPal
    if (url.pathname === "/api/paypal/webhook" && request.method === "POST") {
      try {
        latestWebhookData = await request.json();
        console.log("Webhook Data:", JSON.stringify(latestWebhookData, null, 2));

        // Kiểm tra sự kiện CHECKOUT.ORDER.APPROVED
        if (latestWebhookData?.event_type === "CHECKOUT.ORDER.APPROVED") {
          const orderId = latestWebhookData.resource.id;
          try {
            const accessToken = await getPaypalAccessToken();
            captureResult = await capturePayment(orderId, accessToken);
            console.log("Capture Result:", JSON.stringify(captureResult, null, 2));
          } catch (error) {
            console.error("Lỗi khi xử lý capture:", error);
            captureResult = { id: "", status: "FAILED", error: "Không thể capture thanh toán" };
          }
        }

        return new Response("Webhook processed successfully", {
          headers: { "Content-Type": "text/plain" },
          status: 200,
        });
      } catch (error) {
        console.error("Lỗi khi xử lý webhook:", error);
        return new Response("Invalid JSON", { status: 400 });
      }
    }

    // Endpoint hiển thị lịch sử webhook (tùy chọn)
    if (url.pathname === "/api/webhook/history" && request.method === "GET") {
      const content = latestWebhookData
          ? JSON.stringify(latestWebhookData, null, 2)
          : "Không có dữ liệu webhook.";
      return new Response(content, {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Endpoint khi thanh toán thành công
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

    // Endpoint khi hủy thanh toán
    if (url.pathname === "/cancel") {
      const content = "You have canceled the payment process.";
      const html = renderHtml(content);
      return new Response(html, {
        headers: { "Content-Type": "text/html" },
      });
    }

    // Trang chủ
    if (url.pathname === "/") {
      const content = "Hello This is page by AdobeStock Bot";
      const html = renderHtml(content);
      return new Response(html, {
        headers: { "Content-Type": "text/html" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
};