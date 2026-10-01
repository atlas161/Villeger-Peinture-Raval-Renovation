'use strict';
// Pages CMS : la configuration doit rester alignée avec les fichiers de contenu, sinon une sauvegarde dans
// l'éditeur ferait disparaître des champs ou casserait une page.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { config } = require('../scripts/cms-config.js');

const ROOT = path.join(__dirname, '..');
const json = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

const files = [];
(function collect(entries) {
  for (const e of entries) {
    if (e.type === 'group') collect(e.items);
    else if (e.type === 'file') files.push(e);
  }
})(config.content);

test('.pages.yml est à jour par rapport à scripts/cms-config.js (npm run build:cms)', () => {
  const r = spawnSync('node', [path.join(ROOT, 'scripts', 'build-cms-config.js'), '--check'], { encoding: 'utf8' });
  assert.strictEqual(r.status, 0, r.stderr || r.stdout);
});

test('noms Pages CMS uniques', () => {
  const names = [];
  (function walk(entries) { for (const e of entries) { names.push(e.name); if (e.items) walk(e.items); } })(config.content);
  assert.strictEqual(new Set(names).size, names.length, `noms en double : ${names.join(', ')}`);
});

function checkKeys(data, fields, where) {
  if (Array.isArray(data)) return data.forEach((d, i) => checkKeys(d, fields, `${where}[${i}]`));
  if (!data || typeof data !== 'object') return;
  for (const [k, v] of Object.entries(data)) {
    const f = fields.find((x) => x.name === k);
    assert.ok(f, `${where} : le champ « ${k} » n'est pas déclaré dans scripts/cms-config.js (il serait perdu à la sauvegarde)`);
    if (f.fields) checkKeys(v, f.fields, `${where}.${k}`);
  }
}

for (const entry of files) {
  test(`CMS « ${entry.name} » : le fichier existe et tous ses champs sont déclarés`, () => {
    assert.ok(fs.existsSync(path.join(ROOT, entry.path)), `${entry.path} introuvable`);
    checkKeys(json(entry.path), entry.fields, entry.path);
  });
}

test('toutes les photos citées dans le contenu existent', () => {
  const missing = [];
  const walk = (o, f) => {
    if (typeof o === 'string') {
      if (/^\/media\/.+\.(jpe?g|png|webp)$/i.test(o) && !fs.existsSync(path.join(ROOT, o))) missing.push(`${f} → ${o}`);
    } else if (o && typeof o === 'object') Object.values(o).forEach((x) => walk(x, f));
  };
  for (const e of files) walk(json(e.path), e.path);
  assert.deepStrictEqual(missing, []);
});

test('les prix du bloc « Prix au m² » se retrouvent dans la FAQ de la page (cohérence prix ↔ FAQ)', () => {
  const { loadPage, listSlugs } = require('../scripts/lib/content-loader.js');
  const nb = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;| /g, ' ').replace(/\s+/g, ' ');
  for (const slug of listSlugs()) {
    const page = loadPage(slug);
    const price = page.sections.find((s) => s.type === 'tarifs').price;
    const faqs = page.sections.find((s) => s.type === 'faq').items;
    const priceQ = nb(faqs.find((i) => /prix/i.test(i.question)).answerHtml);
    for (const c of price.cards) {
      const m = c.price.match(/(\d+)-(\d+)/);
      assert.ok(m, `${slug} : prix illisible « ${c.price} » (format attendu : 25-40 €/m²)`);
      const lo = c.price.startsWith('+') ? `+${m[1]} à ${m[2]}` : `${m[1]} à ${m[2]}`;
      assert.ok(priceQ.includes(lo), `${slug} : « ${c.title} » (${c.price}) absent de la FAQ prix (attendu « ${lo} »)`);
    }
  }
});

test('À propos et Réalisations sont à jour par rapport à leurs données (npm run build:content)', () => {
  const r = spawnSync('node', [path.join(ROOT, 'scripts', 'build-content-pages.js'), '--check'], { encoding: 'utf8' });
  assert.strictEqual(r.status, 0, r.stderr || r.stdout);
});
