# Reste à faire — feuille de route (mise à jour : 2026-10-01)

> Fait le 2026-10-01 : `styles.css`, `zone.css` et `main.js` découpés par fonction (sources dans `src/`, voir changelog).

Point de reprise pour une nouvelle session. Rien ici n'est cassé : le site est stable et tout le travail précédent
est déployé (voir [`changelog.md`](./changelog.md)). Ce sont des améliorations, classées par priorité.
Contexte technique : [`seo/architecture.md`](./seo/architecture.md) · méthode de vérification : [`README.md`](./README.md).

> Règles rappelées : ne jamais commit/push sans validation ; un commit = une idée ; vérifier la prod à 375 / 768 /
> 1440 px après chaque déploiement ; mettre à jour `changelog.md` à chaque déploiement.

## A. Actions qui attendent le client (rien à coder tant qu'elles ne sont pas faites)

| # | Action | Détail |
|---|---|---|
| A1 | **Marquer `generate_lead` comme événement clé dans GA4** | GTM/GA4 sont configurés et publiés (2026-09-30, version GTM 3, propriété `G-173V5FGW2S`). Reste : après le premier vrai envoi de formulaire, GA4 > Admin > Événements → étoile sur `generate_lead`. Détail : `seo/blockers.md` §4. |
| A2 | **Nom de l'assureur décennale / RC Pro** | Obligatoire à afficher : section « Assurances » de `mentions-legales.html` (+ éventuellement `llms.txt`). Demander aussi n° de contrat et zone couverte. |
| A3 | **Fiche PagesJaunes doublon** `61413918` | Réclamation / demande de fusion via Solocal. `seo/blockers.md` §2. |
| A4 | **Process d'avis Google après chantier** | Choisir le canal (SMS, QR code, carte, mail) puis préparer le support. `seo/blockers.md` §3. |
| A5 | ~~Vidéo du hero sur téléphone~~ | **Fait le 2026-09-30** : la vidéo se lance sur tous les écrans (décision du client). À surveiller : Lighthouse mobile (perf) après déploiement. |
| A6 | **Contenus/photos** | Nouvelles photos de chantiers (avant/après). **Instagram (Elfsight)** : fil avec photos hors sujet (masquer des posts dans l'éditeur Elfsight), bandeau « Free Instagram Feed Widget » et bouton bleu hors charte → choix du client : régler Elfsight ou remplacer par une galerie maison + lien Instagram (voir `seo/decisions.md`). **Titres d'articles** trop longs (3–5 lignes sur les cartes) : à raccourcir dans `content/blog/`. |
| A7 | ~~Avis Google : fournir les 14 avis~~ | **Fait le 2026-10-01** : carrousel de `index.html` remplacé par 7 vrais avis lus sur Google Maps (4-5★ avec texte ; les 1-2★ et les avis sans texte ne sont pas affichés). Les anciens Gregory Themot, Sylvie B. et Marc Deschamps n'existent pas sur la fiche Google. Note et nombre (4,1 · 14) inchangés. |
| A8 | **Photos à fournir (plus tard, par le client)** | (1) **Portrait de Stéphane Villéger** (+ quelques lignes sur son parcours) → section « Qui est derrière VPRR » sur `a-propos.html`. (2) **Photos de chantiers** pour les **pages de service** (hero avant/après) et pour **`realisations.html`** (une carte par chantier : commune, prestation, avant/après). **Depuis le 2026-10-03 le client peut les ajouter lui-même dans Pages CMS** ([`cms.md`](./cms.md)) : plus de conversion WebP manuelle (Netlify Image CDN). Aujourd'hui seules 4 paires avant/après existent (`media/services/`), et celles du ravalement et du nettoyage de façade se ressemblent. Si elles arrivent par un autre canal : les déposer dans `media/uploads/` et renseigner `content/realisations.json` / `page.json`. |
| A11 | **À remplacer plus tard (demande du client, 2026-10-03)** | (1) **Photos des 5 pages de service** (en-tête avant/après) ; (2) **photos des articles de blog** (couvertures actuelles = images génériques, plusieurs se ressemblent) ; (3) **une image pour la page À propos** et le **portrait de Stéphane Villéger** (voir A8). Tout se fait dans Pages CMS ([`cms.md`](./cms.md)) : rien à coder. |

## B. Petits chantiers rapides (≤ 1 h chacun)

- [ ] **Page « À propos » : ajouter l'humain.** Elle ne contient que des faits vérifiables. Quand le client fournit un portrait de Stéphane Villéger et quelques lignes sur son parcours : ajouter une section « Qui est derrière VPRR » (photo + texte) — c'est le levier de confiance principal d'un site d'artisan.
- [ ] **Page « Réalisations » : plus de chantiers.** Aujourd'hui 4 paires avant/après (les photos de « Ravalement » et « Nettoyage de façade » se ressemblent beaucoup). Ajouter de vraies photos de chantiers récents (A6), une carte par chantier avec commune et durée.

- [ ] **Netlify Forms : vérifier la réception** du premier envoi depuis `contact.html` (le formulaire garde le nom `contact`). Après déploiement : envoyer un message test, vérifier l'e-mail de notification et l'événement `generate_lead`.

- [x] *(fait le 2026-10-01)* Propositions de redesign 1 à 6 des pages service et zone ([`design/direction-artistique.md`](./design/direction-artistique.md)). Reste la n° 7 (logo B2, en attente du client). Le guide visuel [`design/guide-direction-artistique.html`](./design/guide-direction-artistique.html) est à tenir à jour à chaque évolution de composant.

- [ ] **Appliquer le logo B2** quand le client le demande : tout est prêt dans [`design/logo-b2.md`](./design/logo-b2.md) (balisage + CSS + vérifications). En attendant, le logo d'origine est en ligne.

- [ ] **Vérifier `quote_cta_click` et `generate_lead`** dans GA4 > Temps réel (fenêtre privée sans anti-pub : le Chrome de
  l'utilisateur bloque `gtm.js`). `page_view` et `phone_click` sont déjà vérifiés (2026-09-30, requêtes `g/collect` en 204).
- [ ] **Relancer Lighthouse mobile sur la prod** (dernier relevé : 2026-09-29, avant les changements mobile/cookies/ménage) et
  consigner les scores dans `changelog.md`. Objectif : garder Perf ≥ 95, A11y 100, Bonnes pratiques 100, SEO 100.
- [x] *(fait, à déployer)* **Fichiers non suivis par git** : décider pour `.agents/`, `.codex/`, `graphify-out/`, `AGENTS.md` (ancienne copie de
  `CLAUDE.md`), `.gitattributes`, `.claude/settings.json` → les ajouter au `.gitignore` ou les versionner. Un
  `.gitattributes` avec `* text=auto eol=lf` supprimerait les avertissements « LF will be replaced by CRLF ».
- [x] *(fait, à déployer)* **Bruit dans le sitemap** : `scripts/build-blog.js` réécrit les `<lastmod>` de `sitemap.xml` (et un espace dans
  `blog/index.html`) à chaque build, d'où des diffs à annuler à la main (`git checkout -- sitemap.xml blog/index.html`).
  Corriger pour ne mettre à jour `lastmod` que si le contenu de l'article a changé.
- [ ] **Google Search Console** : renvoyer le sitemap, inspecter quelques URLs (`/blog/<slug>` doit montrer la redirection
  301 vers `.html`), surveiller « Pages » et « Expérience » (Core Web Vitals) sur 28 jours.
- [x] *(fait, à déployer ; reste : liens en ligne dans les paragraphes, carte Leaflet)* **Accessibilité résiduelle** (audit du 29/09) : ~9 cibles tactiles < 40 px et ~8 textes < 13 px sur mobile ; images sans
  `width`/`height` (≈ 4 par page de service, 9 sur l'accueil) ; vérifier le contraste des cartes d'avis.

- [ ] **A9 — Faire valider les tarifs par le client** : fourchettes au m² du tableau de [`seo/decisions.md`](./seo/decisions.md) (estimations de marché charentais, pas des prix du client). Ajuster d'un seul endroit puis propager.
- [ ] **A10 — Statut RGE / assureur** : la FAQ isolation renvoie vers France Rénov' sans promettre d'aides ; si l'entreprise est RGE, le dire (pages isolation + FAQ).

- [ ] **Vérifier Pages CMS en conditions réelles** (première connexion du client sur app.pagescms.org) : ouverture de chaque fichier, import d'une photo, enregistrement, build Netlify, rendu des photos via Netlify Image CDN sur l'aperçu. Si un champ se comporte mal, ajuster `scripts/cms-config.js` puis `npm run build:cms`.

## B2. Points relevés à l'issue de l'audit du 2026-10-03

Faits le 2026-10-03 (voir [`changelog.md`](./changelog.md)) : étude de cas réécrite en chantier type (sans client ni citation), affirmations de blog nuancées, gros ménage CSS/JS, pages 404 et merci passées au design system.

- [x] ~~Voix « équipe »~~ — **décidé** : on garde « nous / notre équipe » (l'entreprise compte environ 4 à 6 personnes ; ne pas annoncer de chiffre exact). Éviter « un seul artisan » ; titre À propos : « Un artisan et son équipe… ».
- [x] ~~Tiers avant consentement (Vimeo, Instagram)~~ — **décidé par le client : on ne s'en occupe pas** (retiré du chantier C.4).
- [ ] **Avis Google** : choisir la solution d'affichage (options et recommandation ci-dessous), puis la brancher.
- [ ] **Bonnes pratiques Lighthouse 75 sur les aperçus Netlify** (100 en prod) : à remesurer sur la prod, puis revoir « Bonnes pratiques » (à traiter après le ménage, sur demande du client).
- [ ] **Relecture éditoriale du blog** : les 6 articles ont été nuancés ; une relecture par le client (exactitude métier : durées, produits, méthodes) reste utile.

### Avis Google : options étudiées (2026-10-03)

Règle Google à connaître : des avis d'une entreprise affichés **sur son propre site** (balisage ou widget) ne donnent **pas** d'étoiles dans les résultats de recherche (« avis auto-promus », LocalBusiness/Organization). Le gain SEO vient donc de la **fiche Google elle-même** (nombre et fraîcheur des avis, réponses du propriétaire), pas du balisage sur le site. Sur le site, les avis servent la confiance et la conversion.

| Option | Coût | Mise en place | À savoir |
|---|---|---|---|
| **A. Widget gratuit Featurable** (ou équivalent) | 0 € à vie, vues illimitées, petit lien « Powered by » | coller un script, relier la fiche Google | mises à jour automatiques ; script tiers (CSP + mentions légales à compléter) ; rendu en JS, donc peu de texte indexé |
| **B. Avis statiques (actuel) + mise à jour trimestrielle** | 0 € | modifier `index.html` à la main | texte indexable et totalement maîtrisé ; demande un geste manuel |
| **C. API Google Places** (récupération par script) | gratuit sous quota mais **carte bancaire obligatoire** | clé API + tâche planifiée | 5 avis maximum ; les conditions d'usage de Google limitent le stockage des avis : non recommandé |

**Recommandation** : A pour l'affichage (auto-actualisé, gratuit), en gardant dans la page un court texte statique (note, nombre d'avis, lien « Voir tous les avis sur Google ») pour l'indexation ; et surtout travailler la **collecte d'avis** (lien direct d'avis `https://g.page/r/CZZJ5Bogt13fEBM/review`, QR code, SMS après chantier — voir A4), car c'est ce qui améliore le référencement local de la fiche.

## C. Chantiers moyens (une session chacun)

1. **Pages « ville » (SEO local)** — le gabarit est prêt (`content/pages/<slug>/page.json`, voir `seo/architecture.md` §4.2) ;
   il manque un **modèle de contenu** : décider avec le client quelles communes (Cognac, Jarnac, Soyaux, La Couronne,
   Champniers…), écrire un texte réellement différent par commune (éviter le contenu dupliqué), photos locales.
   Pour chaque page : `page.json` + sitemap + menu (`sync-header.js`) + liens depuis `zone-desservie-charente.html`.
2. ~~**Tokeniser le reste du design system**~~ — **fait le 2026-10-02** : 13 tailles de texte, 4 ombres, couches `z-index` nommées, points de rupture alignés par paires ; vérifié par `npm test` (`design-tokens`). Voir [`design/tokens.md`](./design/tokens.md) et le bilan avant/après dans [`design/direction-artistique.md`](./design/direction-artistique.md) §F. Reste : rayons (`border-radius`) et espacements en dur résiduels.
3. **Durcir la CSP** — retirer `'unsafe-inline'` de `script-src` : externaliser les 2 scripts inline de `index.html` et les
   attributs `onclick` restants (puis évaluer `style-src`). Tester toutes les pages avec la CSP en `Report-Only` d'abord.
4. ~~Consentement des tiers~~ — carte OpenStreetMap à la demande (fait le 2026-10-01) ; **Vimeo et Elfsight/Instagram : le client a décidé de ne pas les mettre derrière un clic (2026-10-03)**.
5. **URLs sans `.html`** — décision SEO : impacte canonicals, sitemap, JSON-LD, liens internes et redirections 301 (~50
   URL à migrer d'un coup) ; à faire seulement si le gain est jugé utile.
6. **Condensation mobile, suite** (non demandée mais possible) : carrousel des avis de l'accueil, bloc « zone » de
   l'accueil, réduction du hero. Mêmes garde-fous : contenu conservé dans le HTML, desktop inchangé.
7. **Refonte du blog** (pistes du 21/09) : liste en grille compacte au lieu d'une colonne de 5 000 px, remplacer les
   emojis des filtres par des icônes Font Awesome, style des champs du formulaire.
8. **Contenu SEO** : nouveaux articles (`content/blog/`), publications Google Business Profile, cohérence NAP
   GBP ↔ PagesJaunes ↔ site.

## D. Contrôles à refaire après tout déploiement

```
npm test                       # 20 tests
npm run build                  # arrêter d'abord tout « serve dist » (Windows : EPERM)
git checkout -- sitemap.xml blog/index.html   # annule le bruit de lastmod si besoin
```
Puis sur vprr.fr : pages principales en 200, `/docs/*` `/CLAUDE.md` `/content/*` en 404, bannière cookies visible,
hauteurs de pages inchangées (ravalement : 13 934 px desktop / 16 133 px téléphone ; accueil : 9 864 / 12 176),
aucun débordement horizontal.

## E. Décisions déjà prises (ne pas rouvrir sans raison)

- Isolation = **isolation intérieure uniquement** (pas d'ITE) — `seo/decisions.md`.
- Téléphone officiel 05 45 91 22 70 ; horaires lun–ven 9 h–17 h, sam 9 h–12 h.
- Robots d'IA autorisés (`robots.txt`, `llms.txt`).
- Cookies : choix binaire tout accepter / tout refuser, sans paramètres.
- Vidéo hero sur tous les écrans (sauf économiseur de données / connexion lente / mouvement réduit).
- Condensation mobile validée par le client : communes 8/18, FAQ 5/9, tarifs repliés (page ravalement), photos en double
  masquées, galerie de l'accueil horizontale.
