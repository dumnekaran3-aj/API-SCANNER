'use strict';

const crypto = require('node:crypto');
const net = require('node:net');
const express = require('express');

const HOST = '127.0.0.1';
const DEFAULT_PORT = 8010;
const TOKEN_TTL_MS = 10 * 60 * 1000;

const profiles = {
  alice: { id: 'alice', name: 'Alice Example', email: 'alice@example.test' },
  bob: { id: 'bob', name: 'Bob Example', email: 'bob@example.test' },
  admin: { id: 'admin', name: 'Admin Example', email: 'admin@example.test' }
};

const demoAccounts = {
  alice: { password: 'alice-practice', role: 'user' },
  bob: { password: 'bob-practice', role: 'user' },
  admin: { password: 'admin-practice', role: 'admin' }
};

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function safeEqual(left, right) {
  const leftHash = crypto.createHash('sha256').update(left).digest();
  const rightHash = crypto.createHash('sha256').update(right).digest();
  return crypto.timingSafeEqual(leftHash, rightHash);
}

function createRateLimiter(limit, windowMs) {
  const buckets = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip;
    let bucket = buckets.get(key);

    if (!bucket || now >= bucket.resetAt) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }

    bucket.count += 1;
    res.setHeader('RateLimit-Limit', String(limit));
    res.setHeader('RateLimit-Remaining', String(Math.max(0, limit - bucket.count)));
    res.setHeader('RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > limit) {
      return res.status(429).json({
        error: 'Practice rate limit reached. Wait for the window to reset.'
      });
    }

    if (buckets.size > 1000) {
      for (const [bucketKey, value] of buckets) {
        if (now >= value.resetAt) buckets.delete(bucketKey);
      }
    }

    return next();
  };
}

