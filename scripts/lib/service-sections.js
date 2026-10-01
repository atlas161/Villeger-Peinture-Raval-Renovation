'use strict';
/**
 * Composants HTML des pages de service. Chaque fonction reçoit des données (voir content/pages/*.json)
 * et renvoie le HTML de la section. Les champs `*Html` contiennent du HTML brut (liens, <strong>…).
 */

const { img, esc } = require('./media');

const SLIDER_SIZES = '(max-width: 960px) 100vw, 50vw';

const indent = (str, n) => str.split('\n').map((l) => (l ? ' '.repeat(n) + l : l)).join('\n');

function header({ eyebrow, title, id, intro }) {
  return `<header class="section-header">
  <p class="section-eyebrow">${esc(eyebrow)}</p>
  <h2 id="${id}">${esc(title)}</h2>${intro ? `\n  <p>${esc(intro)}</p>` : ''}
</header>`;
}

function hero(h) {
  const image = h.before && h.after
    ? `<div class="before-after-slider" id="beforeAfterSlider">
  ${img({ src: h.before, alt: h.altBefore, sizes: SLIDER_SIZES, className: 'image-before', id: 'imageBefore', eager: true })}
  ${img({ src: h.after, alt: h.altAfter, sizes: SLIDER_SIZES, className: 'image-after' })}
  <div class="slider-label label-before">Avant</div>
  <div class="slider-label label-after">Après</div>
  <div class="slider-handle" id="sliderHandle"></div>
</div>`
    : `<div class="hero-placeholder">
  <i class="${h.placeholderIcon}" aria-hidden="true"></i>
  <p class="hero-placeholder-text">${esc(h.placeholderText)}</p>
</div>`;
  return `<section class="service-hero" aria-labelledby="hero-title">
  <div class="service-hero-container">
    <div class="service-hero-content">
      <h1 id="hero-title">${esc(h.title)}</h1>
      <p class="service-hero-subtitle">${esc(h.subtitle)}</p>
      <div class="service-hero-cta">
        <a class="btn btn-primary btn--lg" href="#contact">${esc(h.ctaLabel)}</a>
        <a class="btn btn-secondary btn--lg" href="tel:+33545912270">
          <i class="fa-solid fa-phone" aria-hidden="true"></i> 05 45 91 22 70
        </a>
      </div>
    </div>
    <div class="service-hero-image">
${indent(image, 6)}
    </div>
  </div>
</section>`;
}

function proofBar() {
  const items = [
    { icon: 'fa-solid fa-star', title: '4,1/5 sur Google', text: '14 avis clients' },
    { icon: 'fa-solid fa-shield-halved', title: 'Décennale &amp; RC Pro', text: 'Travaux assurés' },
    { icon: 'fa-solid fa-file-signature', title: 'Devis sous 48 h', text: 'Gratuit, sans engagement' },
  ]
    .map(
      (i) => `    <li class="proof-bar-item">
      <span class="proof-bar-icon"><i class="${i.icon}" aria-hidden="true"></i></span>
      <span class="proof-bar-text"><strong>${i.title}</strong><span>${i.text}</span></span>
    </li>`
    )
    .join('\n');
  return `<section class="proof-bar" aria-label="Nos garanties">
  <ul class="proof-bar-list">
${items}
  </ul>
</section>`;
}

function problem(s) {
  const items = s.items
    .map(
      (i) => `    <li class="problem-item">
      <div class="problem-item-icon"><i class="${i.icon}" aria-hidden="true"></i></div>
      <div class="problem-item-content">
        <h3>${esc(i.title)}</h3>
        <p>${esc(i.text)}</p>
      </div>
    </li>`
    )
    .join('\n');
  return `<section class="problem-section" aria-labelledby="problem-title">
  <div class="problem-content">
${indent(header({ ...s, id: 'problem-title' }), 4)}

    <ul class="problem-list">
${indent(items, 2)}
    </ul>
  </div>
</section>`;
}

