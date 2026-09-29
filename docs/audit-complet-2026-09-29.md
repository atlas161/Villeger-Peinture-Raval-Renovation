# Audit complet du site vprr.fr — 2026-09-29

Périmètre : design, responsive (mobile 375 / tablette 768 / desktop 1440), back-end/infra, sécurité,
RGPD, performance, SEO. Méthode : lecture du code, requêtes HTTP réelles sur la prod, Lighthouse mobile
(prod), tests DOM dans le navigateur intégré. **Aucune modification du site n'a été faite** — ce document
est un état des lieux + un plan. Les points déjà traités par les audits précédents
([design 09-21](./design-audit-2026-09-21.md), [UX/responsive](./ux-ui-responsive-audit.md),
[SEO](./seo/README.md)) ne sont pas re-signalés.

## Verdict global

**Site sain sur le fond, avec 3 vrais problèmes à traiter en priorité.** Le site est propre, cohérent,
sans bug de mise en page, avec un SEO on-page solide (Lighthouse SEO 100/100, accessibilité 95/100). Mais :

1. **Performance mobile mauvaise** (Lighthouse 61/100, LCP 9,4 s, page de **20 Mo**) à cause de la vidéo
   Vimeo du hero, qui bloque en plus l'affichage de toute la page.
2. **Conformité RGPD fragile** : Vimeo, Google Fonts, Elfsight, cdnjs, unpkg et OpenStreetMap se chargent
   **avant tout consentement** (Lighthouse relève 2 cookies tiers) et ne sont pas cités dans les mentions légales.
3. **Fichiers internes servis publiquement** (`CLAUDE.md`, `docs/`, `package.json`, `content/*.md`,
   `template-article.html`) parce que Netlify publie la racine du dépôt (`publish = "."`).

## Scores mesurés (prod, Lighthouse mobile, 2026-09-29)

| Catégorie | Score | Commentaire |
|---|---|---|
| Performance | **61** | FCP 4,4 s · LCP 9,4 s · Speed Index 6,3 s · TBT 0 ms · CLS 0,003 |
| Accessibilité | 95 | contrastes insuffisants (cartes avis) + ordre des titres (un H4 sans H3) |
| Bonnes pratiques | 77 | cookies tiers (Vimeo) + issues DevTools |
| SEO | **100** | |

## ✅ Ce qui va bien

- **Responsive** : aucun débordement horizontal de page sur 7 pages testées en 375 / 768 / 1440 px (les
  débordements détectés sont des carrousels et la carte Leaflet, volontairement rognés). Menu burger OK
  jusqu'en 768 px, hero lisible partout, cibles tactiles correctes.
- **SEO on-page** : 1 seul H1 par page, canonicals partout, robots noindex correct sur 404/merci, JSON-LD
  riche (WebSite, HomeAndConstructionBusiness, FAQPage, Service…), Open Graph/Twitter complets, toutes les
  images ont un `alt`, sitemap + robots.txt + llms.txt présents, redirection www → non-www et `.html` forcées.
- **Sécurité de base** : HTTPS + HSTS preload, `nosniff`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy`, SRI sur Font Awesome et Leaflet, `rel="noopener noreferrer"` sur les liens externes,
  `.git`/`netlify.toml` non exposés, `security.txt` présent.
- **Formulaire** : Netlify Forms + honeypot + délai minimal + limite de soumissions ; pas de backend maison
  donc pas de surface d'attaque serveur.
- **Bannière cookies** : GTM chargé seulement après consentement, refus aussi simple que l'acceptation.
- **Architecture** : site statique sans dépendance runtime, blog généré proprement, 6 tests unitaires verts.

---

## 🔴 Priorité 1 — À corriger en premier

### P1-1. Hero vidéo Vimeo : 19 Mo, LCP 9,4 s, page masquée derrière un loader
- **Constat** : l'iframe Vimeo en autoplay télécharge ~19 Mo sur mobile (sur 20,4 Mo de page). Le
  `#page-loader` + `html.vprr-loading` (`styles.css:2617`) met `#main-content` et le header en
  `opacity: 0` **jusqu'à ce que la vidéo joue** (`main.js:28-80`, filet de sécurité à 2,5 s). Lighthouse
  mesure comme LCP le *logo du loader* : le vrai contenu est invisible tant que la vidéo n'a pas démarré.
  Conséquence : mauvais Core Vitals (signal de classement Google) et risque d'écran vide si le JS échoue.
