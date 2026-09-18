# Architecture technique du site VPRR

Contexte utile avant de modifier quoi que ce soit sur le site. À lire avant de toucher au blog ou aux
pages de service.

## Stack

- Site statique HTML/CSS/JS vanilla, pas de framework front, pas de bundler.
- Hébergement : **Netlify**, déployé depuis le repo GitHub `atlas161/Villeger-Peinture-Raval-Renovation`
  (branche `main`). Chaque push sur `main` redéploie le site.
- Redirections, headers de cache et règles de build : `netlify.toml` à la racine.
- CMS de contenu : **Pages CMS** (`.pages.yml` à la racine définit les champs éditables depuis
  l'interface Pages CMS), qui édite les fichiers Markdown dans `content/blog/`.

## Comment le blog est généré (important)

Le blog **n'est pas édité directement en HTML**. Le flux est :

1. Les articles vivent en Markdown avec frontmatter dans `content/blog/*.md`.
2. Le script `scripts/build-blog.js` lit ces fichiers, les injecte dans le template
   `blog/template-article.html`, et génère :
   - une page HTML statique par article dans `blog/`,
   - `blog/articles.json` (liste structurée utilisée par la page d'accueil et l'index blog),
   - `blog/index.html` pré-rendu,
   - les entrées correspondantes dans `sitemap.xml`.
3. **Toute modification d'un article de blog doit se faire dans `content/blog/*.md`, jamais directement
   dans les fichiers générés `blog/*.html`** — sinon la modification sera écrasée au prochain
   `npm run build:blog`.
4. Après modification d'un `.md` ou du template, relancer :

   ```bash
   npm run build:blog
   ```

### Champs SEO du frontmatter (ajoutés le 2026-09-16)

Le champ `title` sert à la fois de titre H1 affiché sur la page ET (historiquement) de balise
`<title>` SEO — ce qui posait problème quand un titre H1 riche et long (bon pour le contenu) devenait
aussi la balise `<title>` (mauvais pour le SEO, Google tronque au-delà de ~60 caractères).

Deux champs optionnels ont été ajoutés pour découpler les deux :

- `seoTitle` — utilisé dans `<title>`, `og:title`, `twitter:title`, le `headline` JSON-LD et le fil
  d'Ariane. Si absent, retombe sur `title`. À remplir quand `title` dépasse ~60 caractères.
- `metaDescription` — utilisé dans la balise `meta description`, `og:description`,
  `twitter:description` et la `description` JSON-LD. Si absent, retombe sur `description`. À remplir
  quand `description` dépasse ~160 caractères.

Le H1 affiché sur la page et le chapeau (`description`) restent inchangés, riches et longs — c'est bon
pour le contenu et l'expérience de lecture. Seuls les balises destinées aux moteurs de recherche sont
raccourcies.

Ces deux champs sont aussi disponibles dans l'interface Pages CMS (`.pages.yml`).

## Pages de service (hors blog)

Les pages comme `ravalement-facade-angouleme.html`, `nettoyage-facade-angouleme.html`,
`nettoyage-toiture-angouleme.html`, `peinture-exterieure-charente.html`, `zone-desservie-charente.html`,
`index.html` sont du **HTML statique écrit à la main**, pas généré. Toute modification se fait
directement dans ces fichiers.

### CSS des 5 pages de service : `assets/css/service-page.css`

`ravalement-facade-angouleme.html`, `nettoyage-facade-angouleme.html`, `nettoyage-toiture-angouleme.html`,
`peinture-exterieure-charente.html` et `isolation-interieure-charente.html` partagent les mêmes
composants visuels (`.service-hero`, `.before-after-slider`, `.feature-grid`, `.problem-section`,
`.process-steps`, `.zone-list`...) via le fichier commun **`assets/css/service-page.css`**, chargé dans le
`<head>` de chacune (avant `responsive.css`, pour que les breakpoints mobile de `responsive.css`
l'emportent sans avoir besoin de `!important`).

Avant le 2026-09-18, ce CSS était dupliqué dans un `<style>` de ~500 lignes propre à chaque page — voir
`journal.md` pour le détail. Certaines pages ont de petites vraies différences avec le gabarit commun
(ex. bordure du `.zone-tag` sur `nettoyage-facade-angouleme.html`, style du `.hero-placeholder-text` sur
`isolation-interieure-charente.html`) : ces différences sont préservées via un petit `<style>` de
quelques lignes en fin de `<head>` de la page concernée, **après** le `<link>` vers `service-page.css`
(pour gagner la cascade sans `!important`). Si vous ajoutez une 6e page de service, liez
`service-page.css` plutôt que de recopier ces styles.

## `config-loader.js` : supprimé le 2026-09-18

`data/config.json` contenait une section `services` (Ravalement, Toiture, **Isolation**, Rénovation
intérieure) injectée dynamiquement dans le DOM par `assets/js/config-loader.js` au chargement de la page.
Ce fichier documentait auparavant `applyServicesConfig()` comme code mort (cible `.services-grid` /
`.service-card`, sélecteurs remplacés par `.svc-grid` / `.svc-card` lors d'une refonte) — **mais un audit
du 2026-09-18 a montré que les autres fonctions du même fichier (`applyFaqConfig`, `applyZoneConfig`,
`applyContactConfig`, `applySectionHeaders`, `applyFormOptions`) étaient elles bien actives** et
écrasaient silencieusement au chargement le FAQ, les villes de zone, les liens de contact, les titres de
section et les options du formulaire de contact de `index.html` — avec un flash de contenu visible et une
divergence HTML/JSON (le formulaire n'avait que 4 options en HTML statique contre 6 dans `config.json`).

Décision retenue : `config-loader.js` a été supprimé, et le HTML statique de `index.html` est la seule
source de vérité pour ce contenu (cohérent avec les 9 autres pages du site qui n'ont jamais utilisé ce
script). Les 2 options de formulaire manquantes (Toiture & Couverture, Rénovation intérieure) ont été
ajoutées en dur dans `index.html`. `data/config.json` reste dans le repo comme note de référence mais
n'est plus lu par aucun script.

## Build & scripts disponibles

```bash
npm run build:blog   # régénère le blog depuis content/blog/*.md
npm run dev           # sert le site en local (npx serve .)
npm test              # tests Node (tests/)
```
