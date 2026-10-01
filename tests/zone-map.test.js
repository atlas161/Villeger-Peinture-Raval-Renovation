const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');

test('Carte de zone : Google Maps intégré directement, identique sur l’accueil et la page zone', () => {
  for (const page of ['index.html', 'zone-desservie-charente.html']) {
    const html = read(page);
    assert.match(html, /<div class="zone-map-embed">\s*<iframe src="https:\/\/www\.google\.com\/maps\?ll=45\.655,0\.17&q=45\.65819,0\.19226&z=11&hl=fr&output=embed"/, `${page} : carte absente ou paramètres différents`);
    assert.ok(!/leaflet|openstreetmap/i.test(html), `${page} ne doit plus charger Leaflet/OpenStreetMap`);
  }
});

test('Carte de zone : la CSP autorise Google Maps et les mentions légales le citent', () => {
  assert.match(read('netlify.toml'), /frame-src https:\/\/www\.google\.com /);
  assert.match(read('mentions-legales.html'), /carte de notre zone d'intervention/);
});
