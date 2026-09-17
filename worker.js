const SESSION_COOKIE = 'navify_session';
const SESSION_DURATION_SECONDS = 8 * 60 * 60;
const MAX_ATTEMPTS = 8;
const ATTEMPT_WINDOW_MS = 60 * 1000;
const attempts = new Map();

function json(body, status, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json; charset=utf-8',
      ...headers
    }
  });
}

function getClientAddress(request) {
  return request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For')?.split(',')[0].trim() || 'unknown';
}

function isRateLimited(ip) {
  const now = Date.now();
  const recentAttempts = (attempts.get(ip) || []).filter((time) => now - time < ATTEMPT_WINDOW_MS);
  attempts.set(ip, recentAttempts);
  return recentAttempts.length >= MAX_ATTEMPTS;
}

function recordAttempt(ip) {
  const recentAttempts = attempts.get(ip) || [];
  recentAttempts.push(Date.now());
  attempts.set(ip, recentAttempts);
}

function base64UrlEncode(bytes) {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecode(value) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function constantTimeEqual(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index] ^ right[index];
  }
  return difference === 0;
}

async function digest(value) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value)));
}

function parseCookies(request) {
  const cookies = {};
  for (const item of (request.headers.get('Cookie') || '').split(';')) {
    const separator = item.indexOf('=');
    if (separator === -1) {
      continue;
    }
    cookies[item.slice(0, separator).trim()] = item.slice(separator + 1).trim();
  }
  return cookies;
}

function getConfiguredCodes(env) {
  return (env.NAVIFY_ACCESS_CODES || '')
    .split(',')
    .map((code) => code.trim())
    .filter(Boolean);
}

async function verifyCode(code, env) {
  const configuredCodes = getConfiguredCodes(env);
  if (!code || configuredCodes.length === 0 || !env.NAVIFY_SESSION_SECRET) {
    return false;
  }

  const submittedHash = await digest(code);
  for (const configuredCode of configuredCodes) {
    const configuredHash = await digest(configuredCode);
    if (constantTimeEqual(submittedHash, configuredHash)) {
      return true;
    }
  }
  return false;
}

async function createSessionCookie(secret, secure) {
  const payload = base64UrlEncode(new TextEncoder().encode(JSON.stringify({
    expiresAt: Date.now() + SESSION_DURATION_SECONDS * 1000,
    nonce: base64UrlEncode(crypto.getRandomValues(new Uint8Array(24)))
  })));
  const signature = base64UrlEncode(await sign(payload, secret));
  return `${SESSION_COOKIE}=${payload}.${signature}; HttpOnly; ${secure ? 'Secure; ' : ''}SameSite=Lax; Path=/; Max-Age=${SESSION_DURATION_SECONDS}`;
}

async function hasValidSession(request, secret) {
  const value = parseCookies(request)[SESSION_COOKIE];
  if (!value || !secret) {
    return false;
  }

  const separator = value.lastIndexOf('.');
  if (separator === -1) {
    return false;
  }

  const payload = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  try {
    const expectedSignature = await sign(payload, secret);
    if (!constantTimeEqual(base64UrlDecode(signature), expectedSignature)) {
      return false;
    }
    const session = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload)));
    return Number.isSafeInteger(session.expiresAt) && session.expiresAt > Date.now();
  } catch {
    return false;
  }
}

async function handleAuth(request, env) {
  const ip = getClientAddress(request);
  if (isRateLimited(ip)) {
    return json({ error: 'Too many attempts' }, 429, { 'Retry-After': '60' });
  }

  try {
    const body = await request.json();
    const code = typeof body.code === 'string' ? body.code.trim() : '';
    recordAttempt(ip);
    if (!(await verifyCode(code, env))) {
      return json({ error: 'Unauthorized' }, 401);
    }

    return json({ authorized: true }, 200, {
      'Set-Cookie': await createSessionCookie(env.NAVIFY_SESSION_SECRET, new URL(request.url).protocol === 'https:')
    });
  } catch {
    return json({ error: 'Invalid request' }, 400);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/auth' && request.method === 'POST') {
      return handleAuth(request, env);
    }

    if (url.pathname === '/api/session' && request.method === 'GET') {
      const authorized = await hasValidSession(request, env.NAVIFY_SESSION_SECRET);
      return authorized ? json({ authorized: true }, 200) : json({ authorized: false }, 401);
    }

    if (url.pathname.startsWith('/api/')) {
      return json({ error: 'Not found' }, 404);
    }

    const assetResponse = await env.ASSETS.fetch(request);
    const headers = new Headers(assetResponse.headers);
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    return new Response(assetResponse.body, { status: assetResponse.status, headers });
  }
};
