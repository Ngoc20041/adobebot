// @ts-ignore
import * as console from 'node:console';

export default {
  async fetch(request: Request): Promise<Response> {

    console.log('🚀 Request:', request.url);

    return new Response('Not found', { status: 404 });
  }
};

