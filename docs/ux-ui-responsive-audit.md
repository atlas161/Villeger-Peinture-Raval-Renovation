# Audit UX/UI & Responsive — 2026-09-21

Chantier demandé par le client : améliorer significativement l'expérience utilisateur et le rendu
responsive du site, au-delà du chantier "qualité de code" (voir
[`docs/code-quality-refactor.md`](code-quality-refactor.md)) qui portait sur le code sans toucher au
visuel. Ici, contrairement à ce chantier-là, **des changements visuels sont attendus et souhaités**.

Méthode : audit live via navigateur (mobile 375px, tablette ~900px, desktop 1440px) sur la home, une
page de service (`ravalement-facade-angouleme.html`) et lecture du CSS/JS pour les points non visibles
à l'œil (breakpoints, a11y clavier, perf de chargement).

## Priorité 1 — Corrigés dans cette session

1. **Loader plein écran bloquant jusqu'à 9s sur la home** (`assets/js/main.js`) — le spinner de
   chargement (`#page-loader`) n'est retiré qu'une fois la vidéo Vimeo du hero prête, avec un timeout de
   secours à **9000ms**. Sur mobile/4G, un visiteur peut fixer un écran de chargement plusieurs secondes
   avant de voir le moindre contenu. Impact direct sur le taux de rebond et le Core Web Vital LCP.
   **→ Réduit à 2.5s.**
2. **Titre du hero trop grand sur petit mobile** (`assets/css/hero.css` `.hero-title` pour la home,
   `assets/css/service-page.css` `.service-hero h1` pour les 5 pages de service) — planchers de police
   de 44.8px et 40px respectivement. Sur un iPhone SE/mini (375px et moins), le H1 se retrouve sur 5-6
   lignes et repousse le CTA principal très bas, avant même que le visiteur ait vu l'appel à l'action.
   **→ Planchers abaissés (1.9rem), pente et plafond conservés à l'identique : aucun changement vérifié
   sur tablette (768px) et desktop (1440px).**
3. **Paragraphe éclaté en colonnes indépendantes** (`assets/css/zone.css`, `.zone-note p`) — bug réel
   (pas un artefact de capture), confirmé en inspectant le CSS et en le voyant se reproduire à l'identique
   sur `zone-desservie-charente.html` mobile ET desktop. `.zone-note p` était en `display: flex`, ce qui
   transformait chaque nœud de texte brut autour de l'icône et du lien `<a>` en item flex indépendant
   (largeur "fit-content"), au lieu de laisser le paragraphe passer à la ligne normalement. Résultat : le
   texte de la note (icône outil + "Pour un [lien] ravalement de façade, nous intervenons...") s'affichait
   en colonnes étroites façon tableau au lieu d'un paragraphe qui s'enroule sur toute la largeur. Trace de
   ce même bug déjà rencontré : `mentions-legales.html` avait un `style="display:block"` inline sur son
   `.zone-note p` pour le contourner localement. **→ Corrigé à la source : icône en `float: left` au lieu
   de flex sur le `<p>`, donc plus aucun impact sur la structure du texte quel que soit son contenu.**
   Vérifié sur `zone-desservie-charente.html` (mobile + desktop) et sur la note "Autre localité ?" de la
   home ; `mentions-legales.html` non revérifié visuellement mais son override inline reste compatible
   (devenu redondant, sans effet néfaste).

## Priorité 2 — À corriger, proposé pour une prochaine étape (changement visuel, à valider avec vous)

3. **Incohérence des breakpoints entre fichiers CSS** : `responsive.css` ne définit que 480px/768px,
   mais `styles.css`, `contact.css`, `hero.css`, `zone.css`, `faq.css` utilisent chacun leurs propres
   seuils (420, 480, 640, 767, 768, 769, 859, 860, 991, 992, 1023, 1024, 1200...). Les paires
   complémentaires (768/769, 991/992) évitent les trous les plus visibles, mais le manque de seuils
   partagés rend le responsive fragile à maintenir et augmente le risque de composants qui basculent à
   des largeurs différentes d'un fichier à l'autre. Recommandation : définir 3-4 breakpoints officiels
   (ex. 480 / 768 / 992 / 1200) dans une seule source de vérité (variables CSS ou commentaire en tête de
   `responsive.css`) et migrer progressivement les fichiers.
