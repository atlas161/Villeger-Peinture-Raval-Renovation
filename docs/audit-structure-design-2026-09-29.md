# Audit structure, routes & design system — 2026-09-29

Complément de [`audit-complet-2026-09-29.md`](./audit-complet-2026-09-29.md) (perf/RGPD/SEO/sécurité, en
grande partie corrigé). Celui-ci couvre ce qu'il ne traitait pas : **intégrité des routes**, **architecture du
code**, **cohérence du design system** et **densité/parcours des pages**. Méthode : script de vérification de
tous les liens/ancres/sitemap, requêtes HTTP sur la prod, analyse statique des CSS, mesures DOM (mobile 375 /
desktop 1440). Aucune modification du site.

## Verdict

**Fondations saines, dette de structure moyenne, design cohérent en surface mais sans discipline de tokens.**
Il n'y a pas de « gros travail » urgent : pas de lien cassé, pas de bug de mise en page, 13/13 tests verts.
Le vrai chantier est de **rendre le site maintenable** (le contenu est copié-collé dans 6 pages de 1 200
lignes) et d'**alléger le parcours** (pages très longues, surtout mobile).

## 1. Routes & liens

**OK** : 19 pages, 0 lien interne ni ancre cassés (les 2 « erreurs » du script sont des URL Google Maps),
sitemap = 17 URL toutes existantes, fichiers internes bien en 404 en prod, 404 propre sur URL inconnue,
redirections www→apex et `/page` → `/page.html` fonctionnelles.

