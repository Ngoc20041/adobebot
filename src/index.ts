export default {
  async fetch(request: { method: string; json: () => any; }, env: any, ctx: any) {
    if (request.method === "POST") {
      try {
        const event = await request.json();

        // Kiểm tra loại event từ PayPal
        if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
          const resource = event.resource;
          const amount = resource.amount.value;
          const currency = resource.amount.currency_code;
          const custom_id = resource.custom_id || "unknown_user";

          // Gửi về Bot Server để cộng credit
          await fetch("https://your-bot-server.com/api/update-credit", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              user_id: custom_id,
              credit: amount,
              currency: currency,
              source: "paypal"
            })
          });

          return new Response(JSON.stringify({ status: "credit updated" }), { status: 200 });
        }

        // Không phải event mình cần
        return new Response(JSON.stringify({ status: "ignored" }), { status: 200 });
      } catch (err) {
        // @ts-ignore
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }

    return new Response("Method Not Allowed", { status: 405 });
  }
}
