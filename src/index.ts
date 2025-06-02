// export default {
//   async fetch(request: Request): Promise<Response> {
//     if (request.method === 'POST' && new URL(request.url).pathname === '/paypal/webhook') {
//       const body = await request.json();
//
//       // @ts-ignore
//       const eventType = body.event_type;
//       // @ts-ignore
//       const resource = body.resource;
//
//       console.log('💡 PayPal webhook event:', eventType);
//
//       if (eventType === 'CHECKOUT.ORDER.APPROVED') {
//         console.log('✅ Order approved:', resource.id);
//         // Ghi log / cập nhật database ở đây
//       }
//
//       if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
//         console.log('💰 Payment completed:', resource.purchase_units?.[0]?.amount?.value);
//       }
//
//       return new Response(JSON.stringify({ status: 'ok' }), {
//         status: 200,
//         headers: { 'Content-Type': 'application/json' }
//       });
//     }
//
//     return new Response('Not found', { status: 404 });
//   }
// };
export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === 'POST' && new URL(request.url).pathname === '/api/paypal/webhook') {
      const rawBody = await request.text(); // đọc thô nội dung gửi đến
      console.log("📦 Nhận được webhook từ PayPal:");
      console.log(rawBody); // log ra toàn bộ JSON gửi từ PayPal

      return new Response("Webhook received", { status: 200 });
    }

    return new Response("Not Found", { status: 404 });
  },
};
