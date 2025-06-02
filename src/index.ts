// @ts-ignore
import * as console from "node:console";

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === 'POST' && new URL(request.url).pathname === '/api/paypal/webhook') {
      const body = await request.json();

      // @ts-ignore
      const eventType = body.event_type;
      // @ts-ignore
      const resource = body.resource;

      console.log('💡 PayPal webhook event:', eventType);

      if (eventType === 'CHECKOUT.ORDER.APPROVED') {
        console.log('✅ Order approved:', resource.id);
        // Ghi log / cập nhật database ở đây
      }

      if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
        console.log('💰 Payment completed:', resource.purchase_units?.[0]?.amount?.value);
      }

      return new Response(JSON.stringify({ status: 'ok' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    console.log('🚀 Request:', request.url);

    return new Response('Not found', { status: 404 });
  }
};

