/**
 * VPRR Build Site
 *
 * Produit le dossier `dist/` publié par Netlify (liste blanche : seuls les fichiers
 * listés ci-dessous sont publics — plus besoin de bloquer les fichiers internes un par un).
 *
 * Étapes :
 *  1. Copie des fichiers publics vers dist/.
 *  2. Inclusion statique du footer (includes/footer.html) dans chaque page qui charge footer.js
 *     (visible sans JavaScript, pas de décalage de mise en page). En local (`npx serve .`),
 *     footer.js continue de le charger par fetch.
 *  3. Génération de dist/_redirects : /blog/<slug> → /blog/<slug>.html (301), pour qu'un
 *     article n'existe que sous une seule URL, comme les pages du site.
 *
 * Usage : node scripts/build-site.js   (lancé par `npm run build`, après build:blog)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

// Dossiers publics (copiés récursivement) et fichiers racine publics.
const PUBLIC_DIRS = ['assets', 'media', 'includes', 'blog', '.well-known', 'data'];
const PUBLIC_ROOT_FILES = ['robots.txt', 'sitemap.xml', 'llms.txt', 'humans.txt'];
// Chemins (relatifs à la racine) à ne jamais publier même s'ils sont dans un dossier public.
const EXCLUDED = new Set(['includes/partials']);

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    const rel = path.relative(ROOT, from).split(path.sep).join('/');
    if (EXCLUDED.has(rel) || entry.name === '.gitkeep') continue;
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function collectHtml(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectHtml(p));
    else if (entry.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function main() {
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  for (const dir of PUBLIC_DIRS) {
    if (fs.existsSync(path.join(ROOT, dir))) copyDir(path.join(ROOT, dir), path.join(DIST, dir));
  }
  for (const f of fs.readdirSync(ROOT)) {
    if (f.endsWith('.html') || PUBLIC_ROOT_FILES.includes(f)) {
      fs.copyFileSync(path.join(ROOT, f), path.join(DIST, f));
    }
  }

  // Footer statique
  const footer = fs.readFileSync(path.join(ROOT, 'includes', 'footer.html'), 'utf8');
  const wrapper = `<div id="site-footer-wrapper">${footer}</div>\n`;
  let inlined = 0;
  for (const file of collectHtml(DIST)) {
    if (file.includes(`${path.sep}includes${path.sep}`)) continue;
    const html = fs.readFileSync(file, 'utf8');
    if (!/assets\/js\/footer\.js/.test(html) || html.includes('id="site-footer-wrapper"')) continue;
    const i = html.lastIndexOf('</body>');
    if (i === -1) continue;
    fs.writeFileSync(file, html.slice(0, i) + wrapper + html.slice(i));
    inlined += 1;
  }

  // Redirections /blog/<slug> → .html
  const blogDir = path.join(ROOT, 'blog');
  const slugs = fs
    .readdirSync(blogDir)
    .filter((f) => f.endsWith('.html') && f !== 'index.html')
    .map((f) => f.replace(/\.html$/, ''));
  const redirects = slugs.map((s) => `/blog/${s} /blog/${s}.html 301!`).join('\n') + '\n';
  fs.writeFileSync(path.join(DIST, '_redirects'), redirects);

  console.log(`✅ dist/ généré : footer inclus dans ${inlined} page(s), ${slugs.length} redirection(s) blog.`);
}

main();
