import { paypalConfig, TelegramConfig, NowPaymentsConfig } from "../../Config/Config";
import {CaptureResult, WebhookData} from "../Interface/InterfacePayments";

// Lấy access token từ PayPal
export async function getPaypalAccessToken(): Promise<string> {
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
export async function capturePayment(orderId: string | null, accessToken: string): Promise<CaptureResult> {
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