- **Correctif** : afficher le contenu immédiatement avec l'image `data/hero.webp` en fond ; ne charger la
  vidéo qu'après le premier rendu (ou en desktop uniquement, ou derrière un clic « lecture »). Supprimer le
  loader plein écran ou le limiter à ~300 ms. Ajouter `fetchpriority="high"` sur le preload de l'image hero.
- **Objectif chiffré** : LCP < 2,5 s, page < 2 Mo, score perf ≥ 90.

### P1-2. Ressources tierces chargées avant consentement (RGPD/CNIL)
- **Constat** : sans rien accepter, le navigateur contacte Vimeo (cookies tiers), Google Fonts,
  cdnjs, unpkg, OpenStreetMap ; Elfsight (galerie Instagram) est chargé au scroll. Seul GTM est bloqué
  correctement. Les mentions légales ne citent que GTM.
- **Correctif** : (a) héberger soi-même Inter (le dossier `assets/fonts/` existe déjà) et Font Awesome
  (ou passer à des SVG inline — voir P3), Leaflet ; (b) mettre Vimeo, Elfsight et les tuiles OSM derrière
  un consentement (« Cliquer pour charger la carte/galerie ») ; (c) compléter la section cookies/RGPD des
  mentions légales avec tous les sous-traitants réels.

### P1-3. Fichiers internes publiés sur vprr.fr
- **Constat** (HTTP 200 vérifié) : `/CLAUDE.md`, `/package.json`, `/docs/seo/*.md` (journal, blocages,
  audit Google Business…), `/content/blog/*.md`, `/blog/template-article.html`, `/data/config.json`. Le
  `Disallow: /*.md$` du robots.txt n'empêche pas l'accès, et signale même ces fichiers.
- **Risque** : fuite d'informations internes (stratégie SEO, accès, outils), et **`template-article.html`
  est indexable** (canonical `…/{{SLUG}}.html`, title `{{SEO_TITLE}}`) → contenu dupliqué/parasite dans Google.
- **Correctif** : au build, copier uniquement les fichiers publics dans un dossier `dist/`
  (`publish = "dist"`), ou à défaut ajouter des redirections `status = 404, force = true` pour ces chemins.
  Déplacer `template-article.html` hors de `blog/`.

### P1-4. Cache « immutable 1 an » sur des CSS/JS sans empreinte
- **Constat** : `/assets/css/*` et `/assets/js/*` sont servis `max-age=31536000, immutable`, mais les pages
  y font référence sans version (`styles.css`, pas `styles.css?v=…`). Un visiteur récurrent **ne reverra pas
  les correctifs CSS/JS pendant un an** — y compris les 8 corrections du 21/09.
- **Correctif** : soit ajouter un hash de contenu au nom/URL des fichiers au build (recommandé), soit
  ramener le cache CSS/JS à `max-age=3600, must-revalidate` en attendant. Les images peuvent rester en
  immutable si leur nom change quand elles changent.

---

## 🟠 Priorité 2 — Important

### Sécurité
- **Pas de Content-Security-Policy.** Ajouter une CSP en mode *report-only* d'abord (sources : soi-même,
  Vimeo, Elfsight, GTM, OSM…), puis l'appliquer. Les 8 scripts inline de `index.html` imposeront des nonces
  ou un déplacement vers des fichiers `.js`.
