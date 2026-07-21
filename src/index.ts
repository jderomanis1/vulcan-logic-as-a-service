export default {
  async fetch(_request: Request): Promise<Response> {
    return new Response('Live long and prosper.', {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Live-Long': 'and-prosper',
        'Access-Control-Allow-Origin': '*',
      },
    });
  },
} satisfies ExportedHandler;
