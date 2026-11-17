'use strict';
/**
 * Chargeur du contenu éditable (Pages CMS) → modèle interne des générateurs.
 *
 *   content/pages/<slug>/page.json   textes et photos de la page (édité dans Pages CMS)
 *   content/pages/<slug>/meta.json   données techniques (URL, JSON-LD, style propre) — hors CMS
 *   content/shared/*.json            blocs communs : services, communes, « pourquoi nous choisir »
 *   content/tarifs.json              prix au m² de chaque prestation (une seule saisie)
 *
 * Convention : les champs `*Html` contiennent du HTML (éditeur riche) ; tous les autres champs sont du texte
 * brut, échappé à l'affichage.
 */
const fs = require('fs');
const { listArticles } = require('./articles.js');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const read = (...p) => JSON.parse(fs.readFileSync(path.join(ROOT, ...p), 'utf8'));

const services = () => read('content', 'shared', 'services.json').services;

function loadPage(slug) {
  const dir = path.join('content', 'pages', slug);
  const cms = read(dir, 'page.json');
  const meta = read(dir, 'meta.json');
  const all = services();
  // Page de ville : `meta.service` = slug de la page de service parente (ex. ravalement-facade-angouleme).
  const self = all.find((s) => s.slug === (meta.service || slug));
  const tarif = read('content', 'tarifs.json').tarifs.find((t) => t.key === meta.prestation);
  if (!self || !tarif) throw new Error(`${slug} : service ou tarif introuvable (content/shared/services.json, content/tarifs.json)`);
  const communes = read('content', 'shared', 'communes.json');
  const why = read('content', 'shared', 'why.json');
  const bySlug = (s) => {
    const f = all.find((x) => x.slug === s);
    if (!f) throw new Error(`${slug} : service inconnu « ${s} »`);
    return f;
  };
  const others = cms.others ? cms.others.services.map(bySlug) : [];

  const s = cms.seo;
  const head = {
    title: s.title, description: s.description, keywords: s.keywords, geoPlacename: meta.geoPlacename,
    ogTitle: s.title, ogDescription: s.description, ogImage: meta.ogImage,
    twitterTitle: s.title, twitterDescription: s.description, twitterImage: meta.ogImage, twitterImageAlt: meta.twitterImageAlt,
    ...(meta.extraStyle && { extraStyle: meta.extraStyle }),
    ...(meta.ogExtra && { ogExtra: meta.ogExtra }),
    ...(meta.twitterExtra && { twitterExtra: meta.twitterExtra }),
  };

  // Pages de ville rattachées à ce service (meta.service === slug) : liées depuis la section « zone ».
  const cityPages = listSlugs()
    .map((d) => ({ d, m: read('content', 'pages', d, 'meta.json') }))
    .filter(({ m }) => m.service === slug)
    .map(({ m }) => ({ file: m.file, label: m.breadcrumbName }));

  // Articles du blog sur ce service (6 plus récents) : section « Nos guides » avant la bande devis.
  const guideList = listArticles().filter((a) => a.service && a.service.prestation === meta.prestation).slice(0, 6);

  const sections = [
    { type: 'hero', ...cms.hero },
    ...(cms.realisation ? [{ type: 'realisation', ...cms.realisation, hero: cms.hero }] : []),
    ...(cms.note ? [{ type: 'note', ...cms.note }] : []),
    ...(cms.problem ? [{ type: 'problem', ...cms.problem }] : []),
    ...(cms.rules && meta.rulesFirst ? [{ type: 'rules', ...cms.rules }] : []),
    ...(cms.solution ? [{ type: 'solution', ...cms.solution }] : []),
    ...(cms.ite ? [{ type: 'ite', ...cms.ite, alt: true }] : []),
    { type: 'why', ...why, items: [...why.items, ...(cms.whyExtra || [])], alt: !!meta.whyAlt },
    ...(cms.zone ? [{ type: 'zone', ...cms.zone, cities: communes.communes, noteTitle: communes.noteTitle, noteText: communes.noteText, cityPages }] : []),
    ...(cms.others ? [{ type: 'others', ...cms.others, cards: others }] : []),
    { type: 'tarifs', ...cms.tarifs, price: tarif },
    ...(cms.rules && !meta.rulesFirst ? [{ type: 'rules', ...cms.rules }] : []),
    { type: 'faq', ...cms.faq },
    ...(guideList.length ? [{ type: 'guides', title: `Nos guides : ${self.label.toLowerCase()}`, articles: guideList }] : []),
    { type: 'contact' },
  ];

  return {
    file: meta.file,
    head,
    ld: { ...meta.ld, breadcrumbName: meta.breadcrumbName, ...(meta.parent && { parent: meta.parent }) },
    beforeAfterScript: !!(cms.hero.before && cms.hero.after),
    contact: { prestation: meta.prestation, serviceLabel: cms.contact.serviceLabel },
    related: meta.related || others.map((o) => ({ href: `${o.slug}.html`, icon: o.icon, label: o.label })),
    sections,
  };
}

const listSlugs = () =>
  fs.readdirSync(path.join(ROOT, 'content', 'pages'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);

module.exports = { loadPage, listSlugs, read, services };
