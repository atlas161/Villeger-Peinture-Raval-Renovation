/**
 * Pages « À propos » et « Réalisations » pilotées par Pages CMS.
 *
 *   content/a-propos.json      textes, faits, portrait, engagements
 *   content/realisations.json  un chantier = une carte (photos avant/après, commune, prestation)
 *   content/shared/services.json  descriptions des services (cartes de « Notre métier »)
 *
 * Les fichiers a-propos.html et realisations.html restent des pages HTML « normales » (en-tête, bande de contact,
 * JSON-LD…) ; seule la zone entre `<!-- cms:begin -->` et `<!-- cms:end -->` et les balises title / description
 * sont régénérées ici.
 *
 * Usage : node scripts/build-content-pages.js          (réécrit les pages)
 *         node scripts/build-content-pages.js --check  (échoue si une page n'est pas à jour — utilisé par les tests)
 */
const fs = require('fs');
const path = require('path');
const { img, esc } = require('./lib/media.js');
const { read } = require('./lib/content-loader.js');

const ROOT = path.join(__dirname, '..');
const nbr = (s) => esc(s).replace(/\n/g, '<br />');

/** Remplace le contenu d'une balise <meta> ou <title> d'après les champs SEO. */
function applySeo(html, seo) {
  const t = esc(seo.title);
  const d = esc(seo.description);
  const metaFor = (attr, name, value) => (h) =>
    h.replace(new RegExp(`(<meta ${attr}="${name}" content=")[^"]*(")`), (_, a, b) => `${a}${value}${b}`);
  return [
    (h) => h.replace(/<title>[\s\S]*?<\/title>/, `<title>${t}</title>`),
    metaFor('name', 'description', d),
    metaFor('property', 'og:title', t),
    metaFor('property', 'og:description', d),
    metaFor('name', 'twitter:title', t),
    metaFor('name', 'twitter:description', d),
  ].reduce((h, fn) => fn(h), html);
}

const header = ({ eyebrow, title, id, intro, tag = 'h2', wide }) => `<header class="section-header${wide ? ' section-header--wide' : ''}">
  <p class="section-eyebrow">${esc(eyebrow)}</p>
  <${tag} id="${id}">${esc(title)}</${tag}>${intro ? `\n  <p>${esc(intro)}</p>` : ''}
</header>`;

const indent = (str, n) => str.split('\n').map((l) => (l ? ' '.repeat(n) + l : l)).join('\n');

function aboutBody(a, services) {
  const facts = a.facts.map((f) => `    <div><dt>${esc(f.label)}</dt><dd>${nbr(f.value)}</dd></div>`).join('\n');
  const owner = a.owner && a.owner.photo && a.owner.textHtml
    ? `
<section class="section" aria-labelledby="about-owner-title">
  <div class="container">
    <div class="about-owner">
      <figure class="about-owner-photo">
        ${img({ src: a.owner.photo, alt: a.owner.photoAlt || a.owner.name, sizes: '(max-width: 768px) 100vw, 380px' })}
      </figure>
      <div class="about-owner-text">
        <p class="section-eyebrow">Qui est derrière VPRR</p>
        <h2 id="about-owner-title">${esc(a.owner.name)}${a.owner.role ? `<span class="about-owner-role">${esc(a.owner.role)}</span>` : ''}</h2>
        ${a.owner.textHtml}
      </div>
    </div>
  </div>
</section>
`
    : '';
  const cards = services
    .map(
      (s) => `    <a href="${s.slug}.html" class="svc-card">
      <div class="svc-icon" aria-hidden="true"><i class="${s.icon}"></i></div>
      <div class="svc-body"><h3>${esc(s.label)}</h3><p>${esc(s.about)}</p></div>
      <div class="svc-footer"><span>Découvrir ce service</span><span class="svc-arrow" aria-hidden="true"><i class="fa-solid fa-arrow-right"></i></span></div>
    </a>`
    )
    .join('\n');
  const eng = a.engagements.items
    .map(
      (i) => `    <div class="reassurance-item">
      <div class="reassurance-icon"><i class="${i.icon}" aria-hidden="true"></i></div>
      <div class="reassurance-text"><h3>${esc(i.title)}</h3><p>${esc(i.text)}</p></div>
    </div>`
    )
    .join('\n');
  return `<section class="section page-intro" aria-labelledby="about-title">
  <div class="container">
${indent(header({ ...a.intro, id: 'about-title', intro: a.intro.text, tag: 'h1', wide: true }), 4)}
    <dl class="about-facts">
${facts}
    </dl>
  </div>
</section>
${owner}
<section class="section section--alt" aria-labelledby="about-metier-title">
  <div class="container">
${indent(header({ ...a.metier, id: 'about-metier-title' }), 4)}
    <div class="svc-grid about-services">
${cards}
    </div>
  </div>
</section>

<section class="section" aria-labelledby="about-engagements-title">
  <div class="container">
${indent(header({ eyebrow: a.engagements.eyebrow, title: a.engagements.title, id: 'about-engagements-title' }), 4)}
    <div class="reassurance-grid about-engagements">
${eng}
    </div>
  </div>
</section>`.replace(/\n{3,}/g, '\n\n');
}

