# Logo — variante B2 (**abandonnée** au profit de B1)

> **Remplacé par [`logo-b1.md`](./logo-b1.md)** (2026-10-01) : le client a finalement préféré B1 (porte agrandie, pas allongée), avec les finitions
> de la porte corrigées. Ce fichier est conservé comme historique.

**Statut** : jamais déployée. En production : le **logo d'origine** (`media/VPRR-LOGO.svg`, `<img class="logo-img">`).

## Décision

- Le client veut « Villéger Peinture Ravalement Rénovation » écrit en clair (pas « VPRR ») à côté de la porte.
- Mise en page retenue : **B = quatre lignes empilées** comme l'original (Villéger / Peinture / Ravalement /
  Rénovation), initiales **V, P, R, R** en brun gras.
- **Porte B2** = porte **allongée** (plus haute et plus fine), **à la même hauteur que le bloc de texte**.
- Thème clair uniquement.

## Fichiers de référence

| Fichier | Rôle |
|---|---|
| [`logo-b2-door.svg`](./logo-b2-door.svg) | La porte B2 seule, SVG autonome (viewBox `0 7 64 105`, ≈ 1 Ko) |
| [`logo-b2-preview.html`](./logo-b2-preview.html) | Maquette ouvrable dans un navigateur : ancienne porte, B1 (agrandie) et B2 (allongée), en-tête desktop / 375 px / 320 px / grand, avec repères d'alignement |
| [`../../media/VPRR-LOGO.svg`](../../media/VPRR-LOGO.svg) | Logo d'origine (en production) — à conserver pour le JSON-LD, les réseaux et l'impression |

## Spécification

- **Porte B2** : arche en pierre (voussoirs + clé de voûte), 4 rangées de joints sur chaque jambage, porte brune
  `#673A12` avec imposte vitrée `#FAF8F5`, 4 planches, poignée `#D9C4A1`, seuil `#A8946F`. Pierre `#CDBB9B`, joints `#A8946F`.