4. **Paragraphes centrés sur mobile** (pages de service, ex. cartes "Devis 100% Gratuit") — du texte de
   plusieurs lignes centré est plus difficile à lire qu'aligné à gauche. À vérifier si c'est un choix de
   design assumé ou un effet de bord de l'extraction de styles inline faite pendant le chantier qualité.
5. **9 des 11 images de la home ont `loading="lazy"`, 2 n'en ont pas** — à vérifier si ce sont bien les
   images above-the-fold (où `lazy` serait contre-productif) ; sinon, ajouter l'attribut pour réduire le
   poids initial sur mobile.

## Priorité 1 bis — Audit clavier du menu burger (corrigé)

4. **Focus qui pouvait "s'échapper" derrière le menu mobile ouvert** (`assets/js/main.js`,
   `assets/js/footer.js`) — le menu mobile plein écran (`.primary-nav.open`) est un overlay
   `position: fixed` par-dessus tout le reste de la page, mais rien n'empêchait un utilisateur clavier de
   continuer à tabuler dans `#main-content` et le footer (`#site-footer-wrapper`, contenant aussi la
   bannière cookies), invisibles derrière l'overlay. Un utilisateur au clavier pouvait donc perdre le
   focus sur un lien qu'il ne voit plus à l'écran. **→ Corrigé avec l'attribut natif `inert`** : posé sur
   `#main-content` et `#site-footer-wrapper` à l'ouverture du menu (et retiré à la fermeture, par le
   bouton, Escape ou un clic sur un lien), ce qui rend tout leur contenu ignoré par Tab/lecteur d'écran
   tant que le menu est ouvert. Le footer n'ayant pas d'`id` avant ce correctif (juste un `<div>`
   générique ajouté par `footer.js`), un `id="site-footer-wrapper"` lui a été ajouté pour pouvoir le
   cibler.
5. **`aria-label` du bouton burger figé sur "Ouvrir le menu"** même une fois le menu ouvert — seul
   `aria-expanded` changeait. **→ Le label bascule maintenant entre "Ouvrir le menu" et "Fermer le
   menu"** selon l'état, en plus de `aria-expanded` (déjà correct).

Vérifié en JS (`aria-expanded`, `aria-label`, présence de `inert`) à l'ouverture et à la fermeture
(bouton + Escape), et visuellement (aucun changement d'apparence, l'icône burger s'anime toujours en
croix comme avant).

**Reste du site déjà solide côté clavier**, vérifié par lecture du code : tous les boutons/icônes
interactifs trouvés (`blog-carousel-btn`, `share-btn`, filtres FAQ/blog, "Tout déplier/replier") sont de
vrais `<button>`/`<a>` natifs avec `aria-label`, donc focusables et activables au clavier sans JS
supplémentaire. Un `:focus-visible` global (`styles.css`) et un lien "aller au contenu" (`.skip-to-content`)
existent déjà. Seul point non corrigé, mineur et hors scope de cette passe : la **modale des réglages
cookies** (`#cookie-settings-modal` dans `includes/footer.html`) n'a pas de piège à focus ni de fermeture
au clavier (Escape) — même famille de problème que le menu burger, mais un cas d'usage beaucoup plus rare
(elle ne s'ouvre que si l'utilisateur clique explicitement sur "Paramètres" dans le bandeau cookies).

## Priorité 1 ter — Cibles tactiles trop petites (corrigé)

Mesure en direct (`getBoundingClientRect`) des petits boutons icône sur mobile (375px), la même liste
que celle des boutons concernés par le hack `border-radius` documenté dans
`code-quality-refactor.md` :

