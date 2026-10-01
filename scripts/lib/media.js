'use strict';
/**
 * Images des pages pilotées par le CMS.
 *
 * Le client peut téléverser n'importe quelle photo (JPEG, PNG, WebP, téléphone compris) dans
 * media/uploads/ via Pages CMS : on ne la redimensionne pas à la main. Au rendu :
 *  - les photos « historiques » nommées `xxx-900w.webp` (avec leurs variantes 600/900/1200) gardent leur srcset ;
 *  - toute autre photo passe par Netlify Image CDN (`/.netlify/images?url=…&w=…&fm=webp`) : redimensionnée
 *    et convertie en WebP à la demande, sans dépendance npm ni étape de build.
 * Les dimensions (width/height) sont lues dans l'en-tête du fichier pour éviter les décalages de mise en page
 * (orientation EXIF comprise).
 */
const fs = require('fs');
const path = require('path');
const { webpSize } = require('./image-size');

const ROOT = path.join(__dirname, '..', '..');
const CDN_WIDTHS = [480, 800, 1200];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Chemin public « /media/x.jpg » ou relatif → chemin relatif à la racine du dépôt (« media/x.jpg »). */
const rel = (src) => src.replace(/^\/+/, '');

function jpegSize(b) {
  let i = 2;
  let orientation = 1;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1];
    const len = b.readUInt16BE(i + 2);
    if (m === 0xe1 && b.toString('ascii', i + 4, i + 8) === 'Exif') {
      const t = i + 10; // début de l'en-tête TIFF
      const le = b.toString('ascii', t, t + 2) === 'II';
      const u16 = (o) => (le ? b.readUInt16LE(o) : b.readUInt16BE(o));
      const u32 = (o) => (le ? b.readUInt32LE(o) : b.readUInt32BE(o));
      const ifd = t + u32(t + 4);
      const n = u16(ifd);
      for (let k = 0; k < n; k++) if (u16(ifd + 2 + k * 12) === 0x0112) orientation = u16(ifd + 2 + k * 12 + 8);
    }
    if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) {
      const height = b.readUInt16BE(i + 5);
      const width = b.readUInt16BE(i + 7);
      return orientation >= 5 ? { width: height, height: width } : { width, height };
    }
    i += 2 + len;
  }
  return null;
}

function imageSize(file) {
  const b = fs.readFileSync(file);
  if (b[0] === 0xff && b[1] === 0xd8) return jpegSize(b);
  if (b.toString('ascii', 1, 4) === 'PNG') return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  return webpSize(file);
}

/**
 * @param {object} o  src (chemin dans le dépôt, avec ou sans « / »), alt, sizes, className, id, eager
 * @returns {string} balise <img> complète
 */
function img({ src, alt, sizes, className, id, eager }) {
  const file = path.join(ROOT, rel(src));
  if (!fs.existsSync(file)) throw new Error(`Image introuvable : ${src} (ajoutez-la dans Pages CMS > Médias)`);
  let srcAttr;
  let srcset;
  let size = imageSize(file);
  const legacy = rel(src).match(/^(.*)-(\d+)w\.webp$/);
  const variants = legacy
    ? [600, 900, 1200].filter((w) => fs.existsSync(path.join(ROOT, `${legacy[1]}-${w}w.webp`)))
    : [];
  if (legacy && variants.length > 1) {
    srcAttr = rel(src);
    srcset = variants.map((w) => `${legacy[1]}-${w}w.webp ${w}w`).join(', ');
  } else {
    const url = '/' + rel(src);
    const cdn = (w) => `/.netlify/images?url=${encodeURI(url)}&amp;w=${w}&amp;fm=webp&amp;q=80`;
    srcAttr = cdn(800);
    srcset = CDN_WIDTHS.map((w) => `${cdn(w)} ${w}w`).join(', ');
    if (size && size.width > 800) size = { width: 800, height: Math.round((size.height * 800) / size.width) };
  }
  const attrs = [
    `src="${srcAttr}"`,
    `srcset="${srcset}"`,
    sizes ? `sizes="${sizes}"` : null,
    `alt="${esc(alt || '')}"`,
    size ? `width="${size.width}" height="${size.height}"` : null,
    className ? `class="${className}"` : null,
    id ? `id="${id}"` : null,
    eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"',
    'decoding="async"',
  ].filter(Boolean);
  return `<img ${attrs.join(' ')} />`;
}

module.exports = { img, imageSize, esc, rel };
