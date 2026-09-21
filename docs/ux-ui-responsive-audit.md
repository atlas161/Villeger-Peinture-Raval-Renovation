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
