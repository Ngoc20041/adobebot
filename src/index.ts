export interface Env {}

export default {
  async fetch(request: Request, env: Env) {
    if (request.method === "POST") {
      try {
        const data = await request.json();  // lấy JSON từ body webhook
        // trả về JSON dạng text (đẹp)
        return new Response(JSON.stringify(data, null, 2), {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        });
      } catch (err) {
        return new Response("Invalid JSON", { status: 400 });
      }
    }
    return new Response("Send POST request with JSON webhook data", {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  },
};
