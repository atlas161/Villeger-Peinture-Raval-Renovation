/**
 * VPRR Build Pages — génère les pages de service à partir d'un gabarit et de données.
 *
 *   scripts/templates/service-page.html   gabarit commun (head, en-tête, pied de page, scripts)
 *   scripts/lib/service-sections.js       composants des sections (hero, problème, solution, zone, FAQ…)
 *   includes/partials/*.html              formulaire de contact et « Pourquoi nous choisir » communs
 *   content/pages/<slug>/page.json        données de la page (métadonnées, JSON-LD, contenu des sections)
 *   content/pages/<slug>/*.html           sections propres à la page, en HTML brut (type "raw")
 *
 * Pour ajouter une page de service (ou de ville) : créer content/pages/<slug>/page.json (copier une page
 * existante), l'ajouter au sitemap, puis `npm run build:pages`. Les fichiers `<slug>.html` à la racine sont
 * GÉNÉRÉS : ne pas les éditer à la main.
 *
 * Usage : node scripts/build-pages.js          (réécrit les pages)
 *         node scripts/build-pages.js --check  (échoue si une page n'est pas à jour — utilisé par les tests)
 */

const fs = require('fs');
const path = require('path');
const { generateHeader } = require('./sync-header.js');
const { readPartial, renderContact } = require('./lib/partials.js');
const { loadPage, listSlugs } = require('./lib/content-loader.js');
const S = require('./lib/service-sections.js');

const ROOT = path.join(__dirname, '..');
const PAGES_DIR = path.join(ROOT, 'content', 'pages');
const TEMPLATE = fs.readFileSync(path.join(__dirname, 'templates', 'service-page.html'), 'utf8').replace(/\r\n/g, '\n');

// Partie « entreprise » du JSON-LD, commune à toutes les pages (seuls areaServed et le catalogue varient).
const BUSINESS = {
  '@context': 'https://schema.org',
  '@type': 'HomeAndConstructionBusiness',
  '@id': 'https://vprr.fr/#business',
  name: 'Villéger Peinture Raval Rénovation',
  alternateName: 'VPRR',
  url: 'https://vprr.fr/',
  logo: 'https://vprr.fr/media/VPRR-LOGO.svg',
  email: 'villegerstephane204@gmail.com',
  telephone: '+33545912270',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '136 Avenue de la République',
    addressLocality: "L'Isle-d'Espagnac",
    addressRegion: 'Nouvelle-Aquitaine',
    postalCode: '16340',
    addressCountry: 'FR',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 45.6667, longitude: 0.1833 },
};
const BUSINESS_TAIL = {
  sameAs: ['https://www.instagram.com/vprr.16/', 'https://g.page/r/CZZJ5Bogt13fEBM/review'],
  priceRange: '€€',
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '17:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Saturday'], opens: '09:00', closes: '12:00' },
  ],
};

const ldScript = (obj) => `    <script type="application/ld+json">\n${S.indent(JSON.stringify(obj, null, 2), 6)}\n    </script>`;

