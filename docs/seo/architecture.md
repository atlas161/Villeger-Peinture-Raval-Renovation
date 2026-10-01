# Architecture technique du site VPRR

Référence technique — **à lire avant de modifier quoi que ce soit** (contenu, CSS/JS, build, hébergement).
Dernière mise à jour complète : 2026-09-30. L'historique de ce qui a changé est dans
[`../changelog.md`](../changelog.md).

## 1. Vue d'ensemble

- Site vitrine **statique** : HTML/CSS/JS vanilla, **aucune dépendance npm** (ni framework, ni bundler).
- Hébergement **Netlify**, déployé depuis GitHub (`atlas161/Villeger-Peinture-Raval-Renovation`, branche
  `main`). Chaque push sur `main` redéploie le site (≈ 1 min).
- Netlify exécute `npm run build` puis publie le dossier **`dist/`** (`netlify.toml` : `publish = "dist"`).
- Formulaires : Cloudflare Turnstile (captcha) → fonction Netlify `/api/contact` → Netlify Forms.
- Mesure d'audience : Google Tag Manager + Microsoft Clarity, **uniquement après « Tout accepter »**.
- Contenu éditable via **Pages CMS** (`.pages.yml`, généré depuis `scripts/cms-config.js`) : blog, pages de service, tarifs, À propos, Réalisations, blocs communs — guide client : [`../cms.md`](../cms.md).

## 2. Chaîne de build

```
npm run build
 ├─ build:pages   scripts/build-pages.js   → régénère les 5 pages de service (racine) depuis content/pages/
 ├─ build:blog    scripts/build-blog.js    → régénère blog/*.html, blog/articles.json, blog/index.html, sitemap.xml
 └─ scripts/build-site.js                  → construit dist/ (liste blanche), inclut le footer, écrit _redirects
```

| Commande | Rôle |
|---|---|
| `npm run build` | Build complet (celui de Netlify) |
| `npm run build:pages` / `build:blog` | Une seule étape |
| `npm run sync:header` | Réinjecte le menu dans les pages **écrites à la main** (accueil, zone, FAQ, mentions, merci) |
| `npm run dev` | `npx serve .` : sert la racine (le footer est alors chargé par `footer.js` en JS) |
| `npm test` | Tests Node (`node --test`, dossier `tests/`) — 20 tests |
| `node scripts/tokenize-css.js` | Remplace les valeurs CSS en dur identiques à un token de `:root` par la variable |

**`dist/` (jamais versionné)** : `build-site.js` copie uniquement les dossiers `assets`, `media`, `includes`
(hors `partials/`), `blog`, `data`, `.well-known` et les fichiers racine `*.html`, `robots.txt`,
`sitemap.xml`, `llms.txt`, `humans.txt`. Tout le reste (docs, scripts, tests, `content/`, `netlify/`,
`CLAUDE.md`…) n'est **jamais public**. Il n'y a plus de liste noire de 404 dans `netlify.toml` : c'est une liste
blanche. Pour publier un nouveau dossier/fichier : l'ajouter à `PUBLIC_DIRS` / `PUBLIC_ROOT_FILES`.
Le script inclut aussi `includes/footer.html` dans le HTML de chaque page qui charge `footer.js` (footer visible
sans JavaScript, pas de décalage de mise en page) et génère `dist/_redirects` (`/blog/<slug>` → `.html`, 301).

⚠ Sous Windows, `npm run build` échoue avec `EPERM` si un `npx serve dist` tourne encore (il verrouille le
dossier) : arrêter le serveur avant de reconstruire.

## 3. Arborescence

```
/                         pages à la racine : index, 5 pages de service (générées), zone, faq, mentions, merci, 404
assets/css/               styles (voir §6)            assets/js/   scripts (voir §7)
assets/fonts, vendor/     Inter, Font Awesome 6.5.1, Leaflet 1.9.4 — auto-hébergés, chemins versionnés
assets/img/blog/          images des articles (+ déclinaisons -400w/-600w/-800w/-1200w)
media/                    logo d'origine (VPRR-LOGO.svg : en-tête, JSON-LD, impression ; le nouveau logo B2 est prêt mais non déployé, voir `docs/design/logo-b2.md`), favicons, photos avant/après des services (déclinaisons -600w/-900w/-1200w)
data/                     hero.webp, hero-poster-*.webp, charente.geojson (carte)
blog/                     HTML GÉNÉRÉ des articles + index.html + articles.json (ne pas éditer à la main)
content/blog/*.md         source des articles          content/pages/<slug>/   source des pages de service
includes/footer.html      pied de page + bannière cookies    includes/partials/  blocs communs (formulaire, « pourquoi nous »)
scripts/                  build-*.js, sync-header.js, tokenize-css.js, fetch_geojson.py (one-shot), lib/, templates/
netlify/functions/        contact.js (vérification Turnstile → Netlify Forms)
tests/                    contact-function, zone-map, site-invariants, pages
docs/                     toute la documentation (index : docs/README.md)
```

