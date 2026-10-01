# Journal des changements du site (changelog)

Historique **daté et par commit** de tout ce qui a été modifié sur vprr.fr, du plus récent au plus ancien.
Pour annuler une étape précise : `git revert <hash>` (chaque ligne = un commit indépendant, déployé et vérifié
sur vprr.fr avant de passer au suivant). Le détail des audits est dans les fichiers cités ; l'architecture actuelle
est décrite dans [`seo/architecture.md`](./seo/architecture.md).

## Photo de l'état actuel (2026-09-30)

| Mesure | Valeur |
|---|---|
| Lighthouse mobile (prod, 2026-09-29) | Perf **99** · Accessibilité **100** · Bonnes pratiques **100** · SEO **100** (avant : 61 / 95 / 77 / 100) |
| Poids de la page d'accueil (mobile) | ≈ 550 Ko avant le 2026-09-30 (la vidéo du hero se lance désormais aussi sur téléphone) |
| Hauteur page ravalement, téléphone 375 px | **16 133 px** (avant : 23 851) · tablette 768 px : 12 957 (avant 17 659) · desktop : 13 934 (inchangé) |
| Hauteur accueil, téléphone | **12 176 px** (avant : 13 486) · desktop : 9 864 (inchangé) |
| Tests automatiques | 20 / 20 (`npm test`) |
| Dépendances npm | **0** |
| Pages de service | 5, générées depuis `content/pages/` |

## 2026-10-01 (nuit 2) — Menu burger, cohérence des cartes, guide de direction artistique

- **Menu burger** (`assets/js/main.js`) : « Services » ne s'ouvre plus au survol en mode mobile/tablette (la largeur est testée à chaque événement, plus seulement au chargement).
- **Pages de service** (`service-page.css`, `content/pages/ravalement-facade-angouleme/tarifs.html`) : carte « mise en avant » unifiée en or, orange hors palette supprimé, cartes « problème » sans déplacement au survol. Pages régénérées par `npm run build:pages`.
- **Nouveau** : [`design/guide-direction-artistique.html`](./design/guide-direction-artistique.html) (référence visuelle avec les vraies classes) et [`design/direction-artistique.md`](./design/direction-artistique.md) (audit pages service/zone, corrigé / restant / propositions à valider).

## 2026-10-01 (nuit) — Avis Google : carrousel remplacé par les vrais avis

- `index.html` : 7 avis réels lus sur Google Maps (4-5★ avec texte), notes fidèles (Florence Pluvieux 4★). Retrait de 3 avis absents de la fiche (Gregory Themot, Sylvie B., Marc Deschamps). Note 4,1 · 14 avis inchangée. Vérifié à 375 / 768 / 1280 px : pas de débordement, flèches et « Lire la suite » OK.

## 2026-10-01 (soir) — Logo : retour à l'ancien logo, B2 retenue et documentée

Le client a comparé 4 variantes (A à D) puis la variante B avec deux portes (B1 agrandie, B2 allongée) : **B2 est choisie**,
mais **l'ancien logo d'origine reste en production** en attendant. Tout B2 est documenté pour être appliqué plus tard.

