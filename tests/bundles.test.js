'use strict';
// styles.css, zone.css et main.js sont assemblés depuis src/ : ils doivent être à jour,
// et src/ ne doit pas être publié.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { build, BUNDLES } = require('../scripts/build-bundles');

const ROOT = path.join(__dirname, '..');

test('les bundles assemblés depuis src/ sont à jour (npm run build:bundles)', () => {
  assert.deepStrictEqual(build({ check: true }), []);
});

test('chaque module source est un petit fichier numéroté', () => {
  for (const b of BUNDLES) {
    const files = fs.readdirSync(path.join(ROOT, b.dir)).filter((f) => f.endsWith(b.ext));
    assert.ok(files.length >= 5, `${b.dir} devrait être découpé en plusieurs fichiers`);
    for (const f of files) {
      assert.match(f, /^\d{2}-[a-z0-9-]+\./, `${b.dir}/${f} : nom attendu NN-sujet${b.ext}`);
      const lines = fs.readFileSync(path.join(ROOT, b.dir, f), 'utf8').split('\n').length;
      assert.ok(lines <= 480, `${b.dir}/${f} : ${lines} lignes — à redécouper`);
    }
  }
});

test("src/ n'est pas publié", () => {
  const site = fs.readFileSync(path.join(ROOT, 'scripts', 'build-site.js'), 'utf8');
  const dirs = site.match(/PUBLIC_DIRS = \[([^\]]*)\]/)[1];
  assert.ok(!/['"]src['"]/.test(dirs));
});
