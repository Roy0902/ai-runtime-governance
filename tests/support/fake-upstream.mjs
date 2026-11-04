import { createServer } from 'node:http';

const port = Number(process.env.FAKE_UPSTREAM_PORT ?? 19090);
let lastRequest = null;

const server = createServer((request, response) => {
  if (request.method === 'GET' && request.url === '/health') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end('{"ok":true}');
    return;
  }

  if (request.method === 'GET' && request.url === '/__last') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(lastRequest));
    return;
  }

  if (request.method === 'POST' && request.url === '/v1/chat/completions') {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
    });
    request.on('end', () => {
      try {
        lastRequest = JSON.parse(body);
      } catch {
        lastRequest = { invalid: body };
      }
      const payload = {
        id: 'chatcmpl-fake',
        object: 'chat.completion',
        model: lastRequest?.model ?? 'fake',
        choices: [
          {
            index: 0,
            message: { role: 'assistant', content: 'fake answer' },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 20,
          total_tokens: 120,
          prompt_tokens_details: { cached_tokens: 40 },
          completion_tokens_details: { reasoning_tokens: 5 },
        },
      };

      if (lastRequest?.stream) {
        response.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
        });
        response.write(`data: ${JSON.stringify({ choices: [{ delta: { content: 'fake ' } }] })}\n\n`);
        response.write(`data: ${JSON.stringify({ choices: [{ delta: { content: 'answer' } }] })}\n\n`);
        response.write(
          `data: ${JSON.stringify({
            choices: [{ delta: {}, finish_reason: 'stop' }],
            usage: payload.usage,
          })}\n\n`,
        );
        response.end('data: [DONE]\n\n');
        return;
      }

      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(payload));
    });
    return;
  }

  response.writeHead(404, { 'Content-Type': 'application/json' });
  response.end('{"error":"not found"}');
});

server.listen(port, '127.0.0.1');