function createLabApp() {
  const app = express();
  const sessions = new Map();
  const loginRateLimit = createRateLimiter(10, 60 * 1000);

  app.disable('x-powered-by');
  app.use((req, res, next) => {
    const remoteAddress = req.socket.remoteAddress || '';
    const address = remoteAddress.startsWith('::ffff:') ? remoteAddress.slice(7) : remoteAddress;
    const isLoopback = address === '::1' || (net.isIPv4(address) && address.startsWith('127.'));
    if (!isLoopback) {
      return res.status(403).json({ error: 'The practice lab is available only from this machine.' });
    }
    return next();
  });
  app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    next();
  });
  app.use(express.json({ limit: '8kb', strict: true }));

  app.get('/', (req, res) => {
    res.json({
      message: 'Local-only API security practice lab. All records and scenarios are fictional.',
      host: HOST,
      demoAccounts: Object.entries(demoAccounts).map(([username, account]) => ({
        username,
        password: account.password,
        role: account.role
      })),
      scenarios: [
        'authentication',
        'authorization',
        'input-validation',
        'rate-limiting',
        'security-headers',
        'html-injection-simulation',
        'database-injection-simulation',
        'mitm-threat-model'
      ],
      limits: {
        externalTargets: 'not supported',
        database: 'none; in-memory fictional data only',
        rateLimitDemo: '5 requests per minute per local client'
      }
    });
  });

  app.post('/auth/login', loginRateLimit, (req, res) => {
    const { username, password } = req.body || {};
    if (!isRecord(req.body) || typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Provide a JSON object with username and password strings.' });
    }

    const account = Object.hasOwn(demoAccounts, username) ? demoAccounts[username] : null;
    if (!account || !safeEqual(password, account.password)) {
      return res.status(401).json({ error: 'Invalid practice credentials.' });
    }

    const now = Date.now();
    for (const [existingToken, session] of sessions) {
      if (now >= session.expiresAt) sessions.delete(existingToken);
    }
    if (sessions.size >= 1000) {
      return res.status(503).json({ error: 'Practice session limit reached; restart the lab to clear sessions.' });
    }

    const token = crypto.randomBytes(32).toString('base64url');
    sessions.set(token, { userId: username, role: account.role, expiresAt: now + TOKEN_TTL_MS });
    return res.json({ token, tokenType: 'Bearer', expiresInSeconds: TOKEN_TTL_MS / 1000 });
  });

  function requireSession(req, res, next) {
    const authorization = req.get('authorization') || '';
    const match = /^Bearer ([A-Za-z0-9_-]+)$/.exec(authorization);
    const session = match && sessions.get(match[1]);

    if (!session || Date.now() >= session.expiresAt) {
      if (match) sessions.delete(match[1]);
      return res.status(401).json({ error: 'A valid practice Bearer token is required.' });
    }

    req.practiceSession = session;
    return next();
  }

  app.get('/me', requireSession, (req, res) => {
    res.json({ id: req.practiceSession.userId, role: req.practiceSession.role });
  });

  app.get('/profiles/:id', requireSession, (req, res) => {
    const profile = Object.hasOwn(profiles, req.params.id) ? profiles[req.params.id] : null;
    if (!profile) return res.status(404).json({ error: 'Practice profile not found.' });
    if (req.practiceSession.role !== 'admin' && req.practiceSession.userId !== profile.id) {
      return res.status(403).json({ error: 'You may only access your own practice profile.' });
    }
    return res.json({ profile });
  });

  app.get('/scenarios/authorization-weak/profiles/:id', requireSession, (req, res) => {
    const profile = Object.hasOwn(profiles, req.params.id) ? profiles[req.params.id] : null;
    if (!profile) return res.status(404).json({ error: 'Practice profile not found.' });
    return res.json({
      simulation: 'weak object-level authorization',
      warning: 'Intentionally weak route; fictional records only, bound to localhost.',
      profile
    });
  });

  app.post('/notes', (req, res) => {
    if (!isRecord(req.body)) {
      return res.status(400).json({ error: 'Provide a JSON object.' });
    }

    const keys = Object.keys(req.body);
    if (keys.some((key) => !['title', 'body'].includes(key))) {
      return res.status(400).json({ error: 'Only title and body fields are accepted.' });
    }
    if (typeof req.body.title !== 'string' || req.body.title.trim().length < 1 || req.body.title.trim().length > 80) {
      return res.status(400).json({ error: 'title must contain 1 to 80 characters.' });
    }
    if (typeof req.body.body !== 'string' || req.body.body.length > 500) {
      return res.status(400).json({ error: 'body must be a string of at most 500 characters.' });
    }

    return res.status(201).json({
      note: { title: req.body.title.trim(), body: req.body.body },
      storage: 'not persisted'
    });
  });

  app.get('/scenarios/rate-limit', createRateLimiter(5, 60 * 1000), (req, res) => {
    res.json({ message: 'Practice request accepted.' });
  });

  app.get('/scenarios/security-headers', (req, res) => {
    res.json({
      message: 'Inspect this response for the lab security headers.',
      note: 'HSTS is not set because this loopback lab uses plain HTTP; production HSTS requires HTTPS.'
    });
  });

  app.post('/scenarios/html-injection', (req, res) => {
    const sample = req.body && req.body.sample;
    if (!isRecord(req.body) || typeof sample !== 'string' || sample.length > 200) {
      return res.status(400).json({ error: 'Provide a sample string of at most 200 characters.' });
    }
    const escaped = sample
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
    return res.json({
      simulation: 'HTML output encoding',
      inputWasRenderedAsHtml: false,
      encodedForHtmlText: escaped
    });
  });

  app.post('/scenarios/database-injection', (req, res) => {
    if (!isRecord(req.body) || typeof req.body.sample !== 'string' || req.body.sample.length > 200) {
      return res.status(400).json({ error: 'Provide a sample string of at most 200 characters.' });
    }
    return res.json({
      simulation: 'database injection threat model',
      inputWasExecuted: false,
      databaseConnected: false,
      safePractice: 'Use parameterized queries and allowlist validation; this lab does not parse or execute query input.'
    });
  });

  app.get('/scenarios/transport', (req, res) => {
    res.json({
      simulation: 'MITM threat model only',
      scheme: 'http',
      host: HOST,
      interceptionToolsProvided: false,
      safePractice: 'Use HTTPS with valid certificate verification outside this isolated HTTP-only lab.'
    });
  });

  app.use((req, res) => {
    res.status(404).json({ error: 'Practice route not found.' });
  });

  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    if (err.type === 'entity.too.large') {
      return res.status(413).json({ error: 'JSON request body exceeds the 8kb lab limit.' });
    }
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Malformed JSON request body.' });
    }
    console.error('Training lab request failed:', err);
    return res.status(500).json({ error: 'Unexpected training lab error.' });
  });

  return app;
}

function getPort() {
  const value = process.env.LAB_PORT || String(DEFAULT_PORT);
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('LAB_PORT must be an integer between 1 and 65535.');
  }
  return port;
}

if (require.main === module) {
  const port = getPort();
  const app = express();
  app.use('/api/lab', createLabApp());
  app.listen(port, HOST, () => {
    console.log(`Local API security lab listening at http://${HOST}:${port}`);
    console.log('Loopback-only; fictional data; no external target scanning or database access.');
  });
}

module.exports = { createLabApp };
