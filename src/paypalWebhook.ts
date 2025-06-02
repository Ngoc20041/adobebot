let lastWebhookData: any = null;

export async function handlePayPalWebhook(request: Request) {
    const body = await request.json();

    // Lấy event type
    // @ts-ignore
    const eventType = body.event_type;

    if (eventType === "CHECKOUT.ORDER.APPROVED") {
        // @ts-ignore
        const resource = body.resource;
        const purchaseUnit = resource.purchase_units[0];

        // Lấy các thông tin cần thiết
        const orderId = resource.id;                       // ID đơn PayPal
        const invoiceId = purchaseUnit.invoice_id;         // Invoice ID bạn tạo
        const customId = purchaseUnit.custom_id;           // ID tùy chỉnh (ví dụ userId)
        const description = purchaseUnit.description;      // Mô tả mặt hàng
        const amount = purchaseUnit.amount.value;           // Tổng tiền
        const currency = purchaseUnit.amount.currency_code;
        const payerName = resource.payer.name.given_name + " " + resource.payer.name.surname;
        const payerEmail = resource.payer.email_address;

        // Ví dụ: lưu vào database hoặc xử lý logic đơn hàng
        console.log("Order approved:");
        console.log({ orderId, invoiceId, customId, description, amount, currency, payerName, payerEmail });

        // Trả về 200 OK cho PayPal
        return new Response("Webhook received", { status: 200 });
    }

    // Xử lý các event khác nếu cần

    return new Response("Event type not handled", { status: 200 });
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
