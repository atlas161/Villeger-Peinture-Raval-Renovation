/**
 * VPRR Header Sync
 *
 * Le header/nav était dupliqué à la main dans 9 des 10 pages HTML du site (une copie
 * quasi identique de ~36 lignes par page — un changement de menu devait être répété 9 fois).
 * Ce script génère le header à partir d'un seul gabarit ci-dessous et le réinjecte dans
 * chaque page, entre les balises <header class="site-header" id="top"> ... </header>.
 *
 * 404.html est volontairement exclu : sa nav simplifiée (3 liens) est un choix délibéré
 * pour une page d'erreur, pas une copie à synchroniser.
 *
 * Usage : node scripts/sync-header.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// Pages qui ont leur propre section #contact (formulaire) : le CTA du header pointe
// directement dessus (#contact) avec le texte "Obtenez un devis". Les autres pages
// n'ont pas de formulaire local : le CTA renvoie vers index.html#contact avec le texte
// "Obtenir un devis".
const PAGES = [
  { file: 'index.html', isHome: true, hasLocalContact: true },
  // Les 5 pages de service sont générées par scripts/build-pages.js (qui appelle generateHeader).
  { file: 'zone-desservie-charente.html', hasLocalContact: false, currentSection: 'zone' },
  { file: 'faq-renovation-angouleme.html', hasLocalContact: false, currentSection: 'faq' },
  { file: 'mentions-legales.html', hasLocalContact: false },
  { file: 'merci.html', hasLocalContact: false },
];

const SERVICE_LINKS = [
  { href: 'nettoyage-facade-angouleme.html', label: 'Nettoyage de façade', meta: 'Angoulême' },
  { href: 'ravalement-facade-angouleme.html', label: 'Ravalement de façade', meta: 'Charente' },
  { href: 'nettoyage-toiture-angouleme.html', label: 'Nettoyage de toiture', meta: 'Angoulême' },
  { href: 'peinture-exterieure-charente.html', label: 'Peinture extérieure', meta: 'Charente' },
  { href: 'isolation-interieure-charente.html', label: 'Isolation intérieure', meta: 'Charente' },
];

// { key, label, id } — l'ordre des sections de la home, dans l'ordre du menu.
const SECTIONS = [
  { key: 'home', label: 'Accueil' },
  { key: 'services', label: 'Services' },
  { key: 'galerie', label: 'Galerie' },
  { key: 'blog', label: 'Blog' },
  { key: 'zone', label: "Zone d'intervention" },
  { key: 'faq', label: 'FAQ' },
  { key: 'contact', label: 'Contact' },
];

function sectionHref(section, { isHome, currentSection }) {
  if (isHome) return `#${section.key}`;
  if (currentSection === section.key) return `#${section.key}`;
  return `index.html#${section.key}`;
}

function generateHeader({ isHome = false, hasLocalContact, currentSection = null }) {
  const logoHref = isHome ? '#top' : 'index.html#top';

  const navItems = SECTIONS.filter((s) => s.key !== 'services').map((section) => {
    const href = sectionHref(section, { isHome, currentSection });
    const current = !isHome && currentSection === section.key ? ' aria-current="page"' : '';
    return `            <li><a class="nav-link" href="${href}"${current}>${section.label}</a></li>`;
  });

  const servicesHref = sectionHref({ key: 'services' }, { isHome, currentSection });
  const submenu = SERVICE_LINKS.map(
    (s) => `                <li><a href="${s.href}">${s.label} <span class="submenu-meta">${s.meta}</span></a></li>`
  ).join('\n');

  const ctaHref = hasLocalContact ? '#contact' : 'index.html#contact';
  const ctaText = hasLocalContact ? 'Obtenez un devis' : 'Obtenir un devis';

  return `    <header class="site-header" id="top">
      <div class="container header-inner">
        <a href="${logoHref}" class="logo" aria-label="Villéger Peinture Ravalement Rénovation - Accueil">
          <svg class="logo-mark" viewBox="0 0 64 96" width="30" height="45" aria-hidden="true" focusable="false"><path d="M3 94V36a29 29 0 0 1 58 0v58z" fill="#CDBB9B"/><path d="M3 50h10M3 64h10M3 78h10M51 50h10M51 64h10M51 78h10" stroke="#A8946F" stroke-width="1.4"/><path d="M13 94V38a19 19 0 0 1 38 0v56z" fill="#673A12"/><path d="M16 41a16 16 0 0 1 32 0z" fill="#FAF8F5"/><path d="M32 41V25M32 41l-11-11M32 41l11-11" stroke="#673A12" stroke-width="1.8" fill="none"/><rect x="13" y="41" width="38" height="3" fill="#522E0E"/><path d="M23 46v48M32 46v48M41 46v48" stroke="#4A260B" stroke-width="1.4"/><circle cx="45" cy="72" r="1.8" fill="#D9C4A1"/></svg>
          <span class="logo-text" aria-hidden="true"><span class="logo-name">Villéger</span><span class="logo-sub"><b>P</b>einture <b>R</b>avalement <b>R</b>énovation</span></span>
        </a>

        <button class="burger" aria-label="Ouvrir le menu" aria-controls="primary-nav" aria-expanded="false">
          <span class="burger-bar" aria-hidden="true"></span>
          <span class="burger-bar" aria-hidden="true"></span>
          <span class="burger-bar" aria-hidden="true"></span>
        </button>

        <nav class="primary-nav" id="primary-nav" aria-label="Navigation principale">
          <ul class="menu">
            <li><a class="nav-link" href="${sectionHref(SECTIONS[0], { isHome, currentSection })}">Accueil</a></li>
            <li class="has-submenu">
              <a class="nav-link" href="${servicesHref}">Services</a>
              <ul class="submenu" aria-label="Pages services">
${submenu}
              </ul>
            </li>
${navItems.slice(1).join('\n')}
            <li class="menu-tel">
              <a href="tel:+33545912270" aria-label="Appeler le 05 45 91 22 70">05 45 91 22 70</a>
              <span>Lun–ven 9 h–17 h · sam 9 h–12 h</span>
            </li>
            <li class="menu-cta">
              <a class="btn btn-primary" href="${ctaHref}">${ctaText}</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>`;
}

function syncPage({ file, isHome, hasLocalContact, currentSection }) {
  const filePath = path.join(ROOT, file);
  const content = fs.readFileSync(filePath, 'utf8');

  const start = content.indexOf('<header class="site-header" id="top">');
  if (start === -1) {
    console.warn(`   ⚠️  ${file} : balise <header class="site-header" id="top"> introuvable, ignoré`);
    return false;
  }
  const end = content.indexOf('</header>', start);
  if (end === -1) {
    console.warn(`   ⚠️  ${file} : balise </header> introuvable, ignoré`);
    return false;
  }

  const before = content.slice(0, start);
  const after = content.slice(end + '</header>'.length);
  const newHeader = generateHeader({ isHome, hasLocalContact, currentSection });

  const updated = before + newHeader + after;
  if (updated === content) {
    console.log(`   = ${file} déjà à jour`);
    return false;
  }

  fs.writeFileSync(filePath, updated);
  console.log(`   ✅ ${file}`);
  return true;
}

function main() {
  console.log('🏗️  VPRR Header Sync\n   Synchronisation du header/nav sur toutes les pages...\n');
  let changed = 0;
  for (const page of PAGES) {
    if (syncPage(page)) changed += 1;
  }
  console.log(`\n✅ Terminé : ${changed} page(s) mise(s) à jour sur ${PAGES.length}.`);
}

if (require.main === module) main();

module.exports = { generateHeader };
