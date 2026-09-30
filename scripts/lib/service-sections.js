'use strict';
/**
 * Composants HTML des pages de service. Chaque fonction reçoit des données (voir content/pages/*.json)
 * et renvoie le HTML de la section. Les champs `*Html` contiennent du HTML brut (liens, <strong>…).
 */

const path = require('path');
const { webpSize } = require('./image-size');

const SLIDER_SIZES = '(max-width: 960px) 100vw, 50vw';

const indent = (str, n) => str.split('\n').map((l) => (l ? ' '.repeat(n) + l : l)).join('\n');

function header({ eyebrow, title, id, introHtml }) {
  return `<header class="section-header">
  <p class="section-eyebrow">${eyebrow}</p>
  <h2 id="${id}">${title}</h2>${introHtml ? `\n  <p>${introHtml}</p>` : ''}
</header>`;
}

function responsiveImg({ dir, name, alt, className, id, eager }) {
  const base = `${dir}/${name}`;
  const srcset = [600, 900, 1200].map((w) => `${base}-${w}w.webp ${w}w`).join(', ');
  const size = webpSize(path.join(__dirname, '..', '..', `${base}-900w.webp`));
  const attrs = [
    `src="${base}-900w.webp"`,
    `srcset="${srcset}"`,
    `sizes="${SLIDER_SIZES}"`,
    `alt="${alt}"`,
    size ? `width="${size.width}" height="${size.height}"` : null,
    `class="${className}"`,
    id ? `id="${id}"` : null,
    eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"',
    'decoding="async"',
  ].filter(Boolean);
  return `<img ${attrs.join(' ')} />`;
}

function hero(h) {
  const image = h.slider
    ? `<div class="before-after-slider" id="beforeAfterSlider">
  ${responsiveImg({ ...h.slider, name: h.slider.before, alt: h.slider.altBefore, className: 'image-before', id: 'imageBefore', eager: true })}
  ${responsiveImg({ ...h.slider, name: h.slider.after, alt: h.slider.altAfter, className: 'image-after' })}
  <div class="slider-label label-before">Avant</div>
  <div class="slider-label label-after">Après</div>
  <div class="slider-handle" id="sliderHandle"></div>
</div>`
    : `<div class="hero-placeholder">
  <i class="${h.placeholder.icon}" aria-hidden="true"></i>
  <p class="hero-placeholder-text">${h.placeholder.text}</p>
</div>`;
  return `<section class="service-hero" aria-labelledby="hero-title">
  <div class="service-hero-container">
    <div class="service-hero-content">
      <h1 id="hero-title">${h.title}</h1>
      <p class="service-hero-subtitle">${h.subtitleHtml}</p>
      <div class="service-hero-cta">
        <a class="btn btn-primary btn--lg" href="#contact">${h.ctaLabel}</a>
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

function problem(s) {
  const items = s.items
    .map(
      (i) => `    <li class="problem-item">
      <div class="problem-item-icon"><i class="${i.icon}" aria-hidden="true"></i></div>
      <div class="problem-item-content">
        <h3>${i.title}</h3>
        <p>${i.text}</p>
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
        <h3>${f.title}</h3>
        <p>${f.text}</p>
      </div>
    </article>`
    )
    .join('\n\n');
  const steps = s.steps
    .map(
      (st, i) => `    <div class="process-step">
      <div class="step-number">${i + 1}</div>
      <h3>${st.title}</h3>
      <p>${st.text}</p>
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
    .map((c, i) => `    <li class="zone-tag">${i === 0 ? '<i class="fa-solid fa-location-dot" aria-hidden="true"></i> ' : ''}${c}</li>`)
    .join('\n');
  return `<section class="section" aria-labelledby="zone-title">
  <div class="container">
${indent(header({ ...z, id: 'zone-title' }), 4)}

    <ul class="zone-list" data-m-limit="8" data-m-more="Voir les autres communes">
${cities}
    </ul>

    <p class="section-note">
      <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
      ${z.noteHtml}
    </p>
  </div>
</section>`;
}

function others(o) {
  const cards = o.cards
    .map(
      (c) => `    <article class="service-card">
      <div class="service-icon"><i class="${c.icon}" aria-hidden="true"></i></div>
      <h3>${c.title}</h3>
      <p>${c.text}</p>
      <a href="${c.href}" class="btn btn-secondary btn--sm">En savoir plus</a>
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
          <span>${i.question}</span>
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

    <div class="section-cta">
      <p>
        ${f.cta.text}
      </p>
      <a href="#contact" class="btn btn-primary">
        <i class="${f.cta.icon} icon-inline" aria-hidden="true"></i>
        ${f.cta.label}
      </a>
    </div>
  </div>
</section>`;
}

function related(items) {
  const links = items
    .map((i) => `      <a href="${i.href}" class="related-services-link">
        <i class="${i.icon} icon-inline"></i>${i.label}
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

module.exports = { indent, hero, problem, solution, zone, others, faq, related };
