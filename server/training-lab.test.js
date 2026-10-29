'use strict';

const { after, before, test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { createLabApp } = require('./training-lab');

let server;
let baseUrl;
let aliceToken;

before(async () => {
  const app = express();
  app.use('/api/lab', createLabApp());
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

async function request(path, options) {
  return fetch(`${baseUrl}${path}`, options);
}

test('describes the local-only lab and demo accounts', async () => {
  const response = await request('/api/lab');
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.limits.externalTargets, 'not supported');
  assert.equal(body.demoAccounts.length, 3);
});

test('authenticates fictional accounts and enforces object ownership', async () => {
  const invalidLogin = await request('/api/lab/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'toString', password: 'anything' })
  });
  assert.equal(invalidLogin.status, 401);

  const aliceLogin = await request('/api/lab/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'alice', password: 'alice-practice' })
  });
  const aliceBody = await aliceLogin.json();
  assert.equal(aliceLogin.status, 200);
  aliceToken = aliceBody.token;

  const ownProfile = await request('/api/lab/profiles/alice', {
    headers: { authorization: `Bearer ${aliceToken}` }
  });
  assert.equal(ownProfile.status, 200);

  const otherProfile = await request('/api/lab/profiles/bob', {
    headers: { authorization: `Bearer ${aliceToken}` }
  });
  assert.equal(otherProfile.status, 403);

  const weakScenario = await request('/api/lab/scenarios/authorization-weak/profiles/bob', {
    headers: { authorization: `Bearer ${aliceToken}` }
  });
  assert.equal(weakScenario.status, 200);
  assert.equal((await weakScenario.json()).simulation, 'weak object-level authorization');
});

test('rejects unauthenticated access and invalid note input', async () => {
  const unauthorized = await request('/api/lab/me');
  assert.equal(unauthorized.status, 401);

  const invalidNote = await request('/api/lab/notes', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title: '', body: 'test' })
  });
  assert.equal(invalidNote.status, 400);

  const validNote = await request('/api/lab/notes', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title: 'practice note', body: 'fictional data' })
  });
  assert.equal(validNote.status, 201);
});

test('applies security headers and escapes the HTML demonstration input', async () => {
  const headersResponse = await request('/api/lab/scenarios/security-headers');
  assert.equal(headersResponse.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(headersResponse.headers.get('x-frame-options'), 'DENY');
  assert.equal(headersResponse.headers.get('content-security-policy'), "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
  assert.equal(headersResponse.headers.get('x-powered-by'), null);

  const injectionResponse = await request('/api/lab/scenarios/html-injection', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ sample: '<b>demo</b>' })
  });
  const injectionBody = await injectionResponse.json();
  assert.equal(injectionBody.inputWasRenderedAsHtml, false);
  assert.equal(injectionBody.encodedForHtmlText, '&lt;b&gt;demo&lt;/b&gt;');
});

test('keeps database injection and transport scenarios non-executing', async () => {
  const databaseResponse = await request('/api/lab/scenarios/database-injection', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ sample: 'example input' })
  });
  assert.equal((await databaseResponse.json()).inputWasExecuted, false);

  const transportResponse = await request('/api/lab/scenarios/transport');
  assert.equal((await transportResponse.json()).interceptionToolsProvided, false);
});

test('limits repeated requests to the rate-limit exercise', async () => {
  let lastResponse;
  for (let index = 0; index < 6; index += 1) {
    lastResponse = await request('/api/lab/scenarios/rate-limit');
  }
  assert.equal(lastResponse.status, 429);
});
