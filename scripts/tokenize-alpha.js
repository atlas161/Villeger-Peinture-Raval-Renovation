/**
 * Remplace les rgba(...) en dur (blanc, noir, brun de marque, voile du hero, or) par des tokens d'opacité de :root
 * (--white-a80, --black-a10, --primary-a12, --scrim-a75, --accent-a12…). L'opacité est ramenée au cran le plus proche
 * (écart max 0,03 : invisible). Les définitions de :root (02-tokens.css) et les dégradés vers « transparent » ne sont pas touchés.
 * Usage : node scripts/tokenize-alpha.js (puis npm run build:bundles). Idempotent.
 */
const fs = require('fs');
const path = require('path');
const { cssSourceFiles, BUNDLES } = require('./build-bundles');
const CSS_DIR = path.join(__dirname, '..', 'assets', 'css');
const BUNDLED = new Set(BUNDLES.map((b) => path.basename(b.out)));
const FILES = [
  ...fs.readdirSync(CSS_DIR).filter((f) => f.endsWith('.css') && !BUNDLED.has(f)).map((f) => path.join(CSS_DIR, f)),
  ...cssSourceFiles(),
].filter((f) => !f.endsWith('02-tokens.css'));

const FAMILIES = {
  '255,255,255': { name: 'white', steps: [0.08, 0.12, 0.16, 0.28, 0.36, 0.55, 0.65, 0.8, 0.88, 0.95] },
  '0,0,0': { name: 'black', steps: [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.45, 0.55] },
  '103,58,18': { name: 'primary', steps: [0.04, 0.06, 0.08, 0.12, 0.16, 0.2, 0.8] },
  '10,5,2': { name: 'scrim', steps: [0.2, 0.45, 0.55, 0.65, 0.75, 0.88] },
  '168,139,94': { name: 'accent', steps: [0.08, 0.12, 0.45] },
};
const used = new Set();
let maxDelta = 0;
for (const file of FILES) {
  const src = fs.readFileSync(file, 'utf8');
  const out = src.split('\n').map((line) => {
    if (/^\s*--[\w-]+\s*:/.test(line)) return line;
    return line.replace(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/g, (m, r, g, b, a) => {
      const fam = FAMILIES[`${r},${g},${b}`];
      const alpha = parseFloat(a);
      if (!fam || alpha === 0) return m;
      const step = fam.steps.reduce((best, s) => (Math.abs(s - alpha) < Math.abs(best - alpha) ? s : best));
      maxDelta = Math.max(maxDelta, Math.abs(step - alpha));
      const token = `--${fam.name}-a${Math.round(step * 100)}`;
      used.add(`${token}|rgba(${r}, ${g}, ${b}, ${step})`);
      return `var(${token})`;
    });
  }).join('\n');
  if (out !== src) fs.writeFileSync(file, out);
}
console.log('écart max :', maxDelta.toFixed(2));
console.log([...used].sort().map((u) => { const [t, v] = u.split('|'); return `  ${t}: ${v};`; }).join('\n'));