function solution(s) {
  const features = s.features
    .map(
      (f) => `    <article class="feature-card${f.highlight ? ' feature-card--highlight' : ''}">
      <div class="feature-icon"><i class="${f.icon}" aria-hidden="true"></i></div>
      <div class="feature-card-content">
        <h3>${esc(f.title)}</h3>
        <p>${esc(f.text)}</p>
      </div>
    </article>`
    )
    .join('\n\n');
  const steps = s.steps
    .map(
      (st, i) => `    <div class="process-step">
      <div class="step-number">${i + 1}</div>
      <h3>${esc(st.title)}</h3>
      <p>${esc(st.text)}</p>
    </div>`
    )
    .join('\n');
  return `<section class="section" aria-labelledby="solution-title">
  <div class="container">
${indent(header({ ...s, id: 'solution-title' }), 4)}

    <div class="feature-grid">
${features}
    </div>

    <div class="process-steps">
${steps}
    </div>
  </div>
</section>`;
}

function zone(z) {
  const cities = z.cities
    .map((c, i) => `    <li class="zone-tag">${i === 0 ? '<i class="fa-solid fa-location-dot" aria-hidden="true"></i> ' : ''}${esc(c)}</li>`)
    .join('\n');
  return `<section class="section" aria-labelledby="zone-title">
  <div class="container">
${indent(header({ ...z, id: 'zone-title' }).replace('</p>\n</header>', ' <a href="zone-desservie-charente.html">Voir toutes les villes desservies</a>.</p>\n</header>'), 4)}

    <ul class="zone-list" data-m-limit="8" data-m-more="Voir les autres communes">
${cities}
    </ul>

    <p class="section-note">
      <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
      <strong>${esc(z.noteTitle)}</strong> ${esc(z.noteText)}
    </p>
  </div>
</section>`;
}

function others(o) {
  const cards = o.cards
    .map(
      (c) => `    <article class="service-card">
      <div class="service-icon"><i class="${c.icon}" aria-hidden="true"></i></div>
      <h3>${esc(c.label)}</h3>
      <p>${esc(c.card)}</p>
      <a href="${c.slug}.html" class="btn btn-secondary btn--sm">En savoir plus</a>
    </article>`
    )
    .join('\n\n');
  return `<section class="section section--bg-white" aria-labelledby="autres-services-title">
  <div class="container">
${indent(header({ ...o, id: 'autres-services-title' }), 4)}

    <div class="services-grid">
${cards}
    </div>
  </div>
</section>`;
}

function faq(f) {
  const items = f.items
    .map(
      (i) => `      <details class="faq-item">
        <summary class="faq-question">
          <span class="faq-icon-badge${i.accent ? ' faq-icon-badge--accent' : ''}">
            <i class="${i.icon}" aria-hidden="true"></i>
          </span>
          <span>${esc(i.question)}</span>
          <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
        </summary>
        <div class="faq-answer">
${indent(i.answerHtml, 10)}
        </div>
      </details>`
    )
    .join('\n\n');
  return `<section class="section section--bg-surface-alt" id="faq" aria-labelledby="faq-title">
  <div class="container">
${indent(header({ ...f, id: 'faq-title' }), 4)}

    <div class="faq-accordion" data-m-limit="5" data-m-more="Voir toutes les questions">
${items}
    </div>

  </div>
</section>`;
}

const BA_SIZES = '(max-width: 960px) 100vw, 50vw';