| Bouton | Avant | Après | Page |
|---|---|---|---|
| `.burger` (menu principal) | 40×40 | 44×44 | toutes |
| `.reviews-btn` (avis Google, home) | 40×40 | 44×44 | home |
| `.share-btn` (partage article) | 40×40 | 44×44 | blog/article |
| `.article-nav-btn` (nav article précédent/suivant) | 40×40 | 44×44 | blog/article |
| `.faq-filter-btn` (filtres catégorie FAQ) | largeur variable × **37** | idem × **44** | FAQ |

44×44 = recommandation Apple HIG / WCAG 2.5.5 (AAA). Tout était déjà **conforme WCAG 2.5.8 (AA)**, qui
exige seulement 24×24 minimum — donc pas un bug d'accessibilité au sens strict, mais un vrai risque de
mauvaise manipulation sur mobile pour des contrôles très utilisés (le burger en particulier).

Non touchés (déjà bons) : `.filter-btn` du blog (déjà `min-height: 44px`, voire 48px sur mobile — un
commentaire dans le CSS d'origine montre que c'était déjà pensé), `.blog-carousel-btn` (44×44, masqué sur
mobile ≤768px donc non concerné), boutons "Tout déplier/replier" (43px, jugé suffisamment proche de 44
pour ne pas justifier une retouche).

**Piège trouvé en creusant `.share-btn`** : `assets/css/blog.css` définit `.share-btn` à 44×44, mais sur
les pages d'article c'est en réalité `blog/article.css` (fichier différent, chargé en dernier) qui
s'applique et qui définissait 40×40 sans condition — la règle mobile de `responsive.css` qui semblait
être la cause était en fait déjà sans effet (écrasée par `blog/article.css` chargé après elle). Les deux
fichiers ont été corrigés pour rester cohérents.

Vérifié visuellement (aucun chevauchement, les 5 boutons de partage tiennent toujours sur une ligne, le
burger ne déborde pas du header) et par nouvelle mesure JS après correctif (tous à 44×44/44 de haut).
`npm test` toujours vert.

## Priorité 1 quater — Audit perf images (corrigé)

Bonne surprise de départ : l'essentiel du site est déjà bien optimisé (images de services et la
majorité des articles de blog en WebP, `srcset`/`sizes` corrects, `loading="lazy"` partout sauf le
above-the-fold, `fetchpriority="high"` sur l'image LCP, conteneurs avec `aspect-ratio`/hauteur fixe en
CSS donc pas de CLS malgré l'absence d'attributs `width`/`height` HTML sur certaines images). Trois vrais
problèmes trouvés et corrigés :

