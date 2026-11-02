import assert from 'node:assert/strict';
import { test } from 'node:test';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const frontendDir = process.env.GOVERNANCE_FRONTEND_DIR
  ?? resolve(here, '..', '..', '..', 'ai-runtime-governance-frontend');
const { api, setCsrf } = await import(
  pathToFileURL(join(frontendDir, 'src', 'api.ts')).href
);

test('bodyless sign-out declares JSON and carries the current CSRF token', async (t) => {
  let observed;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    observed = { url, options };
    return new Response(null, { status: 204 });
  });
  setCsrf('synthetic-csrf-token');

  await api('/api/v1/auth/sign-out', { method: 'POST' });

  assert.equal(observed.url, '/api/v1/auth/sign-out');
  assert.equal(observed.options.headers['Content-Type'], 'application/json');
  assert.equal(observed.options.headers['X-CSRF-Token'], 'synthetic-csrf-token');
  assert.equal(observed.options.credentials, 'same-origin');
  assert.equal(observed.options.body, undefined);
});

test('context reads do not send mutation headers or a body', async (t) => {
  let observed;
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    observed = options;
    return Response.json({ state: 'ANONYMOUS', csrfToken: 'synthetic-next-token' });
  });

  const context = await api('/api/v1/auth/context');

  assert.equal(observed.method, 'GET');
  assert.equal(observed.headers['Content-Type'], undefined);
  assert.equal(observed.headers['X-CSRF-Token'], undefined);
  assert.equal(context.state, 'ANONYMOUS');
});
