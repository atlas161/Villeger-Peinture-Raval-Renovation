/**
 * VPRR Partials Sync
 *
 * Blocs HTML qui étaient recopiés à la main dans plusieurs pages, maintenant générés depuis un seul gabarit
 * de `includes/partials/` puis réinjectés dans chaque page (le HTML des pages reste complet : il fonctionne
 * en local avec `npx serve .` et se relit dans git, comme pour `sync-header.js`).
 *
 *  - contact-service.html : section #contact des 5 pages de service. Ce qui varie d'une page est déclaré
 *    ci-dessous (nom du formulaire, service envoyé, options du menu déroulant).
 *  - why-artisan.html : section « Pourquoi nous choisir » identique sur 3 pages de service.
 *
 * Pour modifier un de ces blocs : éditer le gabarit (ou la config ci-dessous), puis `npm run sync:partials`.
 * Ne pas modifier le bloc directement dans la page : il serait écrasé à la prochaine synchronisation.
 *
 * Usage : node scripts/sync-partials.js          (réécrit les pages)
 *         node scripts/sync-partials.js --check  (échoue si une page n'est pas à jour — utilisé par les tests)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PARTIALS = path.join(ROOT, 'includes', 'partials');

// Options communes en fin de liste.
const AUTRE = ['autre', 'Autre'];

const CONTACT_PAGES = [
  {
    file: 'ravalement-facade-angouleme.html',
    formName: 'contact-ravalement-facade',
    service: 'Ravalement de façade Angoulême',
    placeholder: 'Ravalement de façade',
    prestation: 'ravalement',
    options: [['ravalement', 'Ravalement de façade'], ['nettoyage-facade', 'Nettoyage de façade'], ['peinture', 'Peinture extérieure'], AUTRE],
  },
  {
    file: 'nettoyage-facade-angouleme.html',
    formName: 'contact-nettoyage-facade',
    service: 'Nettoyage de façade Angoulême',
    placeholder: 'Nettoyage de façade',
    prestation: 'nettoyage-facade',
    options: [['nettoyage-facade', 'Nettoyage de façade'], ['nettoyage-toiture', 'Nettoyage de toiture'], ['ravalement', 'Ravalement de façade'], AUTRE],
  },
  {
    file: 'nettoyage-toiture-angouleme.html',
    formName: 'contact-nettoyage-toiture',
    service: 'Nettoyage de toiture Angoulême',
    placeholder: 'Nettoyage de toiture',
    prestation: 'nettoyage-toiture',
    options: [['nettoyage-toiture', 'Nettoyage de toiture'], ['nettoyage-facade', 'Nettoyage de façade'], ['ravalement', 'Ravalement de façade'], AUTRE],
  },
  {
    file: 'peinture-exterieure-charente.html',
    formName: 'contact-peinture-exterieure',
    service: 'Peinture extérieure Charente',
    placeholder: 'Peinture extérieure',
    prestation: 'peinture-exterieure',
    options: [['peinture-exterieure', 'Peinture extérieure'], ['peinture-facade', 'Peinture de façade'], ['peinture-boiseries', 'Peinture de boiseries'], AUTRE],
  },
  {
    file: 'isolation-interieure-charente.html',
    formName: 'contact-isolation-interieure',
    service: 'Isolation intérieure Charente',
    placeholder: 'Isolation intérieure',
    prestation: 'isolation-interieure',
    options: [['isolation-combles', 'Isolation des combles'], ['isolation-murs', 'Isolation des murs'], ['menuiseries', 'Remplacement de menuiseries'], AUTRE],
  },
];

const WHY_PAGES = ['nettoyage-facade-angouleme.html', 'nettoyage-toiture-angouleme.html', 'peinture-exterieure-charente.html'];

const CONTACT_RE = /[ \t]*<section id="contact" class="section" aria-labelledby="contact-title">[\s\S]*?<\/section>/;
const WHY_RE = /[ \t]*<section class="section section--bg-surface-alt" aria-labelledby="why-title">[\s\S]*?<\/section>/;

const readPartial = (name) => fs.readFileSync(path.join(PARTIALS, name), 'utf8').replace(/\r\n/g, '\n').replace(/\n$/, '');

function renderContact(template, page) {
  const optionLine = template.split('\n').find((l) => l.includes('{{OPTIONS}}'));
  const indent = optionLine.match(/^[ \t]*/)[0];
  const options = page.options
    .map(([value, label]) => `<div class="apple-select-option" data-value="${value}">${label}</div>`)
    .join('\n' + indent);
  return template
    .replace(/\{\{FORM_NAME\}\}/g, page.formName)
    .replace('{{SERVICE}}', page.service)
    .replace('{{PLACEHOLDER}}', page.placeholder)
    .replace('{{PRESTATION}}', page.prestation)
    .replace('{{OPTIONS}}', options);
}

// Remplace la première occurrence de `re` par `block` en conservant les fins de ligne du fichier.
function replaceBlock(file, re, block) {
  const filePath = path.join(ROOT, file);
  const original = fs.readFileSync(filePath, 'utf8');
  const eol = original.includes('\r\n') ? '\r\n' : '\n';
  const content = original.replace(/\r\n/g, '\n');
  if (!re.test(content)) throw new Error(`${file} : bloc introuvable`);
  const updated = content.replace(re, () => block);
  return { filePath, original, updated: eol === '\r\n' ? updated.replace(/\n/g, '\r\n') : updated };
}

function main() {
  const check = process.argv.includes('--check');
  const contactTpl = readPartial('contact-service.html');
  const whyTpl = readPartial('why-artisan.html');
  const jobs = [
    ...CONTACT_PAGES.map((p) => replaceBlock(p.file, CONTACT_RE, renderContact(contactTpl, p))),
    ...WHY_PAGES.map((f) => replaceBlock(f, WHY_RE, whyTpl)),
  ];
  const stale = jobs.filter((j) => j.updated !== j.original);
  if (check) {
    if (stale.length) {
      console.error('Pages à resynchroniser (npm run sync:partials) :\n' + stale.map((j) => '  ' + path.basename(j.filePath)).join('\n'));
      process.exit(1);
    }
    console.log(`✅ ${jobs.length} bloc(s) à jour`);
    return;
  }
  for (const j of stale) fs.writeFileSync(j.filePath, j.updated);
  console.log(`✅ ${stale.length} page(s) mise(s) à jour sur ${jobs.length} bloc(s)`);
}

main();
