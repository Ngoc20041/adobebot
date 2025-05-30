import { renderHtml } from "./renderHtml";

export default {
  async fetch(request, env) {
    const stmt = env.DB.prepare("SELECT * FROM comments LIMIT 3");
    const { results } = await stmt.all();

    return new Response(renderHtml(JSON.stringify(results, null, 2)), {
      headers: {
        "content-type": "text/html",
      },
    });
  },
} satisfies ExportedHandler<Env>;
// export default {
//   async fetch(request: { url: string | URL; method: string; json: () => any; }) {
//     const url = new URL(request.url);
//
//     if (url.pathname === "/create-order" && request.method === "GET") {
//       const amount = url.searchParams.get("amount") || "5.00"; // USD
//       const userId = url.searchParams.get("user_id") || "anonymous";
//
//       // Gọi PayPal API
//       const auth = btoa("AegZWyIvAAq9NDPHZ-8fvgfnIhYH4NaJfs1sECYhRLWblaOyV1qCPJF2l6gG2zFyqU0C7MAqQaibPvNY:EBzD7a1HpSO4WuEi555IbyoQQiekgIphtHvOj9LEGEbfgHLoJuD3HfdDSjv_PIYjcw0TntLoNa_nNslj"); // Thay bằng thông tin thật của bạn
//       const res = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Basic ${auth}`
//         },
//         body: JSON.stringify({
//           intent: "CAPTURE",
//           purchase_units: [
//             {
//               amount: {
//                 currency_code: "USD",
//                 value: amount
//               },
//               IdUser: userId
//             }
//           ],
//           application_context: {
//             return_url: "https://adobebot.buin1905.workers.dev",
//             cancel_url: "https://yourdomain.com/cancel"
//           }
//         })
//       });
//
//       const data = await res.json();
//
//       // Lấy link redirect
//       // @ts-ignore
//       const approveLink = data.links.find(link => link.rel === "approve").href;
//
//       return Response.redirect(approveLink, 302);
//     }
//
//     // Xử lý webhook từ PayPal
//     if (url.pathname === "/webhook" && request.method === "POST") {
//       try {
//         const body = await request.json();
//
//         // TODO: Xác thực webhook ở đây nếu cần (xem docs PayPal)
//         // Ví dụ log event type, order id, trạng thái,...
//         const eventType = body.event_type || "Unknown event";
//         const resource = body.resource || {};
//
//         // Bạn có thể dùng console.log hoặc gửi dữ liệu này tới database, etc.
//         console.log("Received PayPal webhook event:", eventType);
//         console.log("Resource data:", JSON.stringify(resource));
//
//         // Xử lý logic tùy bạn, ví dụ cập nhật trạng thái order, gửi email, ...
//
//         return new Response("Webhook received", { status: 200 });
//       } catch (err) {
//         console.error("Error handling webhook:", err);
//         return new Response("Invalid webhook data", { status: 400 });
//       }
//     }
//
//     return new Response("Not Found", { status: 404 });
//   }
// }
