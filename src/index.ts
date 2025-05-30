export default {
  async fetch(request: { url: string | URL; method: string; }) {
    const url = new URL(request.url);
    if (url.pathname === "/create-order" && request.method === "GET") {
      const amount = url.searchParams.get("amount") || "5.00"; // USD
      const userId = url.searchParams.get("user_id") || "anonymous";

      // Gọi PayPal API
      const auth = btoa("CLIENT_ID:SECRET"); // Thay bằng thông tin thật của bạn
      const res = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${auth}`
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: "USD",
                value: amount
              },
              custom_id: userId
            }
          ],
          application_context: {
            return_url: "https://yourdomain.com/success",
            cancel_url: "https://yourdomain.com/cancel"
          }
        })
      });

      const data = await res.json();

      // Lấy link redirect
      // @ts-ignore
      const approveLink = data.links.find(link => link.rel === "approve").href;

      return Response.redirect(approveLink, 302);
    }

    return new Response("Not Found", { status: 404 });
  }
}