| # | Constat | Gravité | Correctif |
|---|---|---|---|
| R1 | **Routes incohérentes** : `/ravalement-facade-angouleme` → 301 vers `.html`, mais `/blog/<article>` (sans `.html`) répond **200** (doublon d'URL, sauvé seulement par le canonical). Idem `/index.html` et `/blog/index.html` en 200. | Moyenne | Décider une convention. Recommandé : **URLs propres sans `.html`** (`pretty_urls` + canonicals/sitemap/liens mis à jour + 301 des anciennes). Sinon, ajouter les 301 pour les articles. |
| R2 | `/assets/scss/zone-map.scss` **servi publiquement** (200) et référencé nulle part. | Faible | Supprimer le fichier (orphelin). |
| R3 | `/favicon.ico` → **404** à la racine (le vrai est dans `/media/favicon/`). Les navigateurs et robots le demandent systématiquement. | Faible | Redirection 200 `/favicon.ico` → `/media/favicon/favicon.ico`. |
| R4 | `blog/index.html` est indexable et présent comme `/blog/` dans le sitemap : cohérent, mais la page répond aussi sous 3 URL (`/blog`, `/blog/`, `/blog/index.html`). | Faible | Un seul canonical suffit ; ajouter 301 `/blog/index.html` → `/blog/`. |
| R5 | Le catch-all `/* → 404.html` n'a pas `force` et `netlify.toml` cumule ~35 règles de blocage à la main. Toute nouvelle pièce du dépôt (ex. un nouveau dossier) est publique par défaut. | Moyenne | **Publier un dossier `dist/`** (build qui copie uniquement le public) : remplace toute la liste noire par une liste blanche. |

## 2. Architecture du code

- **`node_modules` versionné dans git (109 fichiers, ~20 Mo) et aucun `.gitignore`.** Bloquant pour la
  propreté du dépôt (et `.agents/`, `.codex/`, `graphify-out/`, `.claude/settings.json` non suivis flottent).
  → `git rm -r --cached node_modules`, créer `.gitignore`.
- **Trois feuilles de style blog** au lieu d'une : `assets/css/blog.css` (4,5 Ko), `blog/blog.css` (11,7 Ko),
  `blog/article.css` (22,5 Ko) + 2 JS (`blog/blog.js` **et** `assets/js/blog-*.js`). `blog/index.html` charge
  `blog/blog.css`, les articles chargent `assets/css/blog.css` **et** `blog/article.css`. Sources de vérité
  ambiguës → risque de régression à chaque retouche.
  → Regrouper dans `assets/css/` (un `blog.css` liste + un `article.css`), un seul dossier JS.
- **Contenu dupliqué à la main** : `index.html` 1 239 lignes, `ravalement-facade-angouleme.html` 1 217 lignes,
  et les 4 autres pages de service du même gabarit. Header déjà factorisé (`sync-header.js`), mais **footer,
  formulaire, bandeau avis, FAQ, JSON-LD** sont recopiés. `includes/footer.html` n'est référencé par aucune
  page (le footer est injecté par `footer.js` → contenu absent du HTML statique, donc **liens de pied de page
  invisibles pour un robot sans JS**).
  → Étendre le build maison (déjà là pour le blog) : partials `header/footer/form` + gabarit de page de
  service alimenté par un JSON par page. C'est **le** chantier structurant : il divise par 5 le coût de toute
  modification et supprime les incohérences de copie.
- **`styles.css` monolithique (69 Ko, 58 `!important`)** + `zone.css` 26 Ko (20 `!important`) chargé sur
  toutes les pages qui en ont besoin ou non. Découper (base / composants / pages) et supprimer les
  `!important` en réglant la spécificité.
- **Bundling/minification déléguée à `[build.processing]` Netlify** (option en fin de vie). À remplacer par
  une étape de build explicite (esbuild/lightningcss) — d'autant que `?v=20260929` est posé à la main partout.
- **Résidus** : `fetch_geojson.py`, `data/config.json` (plus lu), `scss/zone-map.scss`, dossier
  `docs/ux-ui-responsive-audit.md` à archiver ; `package.json` s'appelle `vprr-seo`.
- **Tests** : 13 verts, mais uniquement la carte et la fonction contact. Aucun test sur le build du blog, ni
  sur les invariants SEO/liens. Le script de vérification des liens de cette session
  (`links.js`) mérite d'être versionné dans `tests/`.

## 3. Design system

Palette brune/or cohérente et reconnaissable ; le site « fait artisan haut de gamme ». Mais les tokens existent
sans être appliqués :

| Mesure | Résultat | Lecture |
|---|---|---|
| Couleurs | **51 hex distincts** en dur dans les CSS (117 occurrences) alors que 46 variables existent | Dérives : `#8b5a2b`, `#8b4513`, `#673a12`, `#5a3210`, `#522e0e`, `#5a2f0f` sont 6 bruns proches pour 2 tokens |
| Rayons | `12px` en dur ×44 vs `var(--radius)` ×18 ; aussi 14px ×7, 16px ×18, 999px ×7 | Valeurs équivalentes à des tokens non utilisées |
| Tailles de police | **50 valeurs distinctes** (0.6875 → 4.75rem), aucun token typographique | Pas d'échelle : chaque composant invente sa taille |
| Ombres | **60 `box-shadow` distincts** pour 5 tokens | Idem |
| Boutons | `.btn-primary/secondary/outline/link`, `.hero-btn-primary/ghost`, `.reviews-btn`, `.cta-*`, `.filter-btn`, `.faq-filter-btn`… | ≥ 5 familles de boutons parallèles |
| Breakpoints | 768, 480, 640, 1024, 991, 992, 860, 769, 380, 1200, 1400… (**≥ 12 valeurs**) | 991/992 et 768/769 = doublons ; pas de grille de réf. |
| z-index | 1 → 9999 sans échelle | Risque de superpositions (menu, bannière cookies, popups) |

**Recommandation** : ne pas refaire le design — **tokeniser** : échelle typo (6-7 tailles), 3 ombres, 4 rayons,
3-4 breakpoints, 1 composant bouton à variantes, échelle z-index. Se fait par remplacement mécanique et se
vérifie par diff visuel (méthode « aucun changement visuel » de `code-quality-refactor.md`).

## 4. Parcours & densité des pages

- **Page de service mobile : 23 787 px de haut, 47 titres.** Accueil desktop : 9 900 px, section « Services »
  seule = 1 916 px pour 5 cartes. Un artisan local convertit par le téléphone : le visiteur mobile doit scroller
  ~30 écrans pour atteindre le formulaire.
- **Pas de CTA téléphone collant sur mobile** (mesuré : aucun lien `tel:` fixe/sticky). C'est le levier de
  conversion le plus rentable de tout l'audit : barre fixe « Appeler · Devis » en bas d'écran mobile.
- **Doublon de contenu** : le bloc « Votre avis nous aide beaucoup ! » apparaît 2× sur l'accueil (avis +
  contact). Garder un seul.
