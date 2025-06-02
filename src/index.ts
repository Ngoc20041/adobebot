import { Router } from 'itty-router';

const router = Router();

router.post('/api/paypal/webhook', async (request) => {
  const data = await request.json();
  return new Response(JSON.stringify(data, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
});

router.get('/api/status', () => {
  return new Response('Server is running', { headers: { 'Content-Type': 'text/plain' } });
});

router.all('*', () => new Response('Not Found', { status: 404 }));

export default {
  async fetch(request: Request) {
    return router.handle(request);
  },
};
