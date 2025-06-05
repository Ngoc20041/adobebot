import { renderHtml } from "./renderHtml";
import { paypalConfig, TelegramConfig } from "../Config/Config";
import {NowPaymentsOrderDetail} from "./Interface/InterfaceNowPayments"
import {getPaypalAccessToken, capturePayment} from "./PayPal/PayPalService";
import {sendTelegramMessage} from "./Telegram/TelegramService";
import {getNowPaymentsStatus} from "./NowPayments/NowPaymentsService";
let latestWebhookData: any = null;

export default {
  async fetch(request: { url: string | URL; method: string; json: () => any }) {
    const url = new URL(request.url);
    const tokenPaypal = await getPaypalAccessToken();

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
    if (url.pathname === "/paypal/success") {
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
      const dataCapture = await capturePayment(orderId, accessToken);
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
          `PayPal:\n<pre>${JSON.stringify(orderData, null, 2)}</pre>\n`,
          TelegramConfig.idChannel,
          undefined,
          'HTML' // hoặc Markdown, tùy format bạn muốn
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
            `NowPayments:\n<pre>${JSON.stringify(detail, null, 2)}</pre>\n`,
            TelegramConfig.idChannel,
            undefined,
            'HTML' // hoặc Markdown, tùy format bạn muốn
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
    if (url.pathname === "/paypal/cancel") {
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

    return new Response("Router Not Found", { status: 404 });
  },
};