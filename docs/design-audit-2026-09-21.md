# Audit design & UX — 2026-09-21

Demande du client : capturer le site en desktop et mobile, repérer les erreurs visuelles et les points
de design perfectibles, corriger ce qui peut l'être sans changer le style/l'identité du site, et
documenter le tout avant validation (aucun commit/push effectué — voir `CLAUDE.md`).

Méthode : audit visuel complet (desktop 1440px + mobile 375px) via un sous-agent dédié sur 7 pages
(accueil, page de service ravalement, zone d'intervention, FAQ, blog liste, article de blog, mentions
légales), puis **vérification indépendante de chaque signalement** par inspection DOM/CSS
(`getBoundingClientRect`, `getComputedStyle`) avant toute correction — voir la note méthodologique dans
`docs/code-quality-refactor.md` sur les faux positifs de capture d'écran (animations "reveal on scroll",
glitches de rendu du pane de preview). Plusieurs signalements initiaux se sont révélés être des artefacts
de capture et ont été écartés après vérification (détail plus bas).

## Corrections appliquées

### 1. Noms des avis Google tronqués (desktop)
- **Où** : accueil, section "Ils nous font confiance" (`.review-author`), `assets/css/contact.css`.
- **Problème** : `white-space: nowrap` + `text-overflow: ellipsis` coupait les noms dans la mise en page
  à 2/3 colonnes ("Hélène Bo…", "Gregory Th…") alors qu'ils tenaient très bien en largeur normale.
- **Correctif** : suppression de la troncature (le nom s'affiche en entier, wrap normal si besoin) et
  suppression de la règle mobile devenue redondante.

### 2. Titre de l'article tronqué dans le fil d'Ariane (article de blog)
- **Où** : `blog/article.css`, `.breadcrumb-item.current span`.
- **Problème** : `max-width: 200px` (120px en mobile) + ellipsis coupait systématiquement le titre de la
  page courante dans le fil d'Ariane, même sur desktop où la place ne manque pas ("Ravalement de …").
- **Correctif** : passage à `max-width: 480px` (220px en mobile) sans ellipsis — le titre s'affiche en
  entier, avec retour à la ligne si nécessaire au lieu d'être coupé.

### 3. Carte "Isolation intérieure" orpheline (accueil, grille Services)
- **Où** : accueil, `#services` (`.svc-grid`), `assets/css/styles.css`.
- **Problème** : 5 cartes de service dans une grille à 2 colonnes fixe → la 5ᵉ carte se retrouvait seule
  sur sa ligne avec un grand vide à côté.
- **Correctif** : règle générique `.svc-grid > .svc-card:last-child:nth-child(odd) { grid-column: 1/-1 }`
  — la dernière carte s'étend sur toute la largeur quand elle se retrouve seule (robuste si un service
  est ajouté/retiré plus tard).

### 4. Carte orpheline dans la Galerie (accueil)
- **Où** : accueil, `#galerie` (`.gallery-grid`), `assets/css/styles.css`.
- **Problème** : grille fluide `auto-fit, minmax(280px,1fr)` retombait sur 3 colonnes pour 4 cartes →
  la 4ᵉ carte seule sur une 2ᵉ ligne.
- **Correctif** : grille explicite par palier (1 colonne mobile → 2 dès 640px → 4 dès 1024px), qui ne
  laisse jamais de carte seule pour ces 4 éléments.

### 5. Carte "Marques partenaires certifiées" orpheline (pages de service)
- **Où** : pages de service, section "Pourquoi nous choisir" (`.reassurance-grid`), 7 cartes en grille à
  3 colonnes sur `ravalement-facade-angouleme.html` (la seule page à afficher cette 7ᵉ carte accent) —
  `assets/css/service-page.css`.
- **Problème** : la 7ᵉ carte (déjà stylée en accent : bordure dorée, icône pleine couleur) se retrouvait
  seule sur sa ligne avec un vide à côté au lieu de fermer la section comme un bandeau de mise en avant.
- **Correctif** : `grid-column: 1/-1` sur `.reassurance-item--accent` — elle s'étend maintenant sur toute
  la largeur quel que soit le nombre de colonnes, cohérent avec son style déjà "mis en avant".

### 6. Bloc "Fiche chantier" très déséquilibré (pages de service)
- **Où** : pages de service, section réalisation (`.before-after-grid`), `assets/css/service-page.css`.
- **Problème** : `align-items: start` empêchait la carte photo avant/après de s'étirer → sur
  `ravalement-facade-angouleme.html` la photo faisait ~210px de haut contre ~724px pour la fiche
  chantier juste à côté, laissant un grand vide blanc sous la photo.
- **Correctif** : la carte photo s'étire maintenant à la même hauteur que la fiche chantier (photo
  `object-fit: cover` déjà en place, elle remplit proprement l'espace au lieu de laisser un vide).

