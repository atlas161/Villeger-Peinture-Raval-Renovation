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

## ⚠️ `config-loader.js` / `data/config.json` : code mort, ne pas s'y fier

`data/config.json` contient une section `services` (Ravalement, Toiture, **Isolation**, Rénovation
intérieure) censée être injectée dynamiquement dans le DOM par `assets/js/config-loader.js` au chargement
de la page, en ciblant les sélecteurs `.services-grid` / `.service-card` / `.service-icon`.

**Constat (2026-09-16) : ce script ne fait plus rien.** Le HTML réel de `index.html` utilise depuis une
refonte les classes `.svc-grid` / `.svc-card` / `.svc-icon` (avec microdonnées `itemprop` en plus). Comme
les sélecteurs ne correspondent plus, `applyServicesConfig()` trouve `servicesGrid === null` et sort
immédiatement (`if (!servicesGrid) return;`) — sans erreur visible, silencieusement.

Conséquence concrète : le service **Isolation**, entièrement décrit dans `config.json`
(`"id": "isolation"`, description, détails), **n'apparaît nulle part sur le site**, alors même que le mot
"isolation" est présent dans le titre de la page d'accueil et les meta-descriptions. C'est l'écart identifié
dans l'audit SEO (priorité #3).

Pas touché pour l'instant — voir `decisions.md` pour le plan retenu (page dédiée Isolation en HTML
statique, cohérente avec les 4 autres pages de service, plutôt que de réparer ce pipeline JS legacy).
Si un jour ce script est corrigé ou supprimé, vérifier qu'aucune autre section ne dépend encore de lui
(`applyFaqConfig`, `applyZoneConfig`, `applyContactConfig` ciblent d'autres sélecteurs, à vérifier
séparément avant de supprimer le fichier).

## Build & scripts disponibles

```bash
npm run build:blog   # régénère le blog depuis content/blog/*.md
npm run dev           # sert le site en local (npx serve .)
npm test              # tests Node (tests/)
```
