/**
 * Génère `.pages.yml` (Pages CMS) depuis scripts/cms-config.js.
 *   node scripts/build-cms-config.js          (réécrit .pages.yml)
 *   node scripts/build-cms-config.js --check  (échoue si .pages.yml n'est pas à jour — utilisé par les tests)
 */
const fs = require('fs');
const path = require('path');
const { config } = require('./cms-config.js');

const OUT = path.join(__dirname, '..', '.pages.yml');
const HEADER = '# FICHIER GÉNÉRÉ par scripts/build-cms-config.js depuis scripts/cms-config.js : ne pas éditer à la main\n# (npm run build:cms). Mode d\'emploi pour le client : docs/cms.md\n';

const scalar = (v) => (typeof v === 'string' ? JSON.stringify(v) : String(v));
function emit(v, ind) {
  const pad = ' '.repeat(ind);
  if (Array.isArray(v)) {
    return v.map((x) => {
      if (x && typeof x === 'object') {
        const inner = emit(x, ind + 2).replace(/^ +/, '');
        return `${pad}- ${inner}`;
      }
      return `${pad}- ${scalar(x)}`;
    }).join('\n');
  }
  return Object.entries(v)
    .filter(([, x]) => x !== undefined)
    .map(([k, x]) => {
      if (x && typeof x === 'object' && !(Array.isArray(x) && x.length === 0)) {
        if (Array.isArray(x) && x.every((y) => !y || typeof y !== 'object')) return `${pad}${k}: [${x.map(scalar).join(', ')}]`;
        return `${pad}${k}:\n${emit(x, ind + 2)}`;
      }
      return `${pad}${k}: ${Array.isArray(x) ? '[]' : scalar(x)}`;
    })
    .join('\n');
}

const yaml = HEADER + emit(config, 0) + '\n';
if (process.argv.includes('--check')) {
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8').replace(/\r\n/g, '\n') : '';
  if (cur !== yaml) { console.error('.pages.yml n\'est pas à jour (npm run build:cms)'); process.exit(1); }
  console.log('✅ .pages.yml à jour');
} else {
  fs.writeFileSync(OUT, yaml);
  console.log('✅ .pages.yml généré');
}
