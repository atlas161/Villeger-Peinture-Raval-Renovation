/**
 * VPRR Build Bundles
 *
 * Les gros fichiers (styles.css, zone.css, main.js) sont écrits en petits fichiers par fonction,
 * dans `src/`, puis assemblés ici — dans l'ordre alphabétique des noms (01-, 02-…) — vers les
 * fichiers servis `assets/css/styles.css`, `assets/css/zone.css` et `assets/js/main.js`.
 * Une seule requête par bundle sur le site, l'ordre de la cascade CSS est celui des numéros.
 *
 *   src/css/styles/*.css  → assets/css/styles.css
 *   src/css/zone/*.css    → assets/css/zone.css
 *   src/js/main/*.js      → assets/js/main.js   (enveloppé dans une IIFE : portée partagée entre modules)
 *
 * Les fichiers assemblés sont versionnés (le site se sert aussi en local avec `npx serve .`) mais
 * ne doivent JAMAIS être édités à la main : modifier `src/`, puis `npm run build:bundles`.
 * `npm test` vérifie qu'ils sont à jour. `src/` n'est pas publié (hors liste blanche de build-site.js).
 *
 * Usage : node scripts/build-bundles.js          (écrit les fichiers)
 *         node scripts/build-bundles.js --check  (échoue si un bundle n'est pas à jour)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const BUNDLES = [
  { out: 'assets/css/styles.css', dir: 'src/css/styles', ext: '.css', kind: 'css' },
  { out: 'assets/css/zone.css', dir: 'src/css/zone', ext: '.css', kind: 'css' },
  { out: 'assets/js/main.js', dir: 'src/js/main', ext: '.js', kind: 'js' },
];

function sources(bundle) {
  return fs.readdirSync(path.join(ROOT, bundle.dir)).filter((f) => f.endsWith(bundle.ext)).sort();
}

function render(bundle) {
  const files = sources(bundle);
  const banner = `/* GÉNÉRÉ par scripts/build-bundles.js depuis ${bundle.dir}/ — ne pas éditer ce fichier. */\n`;
  const parts = files.map((f) => {
    const text = fs.readFileSync(path.join(ROOT, bundle.dir, f), 'utf8').replace(/\s+$/, '');
    return `/* ▸ ${f} */\n${text}\n`;
  });
  if (bundle.kind === 'js') {
    return `${banner}(() => {\n${parts.join('\n')}})();\n`;
  }
  return banner + parts.join('\n');
}

/** Tous les fichiers CSS source (src/css/**) — utilisé par les scripts de tokenisation. */
function cssSourceFiles() {
  return BUNDLES.filter((b) => b.kind === 'css').flatMap((b) => sources(b).map((f) => path.join(ROOT, b.dir, f)));
}

function build({ check = false } = {}) {
  const stale = [];
  for (const b of BUNDLES) {
    const target = path.join(ROOT, b.out);
    const next = render(b);
    const current = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : null;
    if (current === next) continue;
    stale.push(b.out);
    if (!check) fs.writeFileSync(target, next);
  }
  return stale;
}

module.exports = { BUNDLES, build, cssSourceFiles };

if (require.main === module) {
  const check = process.argv.includes('--check');
  const stale = build({ check });
  if (check) {
    if (stale.length) {
      console.error(`❌ Bundles à régénérer (npm run build:bundles) : ${stale.join(', ')}`);
      process.exit(1);
    }
    console.log('✅ Bundles à jour');
  } else {
    console.log(stale.length ? `✅ Bundles écrits : ${stale.join(', ')}` : '✅ Bundles déjà à jour');
  }
}
