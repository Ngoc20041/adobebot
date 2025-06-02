let lastWebhookData: any = null;

export async function handlePayPalWebhook(request: Request): Promise<Response> {
    try {
        const body = await request.json();
        lastWebhookData = body;

        console.log("[Webhook] Dữ liệu PayPal nhận được:", JSON.stringify(body, null, 2));

        return new Response("✅ Webhook đã nhận", { status: 200 });
    } catch (err) {
        console.error("❌ Lỗi khi xử lý webhook:", err);
        return new Response("Bad Request", { status: 400 });
    }
}

export function getLastWebhookHtml(): string {
    if (!lastWebhookData) {
        return `<p>📭 Chưa có dữ liệu nào từ PayPal webhook.</p>`;
    }

    const { id, event_type, resource } = lastWebhookData;

    return `
    <div>
      <h3>📄 Thông tin Webhook:</h3>
      <ul>
        <li><strong>ID:</strong> ${id}</li>
        <li><strong>Loại sự kiện:</strong> ${event_type}</li>
        <li><strong>Email người thanh toán:</strong> ${resource?.payer?.email_address || "Không có"}</li>
        <li><strong>Số tiền:</strong> ${resource?.amount?.value || "N/A"} ${resource?.amount?.currency_code || ""}</li>
      </ul>
      <h4>Dữ liệu đầy đủ (JSON):</h4>
      <pre>${JSON.stringify(lastWebhookData, null, 2)}</pre>
    </div>
  `;
}
