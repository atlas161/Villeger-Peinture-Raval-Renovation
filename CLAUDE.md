# VPRR — vprr.fr

Site vitrine de **Villéger Peinture Raval Rénovation** (VPRR), artisan de rénovation extérieure et
intérieure basé à L'Isle-d'Espagnac (16340), Angoulême, Charente. Gérant : Stéphane Villéger.

## Stack & hébergement

- Site statique HTML/CSS/JS vanilla, pas de framework, pas de bundler.
- Hébergé sur **Netlify**, déployé depuis GitHub (`atlas161/Villeger-Peinture-Raval-Renovation`,
  branche `main`). Push sur `main` = redéploiement automatique.
- Blog géré via **Pages CMS** (`.pages.yml`) : contenu en Markdown dans `content/blog/`, généré en HTML
  statique par `scripts/build-blog.js`.
- **Toujours lancer `npm run build:blog` après avoir modifié un fichier dans `content/blog/`** — les
  fichiers `blog/*.html` sont générés, ne jamais les éditer à la main (écrasés au prochain build).
- **Publication = dossier `dist/`** (`publish = "dist"`), généré par `npm run build` (`build:blog` puis
  `scripts/build-site.js`) : liste blanche des fichiers publics (les fichiers internes — docs, scripts, tests,
  `content/`, `data/config.json`, gabarit d'article — n'y sont jamais), footer inclus statiquement dans le HTML,
  `_redirects` `/blog/<slug>` → `.html`. `dist/` n'est pas versionné. En local, `npm run dev` sert la racine
  (le footer est alors chargé par `footer.js`). Un nouveau dossier/fichier public doit être ajouté à
  `PUBLIC_DIRS`/`PUBLIC_ROOT_FILES` de `scripts/build-site.js`.
- Gabarit des articles : `scripts/template-article.html`. CSS/JS du blog : `assets/css/blog*.css`,
  `assets/js/blog-*.js` (plus rien dans `blog/` hormis le HTML généré et `articles.json`).
- CSS : utiliser les variables de `:root` (`--color-*`, `--radius*`, `--space-*`) plutôt que des valeurs en dur ;
  `node scripts/tokenize-css.js` remplace les valeurs identiques à un token (sans changement visuel).
- `npm test` couvre aussi les invariants du site (`tests/site-invariants.test.js` : liens/ancres, H1 unique,
  canonical, `<title>` ≤ 60 car., sitemap, contenu de `dist/`).
- Les **5 pages de service sont générées** (`npm run build:pages`) depuis un gabarit + `content/pages/<slug>/page.json` :
  ne jamais éditer leurs `.html` à la main (voir `docs/seo/architecture.md`, section « Pages de service générées »).
  Ajouter une page de service ou de ville = copier un dossier de `content/pages/`.
- Détails complets de l'architecture : [`docs/seo/architecture.md`](docs/seo/architecture.md).

## Chantier qualité de code en cours

En parallèle du SEO, un chantier de remise aux bonnes pratiques (HTML/CSS/JS, a11y, perf, sans changer
le rendu visuel) est en cours depuis le 2026-09-18. **Avant de continuer ce chantier ou de toucher au
CSS/JS des pages de service, lire [`docs/code-quality-refactor.md`](docs/code-quality-refactor.md)** :
état d'avancement, PR en attente de merge, méthode de vérification "aucun changement visuel" (piège des
captures d'écran + piège d'une règle CSS globale sur `border-radius`), et ce qu'il reste à faire.

## Audit design & UX (2026-09-21)

Un audit visuel desktop/mobile a été fait le 2026-09-21 et 8 bugs de mise en page ont été corrigés et
déployés en prod (commit `96c08c8`) — détail complet, signalements écartés (faux positifs de capture
d'écran) et pistes de redesign restantes (à valider avec le client) dans
[`docs/design-audit-2026-09-21.md`](docs/design-audit-2026-09-21.md). À consulter avant un nouvel audit
design pour ne pas re-signaler les mêmes points.

## Chantier SEO en cours

Un audit SEO complet a été fait le 2026-09-16 et un plan d'action long terme est en cours d'exécution,
étape par étape. **Tout le suivi (ce qui est fait, les blocages, les décisions produit) est dans
[`docs/seo/`](docs/seo/)** — toujours consulter `docs/seo/README.md` en premier pour l'état d'avancement
avant de proposer une nouvelle action SEO, et mettre à jour `docs/seo/journal.md` +
`docs/seo/blockers.md` après chaque session de travail sur ce sujet.

Objectif du client : booster le référencement long terme du site, de la fiche Google Business Profile et
de la fiche Solocal/PagesJaunes.

## Infos business (source de vérité : le HTML statique de chaque page)

- Téléphone : 05 45 91 22 70 · Adresse : 136 Avenue de la République, 16340 L'Isle-d'Espagnac.
- Services réels : ravalement de façade, nettoyage de façade (hydrogommage, démoussage), nettoyage/
  démoussage de toiture, peinture extérieure, rénovation intérieure, **isolation intérieure** (pas
  d'isolation extérieure/ITE — voir [`docs/seo/decisions.md`](docs/seo/decisions.md)).
- Zone d'intervention : Angoulême et Charente (16), rayon ~50 km autour de L'Isle-d'Espagnac.
- `data/config.json` existe encore mais **n'est plus injecté dans le DOM** (voir piège ci-dessous) : il
  ne sert plus que de note/brouillon, pas de source de vérité. Pour changer une info affichée (FAQ,
  villes desservies, options du formulaire, textes de section), éditer directement le HTML de la page
  concernée.

## Pièges connus

- **(Résolu le 2026-09-18)** `assets/js/config-loader.js` a été supprimé. Il n'était pas totalement
  mort comme documenté auparavant : il tournait sur `index.html` et écrasait silencieusement au
  chargement le FAQ, les villes de zone, les liens de contact, les titres de section et les options du
  formulaire (avec un flash de contenu et une divergence HTML/JSON — ex. le formulaire n'avait que 4
  options en HTML statique contre 6 dans `config.json`). Le HTML statique de `index.html` est
  maintenant la seule source de vérité pour ce contenu ; les 2 options manquantes (Toiture & Couverture,
  Rénovation intérieure) ont été ajoutées en dur dans le formulaire.
- Le champ `title` du frontmatter blog sert à la fois de H1 affiché et (historiquement) de balise
  `<title>` SEO. Utiliser le champ optionnel `seoTitle` (et `metaDescription` pour la meta description)
  pour raccourcir les balises SEO sans toucher au H1/chapeau affichés — voir
  `docs/seo/architecture.md`.
- Ne jamais commit/push sans validation explicite de l'utilisateur.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
