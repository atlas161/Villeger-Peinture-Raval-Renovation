# Tokens du design system — échelles de référence (2026-10-02)

Source de vérité : le bloc `:root` de [`assets/css/styles.css`](../../assets/css/styles.css). Ce document décrit les échelles et la règle
d'usage ; la page [`guide-direction-artistique.html`](./guide-direction-artistique.html) les montre avec les vraies feuilles de style.
Les règles sont **vérifiées par `npm test`** (`tests/design-tokens.test.js`) : une valeur hors échelle fait échouer les tests.

## Typographie — 13 pas (`font-size: var(--text-…)`)

| Token | rem | px | Usage type |
|---|---|---|---|
| `--text-2xs` | 0,75 | 12 | étiquettes, mentions |
| `--text-xs` | 0,8125 | 13 | méta, légendes |
| `--text-sm` | 0,875 | 14 | texte secondaire, boutons compacts |
| `--text-md` | 0,9375 | 15 | texte de carte |
| `--text-base` | 1 | 16 | texte courant |
| `--text-lg` | 1,0625 | 17 | chapôs |
| `--text-xl` | 1,125 | 18 | petits titres |
| `--text-2xl` | 1,25 | 20 | titres de carte |
| `--text-3xl` | 1,375 | 22 | |
| `--text-4xl` | 1,5 | 24 | sous-titres de section |
| `--text-5xl` | 1,75 | 28 | |
| `--text-6xl` | 2 | 32 | |
| `--text-7xl` | 2,5 | 40 | grands chiffres |

- Les titres de section fluides gardent `clamp(…)` (h1, h2 des sections). Les `em` relatifs au parent sont autorisés.
- Exceptions documentées : `html` (16 px), icônes décoratives ≥ 3 rem ou 72 px, texte dans les SVG (`.zs-*`, unités du viewBox), icônes Leaflet (`zone.css`, px).
- **Jamais** de taille sous 12 px (0,75 rem).

## Ombres — 4 niveaux (`box-shadow: var(--shadow-…)`)

`--shadow-sm` (repos des cartes, blur ≤ 10) · `--shadow-md` (survol léger, 11–20) · `--shadow-lg` (panneaux, menus, 21–40) · `--shadow-xl` (hero, modales, > 40).
Restent libres : anneaux de focus (`0 0 0 3px …`), `inset`, ombres colorées (halos), ombres multiples sur fond sombre.

## Couches — `z-index: var(--z-…)`

| Token | Valeur | Rôle |
|---|---|---|
| `--z-sticky` | 100 | barres collantes de page (filtres du blog) |
| `--z-dropdown` | 200 | listes déroulantes de formulaire |
| `--z-bar` | 900 | barre d'appel mobile |
| `--z-overlay` | 998 | voile derrière le menu mobile |
| `--z-header` / `--z-banner` | 1000 | en-tête / bannière cookies |
| `--z-menu` | 1050 | panneau du menu mobile |
| `--z-menu-controls` | 1100 | logo et burger (au-dessus du panneau) |
| `--z-submenu` | 1120 | sous-menus |
| `--z-skip` | 9999 | lien d'évitement |

Valeurs 0 à 10 (et 600 pour les calques Leaflet) = empilement **local** à un composant (calques du hero, curseur avant/après…) : autorisées telles quelles.

## Points de rupture (écrits en dur : les variables CSS ne marchent pas dans `@media`)

| Cible | « jusqu'à » (`max-width`) | « à partir de » (`min-width`) |
|---|---|---|
| petit mobile | 480 | 480 |
| mobile / tablette | **767** | **768** |
| ≥ 640 | 639 | 640 |
| menu burger / menu complet | 991 | 992 |
| tablette large | 1023 | 1024 |
| grands écrans | — | 1200 · 1400 |

Règle : un `max-width` et son `min-width` se suivent d'un pixel (767/768, 639/640, 991/992, 1023/1024) — jamais de zone où les deux s'appliquent.
Côté JavaScript : `(max-width: 767px)` (condensation mobile) et `(max-width: 991px)` / `(min-width: 992px)` (menu) ; garder ces valeurs alignées.

## Comment appliquer / vérifier
- `node scripts/tokenize-scale.js` (idempotent, `--dry-run` pour simuler) remplace les valeurs hors échelle par le token le plus proche.
- `npm test` — `design-tokens` échoue si une taille, une ombre neutre, un `z-index` ou un point de rupture sort de l'échelle.
- Méthode de contrôle visuel : captures avant/après à 375 / 768 / 1440 px des pages principales, comparaison pixel par pixel
  (voir `docs/design/direction-artistique.md` §F pour le bilan du 2026-10-02).

## Historique de la conversion (2026-10-02)
Avant : 38 tailles de police, 45 ombres, 14 points de rupture (767/768/769, 991/992…), 12 niveaux de `z-index` jusqu'à 9999.
Après : 13 tailles, 4 ombres (+ cas libres documentés), 11 points de rupture alignés par paires, 10 couches nommées.