## 4. Pages : qui est généré, qui est écrit à la main

| Page(s) | Source de vérité | Comment modifier |
|---|---|---|
| `index.html`, `zone-desservie-charente.html`, `faq-renovation-angouleme.html`, `mentions-legales.html`, `merci.html`, `404.html` | le fichier HTML lui-même | éditer le HTML ; le menu vient de `sync:header` (sauf `404.html`, exclu volontairement) |
| 5 pages de service | `content/pages/<slug>/page.json` + fragments | voir §4.2 — **ne jamais éditer le `.html` racine** |
| `blog/*.html`, `blog/index.html`, `blog/articles.json`, `sitemap.xml` | `content/blog/*.md` | voir §4.3 |
| `dist/` | build | jamais |

### 4.1 Menu : `scripts/sync-header.js`
Un seul gabarit de menu (`generateHeader`). `npm run sync:header` le réinjecte dans les pages écrites à la main ;
`build-pages.js` l'appelle directement pour les pages de service. Variations volontaires : l'accueil utilise des
ancres nues (`#services`), les autres pages préfixent `index.html#…` ; zone et FAQ s'auto-lient avec
`aria-current="page"` ; le CTA dit « Obtenez un devis » (pages avec formulaire) ou « Obtenir un devis » (sans).
`404.html` a une nav simplifiée à 3 liens (choix délibéré).

### 4.2 Pages de service générées : `scripts/build-pages.js`
Pages : `ravalement-facade-angouleme`, `nettoyage-facade-angouleme`, `nettoyage-toiture-angouleme`,
`peinture-exterieure-charente`, `isolation-interieure-charente`.

| Élément | Où |
|---|---|
| Gabarit commun (head, en-tête, scripts, pied de page) | `scripts/templates/service-page.html` |
| Composants (hero, réalisation, problème, solution, pourquoi nous, zone, autres services, tarifs, FAQ, liens associés) | `scripts/lib/service-sections.js` |
| Assemblage du modèle de page depuis les fichiers de contenu | `scripts/lib/content-loader.js` |
| Photos (variantes WebP existantes **ou** Netlify Image CDN pour les photos importées) | `scripts/lib/media.js` |
| Textes et photos de la page — **édités dans Pages CMS** | `content/pages/<slug>/page.json` |
| Données techniques (URL, JSON-LD, style propre à la page) — hors CMS | `content/pages/<slug>/meta.json` |
| Blocs communs : services, communes desservies, « pourquoi nous choisir » | `content/shared/*.json` |
| Prix au m² de chaque prestation (une seule saisie) | `content/tarifs.json` |
| Bande « devis » commune | `includes/partials/contact-cta.html` |

- **Modifier un texte / une photo / un prix** : dans Pages CMS (voir [`../cms.md`](../cms.md)) ou en éditant le JSON, puis
  `npm run build:pages`. `npm test` échoue si une page n'est pas à jour. Convention : un champ `*Html` contient du HTML
  (éditeur riche), tous les autres sont du texte brut échappé à l'affichage.
- **Photos** : le client importe n'importe quelle photo dans `media/uploads/` (Pages CMS). Les photos `xxx-900w.webp`
  historiques gardent leur `srcset` ; les autres passent par `/.netlify/images?url=…&w=…&fm=webp` (pas de redimensionnement
  à la main, pas de dépendance). En local (`npm run dev`) ces photos ne s'affichent pas : seul Netlify les sert.
- **Ajouter une page (service ou ville)** : copier un dossier de `content/pages/`, adapter `page.json` et `meta.json`
  (`file`, `prestation`, `ld`…), ajouter le service dans `content/shared/services.json` et `content/tarifs.json`, déclarer
  la page dans `scripts/cms-config.js` (automatique pour les services de `services.json`), `npm run build:cms`,
  `npm run build:pages`, puis l'ajouter au **sitemap**, au **menu** (`sync-header.js`) et aux liens internes utiles.
