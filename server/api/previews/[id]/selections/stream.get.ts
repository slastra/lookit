import { selectionsEmitter } from '~~/server/utils/selections-emitter';

export default defineEventHandler((event) => {
  const previewId = getRouterParam(event, 'id');
  if (!previewId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing preview id' });
  }

  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const onSelection = (selection: unknown) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(selection)}\n\n`));
        }
        catch {
          // stream closed
        }
      };

      selectionsEmitter.on(`selection:${previewId}`, onSelection);

      // Keep-alive every 30s
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': keepalive\n\n'));
        }
        catch {
          clearInterval(keepAlive);
        }
      }, 30_000);

      event.node.req.on('close', () => {
        selectionsEmitter.off(`selection:${previewId}`, onSelection);
        clearInterval(keepAlive);
        try { controller.close(); }
        catch { /* already closed */ }
      });
    },
  });

  return new Response(stream);
});
