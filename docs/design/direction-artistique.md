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

## B. Défauts restants — **corrigés le 2026-10-01 (passe 2)**

| Constat | Correctif |
|---|---|
| Titres de réassurance sur 1 ou 2 lignes → textes désalignés | `.reassurance-text h3` réserve 2 lignes en grille 3 colonnes (≥ 1025 px). Mesuré : 2 rangées désalignées avant, **0** après. |
| Page zone : lignes de communes de hauteur inégale | Listes en colonnes CSS (`column-count`) au lieu d'une grille : un nom sur 2 lignes n'agrandit plus la ligne voisine. |
| Mobile : barre « Devis gratuit » et bannière cookies qui se touchent | Bannière remontée : écart mesuré **−6 px (chevauchement) → +10 px** à 375 px. |
| `#f8f5f2` en dur, hover à déplacement (cartes solution, réassurance, puces de zone) | Tokens `--color-bg` / `--color-white` ; hover = ombre et couleur seulement. |

## C. Redesign — propositions 1 à 6 **réalisées le 2026-10-01** (validées par le client) ; 7 en attente

1. **Largeur unique** : « Le problème » passe de 900 px à la largeur du conteneur (1200 px), comme les autres grilles. Les chapôs de section restent à 600 px (lecture de texte).
2. **Le problème en grille 2 × 2** (1 colonne < 768 px).
3. **Notre solution en grille 2 colonnes** ; la carte impaire (mise en avant) en pleine largeur.
4. **Tarifs** : montant en grand, un seul trait or en haut, identique pour les 3 cartes.
5. **Page zone** (≥ 992 px) : carte pleine largeur (340–460 px de haut, plus de carte sticky), puis adresse + note, puis les 3 listes de communes côte à côte, note, bouton. En dessous de 992 px : une colonne, listes en 2-3 colonnes.
6. **Bande de preuves** sous le hero de chaque page de service (générée par `scripts/lib/service-sections.js` → `proofBar()`) : 4,1/5 Google (14 avis), décennale & RC Pro, devis sous 48 h.
7. **Logo B2** : prêt, **non déployé** — en attente de la validation du client ([`logo-b2.md`](./logo-b2.md)).

### Preuves (mesures Playwright sur `dist/`, avant → après)

| Mesure | Avant | Après |
|---|---|---|
| Ravalement, hauteur desktop 1440 px | 13 769 px | **13 151 px** (−4,5 %) |
| Ravalement, tablette 768 px | 13 062 px | **12 519 px** (−4,2 %) |
| Ravalement, téléphone 375 px | 16 257 px | 16 420 px (+163 px : la bande de preuves) |
| Zone, desktop 1440 px | 5 300 px | 5 291 px |
| Zone, téléphone 375 px | 8 361 px | 8 269 px |
| Problème (4 cartes), 768 / 1440 px | 4 rangées | **2 rangées** |
| Solution (ravalement, 5 cartes), 1440 px | 5 rangées | **3 rangées** (2 + 2 + 1 pleine largeur) |
| Débordement horizontal, 7 pages × 3 tailles | — | **aucun** |
| Cartes de réassurance désalignées (1440 px) | 2 rangées | **0** |
| `npm test` | 20/20 | 20/20 |

L'accueil n'a aucun composant modifié (sa hauteur varie de ±3 % d'un chargement à l'autre : carrousel et vidéo). L'erreur console `_leaflet_pos` de la page zone est antérieure à ces changements (identique avant) ; les tuiles de carte ne se chargent pas dans l'environnement de test.

## E. Passe 4 (2026-10-02) — blog, FAQ, mentions, accueil, pages de contenu

- **Blog** : carte « à la une » (`.has-featured`), grille 3 colonnes, titres entiers ; article : image 16:7, « À lire aussi » (`.related-card`), CTA double.
- **FAQ** : `.faq-search`, puces de filtre à la ligne, `.faq-toolbar` (compteur + liens « déplier / replier »).
- **Mentions légales** : `.legal-doc` + `.legal-toc` (document lisible, titres à l'échelle).
- **Accueil** : `.home-steps` (4 étapes avec filet pointillé entre les cartes).
- **À propos / Réalisations** : `.about-facts` (4 faits), `.real-card` + `.filter-chip`.
- Reste à valider avec le client : un portrait pour « À propos », plus de photos de chantiers, pages « ville ».

## D. Passe 3 (2026-10-02) — contact dédié et zone

- **Bande d'appel** `.contact-cta` (accueil + pages de service) : carte blanche, trait or, 3 points de réassurance, bouton primaire « Demander mon devis » + téléphone en secondaire.
- **Page contact** : formulaire + coordonnées (téléphone, e-mail, horaires, adresse + itinéraire, Instagram) + note de zone.
- **Zone, accueil** : schéma SVG (`.zone-schema`) + puces (`.zone-chips`) + adresse. **Page zone** : `.zone-finder` (recherche), `.zone-sector` (3 secteurs), `.zone-map-block` (carte à la demande).

## F. Passe 5 (2026-10-02) — conversion aux échelles du design system : bilan visuel

Méthode : captures pleines page de 17 pages (accueil, contact, à propos, réalisations, zone, FAQ, mentions, merci, 404, 5 pages de service, liste du blog, 2 articles) à 375 / 768 / 820 / 1024 / 1440 px, avant et après, comparées pixel par pixel
(seuil de différence par pixel > 30 sur la somme RVB), puis contrôle à l'œil des écarts les plus importants. Plancher de bruit (deux captures identiques de l'état « avant ») : ≈ 0,1 %.

| Largeur | Écart moyen | Médiane | Écart de hauteur | Lecture |
|---|---|---|---|---|
| 375 px (téléphone) | 2,7 % | 0,6 % | 0,2 % | tailles de texte ramenées à l'échelle (≤ 1 px) ; 404 : un retour à la ligne de plus |
| 820 px (tablette) | 2,6 % | 1,5 % | 0,0 % | idem |
| 1440 px (bureau) | 2,1 % | 1,0 % | 0,2 % | idem ; l'article de blog est maintenant aligné sur son conteneur |
| 1024 px exactement | 16,7 % | 16,4 % | 8,6 % | **voulu** : 1024 px passe en gabarit « bureau » (avant : gabarit « tablette » ET « bureau » mélangés) |
| 768 px exactement | variable | — | — | **voulu** : 768 px passe en gabarit « tablette » (2 colonnes), comme 820 px |

À retenir : les chiffres de 375, 820 et 1440 px montrent que la conversion ne change presque rien à l'œil ; les différences visibles viennent
de l'alignement des points de rupture, qui n'affecte que les écrans dont la largeur est exactement 768 ou 1024 px (iPad classique en portrait / paysage, petits portables).

Corrigé en cours de route : (1) débordement de la colonne de texte des articles entre 1025 et ≈ 1250 px ; (2) cartes « problème » trop serrées en tablette (icône 48 px, marges réduites) ;
(3) une règle CSS cassée par une insertion maladroite, détectée par la relecture visuelle avant livraison.
