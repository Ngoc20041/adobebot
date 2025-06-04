import { renderHtml } from "./renderHtml";
import { paypalConfig, TelegramConfig, NowPaymentsConfig } from "../Config/Config";

let latestWebhookData: any = null;

// Định nghĩa kiểu cho dữ liệu webhook PayPal
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

// Định nghĩa kiểu cho capture PayPal
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

// Định nghĩa kiểu cho phản hồi NowPayments
interface NowPaymentsOrderDetail {
  payment_id: string;
  payment_status: string;
  pay_amount: number;
  price_currency: string;
  order_id: string;
  order_description?: string;
  invoice_id: string;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

// Gửi tin nhắn qua Telegram
async function sendTelegramMessage(message: string, chatId: number, threadId?: number) {
  const botToken = TelegramConfig.tokenBotTelegram;

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const body: any = {
    chat_id: chatId,
    text: message,
  };

  if (threadId !== undefined) {
    body.message_thread_id = threadId;
  }

  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

// Lấy access token từ PayPal
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

// Thực hiện capture thanh toán PayPal
async function capturePayment(orderId: string | null, accessToken: string): Promise<CaptureResult> {
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

// Kiểm tra trạng thái thanh toán NowPayments
async function getNowPaymentsStatus(paymentId: string): Promise<NowPaymentsOrderDetail | null> {
  try {
    const response = await fetch(`${NowPaymentsConfig.Nowpayment_api_url}/v1/payment/${paymentId}`, {
      method: "GET",
      headers: {
        "x-api-key": NowPaymentsConfig.NowPaymentapiKey,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Error: ${errorText}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`❌ Error fetching payment status: ${error}`);
    return null;
  }
}

export default {
  async fetch(request: { url: string | URL; method: string; json: () => any }) {
    const url = new URL(request.url);
    var tokenPaypal = await getPaypalAccessToken();

    // Kiểm tra trạng thái server và token PayPal để debug
    if (url.pathname === "/api/status") {
      const content = "Server is running!";
      const html = renderHtml(content + "\n" + tokenPaypal);
      return new Response(html, {
        headers: { "Content-Type": "text/html" },
      });
    }

    // Xử lý webhook PayPal
    if (url.pathname === "/api/paypal/webhook" && request.method === "POST") {
      try {
        latestWebhookData = await request.json();
        return new Response("render data success", { status: 200 });
      } catch {
        return new Response("Invalid JSON", { status: 400 });
      }
    }

    // Xử lý thanh toán PayPal thành công
    if (url.pathname === "/success") {
      const orderId = url.searchParams.get("token");
      const accessToken = await getPaypalAccessToken();

      const response = await fetch(`${paypalConfig.paypal_api_url}/v2/checkout/orders/${orderId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      const orderData = await response.json();
      var dataCapture = await capturePayment(orderId, accessToken);
      // @ts-ignore
      const description = orderData.purchase_units?.[0]?.description;
      // @ts-ignore
      const InfoUser = orderData.purchase_units?.[0]?.custom_id;

      const [userIdStr, messageIdStr] = InfoUser.split(":");
      const userId = parseFloat(userIdStr);
      const messageId = parseFloat(messageIdStr);

      // @ts-ignore
      const amountValue = orderData.purchase_units?.[0]?.amount?.value;
      // @ts-ignore
      const currencyCode = orderData.purchase_units?.[0]?.amount?.currency_code;

      await sendTelegramMessage(
          `${TelegramConfig.idChannel} Price: ${amountValue} ${currencyCode} - UserId: ${userId} - MessageId: ${messageId}`,
          TelegramConfig.idChannel
      );

      const content = `🎉 Thank you for your successful payment with PayPal!\n`;
      const html = renderHtml(content);

      return new Response(html, {
        headers: { "Content-Type": "text/html" },
      });
    }
    // Xử lý thanh toán NowPayments thành công
    if (url.pathname === "/nowpayments/success") {
      const paymentId = url.searchParams.get("NP_id");

      if (!paymentId) {
        const content = "Error: Missing NP_id parameter.";
        const html = renderHtml(content);
        return new Response(html, {
          headers: { "Content-Type": "text/html" },
          status: 400,
        });
      }
      var paymentDetail = await getNowPaymentsStatus(paymentId);
      if (!paymentDetail) {
        const content = `Error: Failed to retrieve payment status for NP_id: ${paymentId}.`;
        const html = renderHtml(content);
        return new Response(html, {
          headers: { "Content-Type": "text/html" },
          status: 500,
        });
      }
      const detail = paymentDetail as NowPaymentsOrderDetail;
      const [userIdStr, messageIdStr] = detail.order_id.split(":");
      // Kiểm tra trạng thái thanh toán
      if (detail.payment_status === "finished") {
        // Gửi thông báo qua Telegram
        await sendTelegramMessage(
            `${TelegramConfig.idChannel} Price: ${detail.pay_amount} ${detail.price_currency} - UserId: ${userIdStr} - MessageId: ${messageIdStr}`,
            TelegramConfig.idChannel
        );
        const content = `🎉 Thank you for your successful payment with NowPayments!\n`+
            `Order Details:\n  ${JSON.stringify(paymentDetail, null, 2)}`;
        const html = renderHtml(content);
        return new Response(html, {
          headers: { "Content-Type": "text/html" },
        });
      } else {
        const content = `Payment not completed. Payment ID: ${paymentId}, Status: ${paymentDetail.payment_status}`;
        const html = renderHtml(content);
        return new Response(html, {
          headers: { "Content-Type": "text/html" },
          status: 400,
        });
      }
    }

    // Xử lý hủy thanh toán NowPayments
    if (url.pathname === "/nowpayments/cancel") {
      const content = `
        You have canceled the payment process.<br/>
        Contact with admin if you have any question: 
        <a href="https://t.me/SoaiNhoBe" target="_blank">https://t.me/SoaiNhoBe</a>
      `;

      const html = renderHtml(content);
      return new Response(html, {
        headers: { "Content-Type": "text/html" },
      });
    }

    // Xử lý hủy thanh toán PayPal
    if (url.pathname === "/cancel") {
      const content = `
        You have canceled the payment process.<br/>
        Contact with admin if you have any question: 
        <a href="https://t.me/SoaiNhoBe" target="_blank">https://t.me/SoaiNhoBe</a>
      `;

      const html = renderHtml(content);
      return new Response(html, {
        headers: { "Content-Type": "text/html" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
};