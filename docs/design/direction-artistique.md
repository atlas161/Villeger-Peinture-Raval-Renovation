# Direction artistique — audit design des pages service et zone, et propositions (2026-10-01)

**Référence visuelle vivante : [`guide-direction-artistique.html`](./guide-direction-artistique.html)** — page unique qui montre,
avec les vraies feuilles de style du site, toutes les couleurs, la typographie, les espaces, les boutons, la navigation,
les cartes, les accordéons, le formulaire et le footer, plus la recette pour créer une page. À ouvrir avec `npm run dev`
puis `/docs/design/guide-direction-artistique.html` (jamais publiée sur vprr.fr : `docs/` n'est pas dans `dist/`).
Le footer y est une copie : en cas d'écart, `includes/footer.html` fait foi.

S'appuie sur [`../design-audit-2026-09-21.md`](../design-audit-2026-09-21.md) (8 bugs déjà corrigés — non re-signalés) et
[`../audit-structure-design-2026-09-29.md`](../audit-structure-design-2026-09-29.md) (tokenisation).

## A. Corrigé le 2026-10-01 (bugs et incohérences, sans changer l'identité)

| # | Constat | Correctif |
|---|---|---|
| 1 | **Menu burger : « Services » s'ouvrait au simple survol.** Le survol ordinateur était branché seulement si la page était chargée en ≥ 992 px ; une fenêtre élargie puis réduite (ou une tablette qui pivote) gardait ce survol actif dans le menu plein écran. | `main.js` : la largeur est testée **au moment de l'événement** ; en mode burger, seul le toucher ouvre le panneau « Services ». Vérifié par script (survol : fermé, clic : ouvert, survol desktop : ouvert). |
| 2 | **Une carte « mise en avant » en brun plein, une autre en or** (`.feature-card--highlight` vs `.reassurance-item--accent`). | Règle unifiée : **une carte accentuée = bordure et pastille or**. |
| 3 | **Orange hors palette** : barre « Réfection enduit » (`#D9742B`) et ombre des cartes « problème ». | Remplacés par `--brand-accent-text` (or foncé) et un brun transparent. |
| 4 | **Cartes « problème » qui glissent de 8 px au survol**, contraire à la règle « hover = assombrissement seul ». | Suppression du déplacement. |

## B. Constats restants — petites corrections possibles (prochaine passe)

- Pages service : titres de cartes de réassurance sur 1 ou 2 lignes → les textes ne s'alignent pas d'une carte à l'autre.
- Page zone : les deux colonnes de communes ont des lignes de hauteur inégale quand un nom passe sur 2 lignes (« La Rochefoucauld-en-Angoumois »).
- Mobile : la barre « Devis gratuit » et la bannière cookies se touchent au premier affichage.
- `#f8f5f2` (3 occurrences dans `service-page.css`) et ~50 tailles de police : à tokeniser (voir roadmap C2).

## C. Propositions de redesign — **à valider par le client avant toute modification**

1. **Une seule largeur de lecture sur les pages service.** Aujourd'hui trois largeurs se succèdent (900 px « problème », 1200 px
   « solution », 600 px sous-titres). Proposition : conteneur 1200 px pour les grilles, 800 px pour le texte seul.
2. **Section « Le problème » en grille 2 × 2** au lieu d'une colonne de 4 longues cartes : −45 % de hauteur, même contenu.
3. **Section « Notre solution » en grille 2 colonnes** (5 cartes → la 5ᵉ accentuée en pleine largeur) plutôt que 5 bandeaux pleine largeur.
4. **Tarifs** : cartes de prix avec le montant en grand et un seul trait or en haut (au lieu de trois barres de couleurs différentes).
5. **Page zone** : carte Leaflet pleine largeur en tête, puis les 3 listes de communes en 3 colonnes ; la colonne de droite actuelle
   (7 blocs empilés) est le point faible de la page.
6. **Accueil des pages service** : photo avant/après dans le hero déjà bonne — proposer une bande de 3 preuves (note Google, décennale,
   délai de devis) sous le hero plutôt qu'en bas de page.
7. **Logo B2** : prêt, non déployé ([`logo-b2.md`](./logo-b2.md)).
