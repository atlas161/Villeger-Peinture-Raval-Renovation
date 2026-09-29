/**
 * @file Fonction Netlify "contact" : vérifie le captcha Cloudflare Turnstile côté serveur,
 * puis transmet le message à Netlify Forms (les demandes arrivent comme avant dans l'interface
 * Netlify et par e-mail). Appelée via /api/contact (voir netlify.toml).
 *
 * Variable d'environnement requise dans Netlify : TURNSTILE_SECRET (clé secrète Turnstile).
 * Si elle est absente, la vérification est ignorée (le site continue de fonctionner) et un
 * avertissement est écrit dans les logs de la fonction.
 */

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const THANKS_PATH = '/merci.html';

const redirect = (location) => ({ statusCode: 303, headers: { Location: location }, body: '' });

const errorPage = (status, message) => ({
  statusCode: status,
  headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  body: `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Message non envoyé | VPRR</title></head><body style="font-family:system-ui,sans-serif;max-width:32rem;margin:4rem auto;padding:0 1rem;line-height:1.5"><h1>Message non envoyé</h1><p>${message}</p><p><a href="javascript:history.back()">← Retourner au formulaire</a> ou appelez-nous au <a href="tel:+33545912270">05 45 91 22 70</a>.</p></body></html>`
});

async function verifyTurnstile(token, secret, ip) {
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set('remoteip', ip);
  const res = await fetch(SITEVERIFY_URL, { method: 'POST', body });
  if (!res.ok) throw new Error(`siteverify HTTP ${res.status}`);
  const data = await res.json();
  return data.success === true;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { Allow: 'POST' }, body: 'Method Not Allowed' };
  }

  const raw = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : event.body || '';
  const params = new URLSearchParams(raw);

  // Honeypot : on fait semblant que tout va bien pour ne pas renseigner les bots.
  if ((params.get('bot-field') || '').trim() !== '') return redirect(THANKS_PATH);

  if (!params.get('form-name')) return errorPage(400, 'Formulaire invalide.');

  const secret = process.env.TURNSTILE_SECRET;
  const token = params.get('cf-turnstile-response');
  params.delete('cf-turnstile-response');

  if (secret) {
    if (!token) return errorPage(400, 'La vérification anti-robot n’a pas abouti. Merci de réessayer.');
    try {
      const ip = (event.headers && (event.headers['x-nf-client-connection-ip'] || event.headers['client-ip'])) || '';
      const ok = await verifyTurnstile(token, secret, ip);
      if (!ok) return errorPage(400, 'La vérification anti-robot a échoué. Merci de réessayer.');
    } catch (err) {
      console.error('[contact] Erreur Turnstile :', err.message);
      return errorPage(502, 'Le service de vérification est momentanément indisponible. Merci de réessayer dans un instant.');
    }
  } else {
    console.warn('[contact] TURNSTILE_SECRET absente : vérification captcha ignorée.');
  }

  // Transmission à Netlify Forms (POST sur la racine du site, comme un envoi natif).
  const siteUrl = (process.env.URL || 'https://vprr.fr').replace(/\/$/, '');
  try {
    const res = await fetch(`${siteUrl}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      redirect: 'manual'
    });
    // Netlify répond 200 ou une redirection (3xx) quand le formulaire est enregistré.
    if (res.status >= 400) throw new Error(`Netlify Forms HTTP ${res.status}`);
  } catch (err) {
    console.error('[contact] Échec de transmission à Netlify Forms :', err.message);
    return errorPage(502, 'Votre message n’a pas pu être enregistré. Merci de réessayer ou de nous appeler.');
  }

  return redirect(THANKS_PATH);
};