- **Un seul formulaire, recopié dans 6 pages** avec les mêmes champs — cohérent, mais à factoriser (§2).
- **Accessibilité restante (mesurée sur une page de service, mobile)** : 9 cibles tactiles < 40 px, 8 textes
  < 13 px, 4 images sans `width/height`, 3 images en `loading="lazy"` à vérifier qu'aucune n'est au-dessus du pli.
- **Points design déjà listés et toujours ouverts** (voir [design-audit-2026-09-21](./design-audit-2026-09-21.md)) :
  liste du blog en colonne unique, emojis dans les filtres du blog, écart de traitement hero accueil/service,
  style des champs du formulaire.

## 5. Plan proposé (par rapport coût/valeur)

| # | Action | Effort | Valeur |
|---|---|---|---|
| 1 | Barre d'appel collante mobile + supprimer le doublon d'avis | 0,5 j | ⭐⭐⭐ conversion |
| 2 | `.gitignore` + retirer `node_modules` de git + supprimer scss/py/config orphelins | 0,2 j | ⭐⭐ hygiène |
| 3 | Convention d'URL (propres sans `.html`) + 301 blog + `/favicon.ico` | 0,5 j | ⭐⭐ SEO/propreté |
| 4 | Fusionner les 3 CSS / 2 JS du blog dans `assets/` | 0,5 j | ⭐⭐ |
| 5 | Build `dist/` (liste blanche) — remplace les 35 règles 404 | 0,5 j | ⭐⭐ sécurité |
| 6 | Tokeniser couleurs/rayons/typo/ombres/breakpoints, un composant bouton | 2 j | ⭐⭐ maintenabilité |
| 7 | Partials + gabarit de page de service (footer, form, avis, FAQ, JSON-LD) | 2–3 j | ⭐⭐⭐ maintenabilité |
| 8 | Condenser accueil/pages de service (accordéons, sections fusionnées) — décision design client | 1–2 j | ⭐⭐⭐ conversion |
| 9 | Tests d'invariants (liens, titres ≤ 60, canonical, H1 unique, build blog) | 0,5 j | ⭐ |

Ordre conseillé : **1 → 5** (rapide, peu risqué), puis **6-7** (le gros chantier, à faire avant d'ajouter de
nouvelles pages/villes SEO, sinon chaque page en plus multiplie la dette), **8** après validation client.

## Suivi d'exécution (2026-09-29, local — non déployé)

