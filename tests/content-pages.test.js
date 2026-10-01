'use strict';
// Pages de contenu (À propos, Réalisations) : présentes, référencées, sans lien cassé (les liens sont vérifiés par site-invariants).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

for (const page of ['a-propos.html', 'realisations.html']) {
  test(`${page} : canonical, sitemap, footer et menu`, () => {
    const html = read(page);
    assert.ok(html.includes(`<link rel="canonical" href="https://vprr.fr/${page}"`), 'canonical manquant');
    assert.ok(read('sitemap.xml').includes(`<loc>https://vprr.fr/${page}</loc>`), 'absente du sitemap');
    assert.ok(read('includes/footer.html').includes(`href="/${page}"`), 'absente du footer');
    assert.match(html, /<header class="site-header" id="top">[\s\S]*class="primary-nav"/, 'menu non injecté (npm run sync:header)');
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, 'un seul H1 attendu');
  });
}

test('les filtres de la page Réalisations correspondent aux catégories des cartes', () => {
  const html = read('realisations.html');
  const filters = [...html.matchAll(/data-real-filter="([a-z]+)"/g)].map((m) => m[1]).filter((v) => v !== 'all');
  const cats = new Set([...html.matchAll(/data-real-category="([a-z]+)"/g)].map((m) => m[1]));
  for (const f of filters) assert.ok(cats.has(f), `filtre « ${f} » sans carte`);
});

test("la liste du blog n'a pas d'orphelin : article « à la une » seulement si (n - 1) est multiple de 3", () => {
  const html = read('blog/index.html');
  const n = (html.match(/<article class="article-card"/g) || []).length;
  const featured = /id="articles-grid" class="articles-grid has-featured"/.test(html);
  assert.equal(featured, n >= 4 && n % 3 === 1, `n=${n}, featured=${featured}`);
});

test("l'accueil affiche en HTML statique les 3 derniers articles du blog (plus de carrousel chargé en JS)", () => {
  const home = read('index.html');
  const articles = JSON.parse(read('blog/articles.json')).filter((a) => !a.draft).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
  const block = home.match(/<!-- home-articles:start -->([sS]*?)<!-- home-articles:end -->/);
  assert.ok(block, 'marqueurs home-articles absents');
  const links = [...block[1].matchAll(/href="blog/([^"]+).html"/g)].map((m) => m[1]);
  assert.deepStrictEqual(links, articles.map((a) => a.slug));
  assert.ok(!/blog-home.js|data-blog-carousel/.test(home));
});
