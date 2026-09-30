'use strict';
// La documentation (CLAUDE.md + docs/) ne doit pas contenir de lien relatif cassé.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function markdownFiles(dir) {
  return fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((e) => {
    const rel = path.posix.join(dir, e.name);
    if (e.isDirectory()) return markdownFiles(rel);
    return e.name.endsWith('.md') ? [rel] : [];
  });
}

test('les liens relatifs de CLAUDE.md et docs/ pointent vers des fichiers existants', () => {
  const broken = [];
  for (const f of ['CLAUDE.md', ...markdownFiles('docs')]) {
    const text = fs.readFileSync(path.join(ROOT, f), 'utf8');
    for (const m of text.matchAll(/\]\(([^)#\s]+)(#[^)]*)?\)/g)) {
      const target = m[1];
      if (/^(https?:|mailto:)/.test(target)) continue;
      if (!fs.existsSync(path.join(ROOT, path.posix.dirname(f), target))) broken.push(`${f} -> ${target}`);
    }
  }
  assert.deepStrictEqual(broken, []);
});