| # | Fait |
|---|---|
| 1 | Barre collante mobile « Appeler / Devis gratuit » (`includes/footer.html` + `styles.css`) ; doublon d'avis de l'accueil supprimé. |
| 2 | `.gitignore`, `node_modules` retiré de git, `assets/scss/zone-map.scss` supprimé. |
| 3 | Redirection `/favicon.ico` ; `/blog/<slug>` → `.html` en 301 (généré dans `dist/_redirects`). Convention d'URL conservée (`.html`) : passer aux URLs propres reste une décision SEO à part. |
| 4 | CSS/JS du blog déplacés dans `assets/` (`blog-list.css`, `blog-article.css`, `blog-list.js`) ; les chemins en `../assets/` fonctionnent aussi sur `/blog` sans slash final. Simple déplacement, pas de fusion du contenu des feuilles. |
| 5 | `scripts/build-site.js` → `dist/` (liste blanche), `netlify.toml` : `publish = "dist"`, ~35 règles 404 supprimées, footer inclus statiquement dans 18 pages (visible sans JS, plus de décalage au chargement). Gabarit d'article déplacé dans `scripts/`. |
| 6 | Tokenisation : 92 valeurs en dur remplacées par leur variable (couleurs de la palette, rayons 8/12/16/24 px) — `scripts/tokenize-css.js`. Vérifié : styles calculés identiques (couleurs, rayons, ombres, tailles) sur 7 pages comparées à la version en ligne. **Non fait** : échelle typographique, ombres, breakpoints, z-index, composant bouton unique (changeraient le rendu, à faire avec validation visuelle). |
| 9 | `tests/site-invariants.test.js` (4 tests) : 17/17 tests verts. |
| 7 | **Partiel** : footer factorisé au build. Restent formulaire/avis/FAQ/JSON-LD et gabarit de page de service. |
| 8 | **Non fait** : décision design client (condenser accueil / pages de service). |

⚠ À vérifier au 1er déploiement : que Netlify publie bien `dist/` (build command `npm run build`), que
`/blog/<slug>` redirige, et que `/favicon.ico` répond.

### Déploiement par étapes (2026-09-30) — tout est en production
Un commit et un push par étape, contrôle de la prod (routes, en-têtes, rendu 375 / 768 / 1440 px) entre chaque :
`7caf6d6` hygiène du dépôt → `bdf7fb3` barre d'appel + doublon d'avis → `e66084d` CSS/JS du blog dans `assets/`
→ `7160215` publication via `dist/` → `3146d6d` correctif bannière cookies → `5aea9bb` tokenisation CSS.
Preuve « aucun changement visuel » : les 13 feuilles CSS, une fois les variables re-substituées par leur valeur,
sont identiques caractère pour caractère à celles d'avant (`git show HEAD:…`), donc identiques à toutes les tailles.

**Bug antérieur découvert et corrigé (`3146d6d`)** : la bannière cookies n'était jamais visible (`opacity: 0` en CSS,
la classe `cookie-banner-visible` n'était jamais ajoutée par `footer.js`) — les visiteurs ne pouvaient donc ni
accepter ni refuser, et Clarity/GTM ne se chargeaient jamais. De plus, un clic sur Accepter/Refuser remontait
jusqu'à l'écouteur global qui réaffichait la bannière. À surveiller : les statistiques Clarity/GTM vont maintenant
commencer à se remplir (uniquement pour les visiteurs qui acceptent).

### Étape 8 — densité mobile/tablette (2026-09-30, commit `4b4bb0a`, en production)
Bloc « DENSITÉ MOBILE / TABLETTE PORTRAIT (≤ 768px) » à la fin de `assets/css/responsive.css` : marges de sections
64 → 48 px (96 → 48 pour « Le problème »), en-têtes de section 64 → 32 px, cartes (problème, atouts, réassurance,
étapes) en grille « icône + titre sur une ligne, texte dessous » avec texte 15 px, FAQ/tarifs/zones/cartes de
services compactés. Contenu HTML inchangé (rien de retiré pour le SEO) ; bureau (> 768 px) strictement inchangé
(hauteurs identiques avant/après).

| Page (téléphone 375 px) | Avant | Après |
|---|---|---|
| Ravalement (la plus longue) | 23 851 px | 18 737 px (-21 %) |
| Isolation | — | 15 267 px |
| Accueil | 13 486 px | 13 051 px (-3 %) |

**Pistes non faites** (changent davantage le rendu, à valider avec le client) : repli « Voir plus » des 18 communes
et des blocs « Tarifs » / « Pourquoi investir » (accordéons), carrousel horizontal des avis/galerie sur l'accueil,
photo avant/après unique au lieu de deux (hero + réalisation), FAQ limitée aux 5 premières questions avec « Voir
toutes ».