const CATEGORIES = { facade: 'Façade', toiture: 'Toiture', peinture: 'Peinture', isolation: 'Isolation' };

function realBody(r, services) {
  const shown = r.chantiers.filter((c) => !c.draft);
  const used = Object.keys(CATEGORIES).filter((k) => shown.some((c) => c.category === k));
  const chips = [['all', 'Toutes'], ...used.map((k) => [k, CATEGORIES[k]])]
    .map(([k, l], i) => `      <button type="button" class="filter-chip${i === 0 ? ' active' : ''}" data-real-filter="${k}" aria-pressed="${i === 0}">${l}</button>`)
    .join('\n');
  const sizes = '(max-width: 768px) 50vw, 25vw';
  const cards = shown
    .map((c) => {
      const svc = services.find((s) => s.slug === c.service);
      const meta = [c.commune, c.duration].filter(Boolean).map(esc).join(' · ');
      return `      <article class="gallery-card real-card" data-real-category="${c.category}">
        <div class="gallery-card-media">
          <figure class="gallery-figure">
            ${img({ src: c.before, alt: c.altBefore || `${c.title} : avant les travaux`, sizes })}
            <figcaption>Avant</figcaption>
          </figure>
          <figure class="gallery-figure">
            ${img({ src: c.after, alt: c.altAfter || `${c.title} : après les travaux`, sizes })}
            <figcaption>Après</figcaption>
          </figure>
        </div>
        <div class="gallery-card-body">
          <p class="real-tag">${CATEGORIES[c.category]}</p>
          <h2>${esc(c.title)}</h2>${meta ? `\n          <p class="real-meta"><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${meta}</p>` : ''}
          ${svc ? `<a href="${svc.slug}.html" class="gallery-card-link">Voir ce service <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>` : ''}
        </div>
      </article>`;
    })
    .join('\n');
  return `<section class="section page-intro" aria-labelledby="real-title">
  <div class="container">
${indent(header({ ...r.intro, id: 'real-title', intro: r.intro.text, tag: 'h1', wide: true }), 4)}

    <div class="real-filters" role="group" aria-label="Filtrer par prestation">
${chips}
    </div>

    <div class="gallery-grid realisations-grid">
${cards}
    </div>
  </div>
</section>`;
}

function render(html, seo, body) {
  const re = /(      <!-- cms:begin[^>]*-->\n)[\s\S]*?(\n      <!-- cms:end -->)/;
  if (!re.test(html)) throw new Error('marqueurs cms:begin / cms:end introuvables');
  return applySeo(html, seo).replace(re, (_, a, b) => `${a}${indent(body, 6)}${b}`);
}

function main() {
  const check = process.argv.includes('--check');
  const services = read('content', 'shared', 'services.json').services;
  const jobs = [
    ['a-propos.html', () => { const a = read('content', 'a-propos.json'); return [a.seo, aboutBody(a, services)]; }],
    ['realisations.html', () => { const r = read('content', 'realisations.json'); return [r.seo, realBody(r, services)]; }],
  ];
  const stale = [];
  for (const [file, make] of jobs) {
    const out = path.join(ROOT, file);
    const current = fs.readFileSync(out, 'utf8').replace(/\r\n/g, '\n');
    const [seo, body] = make();
    const html = render(current, seo, body);
    if (html !== current) {
      stale.push(file);
      if (!check) fs.writeFileSync(out, html);
    }
  }
  if (check) {
    if (stale.length) {
      console.error('Pages à régénérer (npm run build:content) :\n' + stale.map((f) => '  ' + f).join('\n'));
      process.exit(1);
    }
    console.log('✅ À propos et Réalisations à jour');
    return;
  }
  console.log(`✅ pages de contenu générées (${stale.length} modifiée(s))`);
}

if (require.main === module) main();