| Changement |
|---|
| **Production** : `media/VPRR-LOGO.svg` de nouveau affiché par `<img class="logo-img">` (`scripts/sync-header.js`, `scripts/template-article.html`, `404.html`, règles `.logo-img` de `styles.css` et `responsive.css`, `preload` du logo remis dans `index.html` et `scripts/templates/service-page.html`). Les pages ont été régénérées. |
| **Conservé** (inchangé) : palette, boutons pilule, menu burger en liste, barre mobile flottante, footer lisible, correctif des avis. Le panneau du menu mobile garde `.logo { position: relative; z-index: 1100 }` : le logo reste visible au-dessus du menu ouvert. |
| **Documentation** : [`design/logo-b2.md`](./design/logo-b2.md) (décision, spécification, balisage et CSS prêts à coller, mesures d'alignement, historique des variantes), [`design/logo-b2-door.svg`](./design/logo-b2-door.svg) (la porte B2), [`design/logo-b2-preview.html`](./design/logo-b2-preview.html) (maquette locale). |

## 2026-10-01 — Refonte design : palette, boutons, logo, menu mobile, footer

Validée par le client après maquettes (page de propositions). Thème **clair** conservé.

| Changement |
|---|
| **Palette unique** : variables `--brand-accent-text` (#7A5A2B, or pour du texte, 6:1), `--brand-accent-on-dark` (#D9C4A1), `--footer-text`, `--color-star`, `--color-primary-active` ; textes plus contrastés (`--color-text-light` #5C4D41, `--color-text-muted` #6A5C50) ; fonds crème unifiés (`--color-bg` #FAF8F5). L'or `--brand-accent` (#A88B5E, 3:1) ne sert plus qu'au décor. Suppression de #8B5A2B, #5A3210, #5A2F0F, #8B4513, #D9742B, #F59E0B, des 6 crèmes en double et de tous les dégradés de boutons. |
| **Boutons** : pilule, aplat, hover = assombrissement seul (plus de soulèvement, d'ombre qui grandit, de reflet ni de dégradé) ; 2 tailles (48 px, `btn--sm` 40 px) ; filtres en pilule, boutons ronds (burger, flèches) en cercle. |
| **Logo** : une version « A » (porte redessinée + texte en vraie police) a été en ligne quelques heures (commit `a261fe1`), puis **retirée** le même jour (voir l'entrée « Logo » ci-dessous). |
| **Menu burger** : panneau plein écran en liste alignée à gauche (séparateurs, page courante marquée, sous-menu Services qui glisse), bloc du bas avec téléphone, horaires et bouton devis (`<li class="menu-tel">`). |
| **Barre du bas mobile** : pilule flottante (bouton téléphone rond + « Devis gratuit »), masquée par `main.js` quand `#contact` ou le footer est à l'écran. |
| **Footer** : SIRET / TVA en liste étiquette / valeur en texte clair (`--footer-text`), « Garantie décennale & RC Pro » en pastille. |
| **Correctif avis Google (mobile)** : le carrousel débordait de l'écran (régression de la veille : `min-width: 0` manquant sur la grille). |

## 2026-09-30 (nuit) — Audit design : incohérences desktop / tablette / mobile

Méthode : captures Chromium à 375 / 768 / 1440 px + calcul automatique des contrastes (WCAG) et des cibles tactiles.

| Changement |
|---|
| **Eyebrows « Zone d'intervention » et « Contact »** (accueil) : une règle `.zone-header p` / `.contact-header p` écrasait leur style (gris, plus gros) → alignés sur les autres sections. |
| **Label « Type de projet »** : `<span>` non stylé → même style que les autres labels du formulaire. |
| **Footer** : labels « SUIVEZ-NOUS », « TÉLÉPHONE/EMAIL/ADRESSE » ≈ 3:1 en 10 px → nouvelle variable `--brand-accent-on-dark` (≈ 5,5:1), 11 px. |
| **Blog / FAQ** : pill « Guides & Conseils » en brun (était doré clair, ≈ 3:1) ; filtre actif de la FAQ en brun plein comme celui du blog ; contrôles de la FAQ alignés sur la colonne des questions (720 px). |
| **Hero de l'accueil** : nouveau H1 court « Ravalement, toiture et peinture **à Angoulême** » (2-3 lignes, mots-clés + ville) ; sous-titre réécrit ; taille max 76 → 68 px ; **vidéo lancée sur téléphone et tablette** (garde-fous conservés : économiseur de données, connexion lente, mouvement réduit) ; voile plus dense sur mobile/tablette (texte lisible sur toile claire) ; eyebrow en accent clair ; `text-wrap: balance`. |
| **Titres H1** des pages intérieures : plafond 60 → 48 px (FAQ et zone passaient sur 4 lignes). Pages de service : 60 → 48 px. |
| **Boutons** : tailles normalisées (suppression des paddings locaux `faq-actions-btn`, `zone-actions-btn`, `jobsheet-actions`, `cta-glass`, `.btn-lg` du blog) ; rayon unique 12 px (bouton « avis Google » et page 404 passés de pilule à 12 px ; `btn--sm`/`btn--lg` alignés) ; poids 600 partout ; boutons du hero de service pleine largeur sur mobile. |
| **Avis Google (accueil)** : fin de l'effet « carte dans une carte » (conteneur blanc retiré), cartes blanches avec ombre légère, nom puis étoiles en colonne (le nom ne se coupe plus), « 4,1 • 14 avis » sur une ligne. |
| **Cibles tactiles** : liens légaux et crédit du pied de page 44 px ; liens « contact direct » 32 px + texte 14 px. |

## 2026-09-30 — Petits chantiers (roadmap B) — *non déployé, en attente de validation*

| Changement |
|---|
| **Sitemap sans bruit** : `build-blog.js` ne réécrit plus les `<lastmod>` des pages hors blog (à mettre à jour à la main) ; `lastmod` de `/blog/` = max(valeur actuelle, dernier article). `blog/index.html` n'accumule plus de lignes vides à chaque build. |
| **Git** : `.gitignore` (`.agents/`, `.codex/`, `graphify-out/`, `AGENTS.md`, `.claude/settings*.json`) + `.gitattributes` (`* text=auto eol=lf`). |
| **Images** : `width`/`height` ajoutés (accueil ×9, pages de service ×4 chacune) ; lus depuis le fichier WebP par `scripts/lib/image-size.js`. Tailles affichées identiques avant/après. |
| **Accessibilité mobile (≤ 768 px)** : cibles tactiles ≥ 40 px (liens du pied de page, contact direct, « Lire la suite », « Voir ce service », bouton Envoyer 44 px) ; textes de 10–12 px passés à 13 px. Desktop inchangé ; pages mobiles ≈ +1 % de hauteur (accueil +394 px). |

## 2026-09-30 (soir) — Google Analytics 4 branché via GTM

Aucun changement de code du site : configuration du conteneur GTM `GTM-NKPGDBPG` (version 3 publiée, import
« Fusionner » — la balise Clarity est conservée).

- Balise Google `GA4 - Configuration` (`G-173V5FGW2S`, propriété GA4 « VPRR ») sur toutes les pages.
- Déclencheurs « Événement personnalisé » `CE - phone_click`, `CE - quote_cta_click`, `CE - generate_lead` + balises
  GA4 événement associées ; `quote_cta_click` transmet le paramètre `placement` (variable `DLV - placement`).
- Vérifié sur vprr.fr après « Tout accepter » : `page_view` et `phone_click` reçus (`region1.google-analytics.com/g/collect`, 204).
- Reste : étoile « événement clé » sur `generate_lead` dans GA4 après le premier envoi réel de formulaire.

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
