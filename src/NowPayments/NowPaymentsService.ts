import { paypalConfig, TelegramConfig, NowPaymentsConfig } from "../../Config/Config";
import { NowPaymentsOrderDetail} from "../Interface/InterfaceNowPayments";

// Kiểm tra trạng thái thanh toán NowPayments
export async function getNowPaymentsStatus(paymentId: string): Promise<NowPaymentsOrderDetail | null> {
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