### 7. Espace mort excessif en haut des pages de service (desktop + mobile)
- **Où** : pages de service, `.service-hero`, `assets/css/service-page.css`.
- **Problème** : le `padding-top` de la section ajoutait `var(--header-height)` (72px) **en plus** du
  `padding-top: var(--header-height)` déjà appliqué globalement sur `<body>` pour compenser le header
  fixe → le header était compté deux fois. Résultat : 208px de vide avant le H1 sur mobile (~26% de
  l'écran), 208px également en desktop.
- **Correctif** : suppression du double comptage (`padding-top: var(--space-3xl)` au lieu de
  `calc(var(--header-height) + var(--space-3xl))`). Le vide avant le H1 passe de 208px à 136px sur mobile
  (gain net de ~9% de la hauteur d'écran rendu utile dès l'arrivée sur la page), avec un rendu resserré
  et cohérent en desktop.

### 8. Carte "Zone d'intervention" démesurément haute (desktop)
- **Où** : `zone-desservie-charente.html`, bloc carte + colonne d'infos (`.zone-map-container`),
  `assets/css/zone.css`.
- **Problème** : `align-items: stretch` + `height: 100%` forçait la carte Leaflet à s'étirer à la même
  hauteur que la colonne d'infos à côté (adresse, itinéraire, villes desservies…), qui est naturellement
  très longue → carte mesurée à **1419px de haut**, obligeant à scroller longuement une carte
  essentiellement vide avant d'atteindre le contenu utile en dessous.
- **Correctif** : plafond `max-height: 620px` + `position: sticky` (reste visible pendant que l'utilisateur
  lit la colonne d'infos à côté, au lieu de disparaître immédiatement du fait de sa hauteur excessive).
  Vérifié : le test `npm test` couvrant `aspect-ratio: 16/9` sur cette même classe reste vert (correctif
  scindé dans le media query desktop, la règle mobile testée n'est pas touchée).

## Signalements écartés après vérification (faux positifs)

- **"Le header fixe chevauche les badges de confiance du hero (accueil, desktop)"** : non reproductible à
  une position de scroll stable (vérifié via `getBoundingClientRect` sur `.hero-chips` à plusieurs
  positions de scroll) — l'effet visible dans les captures venait du chevauchement normal et transitoire
  pendant le défilement lui-même (comportement standard d'un header `position: fixed`), pas d'un vrai bug
  au repos.
- **"Grand vide incompréhensible dans le bloc FAQ de l'accueil"** : le DOM confirme les 4 questions
  affichées normalement (`display: block`, espacement standard) ; capture d'écran revérifiée propre —
  artefact de capture (cf. piège documenté dans `docs/code-quality-refactor.md` sur les animations
  "reveal on scroll" qui perturbent les screenshots automatisés).
- Plusieurs autres captures prises pendant cette session sont ressorties **entièrement blanches** du
  pane de preview alors que le DOM confirmait un contenu présent et correctement positionné (vérifié à
  chaque fois par `getBoundingClientRect`/`getComputedStyle` avant de conclure) — glitch de rendu de
  l'outil de capture, pas un bug du site. Toujours vérifier par les styles calculés en cas de doute,
  jamais seulement par une capture d'écran isolée.

## Pistes identifiées, non corrigées (nécessitent une décision produit ou un chantier plus large)

Ces points ne sont **pas** des bugs à corriger en 5 minutes ; ce sont des idées de design à valider avec
vous avant d'y toucher, car elles changent davantage le rendu visuel que les corrections ci-dessus :

1. **Page liste du blog (`blog/index.html`)** : actuellement une colonne unique de grandes cartes
   (image + extrait complet), ~5000px de scroll pour voir les 7 articles. Le carrousel compact de
   l'accueil (petites vignettes, 3-4 cartes visibles) est un bien meilleur pattern de navigation — passer
   à une grille de cartes plus compactes serait un vrai gain, mais c'est une refonte de composant, pas
   une correction ponctuelle.
2. **Icônes emoji dans les filtres du blog** ("🧹 Peinture 🖌️ Façade…") : détonnent avec le reste du site
   qui utilise Font Awesome partout ailleurs. À remplacer par des icônes du même set, à choisir avec vous.
3. **Fil Instagram (accueil)** : le widget affiche des photos qui ne sont pas des chantiers de rénovation
   (ex. un mur de cimetière) mélangées aux photos de façades/toitures. Ce n'est pas un bug de code — c'est
   le contenu publié sur le compte Instagram connecté au widget. À trier côté Instagram si souhaité.
4. **Écart de traitement visuel entre le hero de l'accueil (photo pleine largeur, badges forts) et les
   heros des pages de service (plus plats, texte + petit slider avant/après)** : cohérent avec un choix
   éditorial existant, mais à netteté égale un renfort visuel des heros de service pourrait mieux
   convertir sur ces pages d'atterrissage SEO. Décision produit à valider.
5. **Champs du formulaire de contact** : fond gris plat sans bordure visible, un peu "générique" par
   rapport au reste du design, plus travaillé. Piste de polish mineure, pas urgente.
6. **Coin des guillemets décoratifs des cartes d'avis** : léger chevauchement avec les étoiles en haut à
   droite (desktop). Détail cosmétique mineur.

## Fichiers modifiés

- `assets/css/contact.css` — troncature des noms d'avis
- `assets/css/service-page.css` — carte accent orpheline, hauteur fiche chantier, padding hero mobile
- `assets/css/styles.css` — cartes orphelines services/galerie
- `assets/css/zone.css` — hauteur de la carte Leaflet
- `blog/article.css` — troncature du fil d'Ariane

`npm test` (6 tests) reste vert après ces changements. Aucun commit/push effectué — en attente de votre
validation avant de committer (règle du projet, voir `CLAUDE.md`).
