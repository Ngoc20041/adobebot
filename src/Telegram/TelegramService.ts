import { paypalConfig, TelegramConfig, NowPaymentsConfig } from "../../Config/Config";

export async function sendTelegramMessage(
    message: string,
    chatId: number,
    threadId?: number,
    parseMode: "Markdown" | "HTML" = "HTML" // Thêm lựa chọn kiểu format
) {
    const botToken = TelegramConfig.tokenBotTelegram;

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const body: any = {
        chat_id: chatId,
        text: message,
        parse_mode: parseMode, // ✅ Thêm dòng này
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
