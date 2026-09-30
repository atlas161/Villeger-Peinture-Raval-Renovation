'use strict';
// Les blocs générés depuis includes/partials/ (formulaire de contact des pages de service, « Pourquoi nous
// choisir ») doivent être synchronisés dans les pages : sinon `npm run sync:partials` a été oublié.
const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { spawnSync } = require('child_process');

test('les pages de service sont synchronisées avec leurs partials', () => {
  const r = spawnSync('node', [path.join(__dirname, '..', 'scripts', 'sync-partials.js'), '--check'], { encoding: 'utf8' });
  assert.strictEqual(r.status, 0, r.stderr || r.stdout);
});
