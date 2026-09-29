const test = require('node:test');
const assert = require('node:assert/strict');
const { handler } = require('../netlify/functions/contact.js');

const post = (fields) => ({
  httpMethod: 'POST',
  headers: { 'x-nf-client-connection-ip': '1.2.3.4' },
  body: new URLSearchParams(fields).toString()
});

const withFetch = (impl, fn) => async () => {
  const original = global.fetch;
  const calls = [];
  global.fetch = async (url, opts) => { calls.push({ url, opts }); return impl(url, opts); };
  try { await fn(calls); } finally { global.fetch = original; delete process.env.TURNSTILE_SECRET; }
};

const ok = (data = {}, status = 200) => ({ ok: status < 400, status, json: async () => data });

test('refuse les méthodes autres que POST', async () => {
  assert.equal((await handler({ httpMethod: 'GET' })).statusCode, 405);
});

test('honeypot rempli : redirection silencieuse, rien n’est transmis', withFetch(() => ok(), async (calls) => {
  const res = await handler(post({ 'form-name': 'contact', 'bot-field': 'spam' }));
  assert.equal(res.statusCode, 303);
  assert.equal(calls.length, 0);
}));

test('secret défini + jeton absent : 400', withFetch(() => ok(), async (calls) => {
  process.env.TURNSTILE_SECRET = 's';
  const res = await handler(post({ 'form-name': 'contact', nom: 'A' }));
  assert.equal(res.statusCode, 400);
  assert.equal(calls.length, 0);
}));

test('jeton refusé par Cloudflare : 400, rien transmis à Netlify', withFetch(() => ok({ success: false }), async (calls) => {
  process.env.TURNSTILE_SECRET = 's';
  const res = await handler(post({ 'form-name': 'contact', 'cf-turnstile-response': 'bad' }));
  assert.equal(res.statusCode, 400);
  assert.equal(calls.length, 1);
}));

test('jeton valide : transmis à Netlify Forms sans le jeton, puis redirection merci', withFetch(
  (url) => (url.includes('siteverify') ? ok({ success: true }) : ok({}, 200)),
  async (calls) => {
    process.env.TURNSTILE_SECRET = 's';
    const res = await handler(post({ 'form-name': 'contact', nom: 'Jean', 'cf-turnstile-response': 'good' }));
    assert.equal(res.statusCode, 303);
    assert.equal(res.headers.Location, '/merci.html');
    const forward = calls[1];
    assert.match(forward.opts.body, /form-name=contact/);
    assert.match(forward.opts.body, /nom=Jean/);
    assert.doesNotMatch(forward.opts.body, /cf-turnstile-response/);
  }
));

test('Netlify Forms en erreur : 502', withFetch((url) => (url.includes('siteverify') ? ok({ success: true }) : ok({}, 500)), async () => {
  process.env.TURNSTILE_SECRET = 's';
  const res = await handler(post({ 'form-name': 'contact', 'cf-turnstile-response': 'good' }));
  assert.equal(res.statusCode, 502);
}));

test('secret absent : le formulaire fonctionne quand même (avertissement)', withFetch(() => ok({}, 200), async () => {
  const res = await handler(post({ 'form-name': 'contact', nom: 'A' }));
  assert.equal(res.statusCode, 303);
}));
