'use strict';
// Le design system tient dans des échelles (docs/design/tokens.md) : on empêche les valeurs « libres » de revenir.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const CSS_DIR = path.join(__dirname, '..', 'assets', 'css');
const files = fs.readdirSync(CSS_DIR).filter((f) => f.endsWith('.css'));
const css = (f) => fs.readFileSync(path.join(CSS_DIR, f), 'utf8');
const rootCss = css('styles.css');

const declared = (prefix) => [...rootCss.matchAll(new RegExp(`--(${prefix}[a-z0-9-]*):\\s*([^;]+);`, 'g'))].map((m) => m[1]);

test("l'échelle typographique, les couches (z-index) et les ombres sont définies dans :root", () => {
  assert.ok(declared('text-').length >= 13, 'échelle --text-* incomplète');
  assert.ok(declared('z-').length >= 9, 'échelle --z-* incomplète');
  for (const s of ['sm', 'md', 'lg', 'xl']) assert.ok(rootCss.includes(`--shadow-${s}:`), `--shadow-${s} manquante`);
});

test('font-size : uniquement des variables --text-*, clamp(), em, ou une exception documentée', () => {
  const bad = [];
  for (const f of files) {
    css(f).split('\n').forEach((line, i) => {
      const m = line.match(/^\s*font-size:\s*([^;]+);/);
      if (!m) return;
      const v = m[1].replace(/!important/, '').trim();
      if (/^var\(--text-/.test(v) || /^clamp\(/.test(v) || /em$/.test(v) && !/rem$/.test(v)) return;
      const rem = /rem$/.test(v) ? parseFloat(v) : null;
      if (rem !== null && rem > 2.6) return; // décor (grandes icônes)
      if (v === '72px' || v === '16px' || (f === 'zone.css' && /px$/.test(v))) return; // icône, <html>, SVG et icônes Leaflet
      bad.push(`${f}:${i + 1} font-size: ${v}`);
    });
  }
  assert.deepEqual(bad, [], `valeurs hors échelle :\n${bad.join('\n')}`);
});

test('z-index : variables --z-* ou calques locaux (0 à 10, et 600 pour Leaflet)', () => {
  const bad = [];
  for (const f of files) {
    css(f).split('\n').forEach((line, i) => {
      const m = line.match(/^\s*z-index:\s*([^;]+);/);
      if (!m) return;
      const v = m[1].trim();
      if (/^var\(--z-/.test(v)) return;
      const n = Number(v);
      if (Number.isInteger(n) && ((n >= 0 && n <= 10) || n === 600)) return;
      bad.push(`${f}:${i + 1} z-index: ${v}`);
    });
  }
  assert.deepEqual(bad, [], `z-index hors échelle :\n${bad.join('\n')}`);
});

test('box-shadow : pas d\'ombre neutre écrite à la main (utiliser --shadow-sm/md/lg/xl)', () => {
  const bad = [];
  for (const f of files) {
    css(f).split('\n').forEach((line, i) => {
      const m = line.match(/^\s*box-shadow:\s*(0 [0-9.]+px [0-9.]+px(?: [0-9.]+px)? rgba\(([^)]*)\))\s*(?:!important)?;/);
      if (!m) return;
      const [r, g, b, a] = m[2].split(',').map(parseFloat);
      const neutral = (r === 45 && g === 36 && b === 30) || (r === 103 && g === 58 && b === 18) || (r === 0 && g === 0 && b === 0 && a <= 0.08);
      if (neutral) bad.push(`${f}:${i + 1} ${m[1]}`);
    });
  }
  assert.deepEqual(bad, [], `ombres à remplacer par un token :\n${bad.join('\n')}`);
});

test('@media : uniquement les points de rupture du design system', () => {
  const allowed = new Set([480, 639, 640, 767, 768, 991, 992, 1023, 1024, 1200, 1400]);
  const bad = [];
  for (const f of files) {
    css(f).split('\n').forEach((line, i) => {
      if (!/^\s*@media/.test(line)) return;
      for (const m of line.matchAll(/(?:min|max)-width:\s*(\d+)px/g)) {
        if (!allowed.has(Number(m[1]))) bad.push(`${f}:${i + 1} ${m[0]}`);
      }
    });
  }
  assert.deepEqual(bad, [], `points de rupture hors échelle :\n${bad.join('\n')}`);
});

test('border-radius : variables --radius-*, 50 %, 0 ou trait fin (≤ 5 px)', () => {
  const bad = [];
  for (const f of files) {
    css(f).split('\n').forEach((line, i) => {
      const m = line.match(/^\s*border-radius:\s*([^;]+);/);
      if (!m) return;
      const v = m[1].replace(/!important/, '').trim();
      if (/calc\(/.test(v)) return;
      const lits = [...v.matchAll(/(\d*\.?\d+)(px|rem)\b/g)].filter((x) => (x[2] === 'rem' ? parseFloat(x[1]) * 16 : parseFloat(x[1])) > 5);
      if (lits.length) bad.push(`${f}:${i + 1} border-radius: ${v}`);
    });
  }
  assert.deepEqual(bad, [], `rayons en dur à remplacer par --radius-* :\n${bad.join('\n')}`);
});

test('padding / margin / gap : variables --space-* (valeurs en px/rem en dur interdites, hors 0, 1 px, calc/env/clamp)', () => {
  const bad = [];
  for (const f of files) {
    css(f).split('\n').forEach((line, i) => {
      const m = line.match(/^\s*(?:padding|margin|gap|row-gap|column-gap)(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?:\s*([^;]+);/);
      if (!m) return;
      const v = m[1].replace(/!important/, '').trim();
      if (/calc\(|env\(|clamp\(|-\d/.test(v)) return;
      const lits = [...v.matchAll(/(\d*\.?\d+)(px|rem)\b/g)].filter((x) => { const px = x[2] === 'rem' ? parseFloat(x[1]) * 16 : parseFloat(x[1]); return px > 1 && px <= 100; });
      if (lits.length) bad.push(`${f}:${i + 1} ${line.trim()}`);
    });
  }
  assert.deepEqual(bad, [], `espacements en dur à remplacer par --space-* :\n${bad.join('\n')}`);
});
