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

