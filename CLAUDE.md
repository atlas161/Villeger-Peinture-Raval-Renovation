# VPRR — vprr.fr

Site vitrine de **Villéger Peinture Raval Rénovation** (VPRR), artisan de rénovation extérieure et
intérieure basé à L'Isle-d'Espagnac (16340), Angoulême, Charente. Gérant : Stéphane Villéger.

## Stack & hébergement

- Site statique HTML/CSS/JS vanilla, pas de framework, pas de bundler.
- Hébergé sur **Netlify**, déployé depuis GitHub (`atlas161/Villeger-Peinture-Raval-Renovation`,
  branche `main`). Push sur `main` = redéploiement automatique.
- Blog géré via **Pages CMS** (`.pages.yml`) : contenu en Markdown dans `content/blog/`, généré en HTML
  statique par `scripts/build-blog.js`.
- **Toujours lancer `npm run build:blog` après avoir modifié un fichier dans `content/blog/`** — les
  fichiers `blog/*.html` sont générés, ne jamais les éditer à la main (écrasés au prochain build).
- Détails complets de l'architecture : [`docs/seo/architecture.md`](docs/seo/architecture.md).

## Chantier SEO en cours

Un audit SEO complet a été fait le 2026-09-16 et un plan d'action long terme est en cours d'exécution,
étape par étape. **Tout le suivi (ce qui est fait, les blocages, les décisions produit) est dans
[`docs/seo/`](docs/seo/)** — toujours consulter `docs/seo/README.md` en premier pour l'état d'avancement
avant de proposer une nouvelle action SEO, et mettre à jour `docs/seo/journal.md` +
`docs/seo/blockers.md` après chaque session de travail sur ce sujet.

Objectif du client : booster le référencement long terme du site, de la fiche Google Business Profile et
de la fiche Solocal/PagesJaunes.

## Infos business (source de vérité : le HTML statique de chaque page)

- Téléphone : 05 45 91 22 70 · Adresse : 136 Avenue de la République, 16340 L'Isle-d'Espagnac.
- Services réels : ravalement de façade, nettoyage de façade (hydrogommage, démoussage), nettoyage/
  démoussage de toiture, peinture extérieure, rénovation intérieure, **isolation intérieure** (pas
  d'isolation extérieure/ITE — voir [`docs/seo/decisions.md`](docs/seo/decisions.md)).
- Zone d'intervention : Angoulême et Charente (16), rayon ~50 km autour de L'Isle-d'Espagnac.
- `data/config.json` existe encore mais **n'est plus injecté dans le DOM** (voir piège ci-dessous) : il
  ne sert plus que de note/brouillon, pas de source de vérité. Pour changer une info affichée (FAQ,
  villes desservies, options du formulaire, textes de section), éditer directement le HTML de la page
  concernée.

## Pièges connus

- **(Résolu le 2026-09-18)** `assets/js/config-loader.js` a été supprimé. Il n'était pas totalement
  mort comme documenté auparavant : il tournait sur `index.html` et écrasait silencieusement au
  chargement le FAQ, les villes de zone, les liens de contact, les titres de section et les options du
  formulaire (avec un flash de contenu et une divergence HTML/JSON — ex. le formulaire n'avait que 4
  options en HTML statique contre 6 dans `config.json`). Le HTML statique de `index.html` est
  maintenant la seule source de vérité pour ce contenu ; les 2 options manquantes (Toiture & Couverture,
  Rénovation intérieure) ont été ajoutées en dur dans le formulaire.
- Le champ `title` du frontmatter blog sert à la fois de H1 affiché et (historiquement) de balise
  `<title>` SEO. Utiliser le champ optionnel `seoTitle` (et `metaDescription` pour la meta description)
  pour raccourcir les balises SEO sans toucher au H1/chapeau affichés — voir
  `docs/seo/architecture.md`.
- Ne jamais commit/push sans validation explicite de l'utilisateur.
