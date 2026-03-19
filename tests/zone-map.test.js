const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const zoneMap = require(path.join(__dirname, '..', 'assets', 'js', 'zone-map-leaflet.js'));

test('Centrage: les bounds Charente sont cohérents', () => {
  const bounds = zoneMap.getCharenteBounds();

  assert.ok(Array.isArray(bounds.southWest));
  assert.ok(Array.isArray(bounds.northEast));
  assert.equal(bounds.southWest.length, 2);
  assert.equal(bounds.northEast.length, 2);

  const [minLat, minLng] = bounds.southWest;
  const [maxLat, maxLng] = bounds.northEast;

  assert.ok(minLat < maxLat);
  assert.ok(minLng < maxLng);

  assert.ok(minLat > 45.0 && minLat < 45.6);
  assert.ok(maxLat > 45.9 && maxLat < 46.4);
  assert.ok(minLng > -0.8 && minLng < 0.2);
  assert.ok(maxLng > 0.3 && maxLng < 0.9);

  const [cLat, cLng] = zoneMap.getBoundsCenter(bounds);
  assert.ok(cLat > 45.4 && cLat < 46.0);
  assert.ok(cLng > -0.3 && cLng < 0.4);
});

test('Ratio: la carte respecte 16/9', () => {
  assert.equal(zoneMap.isAspectRatio16by9(1600, 900), true);
  assert.equal(zoneMap.isAspectRatio16by9(1920, 1080), true);
  assert.equal(zoneMap.isAspectRatio16by9(400, 300), false);
});

test('Carte statique: interactions désactivées et contrôles masqués', () => {
  const opts = zoneMap.getStaticMapOptions();
  assert.equal(opts.zoomControl, false);
  assert.equal(opts.scrollWheelZoom, false);
  assert.equal(opts.doubleClickZoom, false);
  assert.equal(opts.boxZoom, false);
  assert.equal(opts.keyboard, false);
  assert.equal(opts.dragging, false);
  assert.equal(opts.touchZoom, false);
});

test("Itinéraire: l'URL Google Maps est définie", () => {
  const url = zoneMap.getRouteUrl();
  assert.match(url, /^https:\/\/www\.google\.com\/maps\/dir\/\?api=1&destination=/);
});

test('Angoulême: coordonnées définies pour le centrage', () => {
  const [lat, lng] = zoneMap.getAngoulemeLatLng();
  assert.ok(Math.abs(lat - 45.6484) < 1e-6);
  assert.ok(Math.abs(lng - 0.1560) < 1e-6);
});

test('CSS: .zone-map-container définit aspect-ratio 16/9', () => {
  const cssPath = path.join(__dirname, '..', 'assets', 'css', 'zone.css');
  const css = fs.readFileSync(cssPath, 'utf8');

  assert.match(css, /\.zone-map-container\s*\{[\s\S]*?aspect-ratio:\s*16\s*\/\s*9\s*;[\s\S]*?\}/m);
  assert.doesNotMatch(css, /aspect-ratio:\s*4\s*\/\s*3\s*;/m);
});
