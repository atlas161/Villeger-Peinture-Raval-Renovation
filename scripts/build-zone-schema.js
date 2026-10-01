'use strict';
/**
 * Schéma SVG de la zone d'intervention (accueil) : contour de la Charente (data/charente.geojson),
 * rayon d'environ 50 km autour de la base de L'Isle-d'Espagnac et principales communes.
 * Aucune tuile ni service tiers : le schéma est du SVG en ligne.
 *
 * Usage : node scripts/build-zone-schema.js           → affiche le SVG
 *         node scripts/build-zone-schema.js --inject   → le réécrit dans index.html entre
 *                                                          <!-- zone-schema:start --> et <!-- zone-schema:end -->
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const HQ = [45.658, 0.192]; // [lat, lon]
const RADIUS_KM = 50;
// [nom, lat, lon, ancrage du libellé (start|end|middle), dx, dy]
const CITIES = [
  ['Angoulême', 45.6484, 0.156, 'end', -2.2, -2.2],
  ['Cognac', 45.6958, -0.3287, 'middle', 0, 5],
  ['Jarnac', 45.6812, -0.176, 'middle', 0, -3],
  ['Ruffec', 46.0286, 0.1992, 'start', 2.4, 1],
  ['La Rochefoucauld', 45.7409, 0.3869, 'start', 2.4, -1.2],
  ['Barbezieux', 45.4739, -0.1523, 'middle', 0, 5],
  ['Mansle', 45.8753, 0.1774, 'start', 2.4, 1],
  ['Confolens', 46.013, 0.67, 'end', -2.4, 1],
  ['Chalais', 45.274, 0.029, 'middle', 0, 5],
  ['Montmoreau', 45.396, 0.128, 'start', 2.4, 1.2],
];

const KM_LAT = 110.57;
const kmLon = (lat) => 111.32 * Math.cos((lat * Math.PI) / 180);
const project = ([lat, lon]) => [(lon - HQ[1]) * kmLon(HQ[0]), -(lat - HQ[0]) * KM_LAT];
const f = (n) => Math.round(n * 10) / 10;

function svg() {
  const geo = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'charente.geojson'), 'utf8'));
  const ring = geo.geometry.coordinates[0];
  const pts = ring.map(([lon, lat]) => project([lat, lon]));
  // Simplification : un point sur 2 suffit à cette échelle.
  const kept = pts.filter((_, i) => i % 2 === 0 || i === pts.length - 1);
  const d = 'M' + kept.map(([x, y]) => `${f(x)} ${f(y)}`).join('L') + 'Z';
  // Cadre : contour du département + cercle de rayon, avec une marge pour les libellés.
  const pad = 8;
  const xs = kept.map((p) => p[0]).concat([-RADIUS_KM, RADIUS_KM]);
  const ys = kept.map((p) => p[1]).concat([-RADIUS_KM, RADIUS_KM + 6]);
  const minX = Math.min(...xs) - pad, maxX = Math.max(...xs) + pad;
  const minY = Math.min(...ys) - pad, maxY = Math.max(...ys) + pad;
  const vb = [f(minX), f(minY), f(maxX - minX), f(maxY - minY)];
  const pins = CITIES.map(([name, lat, lon, anchor, dx, dy]) => {
    const [x, y] = project([lat, lon]);
    return `<circle class="zs-pin" cx="${f(x)}" cy="${f(y)}" r="1.6"/><text class="zs-label" x="${f(x + dx)}" y="${f(y + dy)}" text-anchor="${anchor}">${name}</text>`;
  }).join('\n      ');
  return `<svg class="zone-schema-svg" viewBox="${vb.join(' ')}" role="img" aria-labelledby="zone-schema-title">
      <title id="zone-schema-title">Schéma de la zone d'intervention : Charente et rayon d'environ ${RADIUS_KM} km autour de L'Isle-d'Espagnac</title>
      <path class="zs-dept" d="${d}"/>
      <circle class="zs-radius" cx="0" cy="0" r="${RADIUS_KM}"/>
      ${pins}
      <circle class="zs-hq-halo" cx="0" cy="0" r="4.6"/>
      <circle class="zs-hq" cx="0" cy="0" r="2.6"/>
      <text class="zs-label zs-label--hq" x="3.6" y="-4.2" text-anchor="start">Notre base</text>
      <text class="zs-radius-label" x="0" y="${RADIUS_KM + 4}" text-anchor="middle">≈ ${RADIUS_KM} km</text>
    </svg>`;
}

if (process.argv.includes('--inject')) {
  const file = path.join(ROOT, 'index.html');
  const html = fs.readFileSync(file, 'utf8');
  const re = /<!-- zone-schema:start -->[\s\S]*?<!-- zone-schema:end -->/;
  if (!re.test(html)) throw new Error('Marqueurs zone-schema introuvables dans index.html');
  fs.writeFileSync(file, html.replace(re, `<!-- zone-schema:start -->\n    ${svg()}\n    <!-- zone-schema:end -->`));
  console.log('✅ Schéma de zone injecté dans index.html');
} else {
  console.log(svg());
}
