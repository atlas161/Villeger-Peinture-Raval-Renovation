# Journal des changements du site (changelog)

Historique **daté et par commit** de tout ce qui a été modifié sur vprr.fr, du plus récent au plus ancien.
Pour annuler une étape précise : `git revert <hash>` (chaque ligne = un commit indépendant, déployé et vérifié
sur vprr.fr avant de passer au suivant). Le détail des audits est dans les fichiers cités ; l'architecture actuelle
est décrite dans [`seo/architecture.md`](./seo/architecture.md).

## Photo de l'état actuel (2026-09-30)

| Mesure | Valeur |
|---|---|
| Lighthouse mobile (prod, 2026-09-29) | Perf **99** · Accessibilité **100** · Bonnes pratiques **100** · SEO **100** (avant : 61 / 95 / 77 / 100) |
| Poids de la page d'accueil (mobile) | ≈ 550 Ko (avant : 20 Mo) — pas de vidéo sur téléphone |
| Hauteur page ravalement, téléphone 375 px | **16 133 px** (avant : 23 851) · tablette 768 px : 12 957 (avant 17 659) · desktop : 13 934 (inchangé) |
| Hauteur accueil, téléphone | **12 176 px** (avant : 13 486) · desktop : 9 864 (inchangé) |
| Tests automatiques | 20 / 20 (`npm test`) |
| Dépendances npm | **0** |
| Pages de service | 5, générées depuis `content/pages/` |

## 2026-09-30 — Structure, cookies, mobile, ménage, suivi

Audit structure/routes/design system : [`audit-structure-design-2026-09-29.md`](./audit-structure-design-2026-09-29.md).

| Commit | Changement |
|---|---|
| `ef2c608` | **Suivi des conversions** (après consentement uniquement) : `phone_click`, `quote_cta_click` (avec emplacement), `generate_lead` sur `/merci` → GTM `dataLayer` + Clarity. Phrase ajoutée aux mentions légales. |
| `e7e1ac6` | **Ménage** : 112 règles CSS mortes, 3 `@keyframes`, 5 variables ; 3 variantes hero jamais servies + `hero-1200w`, ancienne image d'article, `favicon.svg` (346 Ko), `data/config.json`, `scripts/optimize-hero.js` ; dépendance `sharp` retirée ; `fetch_geojson.py` → `scripts/`. Hauteurs de pages identiques avant/après. |
| `20ceaf2` | **Mobile** : communes (8/18) et FAQ (5/9) avec « Voir plus », encadrés tarifs repliables (page ravalement), photos avant/après en double masquées, galerie de l'accueil en défilement horizontal. Nouveau `assets/js/mobile-condense.js`. Desktop inchangé. |
| `4b4bb0a` | **Densité mobile/tablette** : marges de sections resserrées, cartes « icône + titre sur une ligne, texte dessous » (`responsive.css`). Page ravalement −21 %. |
| `71cd337` | **Pages de service générées** : gabarit `scripts/templates/service-page.html` + composants + `content/pages/<slug>/page.json` (+ fragments HTML). JSON-LD généré. Rendu strictement identique. |
| `c18600e` | **Bannière cookies refaite** : compacte, centrée, « Tout refuser / Tout accepter », sans paramètres ; « Gérer mes cookies » réaffiche la bannière sur place (plus de rechargement/saut de page) ; `cookies.css` supprimé. |
| `3a28f95` | Formulaire de contact + section « Pourquoi nous choisir » factorisés en `includes/partials/` (intégrés depuis dans le gabarit de pages). |
| `384a24d` | Slider avant/après : `assets/js/before-after.js` partagé au lieu de 4 copies inline. |
| `4d53d62` | **Tests d'invariants** (`tests/site-invariants.test.js`) + documentation. |
| `5aea9bb` | **Tokenisation CSS** : 92 valeurs en dur → variables (couleurs, rayons). Preuve : CSS re-substitué identique caractère pour caractère à l'ancien. |
| `3146d6d` | **Correctif** : la bannière cookies n'était **jamais visible** (`opacity: 0`, classe `cookie-banner-visible` jamais posée) et un clic la réaffichait. Conséquence : les visiteurs ne pouvaient ni accepter ni refuser, donc GTM/Clarity ne se chargeaient (au mieux) que pour ceux ayant un ancien choix enregistré — les statistiques ne commencent réellement qu'à partir de cette date. |
| `7160215` | **Publication via `dist/`** (liste blanche) au lieu de la racine du dépôt ; ~35 règles 404 supprimées ; footer inclus dans le HTML ; `/blog/<slug>` → 301 ; `/favicon.ico`. |
| `e66084d` | CSS/JS du blog déplacés dans `assets/` (`blog-list.css`, `blog-article.css`, `blog-list.js`) ; gabarit d'article dans `scripts/`. |
| `bdf7fb3` | **Barre d'appel collante mobile** (« Appeler / Devis gratuit ») ; doublon « Votre avis nous aide beaucoup » retiré de l'accueil. |
| `7caf6d6` | Hygiène du dépôt : `.gitignore`, `node_modules` retiré de git, scss orphelin supprimé. |

## 2026-09-29 — Audit complet, performance, RGPD, sécurité

Détail : [`audit-complet-2026-09-29.md`](./audit-complet-2026-09-29.md) (sessions 1 à 6).

| Commit | Changement |
|---|---|
| `5b229c7` `28b2d7b` `e25eba3` `fc4f79c` | **CSP** : mode observation, puis appliquée après validation sur toutes les pages ; correctif d'un `srcset` d'image de blog. |
| `b48341f` | **Microsoft Clarity** + gestion des cookies (opt-in), « Gérer mes cookies ». |
| `750eb52` | **Captcha Cloudflare Turnstile** + fonction Netlify `/api/contact`. |
| `9967d67` | Purge des anciens caches `immutable` (`?v=` sur CSS/JS). |
| `8c4d681` | Audit : loader plein écran supprimé, contenu visible immédiatement, vidéo hero différée (desktop/tablette), polices/icônes/carte **auto-hébergées**, titres ≤ 60 car., NAP aligné (`llms.txt`/`humans.txt`), mentions légales complétées (SARL, TVA, décennale, sous-traitants), fichiers internes non servis, images de blog recompressées (13 → 2,4 Mo). Perf mobile 61 → 99. |

## 2026-09-21 — Audits design, UX/UI, responsive, qualité

Détail : [`design-audit-2026-09-21.md`](./design-audit-2026-09-21.md), [`ux-ui-responsive-audit.md`](./ux-ui-responsive-audit.md),
[`code-quality-refactor.md`](./code-quality-refactor.md).
`96c08c8` 8 bugs visuels corrigés · `031ebef` `e9d5739` `839756a` `e3c4be9` menu mobile (logo, sous-menu, clavier,
cibles tactiles 44 px) · `6e377a2` poids des images · `c600f64` `<fieldset>` du formulaire · `59c9859`
styles inline extraits des pages de service · audit des `!important`.

## 2026-09-18 — Chantier qualité de code (début)
Suppression de `config-loader.js` (il écrasait le contenu de l'accueil), header/nav centralisé
(`scripts/sync-header.js`), CSS des pages de service factorisé (`service-page.css`). Voir `code-quality-refactor.md`.

## 2026-09-16 — Audit SEO et premières corrections
Titres d'articles raccourcis (`seoTitle`), meta descriptions, page « Isolation intérieure », galerie avant/après.
Détail : [`seo/journal.md`](./seo/journal.md), décisions : [`seo/decisions.md`](./seo/decisions.md).
