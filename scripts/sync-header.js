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

// Le formulaire vit sur une page dédiée (contact.html) : le CTA du header et le lien « Contact »
// y mènent partout. Sur les pages de service, build-pages.js passe `contactHref` avec
// `?service=…` pour pré-sélectionner le service dans le formulaire.
const PAGES = [
  { file: 'index.html', isHome: true },
  // Les 5 pages de service sont générées par scripts/build-pages.js (qui appelle generateHeader).
  { file: 'zone-desservie-charente.html', currentSection: 'zone' },
  { file: 'faq-renovation-angouleme.html', currentSection: 'faq' },
  { file: 'contact.html', currentSection: 'contact' },
  { file: 'a-propos.html' },
  { file: 'realisations.html', currentSection: 'realisations' },
  { file: 'mentions-legales.html' },
  { file: 'merci.html' },
];

const SERVICE_LINKS = [
  { href: 'nettoyage-facade-angouleme.html', label: 'Nettoyage de façade', meta: 'Angoulême' },
  { href: 'ravalement-facade-angouleme.html', label: 'Ravalement de façade', meta: 'Charente' },
  { href: 'nettoyage-toiture-angouleme.html', label: 'Nettoyage de toiture', meta: 'Angoulême' },
  { href: 'peinture-exterieure-charente.html', label: 'Peinture extérieure', meta: 'Charente' },
  { href: 'isolation-interieure-charente.html', label: 'Isolation intérieure', meta: 'Charente' },
];

// Les entrées du menu pointent vers les pages dédiées, pas vers des sections de l'accueil.
// « Services » n'a pas de page : il ouvre seulement le sous-menu des 5 pages de service (voir 40-nav-sous-menus-bureau.js).
const SECTIONS = [
  { key: 'home', label: 'Accueil' },
  { key: 'services', label: 'Services' },
  { key: 'realisations', label: 'Réalisations', page: 'realisations.html' },
  { key: 'blog', label: 'Blog', page: 'blog/' },
  { key: 'zone', label: 'Où ?', page: 'zone-desservie-charente.html' },
  { key: 'faq', label: 'FAQ', page: 'faq-renovation-angouleme.html' },
  { key: 'contact', label: 'Contact', page: 'contact.html' },
];

function sectionHref(section, { isHome }) {
  if (section.page) return section.page;
  if (section.key === 'home') return isHome ? '#home' : 'index.html';
  return isHome ? `#${section.key}` : `index.html#${section.key}`;
}

function generateHeader({ isHome = false, currentSection = null, contactHref = 'contact.html' }) {
  const logoHref = isHome ? '#top' : 'index.html#top';

  const navItems = SECTIONS.filter((s) => s.key !== 'services').map((section) => {
    const href = sectionHref(section, { isHome, currentSection });
    const current = currentSection === section.key ? ' aria-current="page"' : '';
    const active = current ? ' active' : '';
    return `            <li><a class="nav-link${active}" href="${href}"${current}>${section.label}</a></li>`;
  });

  const submenu = SERVICE_LINKS.map(
    (s) => `                <li><a href="${s.href}">${s.label} <span class="submenu-meta">${s.meta}</span></a></li>`
  ).join('\n');

  const ctaHref = contactHref;
  const ctaText = 'Obtenez un devis';

  return `    <header class="site-header" id="top">
      <div class="container header-inner">
        <a href="${logoHref}" class="logo" aria-label="VPRR - Accueil">
          <img src="media/VPRR-LOGO.svg" class="logo-img" alt="Villéger Peinture Raval Rénovation" width="150" height="40" />
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
              <a class="nav-link" href="#" role="button" aria-haspopup="true">Services</a>
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

function syncPage({ file, isHome, currentSection }) {
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
  const newHeader = generateHeader({ isHome, currentSection });

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
