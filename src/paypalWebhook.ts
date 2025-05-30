// Biến lưu tạm dữ liệu webhook mới nhất
let lastWebhookData: any = null;

export async function handlePayPalWebhook(request: Request): Promise<Response> {
    try {
        const body = await request.json();
        lastWebhookData = body;

        return new Response("✅ Webhook nhận thành công.", { status: 200 });
    } catch (err) {
        return new Response("❌ Lỗi khi đọc dữ liệu webhook", { status: 500 });
    }
}

export function getLastWebhookHtml(): string {
    if (!lastWebhookData) {
        return "<p>Chưa có dữ liệu nào từ PayPal webhook.</p>";
    }

    return `<pre>${JSON.stringify(lastWebhookData, null, 2)}</pre>`;
}
