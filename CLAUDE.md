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
- Formulaires : Cloudflare Turnstile → fonction Netlify `/api/contact` (secret `TURNSTILE_SECRET` côté Netlify, jamais
  dans le dépôt) → Netlify Forms.
- Blog : Markdown dans `content/blog/` (édité via **Pages CMS**, `.pages.yml`).

## Commandes

| Commande | Rôle |
|---|---|
| `npm run build` | build complet (pages → blog → `dist/`) — celui de Netlify |
| `npm run build:pages` | régénère les 5 pages de service depuis `content/pages/` |
| `npm run build:blog` | régénère le blog depuis `content/blog/*.md` |
| `npm run sync:header` | réinjecte le menu dans les pages écrites à la main |
| `npm test` | 20 tests (liens, SEO de base, pages à jour, formulaire, carte, `dist/`, liens de la doc) |
| `node scripts/tokenize-css.js` | remplace les valeurs CSS en dur par les variables `:root` identiques |
| `npm run dev` | `npx serve .` (le footer est alors chargé en JS) |

## Règles de travail (à respecter)

- **Ne jamais commit/push sans validation explicite de l'utilisateur.** Quand il demande de « pousser étape par
  étape » : un commit = une idée, attendre le déploiement, revérifier la prod avant l'étape suivante.
- **Pages de service générées** : ne jamais éditer `ravalement-facade-angouleme.html`, `nettoyage-facade-angouleme.html`,
  `nettoyage-toiture-angouleme.html`, `peinture-exterieure-charente.html`, `isolation-interieure-charente.html` à la main
  → éditer `content/pages/<slug>/page.json` (ou son fragment `.html`) puis `npm run build:pages`. Ajouter une page de
  service ou de ville = copier un dossier de `content/pages/` (voir `docs/seo/architecture.md` §4.2).
- **Blog** : ne jamais éditer `blog/*.html` (générés) ; modifier `content/blog/*.md` puis `npm run build:blog`.
  Gabarit : `scripts/template-article.html`. CSS/JS du blog : `assets/css/blog*.css`, `assets/js/blog-*.js`.
- **Publication = liste blanche** (`scripts/build-site.js`) : un nouveau dossier/fichier public doit être ajouté à
  `PUBLIC_DIRS` / `PUBLIC_ROOT_FILES`. Les docs, scripts, tests et `content/` ne sont jamais publiés.
- **CSS** : utiliser les variables de `:root` (`--color-*`, `--radius*`, `--space-*`…) plutôt que des valeurs en dur.
  Or : `--brand-accent` = décor uniquement ; texte doré = `--brand-accent-text` (clair) / `--brand-accent-on-dark` (sombre).
  Boutons : pilule, hover = assombrissement seul, 2 tailles (`.btn`, `.btn--sm`) — pas de soulèvement ni de dégradé.
  Logo : SVG en ligne généré par `scripts/sync-header.js` (+ `template-article.html`, `404.html`).
  Le mobile compact (≤ 768 px) est dans `assets/css/responsive.css` ; le repli de blocs pilotés par JS
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
  Reste : tokeniser typo/ombres/breakpoints/z-index, durcir la CSP — liste dans `docs/README.md`.
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
