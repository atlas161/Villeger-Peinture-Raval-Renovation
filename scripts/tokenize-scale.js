'use strict';
/**
 * Applique l'échelle du design system aux CSS : tailles de police, ombres, z-index et points de rupture.
 * Idempotent : on peut le relancer, il ne touche que les valeurs hors échelle.
 * Les valeurs de référence sont définies dans :root (assets/css/styles.css) et décrites dans docs/design/tokens.md.
 *
 * Usage : node scripts/tokenize-scale.js            → réécrit assets/css/*.css
 *         node scripts/tokenize-scale.js --dry-run  → affiche seulement le bilan
 */
const fs = require('fs');
const path = require('path');

const CSS_DIR = path.join(__dirname, '..', 'assets', 'css');
const DRY = process.argv.includes('--dry-run');

// ---------- Typographie : valeur en rem → variable (voir :root) ----------
const TEXT_SCALE = [
  [0.75, '--text-2xs'], [0.8125, '--text-xs'], [0.875, '--text-sm'], [0.9375, '--text-md'], [1, '--text-base'],
  [1.0625, '--text-lg'], [1.125, '--text-xl'], [1.25, '--text-2xl'], [1.375, '--text-3xl'], [1.5, '--text-4xl'],
  [1.75, '--text-5xl'], [2, '--text-6xl'], [2.5, '--text-7xl'],
];
const nearestText = (rem) => TEXT_SCALE.reduce((best, cur) =>
  Math.abs(cur[0] - rem) < Math.abs(best[0] - rem) || (Math.abs(cur[0] - rem) === Math.abs(best[0] - rem) && cur[0] > best[0]) ? cur : best)[1];

// ---------- Ombres : selon le flou, vers les 4 ombres neutres ----------
const shadowToken = (blur) => (blur <= 10 ? '--shadow-sm' : blur <= 20 ? '--shadow-md' : blur <= 40 ? '--shadow-lg' : '--shadow-xl');

// ---------- z-index global : valeur → variable ----------
const Z_MAP = { 100: '--z-sticky', 200: '--z-dropdown', 900: '--z-bar', 998: '--z-overlay', 1000: '--z-header', 1050: '--z-menu', 1100: '--z-menu-controls', 1120: '--z-submenu', 1200: '--z-submenu', 9999: '--z-skip' };

// ---------- Points de rupture (max-width = « jusqu'à », min-width = « à partir de ») ----------
const BP_MAP = {
  'max-width: 640px': 'max-width: 639px', 'max-width: 768px': 'max-width: 767px', 'max-width: 1024px': 'max-width: 1023px',
  'max-width: 859px': 'max-width: 991px', 'max-width: 900px': 'max-width: 991px', 'max-width: 800px': 'max-width: 767px',
  'max-width: 420px': 'max-width: 480px',
  'min-width: 769px': 'min-width: 768px', 'min-width: 1025px': 'min-width: 1024px', 'min-width: 860px': 'min-width: 992px',
  'min-width: 380px': 'min-width: 480px',
};

const stats = { font: 0, shadow: 0, z: 0, bp: 0 };

function processFile(file) {
  const name = path.basename(file);
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  let selector = '';
  const out = lines.map((line) => {
    if (/\{\s*$/.test(line)) selector = line;
    let l = line;

    // 1. font-size (hors html, hors SVG .zs-*, hors icônes Leaflet de zone.css pour les px)
    l = l.replace(/^(\s*font-size:\s*)([0-9.]+)(rem|px)(\s*(?:!important)?\s*;)/, (m, pre, num, unit, post) => {
      if (/^\s*html\b/.test(selector) || /\.zs-/.test(selector)) return m;
      let rem = unit === 'rem' ? parseFloat(num) : parseFloat(num) / 16;
      if (unit === 'px' && name === 'zone.css') return m;
      if (rem < 0.6 || rem > 2.6) return m; // décor (icônes 3-4 rem, 72 px…) : on ne touche pas
      stats.font += 1;
      return `${pre}var(${nearestText(rem)})${post}`;
    });

    // 2. box-shadow : une seule couche, sans inset/anneau, ombre neutre ou brune
    l = l.replace(/^(\s*box-shadow:\s*)(0 [0-9.]+px [0-9.]+px(?: [0-9.]+px)? rgba\(([^)]*)\))(\s*(?:!important)?\s*;)/, (m, pre, val, rgb, post) => {
      const parts = val.split(/\s+/);
      const blur = parseFloat(parts[2]);
      const [r, g, b, a] = rgb.split(',').map((x) => parseFloat(x));
      const neutral = (r === 45 && g === 36 && b === 30) || (r === 103 && g === 58 && b === 18) || (r === 0 && g === 0 && b === 0 && a <= 0.08);
      if (!neutral) return m;
      stats.shadow += 1;
      return `${pre}var(${shadowToken(blur)})${post}`;
    });

    // 3. z-index global
    l = l.replace(/^(\s*z-index:\s*)(\d+)(\s*;)/, (m, pre, num, post) => {
      const t = Z_MAP[Number(num)];
      if (!t) return m;
      stats.z += 1;
      return `${pre}var(${t})${post}`;
    });

    // 4. points de rupture
    if (/^\s*@media/.test(l)) {
      let changed = l;
      for (const [from, to] of Object.entries(BP_MAP)) changed = changed.split(from).join(to);
      if (changed !== l) { stats.bp += 1; l = changed; }
    }
    return l;
  });
  if (!DRY) fs.writeFileSync(file, out.join('\n'));
}

for (const f of fs.readdirSync(CSS_DIR).filter((x) => x.endsWith('.css'))) processFile(path.join(CSS_DIR, f));
console.log(`${DRY ? '[simulation] ' : ''}font-size : ${stats.font} · box-shadow : ${stats.shadow} · z-index : ${stats.z} · @media : ${stats.bp}`);