- `X-XSS-Protection` est obsolète (ignoré/nuisible sur anciens navigateurs) → le retirer ou mettre `0`.
- Ajouter `Cross-Origin-Opener-Policy: same-origin` ; envisager de retirer `geolocation=(self)` de
  Permissions-Policy si la géolocalisation n'est pas utilisée.
- `security.txt` : ajouter `Expires:` (obligatoire RFC 9116) — sans lui le fichier est techniquement invalide.
- Anti-spam du formulaire côté client uniquement (`form-security.js`) : contournable. Les règles
  `/admin@/i`, `/\.ru$/`, `/\.cn$/` peuvent **bloquer de vrais clients** (ex. `admin@societe.fr`). Ajouter
  reCAPTCHA/Turnstile ou le filtrage Akismet de Netlify Forms ; assouplir la liste.
- Données du formulaire (nom, téléphone, message) : vérifier la durée de conservation dans Netlify et la
  mentionner dans les mentions légales.

### Données incohérentes (SEO local — NAP)
- `llms.txt` et `humans.txt` donnent le **+33 6 59 26 86 23** ; tout le site donne le **05 45 91 22 70**.
- `llms.txt` annonce lundi–vendredi 8 h–18 h, week-end fermé ; le JSON-LD annonce lun–ven 9 h–17 h + samedi
  9 h–12 h. À aligner sur la fiche Google Business Profile (source de vérité).
- Le JSON-LD de l'accueil promet des services **non réalisés** (« réfection de toiture, gouttières et
  zinguerie », « remplacement de fenêtres ») alors que le périmètre acté est nettoyage/démoussage de toiture
  et isolation intérieure ([decisions.md](./seo/decisions.md)) → risque de mauvaise information/avis négatifs.
- Les 4 questions du FAQPage JSON-LD contiennent des `&nbsp;` littéraux (à remplacer par un espace normal).

### SEO technique
- **Sitemap** : contient `llms.txt` et `humans.txt` (à retirer — ce ne sont pas des pages) ; `changefreq`/
  `priority` sont ignorés par Google (à supprimer, garder `lastmod` réel).
- **Balises `<title>` trop longues** (> 60 car., tronquées dans Google) : accueil 67, peinture-exterieure 80,
  zone 72, isolation 69, ravalement 69, nettoyage façade 68, nettoyage toiture 69, et tous les articles de
  blog 67–75 (suffixe « | Guides & Conseils VPRR » trop long). Cible : ≤ 60 car., avec mot-clé + ville en tête.
- **Meta description** : article « étude de cas hydrogommage » = 64 car. (trop court, `articles.json`
  aussi tronqué) ; `merci.html` sans description (noindex, sans importance) ; ravalement = 160 (limite).
- **SearchAction** du JSON-LD WebSite pointe vers `/?s=…` alors que le site n'a **pas de moteur de
  recherche** → à supprimer (donnée structurée invalide).
- **FAQ** (`faq-renovation-angouleme.html`) : aucun `<h2>` (saut H1 → H3). La zone (`zone-desservie…`) n'a que
  2 H2 : page fine pour du SEO local.
- `meta keywords`, `geo.*`, `ICBM`, `bingbot`/`googlebot` dupliquant `robots`, `ai-content-declaration` :
  inutiles (ignorés par les moteurs) → alléger.
- `robots.txt` : fichier de 190 lignes avec des directives fantaisistes (`Googlebot-News`, `Crawl-delay`
  ignoré par Google, `Disallow: /styleguide/` inexistant). À simplifier : `User-agent: *` + `Sitemap:`.
  Décision à prendre sur les bots IA (les autoriser est cohérent avec `llms.txt`).
- **Pas de données structurées d'avis** : 14 avis Google affichés mais pas de `AggregateRating` (à ne
  l'ajouter que si l'avis est vérifiable et conforme aux règles Google sur les avis auto-servis).
