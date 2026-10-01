# Logo — variante B1, porte aux finitions corrigées (retenue, **en attente de validation client**)

**Statut (2026-10-01)** : c'est la direction **actuelle**. Le client (Stéphane Villéger) doit encore valider le PDF
[`VPRR-proposition-logo.pdf`](./VPRR-proposition-logo.pdf). **Rien de ce logo n'est en production** : le site affiche toujours le
logo d'origine (`media/VPRR-LOGO.svg`, `<img class="logo-img">`). **Ne pas l'appliquer sans un « OK » explicite de l'utilisateur**
(qui transmettra la validation du client). Ce document remplace [`logo-b2.md`](./logo-b2.md) (B2, abandonnée au profit de B1).

## Décisions prises (dans l'ordre)

1. « Villéger Peinture Ravalement Rénovation » écrit en toutes lettres à côté de la porte (jamais « VPRR »), thème clair.
2. Mise en page **B** : 4 lignes empilées comme l'original, initiales **V, P, R, R** en brun gras.
3. **B1** (porte courte agrandie à la hauteur du texte) préférée à B2 (porte allongée) par le client.
4. **Alignement validé** : la porte va **du haut du « V » de Villéger au bas du « R » de Rénovation**, taille OK.
5. **Porte** : on garde le dessin actuel, simple, **sans aucun ajout** ; on corrige seulement les finitions (voir plus bas). Le client a
   écarté les propositions « pierres appareillées » et « porte à panneaux ».

## Fichiers de référence