/** Texte brut d'un fragment HTML (pour le JSON-LD) : la FAQ affichée est la seule source. */
function plain(html) {
  return html
    .replace(/<\/(li|p)>/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

const faqItems = (page) => page.sections.filter((x) => x.type === 'faq').flatMap((x) => x.items);

function jsonLd(page) {
  const url = `https://vprr.fr/${page.file}`;
  const l = page.ld;
  const blocks = [
    { ...BUSINESS, areaServed: l.areaServed, hasOfferCatalog: l.businessCatalog, ...BUSINESS_TAIL },
    { '@context': 'https://schema.org', '@type': 'Service', serviceType: l.serviceType, provider: { '@id': 'https://vprr.fr/#business' }, areaServed: l.serviceAreaServed || l.areaServed, hasOfferCatalog: l.serviceCatalog },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://vprr.fr/' },
        { '@type': 'ListItem', position: 2, name: l.breadcrumbName, item: url },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems(page).map((i) => ({ '@type': 'Question', name: plain(i.question), acceptedAnswer: { '@type': 'Answer', text: plain(i.answerHtml) } })),
    },
  ];
  return blocks.map(ldScript).join('\n\n');
}

function renderSections(page) {
  return page.sections
    .map((s) => {
      switch (s.type) {
        case 'hero': return `${S.hero(s)}\n\n${S.proofBar()}`;
        case 'problem': return S.problem(s);
        case 'solution': return S.solution(s);
        case 'zone': return S.zone(s);
        case 'others': return S.others(s);
        case 'faq': return S.faq(s);
        case 'realisation': return S.realisation(s);
        case 'ite': return S.ite(s);
        case 'why': return S.why(s);
        case 'tarifs': return S.tarifs(s);
        case 'contact': return renderContact(readPartial('contact-cta.html'), page.contact);
        default: throw new Error(`${page.file} : type de section inconnu « ${s.type} »`);
      }
    })
    .map((html) => (html.startsWith(' ') ? html : S.indent(html, 6)))
    .join('\n\n')
    // Tous les boutons « devis » mènent à la page de contact, avec le service pré-sélectionné.
    .replace(/href="#contact"/g, `href="contact.html?service=${page.contact.prestation}"`);
}

function render(page) {
  const h = page.head;
  const metaLines = (arr) => (arr && arr.length ? arr.map((m) => `    ${m}\n`).join('') : '');
  const extraStyle = h.extraStyle
    ? `    <!-- Petites variations propres à cette page par rapport au gabarit commun assets/css/service-page.css -->\n    <style>\n${S.indent(h.extraStyle, 6)}\n    </style>\n`
    : '';
  const slots = {
    TITLE: h.title, DESCRIPTION: h.description, KEYWORDS: h.keywords, GEO_PLACENAME: h.geoPlacename,
    OG_TITLE: h.ogTitle, OG_DESCRIPTION: h.ogDescription, OG_IMAGE: h.ogImage,
    TWITTER_TITLE: h.twitterTitle, TWITTER_DESCRIPTION: h.twitterDescription, TWITTER_IMAGE: h.twitterImage, TWITTER_IMAGE_ALT: h.twitterImageAlt,
    CANONICAL: `https://vprr.fr/${page.file}`,
    OG_EXTRA: metaLines(h.ogExtra),
    TWITTER_EXTRA: metaLines(h.twitterExtra),
    EXTRA_STYLE: extraStyle,
    JSONLD: jsonLd(page),
    SLIDER_SCRIPT: page.beforeAfterScript ? '    <script src="assets/js/before-after.js?v=20260929" defer></script>\n' : '',
    HEADER: generateHeader({ isHome: false, contactHref: `contact.html?service=${page.contact.prestation}` }),
    SECTIONS: renderSections(page),
    RELATED: S.indent(S.related(page.related), 4),
  };
  return TEMPLATE.replace(/\{\{([A-Z_]+)\}\}/g, (_, k) => {
    if (!(k in slots)) throw new Error(`Slot inconnu {{${k}}}`);
    return slots[k];
  }).replace(/\n{3,}/g, '\n\n');
}

function main() {
  const check = process.argv.includes('--check');
  const slugs = listSlugs();
  const stale = [];
  for (const slug of slugs) {
    const page = loadPage(slug);
    const html = render(page);
    const out = path.join(ROOT, page.file);
    const current = fs.existsSync(out) ? fs.readFileSync(out, 'utf8').replace(/\r\n/g, '\n') : null;
    if (current !== html) {
      stale.push(page.file);
      if (!check) fs.writeFileSync(out, html);
    }
  }
  if (check) {
    if (stale.length) {
      console.error('Pages à régénérer (npm run build:pages) :\n' + stale.map((f) => '  ' + f).join('\n'));
      process.exit(1);
    }
    console.log(`✅ ${slugs.length} page(s) de service à jour`);
    return;
  }
  console.log(`✅ ${slugs.length} page(s) de service générée(s) (${stale.length} modifiée(s))`);
}

if (require.main === module) main();

module.exports = { render };
