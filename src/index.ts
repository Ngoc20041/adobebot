export default {
  async fetch(request: { method: string; json: () => any; }, env: any, ctx: any) {
    if (request.method === 'POST') {
      try {
        const body = await request.json();
        console.log("Received webhook:", JSON.stringify(body, null, 2)); // 👈 thêm dòng này

        return new Response(JSON.stringify({ status: "Received" }), { status: 200 });
      } catch (err) {
        // @ts-ignore
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }

    return new Response("Method not allowed", { status: 405 });
  }
}
