/**
 * Remplace, dans les CSS, les valeurs en dur strictement identiques à un token de :root
 * (couleurs de la palette, rayons 8/12/16/24 px) par la variable correspondante.
 * Remplacement à valeur égale : aucun changement visuel. À relancer après toute retouche
 * de CSS où l'on aurait recopié une valeur en dur. Usage : node scripts/tokenize-css.js
 */
const fs = require('fs');
const path = require('path');
const { build, cssSourceFiles, BUNDLES } = require('./build-bundles');
const CSS_DIR = path.join(__dirname, '..', 'assets', 'css');
// Les bundles (styles.css, zone.css) sont générés : on retouche leurs sources dans src/css/.
const BUNDLED = new Set(BUNDLES.map((b) => path.basename(b.out)));
const CSS_FILES = [
  ...fs.readdirSync(CSS_DIR).filter((f) => f.endsWith('.css') && !BUNDLED.has(f)).map((f) => path.join(CSS_DIR, f)),
  ...cssSourceFiles(),
];

const COLORS = {
  '#673a12': '--color-primary',
  '#522e0e': '--color-primary-hover',
  '#2d241e': '--color-text',
  '#6b5d52': '--color-text-light',
  '#77695e': '--color-text-muted',
  '#a88b5e': '--brand-accent',
  '#f9f7f5': '--color-bg',
  '#ffffff': '--color-white',
  '#f5f2ee': '--color-surface-alt',
  '#e8e4de': '--color-border',
  '#f0ede8': '--color-border-light',
  '#fafaf8': '--color-panel',
};
const RADII = { 8: '--radius-sm', 12: '--radius', 16: '--radius-lg', 24: '--radius-xl' };

let total = 0;
for (const p of CSS_FILES) {
  const file = path.basename(p);
  let css = fs.readFileSync(p, 'utf8');
  // On protège le bloc :root (définition des tokens) : il ne doit pas se référencer lui-même.
  const rootMatch = css.match(/:root\s*\{[^}]*\}/);
  const placeholder = '/*__ROOT__*/';
  const rootBlock = rootMatch ? rootMatch[0] : null;
  if (rootBlock) css = css.replace(rootBlock, placeholder);

  let n = 0;
  css = css.replace(/#[0-9a-fA-F]{6}\b/g, (m) => {
    const v = COLORS[m.toLowerCase()];
    if (!v) return m;
    n += 1;
    return `var(${v})`;
  });
  css = css.replace(/(border-radius:\s*)(8|12|16|24)px(\s*(?:!important)?\s*;)/g, (_, a, px, c) => {
    n += 1;
    return `${a}var(${RADII[px]})${c}`;
  });

  if (rootBlock) css = css.replace(placeholder, rootBlock);
  if (n) {
    fs.writeFileSync(p, css);
    console.log(`  ${file} : ${n} valeur(s) remplacée(s)`);
    total += n;
  }
}
build(); // régénère les bundles depuis src/
console.log(`✅ ${total} remplacement(s)`);