- `alt` OK, mais **dimensions `width/height` manquantes** sur ~4 images par page de service et 9 sur
  l'accueil (risque de CLS ; CLS mesuré bon, 0,003, donc faible urgence).
- Mentions légales : SIRET présent, mais pas de N° TVA ni d'assurance décennale (obligation d'information
  pour un artisan du bâtiment) — à confirmer avec le client.

### Performance (hors vidéo)
- **Images blog trop lourdes** : originaux de 3,9 Mo et 3,7 Mo (`peinture_ext.webp`,
  `facade_hydrogommage.webp`), 4 autres > 700 Ko, un doublon `bienfait_peinture_ext (1).webp` (espace et
  parenthèses dans le nom). Les déclinaisons `-800w` sont utilisées, mais les originaux sont servis en
  Open Graph. Recompresser (1200×630, < 200 Ko) et supprimer les doublons. Dossier `assets/img` = 13 Mo.
- **Font Awesome complet** (~19 Ko de CSS + 275 Ko de polices, quasi tout inutilisé) → sous-ensemble ou
  SVG inline. Économie ~300 Ko et une dépendance tierce en moins (voir P1-2).
- **CSS bloquant** : Lighthouse estime 1,55 s de gain en retirant/différant les feuilles bloquantes
  (`styles.css` fait 70 Ko non minifié, `zone.css` 26 Ko chargé sur l'accueil en synchrone).
- Page non éligible au bfcache (retour arrière lent) — probablement iframe Vimeo/`unload`.
- `blog-home.js` appelle `articles.json?v=${Date.now()}` avec `no-store` : casse tout cache à chaque visite.

---

## 🟡 Priorité 3 — Améliorations / confort

### Design & accessibilité
- **Contraste** insuffisant sur le texte des cartes d'avis (7 éléments `span` dans `article` de la section
  avis) → assombrir la couleur ou éclaircir le fond (WCAG AA 4,5:1).
- **Ordre des titres** : un `h4` sans `h3` parent sur l'accueil.
- Cibles tactiles < 40 px : ~12 éléments sur l'accueil mobile et 9 sur une page de service (liens de pied de
  page/boutons de filtre FAQ) → viser 44×44 px.
- 34 éléments de texte < 13 px sur mobile (mentions, libellés) → passer à ≥ 14 px pour le contenu lisible.
- Le faux « 06 00 00 00 00 » en placeholder est correct ; ajouter `inputmode="tel"`.
- Le bouton `.faq-filter-btn` déborde la largeur mobile (scroll horizontal interne, à confirmer visuellement).
- Pistes de redesign (à valider avec le client, non urgent) : preuves sociales plus visibles
  (photos de chantiers réelles avant/après, logos assurances/labels), CTA téléphone collant sur mobile,
  simplification de la page d'accueil (9 700 px de haut en desktop, 13 700 px en mobile → sections à condenser).

### Code / back-end
- Aucun vrai « back-end » : formulaire Netlify Forms uniquement. À prévoir : notifications e-mail Netlify
  activées vers le gérant, sauvegarde régulière des soumissions, page `merci.html` avec suivi de conversion
  (événement GTM `generate_lead`) **après consentement uniquement**.
- ~40 handlers `onclick=` inline et 8 `<script>` inline dans l'accueil → à migrer en `addEventListener`
  (prérequis de la CSP).
- `assets/css` : `styles.css` 70 Ko monolithique ; envisager un pas de minification maison plutôt que
  dépendre de `[build.processing]` de Netlify (option dépréciée par Netlify).
- Nettoyage du dépôt : `blog/blog.css|blog.js|article.css` à côté de `assets/css/blog.css` (possible doublon, à vérifier), `fetch_geojson.py`
  (script ponctuel), `data/config.json` (n'est plus lu), `node_modules` **versionné dans git** (à retirer et
  ajouter à `.gitignore`), `.agents/` `.codex/` `graphify-out/` à ignorer.
