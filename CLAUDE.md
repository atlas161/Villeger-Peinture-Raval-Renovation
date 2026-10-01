# VPRR — vprr.fr

Site vitrine de **Villéger Peinture Raval Rénovation** (VPRR), artisan de rénovation extérieure et
intérieure basé à L'Isle-d'Espagnac (16340), Angoulême, Charente. Gérant : Stéphane Villéger.

## Documentation — où trouver quoi

**Point d'entrée : [`docs/README.md`](docs/README.md)** (index, ce qui reste à faire, méthode de vérification).
- [`docs/seo/architecture.md`](docs/seo/architecture.md) — comment le site est construit (**à lire avant de toucher au code**).
- [`docs/roadmap.md`](docs/roadmap.md) — **ce qui reste à faire**, priorisé (point de reprise d'une nouvelle session).
- [`docs/changelog.md`](docs/changelog.md) — tout ce qui a changé, par date et par commit, avec l'état actuel en chiffres.
  **À mettre à jour à chaque déploiement.**
- [`docs/seo/`](docs/seo/) — suivi SEO : `README.md` (état), `journal.md`, `blockers.md` (actions du client), `decisions.md`.
- Audits : `docs/audit-complet-2026-09-29.md` (clos), `docs/audit-structure-design-2026-09-29.md` (plan exécuté),
  `docs/design-audit-2026-09-21.md` et `docs/ux-ui-responsive-audit.md` (historique — ne pas re-signaler les mêmes
  points), `docs/code-quality-refactor.md` (méthode « aucun changement visuel »).

Après chaque session de travail : mettre à jour `docs/changelog.md` et `docs/roadmap.md`, et `docs/seo/journal.md` + `docs/seo/blockers.md`
si le SEO ou une action client est concernée.

## Stack & hébergement

- Site statique HTML/CSS/JS vanilla, **aucune dépendance npm**, pas de framework ni de bundler.
- **Netlify**, déployé depuis GitHub (`atlas161/Villeger-Peinture-Raval-Renovation`, branche `main`). Push sur `main`
  = redéploiement automatique (≈ 1 min). Netlify lance `npm run build` et publie **`dist/`**.
- Formulaire : **une seule page, `contact.html`** (Cloudflare Turnstile → fonction Netlify `/api/contact` → Netlify Forms ;
  secret `TURNSTILE_SECRET` côté Netlify, jamais dans le dépôt). Accueil et pages de service : bande d'appel vers
  `contact.html?service=…`. Ne jamais remettre un `<form>` ailleurs (test `contact-page`).
- Contenu éditable via **Pages CMS** : blog (`content/blog/`), pages de service, tarifs, À propos, Réalisations, textes communs.
  `.pages.yml` est **généré** depuis `scripts/cms-config.js` (`npm run build:cms`) ; guide client : [`docs/cms.md`](docs/cms.md).

## Commandes

| Commande | Rôle |
|---|---|
| `npm run build:bundles` | assemble `styles.css`, `zone.css` et `main.js` depuis `src/` (voir règle ci-dessous) |
| `npm run build` | build complet (bundles → pages → À propos/Réalisations → blog → `dist/`) — celui de Netlify |
| `npm run build:content` | régénère `a-propos.html` et `realisations.html` depuis `content/a-propos.json` / `content/realisations.json` |
| `npm run build:cms` | régénère `.pages.yml` depuis `scripts/cms-config.js` |
| `npm run build:pages` | régénère les 5 pages de service depuis `content/pages/` |
| `npm run build:blog` | régénère le blog depuis `content/blog/*.md` |
| `npm run sync:header` | réinjecte le menu dans les pages écrites à la main |
| `npm test` | 55 tests (liens, SEO de base, pages à jour, formulaire, carte, `dist/`, liens de la doc, design tokens, pages de contenu, Pages CMS) |
| `node scripts/build-zone-schema.js --inject` | régénère le schéma SVG de la zone dans `index.html` |
| `node scripts/tokenize-css.js` | remplace les valeurs CSS en dur par les variables `:root` identiques |
| `npm run dev` | `npx serve .` (le footer est alors chargé en JS) |

## Règles de travail (à respecter)

- **Gros fichiers découpés par fonction** : `assets/css/styles.css`, `assets/css/zone.css` et `assets/js/main.js` sont
  **générés** — ne jamais les éditer. Les sources sont dans `src/css/styles/`, `src/css/zone/` et `src/js/main/`
  (petits fichiers numérotés `NN-sujet`, assemblés dans l'ordre par `scripts/build-bundles.js`), puis
  `npm run build:bundles` (inclus dans `npm run build` ; `npm test` vérifie qu'ils sont à jour). `src/` n'est pas publié.
  Un nouveau sujet = un nouveau fichier avec le bon numéro (l'ordre = la cascade CSS / l'ordre d'initialisation JS).

- **Ne jamais commit/push sans validation explicite de l'utilisateur.** Quand il demande de « pousser étape par
  étape » : un commit = une idée, attendre le déploiement, revérifier la prod avant l'étape suivante.
- **Pages de service générées** : ne jamais éditer `ravalement-facade-angouleme.html`, `nettoyage-facade-angouleme.html`,
  `nettoyage-toiture-angouleme.html`, `peinture-exterieure-charente.html`, `isolation-interieure-charente.html` à la main
  → éditer `content/pages/<slug>/page.json` (texte/photos, aussi édité via Pages CMS), `meta.json` (technique), `content/tarifs.json`
  (prix) ou `content/shared/*.json` puis `npm run build:pages`. Ajouter une page de
  service ou de ville = copier un dossier de `content/pages/` (voir `docs/seo/architecture.md` §4.2).
- **À propos / Réalisations** : `a-propos.html` et `realisations.html` sont écrites à la main **sauf** la zone entre `<!-- cms:begin -->` et
  `<!-- cms:end -->` (et les balises title/description), générée depuis `content/a-propos.json` / `content/realisations.json`
  (`npm run build:content`) : ne jamais éditer cette zone à la main.
- **Blog** : ne jamais éditer `blog/*.html` (générés) ; modifier `content/blog/*.md` puis `npm run build:blog`.
  Gabarit : `scripts/template-article.html`. CSS/JS du blog : `assets/css/blog*.css`, `assets/js/blog-*.js`.
- **Publication = liste blanche** (`scripts/build-site.js`) : un nouveau dossier/fichier public doit être ajouté à
  `PUBLIC_DIRS` / `PUBLIC_ROOT_FILES`. Les docs, scripts, tests et `content/` ne sont jamais publiés.
- **CSS** : utiliser les variables de `:root` (`--color-*`, `--radius*`, `--space-*`, `--text-*`, `--shadow-*`, `--z-*`…) plutôt que des valeurs en dur.
  Échelles et points de rupture : [`docs/design/tokens.md`](docs/design/tokens.md) — **vérifiés par `npm test`** (`design-tokens`) : une taille de police, une ombre, un `z-index` ou un `@media` hors échelle fait échouer les tests ;
  `node scripts/tokenize-scale.js` remplace automatiquement les valeurs hors échelle par le token le plus proche.
  Or : `--brand-accent` = décor uniquement ; texte doré = `--brand-accent-text` (clair) / `--brand-accent-on-dark` (sombre).
  Boutons : pilule, hover = assombrissement seul, 2 tailles (`.btn`, `.btn--sm`) — pas de soulèvement ni de dégradé.
  Logo : `media/VPRR-LOGO.svg` (`<img class="logo-img">`, généré par `scripts/sync-header.js`, `template-article.html`, `404.html`).
  Le logo **B2** est retenu mais non déployé : tout est dans `docs/design/logo-b2.md` (ne pas l'appliquer sans demande du client).
  Le mobile compact (≤ 767 px) est dans `assets/css/responsive.css` ; le repli de blocs pilotés par JS
  (`data-m-limit`, `data-m-collapse`) dans `assets/js/mobile-condense.js`. Rien n'est replié sur ordinateur.
- **Tiers / CSP** : ajouter un outil tiers (pixel, widget, vidéo…) = ajouter son domaine dans la
  `Content-Security-Policy` de `netlify.toml` **et** le citer dans les mentions légales, sinon il est bloqué.
- **Cookies & mesure** : bannière binaire « Tout refuser / Tout accepter » (`localStorage['cookie-consent']`) ;
  GTM + Clarity et les événements `phone_click`, `quote_cta_click`, `generate_lead` (`footer.js`) ne partent
  qu'après « Tout accepter ». Ne jamais charger de traceur avant consentement.
- Caches : CSS/JS revalidés (`max-age=0, must-revalidate`), noms **non versionnés** — ne jamais remettre `immutable`.
  Une lib tierce mise à jour = nouveau dossier versionné dans `assets/vendor/`.
- Après une modification de code : `npm test`, puis vérifier le rendu à 375 / 768 / 1440 px (méthode dans
  `docs/README.md`), puis `graphify update .` (voir plus bas).

## Chantiers et audits (état au 2026-09-30)

- **Qualité de code** (depuis 2026-09-18) : largement fait (tokens CSS, pages générées, CSS mort supprimé, tests).
  Tokens typo/ombres/breakpoints/z-index : faits le 2026-10-02. Reste : durcir la CSP, ménage de `styles.css` / `zone.css` / `main.js` — voir `docs/roadmap.md`.
- **SEO** : suivi dans `docs/seo/` (consulter `README.md` en premier avant de proposer une action SEO). Objectif du
  client : booster le référencement long terme du site, de la fiche Google Business Profile et de la fiche
  Solocal/PagesJaunes. Actions en attente du client : `docs/seo/blockers.md`.
- **Audits** : perf/RGPD/sécurité (2026-09-29, clos), structure/routes/design system (2026-09-29, plan exécuté),
  design/UX (2026-09-21). Lighthouse mobile prod : 99 / 100 / 100 / 100.

## Infos business (source de vérité : le HTML des pages)

- Téléphone : 05 45 91 22 70 · Adresse : 136 Avenue de la République, 16340 L'Isle-d'Espagnac.
- Horaires : lun–ven 9 h–17 h, sam 9 h–12 h, dim fermé.
- Services réels : ravalement de façade, nettoyage de façade (hydrogommage, démoussage), nettoyage/
  démoussage de toiture, peinture extérieure, rénovation intérieure, **isolation intérieure** (pas
  d'isolation extérieure/ITE — voir [`docs/seo/decisions.md`](docs/seo/decisions.md)).
- Zone d'intervention : Angoulême et Charente (16), rayon ~50 km autour de L'Isle-d'Espagnac.
- Contenu affiché (FAQ, villes desservies, options du formulaire, textes) : dans le HTML des pages, ou dans
  `content/pages/<slug>/` pour les pages de service. Il n'y a plus de fichier de configuration JSON
  (`data/config.json` supprimé le 2026-09-30, `config-loader.js` supprimé le 2026-09-18).
- Le numéro/adresse apparaît aussi dans : `includes/footer.html`, le JSON-LD (`scripts/build-pages.js` et
  `index.html`), `llms.txt`, `humans.txt`, `mentions-legales.html` — à tenir alignés.

## Pièges connus

- Le champ `title` du frontmatter blog sert de H1 affiché ; utiliser `seoTitle` (≤ 60 car.) et `metaDescription`
  pour les balises SEO sans toucher au H1.
- Noms d'images de blog : pas d'espaces ni de parenthèses (casse le `srcset`).
- `<title>` de chaque page ≤ 60 caractères (vérifié par `npm test`).
- La bannière cookies dépend de la classe `cookie-banner-visible` posée par `footer.js` : ne pas retirer (elle
  était invisible avant le correctif du 2026-09-30).
- Sous Windows, `npm run build` échoue (`EPERM`) si `npx serve dist` tourne encore : l'arrêter d'abord.
- Le volet de prévisualisation peut être masqué : transitions CSS figées et captures parfois blanches — mesurer le
  DOM (hauteurs, styles calculés) plutôt que de se fier à une capture isolée.
- La CSP de production bloque les `<iframe>` internes : pour comparer des pages sur la prod, naviguer page par page.
- `AGENTS.md` (non suivi par git) est une copie ancienne de ces consignes pour d'autres outils : ne pas s'y fier.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
