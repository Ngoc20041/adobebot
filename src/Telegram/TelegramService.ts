import { paypalConfig, TelegramConfig, NowPaymentsConfig } from "../../Config/Config";

// Gửi tin nhắn qua Telegram
export async function sendTelegramMessage(message: string, chatId: number, threadId?: number) {
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