| Fichier | Rôle |
|---|---|
| [`door-b1.svg`](./door-b1.svg) | La porte B1 seule, SVG autonome (cadre `0 7 64 89`, ≈ 1,2 Ko) |
| [`logo-b1-preview.html`](./logo-b1-preview.html) | Page avant / après (porte actuelle vs corrigée, zoom arche + vitrage, logo en en-tête desktop / téléphone / grand) |
| [`VPRR-proposition-logo.pdf`](./VPRR-proposition-logo.pdf) | **PDF à transmettre au client** (1 page A4, sans texte explicatif ni mention d'outil, métadonnées vidées) |
| [`logo-client-proposal.html`](./logo-client-proposal.html) | Source du PDF (police Inter et logo d'origine embarqués). Régénération : ouvrir dans Chromium → imprimer en PDF A4 sans marges, arrière-plans activés. |
| [`logo-b2.md`](./logo-b2.md), [`logo-b2-door.svg`](./logo-b2-door.svg), [`logo-b2-preview.html`](./logo-b2-preview.html) | Historique B2 (abandonnée) |
| [`../../media/VPRR-LOGO.svg`](../../media/VPRR-LOGO.svg) | Logo d'origine (en production ; à garder pour JSON-LD, réseaux, impression) |

## Corrections de la porte (par rapport à l'actuelle)

| # | Défaut | Correction |
|---|---|---|
| 1 | Joints de l'arche flottants (ne touchaient ni le bord de l'ouverture ni le bord extérieur) | 3 joints de chaque côté (±30°, ±52°, ±74°), de l'**ouverture jusqu'au bord extérieur**. Même couleur `#A8946F`, même épaisseur 1,3 |
| 2 | Clé de voûte = trapèze détaché | Coin de pierre `#BFA97F` (±8°) qui va d'un bord à l'autre de l'arche, avec ses deux joints |
| 3 | Vitrage : cadre épais en haut (6) et fin sur les côtés (3) ; barreaux en biais qui s'arrêtaient avant le cadre | Vitrage **concentrique** à l'ouverture (rayon 14,5, cadre régulier de 4,5) ; 3 barreaux (1 vertical + 2 à 45°) depuis le même point, étendus dans le cadre puis recouverts par l'anneau brun : ils finissent **pile** dans le cadre |
| 4 | Planches séparées de la traverse par un petit vide | Elles partent du bas de la traverse (y = 44) |

**Inchangé** : couleurs (pierre `#CDBB9B`, porte `#673A12`, traverse `#522E0E`, planches `#4A260B`, vitrage `#FAF8F5`, poignée `#D9C4A1`),
silhouette (arche extérieure centre (32,36) rayon 29 ; ouverture centre (32,38) rayon 19), 3 planches, poignée ronde, 3 joints de
jambage de chaque côté, seuil.

Effet de bord à connaître : le cadre du vitrage est un peu plus fin en haut (4,5 au lieu de 6) et un peu plus épais sur les côtés (4,5 au lieu de 3).

## Spécification du logo (mesurée avec la vraie police Inter du site)

- **Texte** : Inter, 4 lignes, `font-size = 0,27 × H`, interligne `1`, espace entre lignes `0,035 × H`, poids 600, couleur `--color-text-light`,
  initiales en `--color-primary` poids 700. `H` = variable `--logo-h`.
- **Porte** : hauteur `1,109 × H`, **calée en haut** (`align-self: flex-start; margin-top: 0,027 × H`). Pour H = 110 : lettres de la
  ligne 3 (haut du V) à la ligne 124 (bas du R) dans un bloc de 130 px ; porte sur les mêmes lignes.
- **Écart porte / lettres mesuré** (pixels, anti-crénelage compris) : grand H = 110 → 0 haut / 1 bas ; en-tête ordinateur H = 54 → 1 / 0 ;
  téléphone H = 46 → 1 / 1 ; très petit écran H = 44 → 0 / 0.
- **Tailles conseillées** : `--logo-h` = 54 px (ordinateur, en-tête 72 px), 44 px (≤ 991 px, en-tête 60 px), 40 px (≤ 359 px, `gap: 8px`).

## Code prêt à appliquer (uniquement après validation)

**1. Balisage** (à mettre dans `scripts/sync-header.js` → `generateHeader`, `scripts/template-article.html` et `404.html`, à la place de `<img class="logo-img">`) :

```html
<a href="${logoHref}" class="logo" aria-label="Villéger Peinture Ravalement Rénovation - Accueil">
  <svg class="logo-mark" viewBox="0 7 64 89" aria-hidden="true" focusable="false">
    <path d="M3 94V36a29 29 0 0 1 58 0v58z" fill="#CDBB9B"/>
    <path d="M3 52h10M3 67h10M3 82h10M51 52h10M51 67h10M51 82h10" stroke="#A8946F" stroke-width="1.3"/>
    <path d="M29.77 22.16L27.96 7.28A29 29 0 0 1 36.04 7.28L34.23 22.16z" fill="#BFA97F"/>
    <path d="M41.50 21.55L46.50 10.89M46.97 26.30L54.85 18.15M50.26 32.76L59.88 28.01M22.50 21.55L17.50 10.89M17.03 26.30L9.15 18.15M13.74 32.76L4.12 28.01M29.36 19.18L27.96 7.28M34.64 19.18L36.04 7.28" stroke="#A8946F" stroke-width="1.3" fill="none"/>
    <path d="M13 94V38a19 19 0 0 1 38 0v56z" fill="#673A12"/>
    <path d="M17.5 41V38a14.5 14.5 0 0 1 29.0 0V41z" fill="#FAF8F5"/>
    <path d="M32 41V22.50M32 41L19.36 28.36M32 41L44.64 28.36" stroke="#673A12" stroke-width="1.8" fill="none"/>
    <path fill-rule="evenodd" d="M13 41V38a19 19 0 0 1 38 0V41zM17.5 41V38a14.5 14.5 0 0 1 29.0 0V41z" fill="#673A12"/>
    <rect x="13" y="41" width="38" height="3" fill="#522E0E"/>
    <path d="M22.5 44v50M32 44v50M41.5 44v50" stroke="#4A260B" stroke-width="1.3"/>
    <circle cx="45.5" cy="72" r="1.9" fill="#D9C4A1"/>
    <rect x="1" y="93" width="62" height="3" rx="1" fill="#A8946F"/>
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
.logo-mark {
  display: block;
  flex: none;
  height: calc(var(--logo-h) * 1.109);
  width: auto;
  align-self: flex-start;
  margin-top: calc(var(--logo-h) * 0.027);
}
.logo-text { display: flex; flex-direction: column; gap: calc(var(--logo-h) * 0.035); line-height: 1; }
.logo-line {
  font-size: calc(var(--logo-h) * 0.27);
  font-weight: var(--font-weight-semibold);
  letter-spacing: -0.005em;
  color: var(--color-text-light);
  white-space: nowrap;
}
.logo-line b { font-weight: var(--font-weight-bold); color: var(--color-primary); }
@media (max-width: 991px) { .logo { --logo-h: 44px; } }
@media (max-width: 359px) { .logo { --logo-h: 40px; gap: 8px; } }
```

**3. Étapes** : appliquer le balisage et le CSS ; dans le menu mobile (`styles.css`, `@media (max-width: 991px)`), `.logo` a déjà
`position: relative; z-index: 1100` (le logo reste visible au-dessus du panneau ouvert) ; retirer `<link rel="preload" href="media/VPRR-LOGO.svg">`
de `index.html` et de `scripts/templates/service-page.html` ; `npm run sync:header && npm run build && npm test` ; vérifier à 320 / 375 / 768 / 1440 px
**avec la vraie police Inter** et mesurer l'alignement porte / lettres (voir ci-dessous) ; mettre à jour `docs/changelog.md`, `docs/roadmap.md`,
`CLAUDE.md` (ligne « Logo ») ; commit, puis push sur `main` après accord.

## Pièges rencontrés (à ne pas refaire)

1. **`<use>` d'un `<symbol>` dans un `<svg>` dont le `viewBox` est différent** : le symbole est réduit et décalé (la porte était 8 % trop petite et remontée,
   donc « pas alignée en bas »). Dans le site, mettre les chemins **directement** dans le `<svg viewBox="0 7 64 89">` (comme ci-dessus), pas via `<use>`.
   Dans une maquette qui réutilise un symbole : `<use href="#id" width="64" height="89">` avec un `viewBox` du `<svg>` à `0 0 64 89`.
