/**
 * Met à jour les <lastmod> de sitemap.xml d'après la dernière vraie modification de chaque page.
 *
 *   - fichier modifié et pas encore commité  → date du jour ;
 *   - sinon                                   → date du dernier commit qui a touché le fichier (git log).
 *
 * Google se sert de <lastmod> pour revenir plus vite sur les pages mises à jour, à condition que la date soit
 * fiable. Le script tourne à chaque `npm run build:blog` / `npm run build`, en local. Il ne fait rien si
 * l'historique git est absent ou tronqué (clone superficiel, ex. sur un serveur de build) : le sitemap
 * commité est alors conservé tel quel.
 *
 * Usage : node scripts/update-lastmod.js
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SITEMAP = path.join(ROOT, 'sitemap.xml');
const SITE = 'https://vprr.fr/';

const git = (...args) => {
  try {
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
};

function fileFor(loc) {
  const rel = loc.slice(SITE.length);
  if (rel === '') return 'index.html';
  if (rel.endsWith('/')) return `${rel}index.html`;
  return rel;
}

function main() {
  if (git('rev-parse', '--is-shallow-repository') !== 'false') {
    console.log('   = lastmod : historique git indisponible ou tronqué, sitemap conservé');
    return;
  }
  const today = new Date().toISOString().slice(0, 10);
  const xml = fs.readFileSync(SITEMAP, 'utf8');
  let changed = 0;
  const out = xml.replace(/<url>([\s\S]*?)<\/url>/g, (block) => {
    const loc = (block.match(/<loc>\s*([^<]+?)\s*<\/loc>/) || [])[1];
    if (!loc || !loc.startsWith(SITE)) return block;
    const file = fileFor(loc);
    if (!fs.existsSync(path.join(ROOT, file))) return block;
    const dirty = git('status', '--porcelain', '--', file);
    const date = dirty ? today : git('log', '-1', '--format=%cs', '--', file);
    if (!date) return block;
    const next = block.replace(/<lastmod>[^<]*<\/lastmod>/, `<lastmod>${date}</lastmod>`);
    if (next !== block) changed += 1;
    return next;
  });
  if (out !== xml) fs.writeFileSync(SITEMAP, out);
  console.log(`   ✅ lastmod : ${changed} date(s) mise(s) à jour dans sitemap.xml`);
}

main();
