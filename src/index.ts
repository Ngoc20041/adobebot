// import { Router } from 'itty-router';
//
// const router = Router();
//
// router.post('/api/paypal/webhook', async (request) => {
//   const data = await request.json();
//   return new Response(JSON.stringify(data, null, 2), {
//     headers: { 'Content-Type': 'application/json' },
//   });
// });
//
// router.get('/api/status', () => {
//   return new Response('Server is running', { headers: { 'Content-Type': 'text/plain' } });
// });
//
// router.all('*', () => new Response('Not Found', { status: 404 }));

// export default {
//   async fetch(request: Request) {
//     return router.handle(request);
//   },
// };
export default {
  async fetch(request: { url: string | URL; method: string; json: () => any; }) {
    const url = new URL(request.url);

    if (url.pathname === '/api/status') {
      return new Response('Server is running', { headers: { 'Content-Type': 'text/plain' } });
    }

    if (url.pathname === '/api/paypal/webhook' && request.method === 'POST') {
      // Ví dụ bạn muốn lấy json body:
      try {
        const data = await request.json();
        return new Response(`Data is: ${JSON.stringify(data)}`, { headers: { 'Content-Type': 'application/json' } });
      } catch {
        return new Response('Invalid JSON', { status: 400 });
      }
    }

    return new Response('Not Found', { status: 404 });
  }
}