1. **3 images d'articles de blog servies en pleine taille, sans `srcset`** — `bienfait_peinture_ext (1).webp`
   (920 Ko), `hydrogommage_.webp` (933 Ko) et `image_renovation_interieur_angouleme.webp` (690 Ko) étaient
   utilisées telles quelles comme image hero (`loading="eager" fetchpriority="high"` — donc traitées comme
   LCP !) **et** comme vignette sur `/blog/`, sans aucune version redimensionnée. Cause racine :
   `scripts/build-blog.js` génère automatiquement le `srcset` en vérifiant si des fichiers
   `<image>-400w/600w/800w/1200w.webp` existent à côté de l'image source déclarée dans le frontmatter —
   ces 3 articles (les plus récents, 2026-03-23 et 2026-03-25) n'avaient jamais eu leurs variantes
   générées, contrairement aux autres. **→ Variantes générées avec `sharp`** (mêmes réglages que le
   reste du site : 400/600/800/1200px, qualité 78, recadrage 16:9 avec `position: attention`), puis
   `npm run build:blog` relancé pour régénérer les pages. Résultat : l'image réellement chargée passe de
   690-933 Ko à **12-127 Ko** selon le contexte (jusqu'à 90%+ de réduction). Vérifié par lecture du HTML
   généré + `performance.getEntriesByType('resource')` dans le navigateur (les 3 images chargent bien une
   variante `-Xw`, plus jamais le fichier plein format) et visuellement (rendu identique).
2. **Logo `media/VPRR-LOGO.svg` non optimisé (128 Ko)** — export vectoriel brut (91 `<path>`, précision
   décimale excessive), chargé sur **chaque page** du site (header + écran de chargement + fond du menu
   mobile). **→ Passé à `npx svgo --multipass`** : 128 Ko → 54 Ko (-57%), rendu vérifié pixel-identique
   par comparaison ouvert côte à côte dans le navigateur avant remplacement.
3. **Favicon SVG de 348 Ko** (`media/favicon/favicon.svg`) — en l'ouvrant, ce n'est pas un vrai vecteur
   mais une image raster encodée en base64 et enrobée dans une balise `<svg><image>` : SVGO ne trouve
   rien à optimiser (0% de gain), et ce fichier n'apporte aucun bénéfice vectoriel. Un jeu de favicons PNG
   correctement dimensionnés (16/32/96px) était déjà déclaré juste avant dans le `<head>` de chaque page.
   **→ Retiré la balise `<link rel="icon" type="image/svg+xml">` sur les 11 pages HTML** (fichier laissé
   en place sur le disque, juste dé-référencé - plus aucun navigateur ne le téléchargera). Vérifié que
   `site.webmanifest` ne le référence pas non plus.

**Piège annexe trouvé en vérifiant le rendu du logo optimisé sur le menu mobile, corrigé dans la foulée** :
le logo décoratif en fond du menu (`.primary-nav::before`, `height: 40px` en CSS) s'affichait en réalité
sur une hauteur quasi nulle (`0.8125px` mesuré en `getComputedStyle`) - quasiment invisible. Cause :
`.primary-nav` est un flex column avec `overflow-y: auto` ; quand la liste de liens + le CTA dépassent la
hauteur du viewport (menus avec beaucoup d'items, ou petits écrans), la spec CSS force `min-height: auto`
à `0` pour les enfants flex d'un conteneur dont l'`overflow` n'est pas `visible` - ce pseudo-élément
décoratif (`content: ''`, donc sans contenu réel) n'avait rien pour résister au rétrécissement et se
faisait quasiment écraser au lieu de passer sous scroll comme prévu. Même souci potentiel sur
`.primary-nav::after` (le texte "Angoulême • Charente" en bas du menu). **→ `flex-shrink: 0` ajouté aux
deux**, pour qu'ils gardent toujours leur taille et que ce soit le `overflow-y: auto` qui prenne le relais
si le contenu dépasse. Vérifié à 375×812 (logo net et net) et à 375×500 pour simuler un petit écran/mode
paysage (logo toujours net, le reste du menu défile normalement, rien de cassé).

`scripts/optimize-hero.js` (génère les variantes responsives via `sharp`) référençait un dossier
`media/blog/` qui n'existe plus (les images sont dans `assets/img/blog/` depuis une réorganisation) - le
script aurait planté s'il avait été relancé. **Corrigé + les 3 images ci-dessus ajoutées à sa liste de
tâches**, pour que la prochaine réorganisation d'images blog n'ait pas à redécouvrir ce problème.

`npm run build:blog` régénère aussi `sitemap.xml` (dates `lastmod` + `<image:loc>` mis à jour vers les
nouvelles variantes) et `blog/articles.json` - changements attendus, pas des effets de bord.

## Priorité 2 — Incohérence des breakpoints CSS : analyse (pas de correctif ce round)

Creusé plus en détail avant de me lancer dans une réécriture : **les seuils différents ne sont pas des
bugs, mais des choix délibérés par composant**, et une "harmonisation" en dur serait un chantier lourd et
risqué pour un bénéfice purement cosmétique/maintenance :
- Les paires qui coexistent dans un même fichier sont complémentaires et correctes (ex.
  `styles.css` : `.svc-grid` en `max-width: 767px` + `.svc-card` en
  `min-width: 768px and max-width: 1023px` → aucun trou, aucun chevauchement).
- Les seuils "atypiques" (`420px` dans `hero.css`, `380px` dans `zone.css`) sont des réglages fins
  intentionnels pour les très petits mobiles, pas des copier-coller oubliés.
- Réécrire tous les seuils vers un jeu "officiel" (480/768/992/1200) changerait le pixel exact où
  chaque composant bascule sur **10 pages** sans aucun outil de comparaison visuelle automatisé sur ce
  projet (site statique, pas de suite de tests visuels) — le risque de régression invisible dépasse le
  bénéfice pour un site qui fonctionne déjà correctement à tous les breakpoints testés.

**Recommandation : ne pas faire de réécriture globale.** Garder la convention 480/768/992/1200 pour tout
**nouveau** CSS (déjà notée plus haut), et n'unifier un seuil existant que ponctuellement, quand on touche
de toute façon le composant concerné pour une autre raison — jamais comme chantier dédié isolé.

## Pages vérifiées cette session (mobile 375px, plus tablette/desktop pour les points corrigés)

Home, `ravalement-facade-angouleme.html`, `zone-desservie-charente.html` (carte Leaflet incluse),
`faq-renovation-angouleme.html` (accordéons testés en JS : fonctionnent, le `<details>/<summary>` natif
est correct et accessible clavier — un clic simulé par l'outil de test s'est révélé peu fiable après un
scroll, sans rapport avec un bug du site), `blog/` (liste + un article), `merci.html`, `404.html`. Aucune
anomalie structurelle trouvée sur ces pages au-delà des points listés ci-dessus.

**Piège d'outillage rencontré plusieurs fois cette session** : les captures d'écran prises juste après un
`scroll`/`navigate` (avant que le rendu soit stabilisé) produisent parfois un rendu en damier/dupliqué qui
n'existe pas réellement sur la page (confirmé à chaque fois via `document.documentElement.scrollWidth`
== `window.innerWidth`, donc pas de vrai débordement horizontal). Toujours revérifier par une seconde
capture après un `wait`, ou par `getComputedStyle`/`scrollWidth`, avant de conclure à un bug visuel — cf.
piège similaire déjà documenté dans `code-quality-refactor.md` pour Playwright.

## Ce qu'il reste à auditer (prochaine session)

- Les 4 dernières pages de service (`nettoyage-facade-angouleme.html`,
  `nettoyage-toiture-angouleme.html`, `peinture-exterieure-charente.html`,
  `isolation-interieure-charente.html`) ont été vérifiées en mobile (hero + sections "problème") : le
  correctif du plancher de police s'applique bien partout (H1 sur 2-3 lignes, plus 5-6), aucune anomalie
  trouvée. Vérification limitée au scroll visuel, pas un passage exhaustif section par section comme pour
  `ravalement-facade-angouleme.html`.
- Taille des cibles tactiles (zones cliquables) des petits boutons icône (`.share-btn`, `.filter-btn`,
  `.blog-carousel-btn`) — non mesurée précisément cette session, à vérifier avec `getComputedStyle`
  (cible WCAG : 44×44px mini).
- Audit clavier complet (tab order, focus visible sur tous les composants interactifs — menu burger,
  carrousel blog, filtres galerie).
- Audit perf images (poids/format, dimensions servies vs affichées) mentionné comme piste dans
  `code-quality-refactor.md` et jamais fait.
- Hiérarchie visuelle et densité d'information sur les pages de service en desktop large (>1440px) — non
  vérifié.
- Revérifier visuellement `mentions-legales.html` (sommaire `.zone-note`) suite au correctif du point 3.

## Repères

- **Piège hérité du chantier qualité** (`code-quality-refactor.md`) : ne pas oublier la règle CSS
  globale `*[style*="border-radius"]` dans `styles.css` qui force 12px sur tout élément ayant un
  `border-radius` inline — reste valable ici si on retouche des styles inline.
- Ce chantier-ci **autorise le changement visuel** (contrairement au chantier qualité de code) — mais
  toujours commit/push seulement après validation explicite du client (règle `CLAUDE.md`).