- **Proportions** : largeur 64 × hauteur 105 (≈ 4:7). Le dessin de départ (porte « courte », 2:3) est rogné de 7 unités en haut
  (vide au-dessus de l'arche).
- **Texte** : police du site (Inter), 4 lignes, `font-size = 0,27 × H`, interligne `1`, espace entre lignes `0,035 × H`,
  poids 600, couleur `--color-text-light`, initiales en `--color-primary` poids 700. `H` = variable `--logo-h`.
- **Alignement** : la porte fait `1,111 × H` de haut, le bloc de texte `1,185 × H` ; la porte est centrée, donc 4 px de marge
  en haut et en bas pour H = 110 : elle va **du haut du « V » au bas de « Rénovation »** (hauteur des lettres, pas de la boîte).
  Mesuré dans Chromium : porte 122 px / texte 130 px pour H = 110.
- **Tailles conseillées** : `--logo-h` = 54 px (ordinateur, en-tête 72 px), 42 px (≤ 991 px, en-tête 60 px),
  40 px (≤ 359 px, avec `gap: 8px`). À 48 px sur téléphone il faudrait passer l'en-tête de 60 à 68 px.

## Code prêt à appliquer

**1. Balisage** (à mettre dans `scripts/sync-header.js` → `generateHeader`, `scripts/template-article.html` et `404.html`,
à la place du `<img class="logo-img">`) :

```html
<a href="${logoHref}" class="logo" aria-label="Villéger Peinture Ravalement Rénovation - Accueil">
  <svg class="logo-mark" viewBox="0 7 64 105" aria-hidden="true" focusable="false">
  <path d="M3 110V36a29 29 0 0 1 58 0v74z" fill="#CDBB9B"/>
  <path d="M3 52h10M3 67h10M3 82h10M3 97h10M51 52h10M51 67h10M51 82h10M51 97h10" stroke="#A8946F" stroke-width="1.3"/>
  <path d="M8.2 28.5l7.6 3.3M13.4 19.2l6.6 5.6M21.4 11.2l4.6 7.4M38 18.6l4.6-7.4M44 24.8l6.6-5.6M48.2 31.8l7.6-3.3" stroke="#A8946F" stroke-width="1.3"/>
  <path d="M28 8.2h8l1.3 10.6h-10.6z" fill="#BFA97F"/>
  <path d="M13 110V38a19 19 0 0 1 38 0v72z" fill="#673A12"/>
  <path d="M16 41a16 16 0 0 1 32 0z" fill="#FAF8F5"/>
  <path d="M32 41V25M32 41l-11-11M32 41l11-11" stroke="#673A12" stroke-width="1.8" fill="none"/>
  <rect x="13" y="41" width="38" height="3" fill="#522E0E"/>
  <path d="M22.5 46v64M32 46v64M41.5 46v64" stroke="#4A260B" stroke-width="1.3"/>
  <circle cx="45.5" cy="80" r="1.9" fill="#D9C4A1"/>
  <rect x="1" y="109" width="62" height="3" rx="1" fill="#A8946F"/>
  </svg>
  <span class="logo-text" aria-hidden="true">
    <span class="logo-line"><b>V</b>illéger</span>
    <span class="logo-line"><b>P</b>einture</span>
    <span class="logo-line"><b>R</b>avalement</span>
    <span class="logo-line"><b>R</b>énovation</span>
  </span>
</a>
```

**2. CSS** (remplace le bloc `.logo-img` de `assets/css/styles.css` et les deux `.logo-img` de `assets/css/responsive.css`) :

```css
.logo {
  --logo-h: 54px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--color-primary);
  text-decoration: none;
  transition: opacity var(--duration-fast) var(--ease-out);
}
.logo:hover { opacity: 0.85; }
.logo-mark { display: block; flex: none; height: calc(var(--logo-h) * 1.111); width: auto; }
.logo-text { display: flex; flex-direction: column; gap: calc(var(--logo-h) * 0.035); line-height: 1; }
.logo-line {
  font-size: calc(var(--logo-h) * 0.27);
  font-weight: var(--font-weight-semibold);
  letter-spacing: -0.005em;
  color: var(--color-text-light);
  white-space: nowrap;
}
.logo-line b { font-weight: var(--font-weight-bold); color: var(--color-primary); }
@media (max-width: 991px) { .logo { --logo-h: 42px; } }
@media (max-width: 359px) { .logo { --logo-h: 40px; gap: 8px; } }
```

**3. À ne pas oublier** : dans le menu mobile (`assets/css/styles.css`, bloc `@media (max-width: 991px)`), `.logo` a déjà
`position: relative; z-index: 1100` (le logo reste visible au-dessus du panneau). Retirer le
`<link rel="preload" href="media/VPRR-LOGO.svg">` de `index.html` et de `scripts/templates/service-page.html`, puis
`npm run sync:header && npm run build && npm test` et vérifier à 320 / 375 / 768 / 1440 px.

## Historique et autres pistes étudiées (2026-10-01)

| Variante | Description | Sort |
|---|---|---|
| **A** | 2 lignes : « Villéger » gras + « Peinture Ravalement Rénovation » petit dessous (initiales en brun), porte 2:3 | **Mise en ligne quelques heures** (commit `a261fe1`), puis retirée. Texte du bas petit (11 px). |
| **B** | 4 lignes empilées, comme l'original | **Retenue** (le client la préfère) |
| **B1** | B avec la porte courte agrandie à la hauteur du texte (plus large) | Écartée |
| **B2** | B avec la porte **allongée** à la hauteur du texte | **Choisie** — documentée ici |
| **C** | « Villéger Peinture » gras + « Ravalement · Rénovation » en or foncé | Non retenue |
| **D** | « VILLÉGER » en capitales espacées + filet doré + « PEINTURE · RAVALEMENT · RÉNOVATION » | Non retenue (trop large sur téléphone) |

Maquettes interactives (liens privés de la session de travail, peuvent expirer) : comparatif des 4 variantes
<https://claude.ai/artifact/5tLwPo9tK3oDPpRmYTMLiR>, porte alignée B1 / B2 <https://claude.ai/artifact/Hb3fBVp3U65cJpmipfJ9T7>,
propositions générales (palette, boutons, logo, menu mobile, footer) <https://claude.ai/artifact/Q7VLRKz1DVFX7WZySbZ3Lx>.
La copie locale et durable de la maquette B1/B2 est [`logo-b2-preview.html`](./logo-b2-preview.html).
