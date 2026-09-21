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
2. **Titre du hero trop grand sur petit mobile** (`assets/css/hero.css`, `.hero-title`) —
   `font-size: clamp(2.8rem, 5.8vw, 4.75rem)` a un plancher de 44.8px. Sur un iPhone SE/mini (375px et
   moins), le H1 se retrouve sur 5-6 lignes et repousse le CTA principal très bas, avant même que le
   visiteur ait vu l'appel à l'action. Vérifié en direct sur la page ravalement.

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

## Ce qu'il reste à auditer (prochaine session)

- Pages non vérifiées en détail cette session : `zone-desservie-charente.html` (carte Leaflet sur
  mobile), `faq-renovation-angouleme.html`, le blog (liste + article), `merci.html`, `404.html`.
- Taille des cibles tactiles (zones cliquables) des petits boutons icône (`.share-btn`, `.filter-btn`,
  `.blog-carousel-btn`) — non mesurée précisément cette session, à vérifier avec `getComputedStyle`
  (cible WCAG : 44×44px mini).
- Audit clavier complet (tab order, focus visible sur tous les composants interactifs — menu burger,
  accordéons FAQ, carrousel blog, filtres galerie).
- Audit perf images (poids/format, dimensions servies vs affichées) mentionné comme piste dans
  `code-quality-refactor.md` et jamais fait.
- Hiérarchie visuelle et densité d'information sur les pages de service en desktop large (>1440px) — non
  vérifié.

## Repères

- **Piège hérité du chantier qualité** (`code-quality-refactor.md`) : ne pas oublier la règle CSS
  globale `*[style*="border-radius"]` dans `styles.css` qui force 12px sur tout élément ayant un
  `border-radius` inline — reste valable ici si on retouche des styles inline.
- Ce chantier-ci **autorise le changement visuel** (contrairement au chantier qualité de code) — mais
  toujours commit/push seulement après validation explicite du client (règle `CLAUDE.md`).
