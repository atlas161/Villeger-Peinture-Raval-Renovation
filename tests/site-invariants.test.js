'use strict';
// Invariants du site : liens internes, balises SEO de base, sitemap, contenu du dossier dist/.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

const pages = [
  ...fs.readdirSync(ROOT).filter((f) => f.endsWith('.html')),
  ...fs.readdirSync(path.join(ROOT, 'blog')).filter((f) => f.endsWith('.html')).map((f) => `blog/${f}`),
];
const indexable = pages.filter((p) => !/noindex/.test(read(p)));

test('chaque page indexable a un seul H1, un canonical et un <title> de 60 caractères max', () => {
  for (const p of indexable) {
    const html = read(p);
    assert.strictEqual((html.match(/<h1[\s>]/g) || []).length, 1, `${p} : un seul <h1> attendu`);
    assert.match(html, /<link rel="canonical" href="https:\/\/vprr\.fr\//, `${p} : canonical manquant`);
    const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
    assert.ok(title, `${p} : <title> manquant`);
    assert.ok(title.length <= 60, `${p} : <title> trop long (${title.length}) : ${title}`);
  }
});

test('les liens et ancres internes pointent vers des fichiers/ids existants', () => {
  const ids = {};
  const idsOf = (f) => (ids[f] ||= new Set([...read(f).matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  const errors = [];
  for (const p of pages) {
    const dir = path.posix.dirname(p);
    for (const m of read(p).matchAll(/\s(?:href|src)="([^"]+)"/g)) {
      const u = m[1];
      if (/^(https?:|mailto:|tel:|data:|javascript:|\/\/|\{\{|#$)/.test(u)) continue;
      const [file, hash] = u.split('#');
      const clean = file.split('?')[0];
      let target = clean === '' ? p : clean.startsWith('/') ? clean.slice(1) : path.posix.join(dir === '.' ? '' : dir, clean);
      if (target === '' || target.endsWith('/')) target += 'index.html';
      if (!fs.existsSync(path.join(ROOT, target))) { errors.push(`${p} -> ${u}`); continue; }
      if (hash && target.endsWith('.html') && !idsOf(target).has(hash)) errors.push(`${p} -> ${u} (ancre)`);
    }
  }
  assert.deepStrictEqual(errors, []);
});

test('chaque URL du sitemap correspond à un fichier', () => {
  const urls = [...read('sitemap.xml').matchAll(/<loc>https:\/\/vprr\.fr([^<]*)<\/loc>/g)].map((m) => m[1]);
  assert.ok(urls.length > 10);
  for (const u of urls) {
    const f = u === '/' ? 'index.html' : u.endsWith('/') ? `${u.slice(1)}index.html` : u.slice(1);
    assert.ok(fs.existsSync(path.join(ROOT, f)), `sitemap : ${u} introuvable`);
  }
});

test('le build publie uniquement les fichiers publics, avec footer statique', () => {
  execFileSync('node', [path.join(ROOT, 'scripts', 'build-site.js')], { stdio: 'pipe' });
  const dist = (f) => path.join(ROOT, 'dist', f);
  for (const f of ['index.html', 'blog/index.html', 'sitemap.xml', 'assets/css/styles.css', '_redirects']) {
    assert.ok(fs.existsSync(dist(f)), `dist/${f} manquant`);
  }
  for (const f of ['CLAUDE.md', 'package.json', 'docs', 'content', 'scripts', 'tests', 'blog/template-article.html', 'includes/partials', 'node_modules']) {
    assert.ok(!fs.existsSync(dist(f)), `dist/${f} ne doit pas être publié`);
  }
  assert.match(fs.readFileSync(dist('index.html'), 'utf8'), /id="site-footer-wrapper"/);
});
