# Reste à faire — feuille de route (mise à jour : 2026-09-30)

Point de reprise pour une nouvelle session. Rien ici n'est cassé : le site est stable et tout le travail précédent
est déployé (voir [`changelog.md`](./changelog.md)). Ce sont des améliorations, classées par priorité.
Contexte technique : [`seo/architecture.md`](./seo/architecture.md) · méthode de vérification : [`README.md`](./README.md).

> Règles rappelées : ne jamais commit/push sans validation ; un commit = une idée ; vérifier la prod à 375 / 768 /
> 1440 px après chaque déploiement ; mettre à jour `changelog.md` à chaque déploiement.

## A. Actions qui attendent le client (rien à coder tant qu'elles ne sont pas faites)

| # | Action | Détail |
|---|---|---|
| A1 | **Déclencheurs Google Tag Manager** | Créer dans le conteneur `GTM-NKPGDBPG` un déclencheur « Événement personnalisé » pour `phone_click`, `quote_cta_click`, `generate_lead` + balises GA4 associées ; marquer `generate_lead` comme conversion. Clarity reçoit déjà les événements tout seul. Détail : `seo/blockers.md` §4. |
| A2 | **Nom de l'assureur décennale / RC Pro** | Obligatoire à afficher : section « Assurances » de `mentions-legales.html` (+ éventuellement `llms.txt`). Demander aussi n° de contrat et zone couverte. |
| A3 | **Fiche PagesJaunes doublon** `61413918` | Réclamation / demande de fusion via Solocal. `seo/blockers.md` §2. |
| A4 | **Process d'avis Google après chantier** | Choisir le canal (SMS, QR code, carte, mail) puis préparer le support. `seo/blockers.md` §3. |
| A5 | **Vidéo du hero sur téléphone** | Actuellement image seule (la vidéo pèse ~19 Mo). Pour l'activer : retirer la condition de largeur dans `shouldLoadHeroVideo()` de `assets/js/main.js` (impact perf fort — à décider). |
| A6 | **Contenus/photos** | Nouvelles photos de chantiers (avant/après), Instagram : le fil Elfsight montre des photos hors sujet (à trier côté compte Instagram). |

## B. Petits chantiers rapides (≤ 1 h chacun)

- [ ] **Vérifier que les événements arrivent** : accepter les cookies sur vprr.fr, cliquer sur un `tel:`, un bouton devis, envoyer
  un formulaire test → contrôler dans Clarity (événements personnalisés) puis dans GTM en mode aperçu.
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

## C. Chantiers moyens (une session chacun)

1. **Pages « ville » (SEO local)** — le gabarit est prêt (`content/pages/<slug>/page.json`, voir `seo/architecture.md` §4.2) ;
   il manque un **modèle de contenu** : décider avec le client quelles communes (Cognac, Jarnac, Soyaux, La Couronne,
   Champniers…), écrire un texte réellement différent par commune (éviter le contenu dupliqué), photos locales.
   Pour chaque page : `page.json` + sitemap + menu (`sync-header.js`) + liens depuis `zone-desservie-charente.html`.
2. **Tokeniser le reste du design system** — échelle typographique (≈ 50 tailles), ombres (≈ 60), breakpoints (≈ 12 dont
   991/992 et 768/769), échelle de z-index, un seul composant bouton (≥ 5 familles aujourd'hui). Changement visible :
   valider avec des mesures avant/après.
3. **Durcir la CSP** — retirer `'unsafe-inline'` de `script-src` : externaliser les 2 scripts inline de `index.html` et les
   attributs `onclick` restants (puis évaluer `style-src`). Tester toutes les pages avec la CSP en `Report-Only` d'abord.
4. **Consentement des tiers** — Vimeo (hero desktop), Elfsight/Instagram et tuiles OpenStreetMap se chargent avant tout
   consentement (cités dans les mentions légales) : les mettre derrière un clic (« Charger la carte / la galerie »).
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
- Pas de vidéo hero sur téléphone.
- Condensation mobile validée par le client : communes 8/18, FAQ 5/9, tarifs repliés (page ravalement), photos en double
  masquées, galerie de l'accueil horizontale.
