'use strict';
// Les pages de service sont générées (scripts/build-pages.js) : elles doivent correspondre à leurs données.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SECTION_TYPES = ['hero', 'realisation', 'problem', 'solution', 'ite', 'why', 'zone', 'others', 'tarifs', 'faq', 'contact'];

test('les pages de service sont à jour par rapport à content/pages (npm run build:pages)', () => {
  const r = spawnSync('node', [path.join(ROOT, 'scripts', 'build-pages.js'), '--check'], { encoding: 'utf8' });
  assert.strictEqual(r.status, 0, r.stderr || r.stdout);
});

test('chaque page de service a des données complètes et des sections valides', () => {
  const { loadPage, listSlugs } = require('../scripts/lib/content-loader.js');
  const slugs = listSlugs();
  assert.ok(slugs.length >= 5);
  for (const slug of slugs) {
    const page = loadPage(slug);
    assert.strictEqual(page.file, `${slug}.html`, `${slug} : « file » doit valoir ${slug}.html`);
    for (const k of ['title', 'description', 'ogTitle', 'ogDescription', 'twitterTitle', 'twitterDescription']) {
      assert.ok(page.head[k], `${slug} : head.${k} manquant`);
    }
    assert.ok(page.head.title.length <= 60, `${slug} : <title> trop long (${page.head.title.length})`);
    const types = page.sections.map((s) => s.type);
    for (const t of types) assert.ok(SECTION_TYPES.includes(t), `${slug} : section inconnue « ${t} »`);
    for (const t of ['hero', 'tarifs', 'contact', 'faq']) assert.ok(types.includes(t), `${slug} : section « ${t} » manquante`);
    assert.ok(page.sections.some((x) => x.type === 'faq' && x.items.length > 0), `${slug} : FAQ vide`);
    assert.ok(!page.ld.faq, `${slug} : le JSON-LD FAQ est dérivé de la section faq`);
  }
});

// La FAQ visible et son JSON-LD (FAQPage) doivent dire la même chose, page par page (SEO : pas de rich result trompeur).
test('FAQ : le JSON-LD FAQPage reprend exactement les questions affichées', () => {
  const pages = ['index.html', 'faq-renovation-angouleme.html', 'zone-desservie-charente.html', ...fs.readdirSync(path.join(__dirname, '..')).filter((f) => /^(ravalement|nettoyage|peinture|isolation)-.*\.html$/.test(f))];
  const norm = (t) => t.replace(/<[^>]+>/g, '').replace(/&nbsp;| /g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
  for (const f of pages) {
    const html = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
    const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1])).find((j) => j['@type'] === 'FAQPage');
    assert.ok(ld, `${f} : FAQPage manquant`);
    const shown = [...html.matchAll(/<(?:summary|span)[^>]*>(?:\s*<span class="faq-icon-badge[\s\S]*?<\/span>\s*<span>)?([\s\S]*?)<\/(?:summary|span)>/g)]
      .filter((m) => /faq-question/.test(m[0]) || m[0].startsWith('<summary'))
      .map((m) => norm(m[1]));
    assert.ok(shown.length >= 4, `${f} : questions affichées introuvables`);
    const asked = ld.mainEntity.map((q) => norm(q.name));
    for (const q of asked) assert.ok(shown.includes(q), `${f} : question du JSON-LD absente de la page : « ${q} »`);
    assert.equal(new Set(asked).size, asked.length, `${f} : question en double dans le JSON-LD`);
  }
});