- Ordre des sections (fixe, dans `content-loader.js`) : hero, réalisation (si présente), problème, solution, encadré ITE
  (isolation), pourquoi nous choisir, zone, autres services, tarifs, FAQ, bande de contact.
- Le JSON-LD (entreprise, service, fil d'Ariane, FAQ) est **généré** : `meta.json` (`ld`) + la FAQ affichée. La partie
  « entreprise » commune est dans `build-pages.js` (adresse, horaires, `sameAs`…).
- Attributs `data-m-limit` / `data-m-collapse` : voir §8 (condensation mobile).

### 4.3 Blog : `scripts/build-blog.js`
Articles en Markdown + frontmatter dans `content/blog/*.md` → `blog/<slug>.html` (gabarit
`scripts/template-article.html`), `blog/articles.json`, `blog/index.html` pré-rendu et entrées du `sitemap.xml`.
- **Après toute modification d'un `.md` ou du gabarit : `npm run build:blog`.** Ne jamais éditer `blog/*.html`.
- Champs SEO optionnels du frontmatter : `seoTitle` (balise `<title>`, `og:title`, JSON-LD, fil d'Ariane ; retombe
  sur `title`) et `metaDescription` (meta description, `og:description` ; retombe sur `description`). Le `title`
  reste le H1 affiché. Règle : `<title>` ≤ 60 caractères (le suffixe « | VPRR » est ajouté par le build).
- Images d'article : ne pas utiliser d'espaces ni de parenthèses dans les noms (casse le `srcset`).
- Routes : `/blog/<slug>` redirige en 301 vers `/blog/<slug>.html` (généré dans `dist/_redirects` à chaque build).

## 5. Routes, redirections, en-têtes (`netlify.toml`)
- `www.vprr.fr/*` → `vprr.fr` (301) ; `/page` → `/page.html` (301, pages racine listées explicitement) ; `/blog` et
  `/blog/` servent `blog/index.html` ; `/favicon.ico` → `/media/favicon/favicon.ico` ; `/api/*` → fonctions Netlify ;
  toute autre URL → `404.html` (statut 404).
- Convention d'URL : **avec `.html`** (canonicals, sitemap, liens internes). Passer aux URLs propres reste une
  décision SEO à part (impacterait canonicals, sitemap, redirections).
- Sécurité : HTTPS + HSTS preload, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, COOP,
  et une **CSP appliquée** (`Content-Security-Policy` dans `netlify.toml`). **Ajouter un outil tiers (pixel, widget,
  vidéo…) = ajouter son domaine dans la CSP**, sinon il est bloqué. `script-src` garde `'unsafe-inline'`
  (scripts inline de l'accueil) : le durcir demande de les externaliser.
- Cache : HTML `no-cache` ; CSS/JS `max-age=0, must-revalidate` (noms **non versionnés** : ne jamais remettre
  `immutable`) ; images/médias/data 30 jours ; `assets/vendor/*` et polices `immutable` (chemins versionnés :
  mettre à jour une lib = nouveau dossier, pas d'écrasement).
- La CSP interdit aussi les `<iframe>` internes (`frame-src` sans `'self'`) : les outils de test qui chargent des
  pages du site en iframe sur la prod ne fonctionnent pas (normal).

## 6. CSS
Fichiers (`assets/css/`) : `styles.css` (base, composants, accueil), `nav.css`, `utilities.css`, `responsive.css`
(points de rupture + **bloc de densité mobile**), `service-page.css` (pages de service), `contact.css`, `faq.css`,
`hero.css`, `zone.css`, `blog.css`, `blog-list.css`, `blog-article.css`. Ordre de chargement important :
`responsive.css` après `service-page.css` pour gagner la cascade sans `!important`.
- **Tokens** dans `:root` de `styles.css` : `--color-*`, `--brand-accent`, `--space-*`, `--radius*`, `--shadow-*`,
  `--font-*`, `--duration-*`. Utiliser les variables plutôt que des valeurs en dur ; `tokenize-css.js` remplace
  automatiquement les valeurs identiques. **Pas encore tokenisés** (dette connue) : échelle typographique (≈ 50
  tailles), ombres (≈ 60), breakpoints (≈ 12 valeurs dont 991/992 et 768/769), z-index, composant bouton unique.
- Variations propres à une page : petit `<style>` en fin de `<head>` (champ `head.extraStyle` du `page.json`).
- Le `?v=20260929` des `<link>`/`<script>` n'est plus à changer à chaque modif (les fichiers sont revalidés) ; il
  ne sert qu'à avoir purgé les anciens caches `immutable`.
- Nettoyage : le CSS mort a été supprimé le 2026-09-30 (voir changelog). Méthode réutilisable : un sélecteur est
  mort si l'une de ses classes n'apparaît dans **aucun** fichier HTML/JS/JSON du dépôt (attention aux classes
  créées par Leaflet, préfixe `leaflet-`, et à celles construites dynamiquement en JS).

## 7. JavaScript (`assets/js/`)
| Fichier | Rôle |
|---|---|
| `main.js` | menu burger/sous-menus, scroll-spy, animations d'apparition, vidéo du hero (tous écrans depuis le 2026-09-30, hors économiseur de données) |
| `footer.js` | inclusion du footer (fallback local), **bannière cookies**, chargement GTM/Clarity après consentement, **suivi des conversions** |
| `form-security.js` | honeypot, délai minimal, limites de soumission, chargement paresseux de Turnstile |
| `apple-select.js` | menu déroulant « Type de projet » (ARIA listbox) |
| `before-after.js` | slider avant/après des pages de service (partagé) |
| `mobile-condense.js` | repli mobile (listes limitées, encadrés repliables) — §8 |
| `zone-map-leaflet.js` | carte statique de la zone (Leaflet auto-hébergé, tuiles OpenStreetMap) |
| `blog-home.js`, `blog-list.js`, `blog-article.js` | carrousel/accueil du blog, liste paginée, actions d'article |
| `performance.js` | chargements différés et préchargements divers |

## 8. Condensation mobile (≤ 768 px)
Objectif : des pages moins longues sur téléphone **sans retirer de contenu du HTML** (indexation intacte, tout
visible sans JS et sur ordinateur).
- `responsive.css`, blocs « DENSITÉ MOBILE » et « CONDENSATION MOBILE PILOTÉE PAR JS » : marges resserrées, cartes
  en grille « icône + titre / texte dessous », photos avant/après en double de « Réalisation » masquées, galerie de
  l'accueil en défilement horizontal (≤ 639 px).
- `mobile-condense.js` : `[data-m-limit="N"]` (liste dont seuls les N premiers éléments sont visibles + bouton
  « Voir plus », libellé dans `data-m-more`) — utilisé pour les communes (8) et la FAQ (5) ; `[data-m-collapse]`
  (encadré replié derrière son premier `<h3>`) — utilisé pour « Prix au m² » et « Pourquoi investir » (page
  ravalement).
- Rien n'est replié au-dessus de 768 px ; les hauteurs desktop n'ont pas changé.

## 9. Cookies, consentement, mesure
- Bannière (`includes/footer.html` + `footer.js` + bloc « COOKIE BANNER » de `styles.css`) : choix **binaire**
  « Tout refuser » / « Tout accepter », mémorisé dans `localStorage['cookie-consent']` (`accepted` | `rejected`).
  Pas de paramètres. Affichée 1 s après l'arrivée (ou au premier scroll/touche). Sur mobile elle se place au-dessus
  de la barre d'appel.
- « Gérer mes cookies » (pied de page, mentions légales) : attribut `data-open-cookie-settings` → réaffiche la
  bannière **sur place** (sans recharger). Refuser après avoir accepté retire le consentement à Clarity/GTM.
- GTM (`GTM-NKPGDBPG`) et Clarity (`ypwg9bye24`) ne se chargent qu'après « Tout accepter ».
- **Suivi des conversions** (`trackConversions()` dans `footer.js`), actif seulement si le consentement est
  `accepted` au moment du clic : `phone_click` (lien `tel:`), `quote_cta_click` (lien vers `contact.html`),
  `generate_lead` (page `/merci`), avec `placement` (`barre_mobile`, `menu`, `hero`, `pied_de_page`, `contact`,
  `page`). Envoyés dans `dataLayer` (GTM) et via `clarity('event', …)`. Pour les exploiter dans Google Analytics
  il faut créer les déclencheurs correspondants dans le conteneur GTM (voir `blockers.md`).
- Tiers encore chargés **avant** consentement : Vimeo (hero, desktop), Elfsight/Instagram (au scroll), tuiles
  OpenStreetMap (carte). Ils sont cités dans les mentions légales.

## 10. Formulaire de contact — une seule page : `contact.html`
Depuis le 2026-10-01 le formulaire vit **uniquement** sur `contact.html` (nom Netlify `contact`, celui de l'ancien formulaire
de l'accueil : les notifications configurées dans Netlify restent valables). L'accueil et les 5 pages de service n'ont plus qu'une
**bande d'appel** (`#contact.contact-cta-section`, partial `includes/partials/contact-cta.html`) ; tous les boutons « devis »
(header, hero, tarifs, barre mobile, footer, blog) pointent vers `contact.html`, et ceux des pages de service vers
`contact.html?service=<ravalement|nettoyage-facade|toiture|peinture|isolation>` (remplacement de `#contact` fait par
`build-pages.js`). `assets/js/contact-page.js` pré-sélectionne le service (liste blanche, sans clic), renseigne le champ caché
`service` et `source` (page d'origine). Champs : nom, téléphone, e-mail, type de projet (`apple-select`, 7 options), message +
honeypot `bot-field` + horodatage + widget Turnstile. Envoi : `POST /api/contact` → `netlify/functions/contact.js`
vérifie le jeton (variable Netlify `TURNSTILE_SECRET`, jamais dans le dépôt ; sans elle la vérification est
ignorée avec un avertissement) puis transmet à Netlify Forms (`POST /`) → redirection vers `/merci.html`.
Les anciens formulaires par page (`contact-ravalement-facade`…) n'existent plus ; leurs anciennes demandes restent consultables dans Netlify.
Tests : `tests/contact-function.test.js`, `tests/contact-page.test.js`.

## 10 ter. Pages de contenu et blog
- `a-propos.html`, `realisations.html` : pages écrites à la main (menu injecté par `sync-header.js`), styles `assets/css/content-pages.css`, filtre `assets/js/realisations.js`.
- Blog : la liste (`blog/index.html`) est pré-rendue par `build-blog.js` (cartes + classe `has-featured`) puis ré-affichée par `blog-list.js` (filtres) ; les articles reçoivent un bloc « À lire aussi » (`renderRelatedArticles`) via le gabarit `scripts/template-article.html`.
- FAQ : recherche + filtres dans `main.js` (`initFaqPageControls`). Mentions légales : classe `.legal-doc` (`styles.css`).

## 10 bis. Zone d'intervention
- **Accueil** : schéma SVG en ligne (contour de `data/charente.geojson`, rayon ≈ 50 km, communes) généré par
  `node scripts/build-zone-schema.js --inject` (entre `<!-- zone-schema:start/end -->`) — aucun service tiers, plus de Leaflet.
- **Page zone** : recherche de commune (`assets/js/zone-page.js`, insensible aux accents), communes par secteur
  (`.zone-sector` / `.zone-chips`), carte interactive Leaflet/OpenStreetMap **chargée seulement au clic** (`data-zone-lazy="1"`
  dans `zone-map-leaflet.js`) → aucune tuile OSM avant l'action du visiteur.

## 11. Tests (`npm test`)
`contact-function` (7), `contact-page` (6), `zone-map` (6), `site-invariants` (4 : H1 unique/canonical/`<title>` ≤ 60, liens et ancres
internes, URLs du sitemap, contenu de `dist/`), `pages` (2 : pages de service à jour et données valides), `docs` (1 : aucun lien cassé dans `CLAUDE.md` et `docs/`).

## 12. Recettes rapides
| Je veux… | Je fais… |
|---|---|
| Changer le texte/FAQ/photos d'une page de service | Pages CMS (ou `content/pages/<slug>/page.json`) → `npm run build:pages` |
| Changer un prix au m² | Pages CMS « Tarifs » (ou `content/tarifs.json`) + la question « prix » de la FAQ (un test signale l'écart) |
| Ajouter un chantier avant/après | Pages CMS « Réalisations » (ou `content/realisations.json`) → `npm run build:content` |
| Modifier la configuration de Pages CMS | `scripts/cms-config.js` → `npm run build:cms` (ne jamais éditer `.pages.yml`) |
| Ajouter un article | créer/éditer `content/blog/*.md` (ou via Pages CMS) → `npm run build:blog` |
| Changer un lien du menu | éditer `scripts/sync-header.js` → `npm run sync:header` + `npm run build:pages` |
| Changer le téléphone/adresse | pied de page : `includes/footer.html` ; JSON-LD : `scripts/build-pages.js` (`BUSINESS`) et JSON-LD de `index.html` ; `llms.txt`, `humans.txt` |
| Ajouter un service tiers (widget…) | ajouter le domaine dans la CSP (`netlify.toml`), citer le service dans les mentions légales |
| Vérifier « aucun changement visuel » | voir `docs/README.md` §« Vérifier une modification » |
