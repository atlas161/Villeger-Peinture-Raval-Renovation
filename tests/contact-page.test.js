'use strict';
// Le formulaire de devis vit sur UNE page (contact.html) ; les autres pages y renvoient.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const rootHtml = () => fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));

test('contact.html contient le formulaire Netlify « contact » vers /api/contact', () => {
  const html = read('contact.html');
  assert.match(html, /<form[^>]*name="contact"[^>]*action="\/api\/contact"[^>]*data-netlify="true"/);
  assert.match(html, /name="form-name" value="contact"/);
  assert.match(html, /name="bot-field"/, 'honeypot manquant');
  assert.match(html, /cf-turnstile/, 'Turnstile manquant');
  assert.match(html, /id="contact-form"/);
  for (const v of ['ravalement', 'nettoyage-facade', 'toiture', 'peinture', 'isolation', 'renovation', 'autre']) {
    assert.ok(html.includes(`data-value="${v}"`), `option « ${v} » manquante`);
  }
});

test('aucune autre page à la racine ne contient de formulaire', () => {
  for (const f of rootHtml().filter((x) => x !== 'contact.html')) {
    assert.ok(!/<form[\s>]/.test(read(f)), `${f} contient un <form> : il doit vivre dans contact.html`);
  }
});

test('plus aucun lien vers #contact : tous les boutons « devis » mènent à contact.html', () => {
  for (const f of rootHtml()) {
    const html = read(f);
    assert.ok(!/href="(?:\/|index\.html)?#contact"/.test(html), `${f} : lien #contact restant`);
  }
});

test('les pages de service pré-sélectionnent leur service dans contact.html', () => {
  const expected = {
    'ravalement-facade-angouleme.html': 'ravalement',
    'nettoyage-facade-angouleme.html': 'nettoyage-facade',
    'nettoyage-toiture-angouleme.html': 'toiture',
    'peinture-exterieure-charente.html': 'peinture',
    'isolation-interieure-charente.html': 'isolation',
  };
  for (const [file, service] of Object.entries(expected)) {
    assert.ok(read(file).includes(`href="contact.html?service=${service}"`), `${file} : lien contact.html?service=${service} manquant`);
  }
});

test('contact.html est dans le sitemap et son titre ≤ 60 caractères', () => {
  assert.ok(read('sitemap.xml').includes('<loc>https://vprr.fr/contact.html</loc>'));
  const title = read('contact.html').match(/<title>([^<]+)<\/title>/)[1].replace(/&amp;/g, '&');
  assert.ok(title.length <= 60, `titre trop long (${title.length})`);
});

test("la page zone ne charge aucune tuile OpenStreetMap avant le clic (carte à la demande)", () => {
  const html = read('zone-desservie-charente.html');
  assert.match(html, /id="zone-map"[^>]*data-zone-lazy="1"/);
  assert.match(html, /id="zone-map-wrap"[^>]*hidden/);
  assert.ok(!/leaflet/i.test(read('index.html')), "l'accueil ne doit plus charger Leaflet");
});