- Tests : 6 tests, tous sur la carte. Ajouter un test de non-régression des balises SEO (longueur title,
  canonical, un seul H1) et du build blog.

### Hors site (rappel, voir [blockers.md](./seo/blockers.md))
- Fusion/suppression de la fiche PagesJaunes doublon (61413918), process de demande d'avis Google,
  cohérence NAP GBP ↔ PagesJaunes ↔ site.

---

## 📋 Plan d'action proposé (ordre recommandé)

| # | Étape | Effort | Impact | Risque |
|---|---|---|---|---|
| 1 | **Hero** : supprimer le blocage du loader, image statique + vidéo différée/desktop-only (P1-1) | 0,5 j | ⭐⭐⭐ perf + SEO | faible (change le rendu au chargement — à valider) |
| 2 | **Cache CSS/JS** : hash au build ou cache court (P1-4) | 0,5 j | ⭐⭐⭐ | faible |
| 3 | **Publier un `dist/`** ou bloquer les fichiers internes ; retirer `template-article.html` du public (P1-3) | 0,5 j | ⭐⭐⭐ sécu + SEO | faible |
| 4 | **Auto-héberger** Inter + Font Awesome (subset) + Leaflet ; consentement Vimeo/Elfsight/OSM ; MAJ mentions légales (P1-2) | 1–1,5 j | ⭐⭐⭐ RGPD | moyen (visuel des icônes à vérifier) |
| 5 | **Corrections de contenu** : téléphone/horaires `llms.txt`+`humans.txt`, JSON-LD services fantômes, `&nbsp;`, SearchAction, sitemap, `security.txt` Expires | 0,5 j | ⭐⭐ SEO local | très faible |
| 6 | **Titles ≤ 60 car.** + meta description article court + H2 de la FAQ | 0,5 j | ⭐⭐ | très faible |
| 7 | **Images** : recompresser blog, supprimer doublons, dimensions `width/height` | 0,5 j | ⭐⭐ | faible |
| 8 | **Headers de sécurité** + CSP report-only puis enforce (déplacement des scripts inline) | 1–1,5 j | ⭐⭐ | moyen (peut casser un embed) |
| 9 | **Formulaire** : captcha/Akismet, règles anti-spam assouplies, notifications | 0,5 j | ⭐⭐ | faible |
| 10 | **A11y/design** : contrastes avis, ordre des titres, cibles tactiles, tailles de texte | 0,5 j | ⭐ | faible |
| 11 | **Nettoyage du dépôt** (node_modules, doublons CSS/JS, .gitignore) + tests SEO | 0,5 j | ⭐ | faible |
| 12 | Chantiers externes : GBP/PagesJaunes/avis, contenu (pages villes, nouveaux articles) | continu | ⭐⭐⭐ long terme | — |

Ordre conseillé : **1 → 4** d'abord (ils règlent les 3 problèmes majeurs), puis 5–7 (gains SEO rapides),
puis 8–11. Après chaque lot : relancer Lighthouse mobile (objectif perf ≥ 90, bonnes pratiques ≥ 95),
`npm run build:blog`, `npm test`, vérification « aucun changement visuel » selon
[`code-quality-refactor.md`](./code-quality-refactor.md).

## Décisions à valider avec le client
1. Vidéo du hero : image fixe partout, vidéo desktop seulement, ou vidéo derrière un bouton lecture ?
2. Galerie Instagram (Elfsight) : garder derrière un clic de consentement, ou remplacer par la galerie
   locale avant/après déjà existante ?
3. Numéro de téléphone officiel et horaires réels (le 06 59 26 86 23 est-il encore valable ?).
4. Services réellement proposés en toiture/isolation (pour corriger le JSON-LD).
5. N° TVA / assurance décennale à afficher dans les mentions légales.
6. Autoriser ou non les robots d'entraînement IA.

---