function realisation(r) {
  const hero = r.hero || {};
  const before = r.before || hero.before;
  const after = r.after || hero.after;
  const photos = before && after
    ? `
          <div class="before-after-card">
            <div class="before-after-images">
              <figure>
                ${img({ src: before, alt: r.altBefore || hero.altBefore, sizes: BA_SIZES })}
                <figcaption>Avant</figcaption>
              </figure>
              <figure>
                ${img({ src: after, alt: r.altAfter || hero.altAfter, sizes: BA_SIZES })}
                <figcaption>Après</figcaption>
              </figure>
            </div>
          </div>
`
    : '';
  const facts = r.facts.map((f) => `    <li><strong>${esc(f.label)} :</strong> ${esc(f.text)}</li>`).join('\n');
  return `<section class="section section--bg-white" id="realisation" aria-labelledby="realisation-title">
  <div class="container">
${indent(header({ eyebrow: 'Réalisation', title: r.title, id: 'realisation-title', intro: r.intro }), 4)}

    <div class="before-after-grid">${indent(photos, -0) || ''}
      <div class="jobsheet-card">
        <h3 class="jobsheet-title">${esc(r.sheetTitle)}</h3>
        <ul class="jobsheet-list">
${indent(facts, 4)}
        </ul>

        <div class="jobsheet-tip">
          <p class="jobsheet-tip-title">${esc(r.tipTitle)}</p>
          <p class="jobsheet-tip-text">
            ${r.tipHtml}
          </p>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

function ite(i) {
  return `<section class="section section--bg-surface-alt" aria-labelledby="ite-iti-title">
  <div class="container">
    <div class="info-box">
      <h2 id="ite-iti-title"><i class="fa-solid fa-circle-info" aria-hidden="true"></i>${esc(i.title)}</h2>
      <p>
        ${i.textHtml}
      </p>
    </div>
  </div>
</section>`;
}

function why(w) {
  const cards = w.items
    .map(
      (i) => `    <div class="reassurance-item${i.accent ? ' reassurance-item--accent' : ''}">
      <div class="reassurance-icon"><i class="${i.icon}" aria-hidden="true"></i></div>
      <div class="reassurance-text">
        <h3>${esc(i.title)}</h3>
        <p>${esc(i.text)}</p>
      </div>
    </div>`
    )
    .join('\n\n');
  return `<section class="section${w.alt ? ' section--bg-surface-alt' : ''}" aria-labelledby="why-title">
  <div class="container">
${indent(header({ eyebrow: w.eyebrow, title: w.title, id: 'why-title', intro: w.intro }), 4)}

    <div class="reassurance-grid">
${cards}
    </div>
  </div>
</section>`;
}

function tarifs(t) {
  const factors = t.factors
    .map(
      (f) => `    <article class="feature-card">
      <div class="feature-icon"><i class="${f.icon}" aria-hidden="true"></i></div>
      <div class="feature-card-content">
        <h3>${esc(f.title)}</h3>
        <p>${esc(f.text)}</p>
      </div>
    </article>`
    )
    .join('\n\n');
  const p = t.price;
  const cards = p.cards
    .map(
      (c) => `        <div class="pricing-card">
          <h4>${esc(c.title)}</h4>
          <p class="price">${esc(c.price.replace(/\s+€/g, '€'))}</p>
          <p class="price-desc">${esc(c.desc)}</p>
        </div>`
    )
    .join('\n');
  const whyNow = t.whyNow
    ? `

    <div class="why-now-box" data-m-collapse>
      <h3 class="why-now-title">
        <i class="fa-solid fa-chart-line"></i> ${esc(t.whyNow.title)}
      </h3>
      <div class="why-now-grid">
${t.whyNow.cards
  .map(
    (c) => `        <div class="why-now-card">
          <h4><i class="${c.icon} icon-inline"></i>${esc(c.title)}</h4>
          <p>${esc(c.text)}</p>
        </div>`
  )
  .join('\n')}
      </div>
      <p class="why-now-note">
        <i class="fa-solid fa-info-circle icon-inline"></i>
        <em>${esc(t.whyNow.note)}</em>
      </p>
    </div>`
    : '';
  return `<section class="section section--bg-pricing" id="tarifs" aria-labelledby="tarifs-title">
  <div class="container">
${indent(header({ ...t, id: 'tarifs-title' }), 4)}

    <div class="feature-grid feature-grid--pricing">
${factors}
    </div>

    <div class="pricing-box" data-m-collapse>
      <h3 class="pricing-box-title">
        <i class="fa-solid fa-euro-sign"></i> ${esc(p.boxTitle)}
      </h3>
      <div class="pricing-cards">
${cards}
      </div>
      <p class="pricing-note">
        <i class="fa-solid fa-info-circle"></i> ${esc(p.note)}
      </p>
    </div>${whyNow}

    <p class="section-note section-note--sm">
      <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
      <em>Chaque projet est unique. Seul un diagnostic visuel permet d'établir un devis précis et juste.</em>
    </p>
  </div>
</section>`;
}

function related(items) {
  const links = items
    .map((i) => `      <a href="${i.href}" class="related-services-link">
        <i class="${i.icon} icon-inline"></i>${esc(i.label)}
      </a>`)
    .join('\n');
  return `<nav aria-label="Nos autres services" class="related-services-nav">
  <div class="related-services-inner">
    <h2>Nos autres services en Charente</h2>
    <div class="related-services-list">
${links}
    </div>
  </div>
</nav>`;
}

module.exports = { indent, proofBar, hero, realisation, ite, why, tarifs, problem, solution, zone, others, faq, related };
