'use strict';
/**
 * Configuration de Pages CMS (https://pagescms.org) — SOURCE de `.pages.yml`.
 * Ne pas éditer `.pages.yml` à la main : modifier ce fichier puis `npm run build:cms`
 * (le test `cms` vérifie que `.pages.yml` est à jour et que chaque champ des fichiers JSON est déclaré :
 * un champ absent d'ici serait perdu à la première sauvegarde dans l'éditeur).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

// ───────────────────────── Libellés réutilisables ─────────────────────────
const ICONS = [
  ['fa-solid fa-house-crack', 'Maison fissurée'], ['fa-solid fa-house', 'Maison'], ['fa-solid fa-home', 'Maison (simple)'],
  ['fa-solid fa-house-chimney', 'Toiture / cheminée'], ['fa-solid fa-house-chimney-window', 'Maison avec fenêtre'],
  ['fa-solid fa-paint-roller', 'Rouleau de peinture'], ['fa-solid fa-paintbrush', 'Pinceau'], ['fa-solid fa-palette', 'Palette de couleurs'],
  ['fa-solid fa-spray-can', 'Aérosol'], ['fa-solid fa-spray-can-sparkles', 'Nettoyage (aérosol brillant)'], ['fa-solid fa-wand-magic-sparkles', 'Baguette magique'],
  ['fa-solid fa-trowel', 'Truelle (enduit)'], ['fa-solid fa-screwdriver-wrench', 'Outils'], ['fa-solid fa-layer-group', 'Couches'],
  ['fa-solid fa-droplet', 'Goutte d’eau'], ['fa-solid fa-snowflake', 'Flocon (froid)'], ['fa-solid fa-sun', 'Soleil'], ['fa-solid fa-smog', 'Pollution'],
  ['fa-solid fa-leaf', 'Feuille (mousse, nature)'], ['fa-solid fa-temperature-half', 'Thermomètre'], ['fa-solid fa-temperature-high', 'Chaleur'],
  ['fa-solid fa-fire-flame-simple', 'Flamme'], ['fa-solid fa-triangle-exclamation', 'Attention'], ['fa-solid fa-arrow-trend-down', 'Baisse (valeur)'],
  ['fa-solid fa-shield-halved', 'Bouclier (garantie)'], ['fa-solid fa-user-shield', 'Protection'], ['fa-solid fa-award', 'Médaille'], ['fa-solid fa-certificate', 'Certificat'],
  ['fa-solid fa-tag', 'Étiquette (prix)'], ['fa-solid fa-euro-sign', 'Euro'], ['fa-solid fa-hand-holding-dollar', 'Aides financières'], ['fa-solid fa-receipt', 'Devis / facture'],
  ['fa-solid fa-file-contract', 'Contrat'], ['fa-solid fa-clock', 'Horloge (durée)'], ['fa-solid fa-calendar-check', 'Calendrier (coché)'], ['fa-solid fa-calendar-days', 'Calendrier'],
  ['fa-solid fa-landmark', 'Mairie (administratif)'], ['fa-solid fa-handshake', 'Poignée de main'], ['fa-solid fa-user-tie', 'Interlocuteur'], ['fa-solid fa-broom', 'Balai (chantier propre)'],
  ['fa-solid fa-clipboard-check', 'Diagnostic'], ['fa-solid fa-ruler-vertical', 'Mesure (épaisseur)'], ['fa-solid fa-ruler-combined', 'Mesure (surface)'],
  ['fa-solid fa-magnifying-glass', 'Loupe'], ['fa-solid fa-stairs', 'Escalier (accès)'], ['fa-solid fa-door-open', 'Porte ouverte'], ['fa-solid fa-window-restore', 'Fenêtre'],
].map(([value, label]) => ({ value, label }));

const SERVICES = readJson('content/shared/services.json').services;
const serviceOptions = SERVICES.map((s) => ({ value: s.slug, label: s.label }));

const HINT = {
  photo: 'Cliquez sur « Importer » pour ajouter une nouvelle photo depuis votre ordinateur ou téléphone (JPG, PNG ou WebP, toutes tailles : le site la redimensionne et l’optimise automatiquement). Vous pouvez aussi choisir une photo déjà importée.',
};

// ───────────────────────── Briques de champs ─────────────────────────
const str = (name, label, extra = {}) => ({ name, label, type: 'string', ...extra });
const text = (name, label, extra = {}) => ({ name, label, type: 'text', ...extra });
const icon = (name = 'icon', label = 'Icône') => ({ name, label, component: 'icon' });
const photo = (name, label, extra = {}) => ({ name, label, component: 'photo', ...extra });
const html = (name, label, extra = {}) => ({ name, label, type: 'rich-text', options: { format: 'html', switcher: false, media: false }, ...extra });
const obj = (name, label, fields, extra = {}) => ({ name, label, type: 'object', fields, ...extra });
const list = (name, label, fields, summary, extra = {}) => ({
  name, label, type: 'object', list: { collapsible: { collapsed: true, summary } }, fields, ...extra,
});

const sectionHead = (intro = true) => [
  str('eyebrow', 'Petit titre au-dessus (ex. « Le problème »)'),
  str('title', 'Titre de la section'),
  ...(intro ? [text('intro', 'Texte d’introduction')] : []),
];

const seoFields = obj('seo', '1. Référencement Google', [
  str('title', 'Titre dans Google (60 caractères maximum)', { required: true, options: { maxlength: 60 } }),
  text('description', 'Description dans Google (160 caractères conseillés)', { required: true, options: { maxlength: 200 } }),
  str('keywords', 'Mots-clés (séparés par des virgules)'),
]);

// ───────────────────────── Pages de service ─────────────────────────
function serviceFields(slug) {
  const page = readJson(`content/pages/${slug}/page.json`);
  const f = [seoFields];
  f.push(obj('hero', '2. En-tête (photos avant/après + titre)', [
    photo('before', 'Photo AVANT (à importer en premier)', { description: HINT.photo + ' Laissez les deux photos vides pour afficher une icône à la place.' }),
    photo('after', 'Photo APRÈS'),
    str('altBefore', 'Description de la photo avant (accessibilité et Google)'),
    str('altAfter', 'Description de la photo après'),
    str('title', 'Titre principal (H1)', { required: true }),
    text('subtitle', 'Phrase d’accroche sous le titre'),
    str('ctaLabel', 'Texte du bouton « devis »'),
    icon('placeholderIcon', 'Icône (si pas de photos)'),
    str('placeholderText', 'Texte sous l’icône (si pas de photos)'),
  ]));
  if (page.realisation) {
    f.push(obj('realisation', '3. Bloc « Avant / Après » (fiche chantier)', [
      photo('before', 'Autre photo AVANT (optionnel)', { description: 'Laissez vide pour réutiliser les photos de l’en-tête.' }),
      photo('after', 'Autre photo APRÈS (optionnel)'),
      str('altBefore', 'Description photo avant (optionnel)'),
      str('altAfter', 'Description photo après (optionnel)'),
      str('title', 'Titre'), text('intro', 'Introduction'), str('sheetTitle', 'Titre de la fiche'),
      list('facts', 'Lignes de la fiche (Zone, Support, Problèmes…)', [str('label', 'Intitulé'), str('text', 'Texte')], '{label}'),
      str('tipTitle', 'Titre de l’encadré conseil'),
      html('tipHtml', 'Texte de l’encadré conseil (liens possibles)'),
    ]));
  }
  f.push(obj('problem', '4. Le problème', [
    ...sectionHead(),
    list('items', 'Les problèmes', [icon(), str('title', 'Titre'), text('text', 'Texte')], '{title}'),
  ]));
  f.push(obj('solution', '5. Notre solution', [
    ...sectionHead(),
    list('features', 'Prestations', [icon(), str('title', 'Titre'), text('text', 'Texte'), { name: 'highlight', label: 'Mettre en avant', type: 'boolean' }], '{title}'),
    list('steps', 'Étapes du chantier (numérotées automatiquement)', [str('title', 'Titre'), text('text', 'Texte')], '{index}. {title}'),
  ]));
  if (page.ite) {
    f.push(obj('ite', '6. Encadré « pas d’isolation par l’extérieur »', [str('title', 'Titre'), html('textHtml', 'Texte')]));
  }
  f.push(list('whyExtra', '7. « Pourquoi nous choisir » : cartes propres à cette page (les cartes communes se modifient dans « Textes communs »)', [
    icon(), str('title', 'Titre'), text('text', 'Texte'), { name: 'accent', label: 'Carte mise en avant', type: 'boolean' },
  ], '{title}'));
  f.push(obj('zone', '8. Zone d’intervention', [
    str('eyebrow', 'Petit titre'), str('title', 'Titre'), text('intro', 'Introduction'),
  ], { description: 'La liste des communes et la phrase « Votre commune n’est pas listée ? » se modifient dans « Textes communs > Communes desservies ».' }));
  f.push(obj('others', '9. Autres services proposés', [
    ...sectionHead(),
    { name: 'services', label: 'Services affichés (3 conseillés, pas la page elle-même)', type: 'select', list: { min: 1, max: 4 }, options: { values: serviceOptions.filter((s) => s.value !== slug) } },
  ]));
  const tarifs = [
    ...sectionHead(),
    list('factors', 'Facteurs de prix (4 cartes)', [icon(), str('title', 'Titre'), text('text', 'Texte')], '{title}'),
  ];
  if (page.tarifs.whyNow) {
    tarifs.push(obj('whyNow', 'Encadré « investissement rentable »', [
      str('title', 'Titre'),
      list('cards', 'Cartes', [icon(), str('title', 'Titre'), text('text', 'Texte')], '{title}'),
      text('note', 'Note en bas de l’encadré'),
    ]));
  }
  f.push(obj('tarifs', '10. Tarifs (les prix au m² se modifient dans « Tarifs »)', tarifs));
  f.push(obj('faq', '11. Questions fréquentes', [
    ...sectionHead(),
    list('items', 'Questions et réponses', [
      icon(), str('question', 'Question'), html('answerHtml', 'Réponse'),
      { name: 'accent', label: 'Pastille dorée', type: 'boolean' },
    ], '{question}'),
  ], { description: 'Les questions sont aussi envoyées à Google (FAQ enrichie) : écrivez des réponses complètes et exactes.' }));
  f.push(obj('contact', '12. Bande « devis » en bas de page', [
    str('serviceLabel', 'Fin du titre : « Un projet … ? » (ex. « de ravalement de façade »)'),
  ]));
  return f;
}

const pageEntries = SERVICES.map((s) => ({
  name: `page-${s.key}`, label: s.label, type: 'file', format: 'json', path: `content/pages/${s.slug}/page.json`, fields: serviceFields(s.slug),
}));

// ───────────────────────── Autres contenus ─────────────────────────
const realisations = {
  name: 'realisations', label: 'Réalisations (photos de chantiers)', type: 'file', format: 'json', path: 'content/realisations.json',
  fields: [
    obj('seo', 'Référencement Google', [str('title', 'Titre dans Google (60 car. max)', { options: { maxlength: 60 } }), text('description', 'Description dans Google')]),
    obj('intro', 'Introduction de la page', [str('eyebrow', 'Petit titre'), str('title', 'Titre (H1)'), text('text', 'Texte')]),
    list('chantiers', 'Chantiers (une carte avant/après par chantier)', [
      photo('before', 'Photo AVANT (à importer en premier)'),
      photo('after', 'Photo APRÈS'),
      str('title', 'Titre du chantier (ex. « Ravalement de façade à Soyaux »)', { required: true }),
      { name: 'category', label: 'Catégorie (sert au filtre de la page)', type: 'select', required: true, options: { values: [{ value: 'facade', label: 'Façade' }, { value: 'toiture', label: 'Toiture' }, { value: 'peinture', label: 'Peinture' }, { value: 'isolation', label: 'Isolation' }] } },
      { name: 'service', label: 'Page service liée au bouton « Voir ce service »', type: 'select', options: { values: serviceOptions } },
      str('commune', 'Commune (optionnel)'),
      str('duration', 'Durée du chantier (optionnel, ex. « 3 jours »)'),
      str('altBefore', 'Description de la photo avant (optionnel)'),
      str('altAfter', 'Description de la photo après (optionnel)'),
      { name: 'draft', label: 'Brouillon (ne pas afficher sur le site)', type: 'boolean', default: false },
    ], '{title} — {commune}'),
  ],
};

const tarifs = {
  name: 'tarifs', label: 'Tarifs (prix au m²)', type: 'file', format: 'json', path: 'content/tarifs.json',
  fields: [
    list('tarifs', 'Prestations', [
      str('key', 'Identifiant technique', { readonly: true }),
      str('label', 'Prestation', { readonly: true }),
      str('boxTitle', 'Titre du bloc de prix'),
      list('cards', 'Fourchettes de prix (3 cartes)', [
        str('title', 'Nom de la formule'),
        str('price', 'Prix', { description: 'Format conseillé : 25-40 €/m²' }),
        str('desc', 'Précision'),
      ], '{title} : {price}', { description: 'Pensez à mettre à jour aussi la question « Quel est le prix… » dans la FAQ de la page et sur la page FAQ générale : un test signale les écarts.' }),
      text('note', 'Note sous les prix'),
    ], '{label}', { list: { min: 5, max: 5, collapsible: { collapsed: true, summary: '{label}' } } }),
  ],
};

const aPropos = {
  name: 'a-propos', label: 'À propos (portrait, engagements)', type: 'file', format: 'json', path: 'content/a-propos.json',
  fields: [
    obj('owner', 'Portrait du dirigeant (affiché seulement si la photo ET le texte sont remplis)', [
      photo('photo', 'Portrait (à importer en premier)', { description: HINT.photo + ' Idéalement un portrait vertical ou carré.' }),
      str('photoAlt', 'Description de la photo (ex. « Stéphane Villéger devant un chantier »)'),
      str('name', 'Nom'), str('role', 'Fonction (ex. « Gérant »)'),
      html('textHtml', 'Parcours et présentation (quelques paragraphes)'),
    ]),
    obj('seo', 'Référencement Google', [str('title', 'Titre dans Google (60 car. max)', { options: { maxlength: 60 } }), text('description', 'Description dans Google')]),
    obj('intro', 'Introduction de la page', [str('eyebrow', 'Petit titre'), str('title', 'Titre (H1)'), text('text', 'Texte')]),
    list('facts', 'Informations clés (dirigeant, siège, zone, horaires)', [str('label', 'Intitulé'), text('value', 'Valeur (retour à la ligne autorisé)')], '{label}'),
    obj('metier', 'Section « Notre métier » (les cartes viennent de « Textes communs > Services »)', [str('eyebrow', 'Petit titre'), str('title', 'Titre'), text('intro', 'Introduction')]),
    obj('engagements', 'Section « Nos engagements »', [
      str('eyebrow', 'Petit titre'), str('title', 'Titre'),
      list('items', 'Engagements', [icon(), str('title', 'Titre'), text('text', 'Texte')], '{title}'),
    ]),
  ],
};

const shared = {
  name: 'shared', label: 'Textes communs', type: 'group',
  items: [
    { name: 'communes', label: 'Communes desservies', type: 'file', format: 'json', path: 'content/shared/communes.json', fields: [
      str('noteTitle', 'Phrase en gras sous la liste'), str('noteText', 'Suite de la phrase'),
      { name: 'communes', label: 'Communes (la première est mise en avant)', type: 'string', list: true },
    ] },
    { name: 'services', label: 'Services (cartes et liens entre pages)', type: 'file', format: 'json', path: 'content/shared/services.json', fields: [
      list('services', 'Services', [
        str('key', 'Identifiant technique', { readonly: true }), str('slug', 'Adresse de la page', { readonly: true }),
        str('label', 'Nom du service'), icon(), text('card', 'Texte des cartes « autres services »'), text('about', 'Texte de la page À propos'),
      ], '{label}', { list: { min: 5, max: 5, collapsible: { collapsed: true, summary: '{label}' } } }),
    ] },
    { name: 'why', label: '« Pourquoi nous choisir » (cartes communes)', type: 'file', format: 'json', path: 'content/shared/why.json', fields: [
      ...sectionHead(),
      list('items', 'Cartes', [icon(), str('title', 'Titre'), text('text', 'Texte')], '{title}'),
    ] },
  ],
};

const blog = {
  name: 'posts', label: 'Articles de blog', type: 'collection', path: 'content/blog',
  filename: '{year}-{month}-{day}-{fields.slug}.md', format: 'yaml-frontmatter',
  view: { primary: 'title', fields: ['title', 'date', 'slug', 'draft', 'category'], sort: ['date', 'title'], default: { sort: 'date', order: 'desc' } },
  fields: [
    { name: 'category', label: 'Catégorie', type: 'select', options: { values: ['Peinture', 'Façade', 'Toiture', 'Rénovation', 'Conseils', 'Entretien'], default: 'Conseils' } },
    str('title', 'Titre de l\'article (H1, affiché sur la page)', { required: true }),
    str('seoTitle', 'Titre SEO (balise <title>, 55-60 caractères max)', { description: 'Optionnel. Si vide, reprend le champ Titre ci-dessus. À remplir uniquement si le Titre H1 dépasse 60 caractères, pour éviter que Google le tronque dans les résultats de recherche.' }),
    str('slug', 'Slug (URL)', { required: true }),
    text('description', 'Chapeau de l\'article (affiché sous le H1)', { required: true }),
    text('metaDescription', 'Meta description SEO (150-160 caractères max)', { description: 'Optionnel. Si vide, reprend le champ Chapeau ci-dessus. À remplir uniquement si le Chapeau dépasse 160 caractères, pour éviter que Google le tronque dans les résultats de recherche.' }),
    { name: 'date', label: 'Date de publication', type: 'date', required: true },
    { name: 'image', label: 'Image de couverture', type: 'image', options: { media: 'blog' } },
    { name: 'draft', label: 'Brouillon', type: 'boolean', default: false },
    { name: 'tags', label: 'Tags', type: 'string', list: { collapsible: false } },
    { name: 'readtime', label: 'Temps de lecture (min)', type: 'number', default: 5 },
    { name: 'body', label: 'Contenu de l\'article', type: 'rich-text', options: { media: 'blog' } },
  ],
};

const config = {
  components: {
    icon: { type: 'select', options: { values: ICONS } },
    photo: { type: 'image', description: HINT.photo, options: { media: 'photos', path: 'uploads', rename: 'safe' } },
  },
  media: [
    { name: 'blog', label: 'Images du blog', input: 'assets/img/blog', output: '/assets/img/blog' },
    { name: 'photos', label: 'Photos du site (chantiers, portrait, pages)', input: 'media', output: '/media', extensions: ['jpg', 'jpeg', 'png', 'webp'], rename: 'safe' },
  ],
  content: [
    realisations,
    { name: 'service-pages', label: 'Pages de service', type: 'group', items: pageEntries },
    tarifs,
    aPropos,
    shared,
    blog,
  ],
};

module.exports = { config };