## Suivi d'exécution (2026-09-29, session 2) — corrections appliquées en local, NON déployées

Décisions du client : vidéo hero lancée dès le démarrage (qualité qui monte progressivement), galerie
Instagram conservée et citée dans les pages légales, téléphone officiel **05 45 91 22 70**, horaires =
fiche PagesJaunes (lun–ven 9 h–17 h, sam 9 h–12 h, dim fermé), services toiture/isolation **conformes**
(le point « services fantômes » du JSON-LD est donc **retiré de l'audit**), TVA/décennale à afficher,
robots IA autorisés.

| Point | Fait |
|---|---|
| P1-1 Hero | Loader plein écran supprimé ; contenu visible immédiatement ; image d'attente `hero-1200w.webp` en CSS ; vidéo Vimeo injectée au chargement (desktop/tablette ≥ 768 px, hors économiseur de données et 2G/3G), apparition en fondu, retour en qualité auto après 3 s. **Téléphones : image seule** (la vidéo pèse ~19 Mo — mesuré ; inverser en retirant la condition de largeur dans `shouldLoadHeroVideo()` de `main.js`). |
| P1-3 Fichiers internes | Redirections 404 forcées dans `netlify.toml` pour `CLAUDE.md`, `AGENTS.md`, `package*.json`, `docs/`, `content/`, `scripts/`, `tests/`, `node_modules/`, `graphify-out/`, `.agents/`, `.codex/`, `.claude/`, `data/config.json`, `blog/template-article.html`. |
| P1-4 Cache | CSS/JS : `max-age=0, must-revalidate` ; images/média/data : 30 jours (au lieu d'`immutable` 1 an). |
| P1-2 RGPD | Mentions légales : ajout de Vimeo, Elfsight/Instagram, Google Fonts, cdnjs, unpkg, OpenStreetMap, Google Maps + transferts hors UE ; iframe GTM `<noscript>` retiré. **Reste** : ces services se chargent toujours avant consentement (choix client) — auto-héberger Inter/Font Awesome/Leaflet supprimerait 3 tiers sur 6. |
| Légal | Mentions : « Entreprise Individuelle » corrigé en **SARL**, SIREN, SIRET, **TVA FR02 934 010 216** (annuaire-entreprises.data.gouv.fr), assurances décennale + RC Pro ; ligne société dans le pied de page. |
| NAP | `llms.txt`/`humans.txt` : téléphone, horaires, « 15 ans », infos légales alignés. |
| SEO | Titres ≤ 60 car. (accueil, 6 pages de service, zone, 7 articles via suffixe « \| VPRR »), bug du build blog corrigé (descriptions YAML multi-lignes tronquées), `&nbsp;` retirés du JSON-LD, SearchAction supprimée, sitemap sans `llms/humans` ni changefreq/priority, `robots.txt` réduit (bots IA autorisés), `security.txt` + `Expires`, H2 (masqué) sur la FAQ, H4→H3 avis. |
| Sécurité | `X-XSS-Protection` retiré, COOP ajouté, `geolocation=()`, règles anti-spam du formulaire assouplies (`admin@`, `.ru`, `.cn`, « crypto »). |
| Perf | Images blog recompressées (assets/img : 13 Mo → 2,4 Mo), `articles.json` sans cache-buster, contraste du texte « min de lecture » corrigé. |

Mesure locale après correctifs (Lighthouse mobile, serveur non compressé) : perf 61 → ~70 **avec la vidéo
encore chargée** ; accessibilité 95 → 100 ; SEO 100. Le gain principal viendra du contrôle sur mobile
(sans vidéo) et de la mesure sur la prod après déploiement — **à refaire après push**.

### Reste à faire
- Auto-héberger Font Awesome (subset) + Inter + Leaflet (CSS bloquant ≈ 1,3 s, 3 tiers en moins).
- CSP en report-only puis enforce (scripts inline à externaliser).
- Captcha/Akismet sur le formulaire ; nettoyage du dépôt (`node_modules` versionné).
- Nom de l'assureur décennale à ajouter dans les mentions légales (obligation d'affichage).
- Incohérence à trancher : mentions légales citent « Eagle Production » comme réalisateur, le pied de page
  « Angelo Pro ».

### Session 3 (2026-09-29) — auto-hébergement, image d'attente, footer
- **Polices/icônes/carte hébergées** : Inter (`assets/fonts/inter*.{css,woff2}`), Font Awesome 6.5.1
  (`assets/vendor/fontawesome/`), Leaflet 1.9.4 (`assets/vendor/leaflet/`). Plus aucun appel à Google Fonts,
  cdnjs ni unpkg/jsdelivr sur aucune page ; seuls restent Vimeo, Elfsight/Instagram, GTM (après consentement)
  et les tuiles OpenStreetMap. Cache `immutable` sur `/assets/vendor/*` (chemins versionnés).
  ⚠ Mettre à jour une lib = nouveau dossier versionné, pas d'écrasement.
- **Image d'attente du hero** = vraie 1re image de la vidéo (`media/first-frame.webp`), déclinée en
  `data/hero-poster-{768,1280,1920}w.webp`, avec préchargement par media query.
- **Footer** : « Site créé par Angelo Pro » devient un bouton vers https://angelo-pro.fr/ (nouvel onglet) ;
  mentions légales : réalisateur = Angelo Pro (Eagle Production retiré).
- **Purge des anciens caches** : les CSS/JS étaient servis `immutable` 1 an ; les navigateurs des visiteurs déjà
  venus gardaient l'ancien code (constaté en prod : la carte appelait encore unpkg). Toutes les références
  CSS/JS portent maintenant `?v=20260929` (nouvelle URL = rechargement). Les fichiers sont désormais servis
  avec revalidation : ce `?v=` n'est plus à changer à chaque modif, seulement utile pour ce nettoyage unique.
- **Mesure prod après déploiement (Lighthouse mobile)** : performance **99**, accessibilité **100**, bonnes
  pratiques **100**, SEO **100** ; LCP 2,1 s ; 551 Ko transférés (avant : 61 / 95 / 77 / 100, LCP 9,4 s, 20 Mo).

### Session 4 (2026-09-29) — Captcha Cloudflare Turnstile
- Widget Turnstile (clé de site publique dans le HTML des 6 formulaires, script chargé seulement quand le
  formulaire approche de l'écran). Les formulaires postent sur `/api/contact` →
  `netlify/functions/contact.js` : vérifie le jeton côté serveur (variable Netlify **`TURNSTILE_SECRET`**,
  jamais dans le dépôt), honeypot silencieux, puis transmet à Netlify Forms (`POST /`) → les demandes arrivent
  comme avant (interface Netlify + e-mails). Sans `TURNSTILE_SECRET`, la vérification est ignorée (log
  d'avertissement) pour ne pas casser le formulaire.
- Tests : `tests/contact-function.test.js` (7 cas). Cloudflare cité dans les mentions légales.

### Session 5 (2026-09-29) — Microsoft Clarity
- Clarity (projet `ypwg9bye24`) chargé par `assets/js/footer.js` (`loadAnalytics()` = GTM + Clarity), donc sur
  toutes les pages qui incluent le footer (404.html mis à part, sans footer partagé), **uniquement après
  consentement** aux cookies d'analyse. Signal de consentement envoyé à Clarity (`consentv2`, pub refusée).
- Bannière : texte explicite (GTM + Clarity) ; case « analyse » **décochée par défaut** dans les paramètres
  (opt-in, exigence CNIL). Bouton/lien **« Gérer mes cookies »** (pied de page + mentions légales) qui efface le
  choix et réaffiche la bannière. Mentions légales : Clarity dans les sous-traitants + cookies `_clck`/`_clsk`.