2. **Mesurer avec la vraie police** : dans le bac à sable, Google Fonts est bloqué et la police de secours a d'autres métriques. Charger
   `assets/fonts/inter-latin.woff2` (en base64) avant de mesurer.
3. **Aligner sur l'encre des lettres, pas sur la boîte de texte** : avec `line-height: 1`, haut du V ≈ `0,027 × H`, bas du R ≈ `1,136 × H`.
4. **PDF client** : les champs « Creator » et « Producer » indiquent l'outil de fabrication ; ils ont été vidés (remplacement d'octets de même longueur).
   Ne pas mettre de texte explicatif ni de mention d'outil dans un document destiné au client.

## Variantes étudiées et écartées

A (2 lignes, initiales en brun ; **a été en ligne quelques heures**, commit `a261fe1`), B2 (porte allongée), C (« Villéger Peinture » + « Ravalement · Rénovation »),
D (capitales espacées + filet), propositions « pierres appareillées » et « porte à panneaux ». Maquettes privées de la session (peuvent expirer) :
comparatif A à D <https://claude.ai/artifact/5tLwPo9tK3oDPpRmYTMLiR>, B1 corrigé <https://claude.ai/artifact/Hb3fBVp3U65cJpmipfJ9T7>,
analyse de la porte <https://claude.ai/artifact/Bv9YqKqbr8D328S1mpDHVp>, finitions retenues <https://claude.ai/artifact/VJ5XTf6JUhS3uszUA81zto>.
Copie durable : [`logo-b1-preview.html`](./logo-b1-preview.html).
