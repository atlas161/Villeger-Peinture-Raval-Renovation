# Journal SEO — VPRR

Log daté de toutes les sessions de travail sur le chantier SEO. Le plus récent en haut.

---

## 2026-09-18 — Audit qualité de code & correctifs fonctionnels (hors chantier SEO strict, mais impacte
vitesse mobile / tracking / formulaire de contact)

Demande du client : remettre le code du site aux bonnes pratiques (HTML/CSS/JS, a11y, perf) sans changer
le design visuel. Audit complet effectué (voir résumé dans `CLAUDE.md` → Pièges connus). Bugs
fonctionnels réels trouvés et corrigés :

- **`config-loader.js` supprimé** — n'était pas du code mort comme documenté, il écrasait silencieusement
  le FAQ, les villes, le contact, les titres de section et les options du formulaire de `index.html` au
  chargement. Le HTML statique est maintenant la seule source de vérité. Détail dans
  `docs/seo/architecture.md`.
- **Formulaire de contact cassé** : le menu déroulant personnalisé "Type de projet" (`.apple-select`)
  n'avait *aucun* script pour le faire fonctionner — impossible de choisir un service avant cette session.
  Corrigé avec un composant accessible (`assets/js/apple-select.js`, pattern ARIA listbox + clavier) et
  les 2 options manquantes (Toiture, Rénovation intérieure) ajoutées.
- **Tracking (Google Tag Manager) cassé** : la bannière cookies réellement active (`footer.js`)
  n'appelait jamais `loadGoogleTagManager()` — accepter les cookies ne chargeait pas les analytics. Le
  vieux fichier `cookies.js` qui le faisait ne se déclenchait jamais (son `DOMContentLoaded` tournait
  avant que le footer, chargé en fetch async, n'existe dans le DOM). Fusionné dans `footer.js`, `cookies.js`
  supprimé.
- **`index.html` ne chargeait pas `responsive.css` ni `utilities.css`**, contrairement aux 9 autres pages
  du site → la home ratait les ajustements mobile (logo, footer, nav). Ajouté.
- Bug FAQ : `<summary>` en double invalide sur la question 4 (accordéon), corrigé.
- Accessibilité formulaire : erreurs désormais annoncées aux lecteurs d'écran (`role="alert"`,
  `aria-invalid`/`aria-describedby`), styles d'erreur déplacés du JS inline vers `contact.css`.

Suite de la session — nettoyage HTML/CSS/JS (sans changement visuel, vérifié par capture d'écran avant/
après) :

- **Lien mort trouvé et corrigé** : la carte blog en avant sur la home pointait vers
  `blog/choisir-peinture-exterieure.html`, un fichier **orphelin** (ancien slug, plus dans le sitemap,
  jamais régénéré par `npm run build:blog` depuis le renommage du slug en
  `peinture-exterieure-facade-angouleme`). Lien corrigé, fichier orphelin supprimé.
- **~35 attributs `style="..."` inline** de la section Galerie et Blog de `index.html` extraits vers de
  vraies classes CSS (`.gallery-card`, `.blog-preview-*`, etc.) dans `styles.css` — même rendu visuel
  (vérifié par capture d'écran), code réutilisable. Le template JS qui génère ces mêmes cartes
  (`assets/js/blog-home.js`) utilise maintenant les mêmes classes au lieu de dupliquer les styles inline.
- `copyToClipboard()` (dupliqué dans le template blog + 8 pages générées) déplacé vers
  `assets/js/blog-article.js`, lié en `addEventListener` (plus d'`onclick` inline), avec un léger mieux
  UX (icône ✓ au lieu d'un `alert()` bloquant).
- `blog-home.js` mis dans une IIFE (il polluait le scope global, contrairement à tous les autres scripts
  du site).

Suite (2) — pages de service (`ravalement-facade-angouleme.html`, `nettoyage-facade-angouleme.html`,
`nettoyage-toiture-angouleme.html`, `peinture-exterieure-charente.html`, `isolation-interieure-charente.html`) :

- Chacune de ces 5 pages avait un bloc `<style>` de ~430-520 lignes **dupliqué presque à l'identique**
  dans le `<head>` (composants `.service-hero`, `.before-after-slider`, `.feature-grid`,
  `.problem-section`, `.process-steps`, `.zone-list`, `.cta-final-compact`). Extrait vers un seul fichier
  partagé `assets/css/service-page.css`. Les rares vraies différences entre pages (ex. `.zone-tag` sur
  `nettoyage-facade-angouleme.html`, `.hero-placeholder-text` sur `isolation-interieure-charente.html`)
  ont été préservées via un petit `<style>` de quelques lignes propre à chaque page. **Vérifié pixel par
  pixel** (capture d'écran avant/après, desktop + tablette + mobile) sur les 5 pages : rendu strictement
  identique.
- **Découverte en creusant les `!important`** : `.cta-final-compact` (le plus gros bloc du style dupliqué,
  et la cible des ~30 `!important` de `responsive.css`) n'est en fait **utilisé nulle part** — aucune des
  5 pages n'a d'élément avec cette classe dans son HTML. Code mort depuis une refonte antérieure des CTA
  de ces pages. Supprimé entièrement (`service-page.css` + `responsive.css`), ce qui fait tomber
  `responsive.css` de 34 à **0** `!important`. Total `!important` du site : 220 → 174.
- Cause racine des `!important` restants (dans `responsive.css` à l'origine) : un `<style>` en fin de
  `<head>` de chaque page avait la même spécificité que les media-queries de `responsive.css` mais
  passait après dans l'ordre du document, donc gagnait par défaut — d'où le recours à `!important` pour
  forcer les breakpoints mobile. En centralisant dans `service-page.css` chargé *avant* `responsive.css`,
  la cascade normale suffit.

Reste à faire (pas traité cette session — voir `architecture.md`) : les styles inline `style="..."`
restants sur le contenu propre à chaque page de service (hors le bloc `<style>` du `<head>`, qui lui est
traité), le dédoublonnage du header/nav sur les 10 pages HTML (nécessiterait un petit script d'inclusion
à la `scripts/build-blog.js`, pas fait pour limiter le risque de régression sur une session déjà longue),
et les ~86 `!important` de `styles.css` (pas audités un par un).

---

## 2026-09-16 (suite 2) — Audit Google Business Profile & Solocal Manager

Accès obtenu via l'extension Claude in Chrome (session déjà connectée dans le Chrome du client, pas de
mot de passe saisi). Audit en lecture seule, aucune modification faite sans validation préalable.

### Google Business Profile

- Fiche : **VPRR Rénovation**, validée, 299 interactions clients.
- Catégorie principale : **Façadier**. Secondaires : Entreprise de construction, Peintre en bâtiment,
  Remodeleur, **Entreprise de terrassement** (hors sujet — à retirer, voir ci-dessous).
- Téléphones : 05 45 91 22 70 (principal) + 06 59 26 86 23 (secondaire).
- Site web lié avec tracking : `https://vprr.fr/?utm_source=gmb` (bon réflexe déjà en place).
- Réseau social lié : `instagram.com/vprr.16` — **différent** du compte utilisé sur le site
  (`@peinture_raval_renovation`, dans `data/config.json`). À vérifier : deux comptes Instagram
  différents, ou un des deux liens est obsolète ?
- Horaires GBP : Lun-Ven 09:00-17:00 + Sam 09:00-12:00, fermé dimanche. **Différent** des horaires du
  site (`data/config.json` : Lun-Ven 08:00-18:00, pas de samedi). Incohérence à corriger dans un sens ou
  l'autre selon les horaires réels.
- **Avis Google réels : 4,1★ (14 avis).** Le site affiche actuellement "5,0 · 10 avis Google" sur
  l'accueil — **écart important, à corriger en priorité** (voir plan d'action). Tous les avis existants
  ont déjà une réponse du propriétaire — bonne pratique déjà en place.
- Fiche incomplète selon Google : suggestions actives — ajouter une photo d'intérieur, configurer la
  réservation, créer une offre, ajouter une carte/itinéraire sur le site, activer la saisie
  semi-automatique d'adresse.

### Solocal Manager (compte lié à la fiche PagesJaunes `pros/63546590`)

- Score d'engagement digital : **51%**, sous la moyenne du secteur bâtiment (56%). Actions suggérées par
  Solocal : publier ≥4 actualités/promos, connecter Facebook (actuellement non connecté), ajouter une
  photo, solliciter des avis récents sur PagesJaunes et sur Google.
- **Email avec faute de frappe dans la fiche Solocal : `villergestephane204@gmail.com`** — encore une
  troisième variante erronée (ni l'ancienne ni la nouvelle orthographe correcte utilisée sur le site).
  À corriger dans Solocal Manager.
- **Cause racine de la mauvaise catégorie "Terrassement" trouvée** : la liste "Activités et prestations"
  PagesJaunes de cette fiche contient 14 catégories d'activité secondaires, dont beaucoup hors sujet :
  plafonds (pose), plâtrerie, plaquistes, parquets, carrelages/dallages, **travaux publics** (→ mappé en
  "Terrassement" dans les résultats publics), terrasses en bois, cloisons, revêtements de sols/murs — en
  plus des catégories pertinentes (ravalement de façades, peinture, isolation, isolation des combles,
  démoussage/traitement toitures, rénovation immobilière). Cette liste trop large dilue la pertinence de
  la fiche sur les spécialités réelles de VPRR. Côté Google (même compte), la catégorie secondaire
  "Entreprise de terrassement" est le même problème.
- Zones desservies déclarées plus larges que sur le site : inclut Charente-Maritime (Saintes,
  Châteaubernard) et mention "Dordogne (24)" dans la description — à vérifier si c'est voulu (site actuel
  ne communique que sur la Charente).
- Un seul établissement "VPRR Rénovation" dans ce compte Solocal — la deuxième fiche PagesJaunes trouvée
  publiquement (`pros/61413918`, nom "Peinture Raval Rénovation") n'est pas gérée depuis ce compte : voir
  `blockers.md`.

### Corrections faites le même jour (validées par le client)

1. **Site** : remplacé "5,0 · 10 avis Google" et "5,0 • 6 avis" par les vrais chiffres (4,1★, 14 avis)
   à 7 endroits (`index.html` x2 + les 5 pages de service, y compris `isolation-interieure-charente.html`
   qui reprenait la même formule). Étoiles ajustées visuellement (4 pleines + 1 demi/vide) pour rester
   honnête.
2. **Google Business Profile** : catégorie secondaire "Entreprise de terrassement" supprimée. Modification
   soumise, en cours de validation Google (~10 min).
3. **Solocal / PagesJaunes** : 9 activités secondaires hors sujet retirées (plafonds, plâtrerie,
   plaquistes, parquets, carrelages/dallages, travaux publics, terrasses en bois, cloisons, revêtements de
   sols/murs). Restent les 6 pertinentes : ravalement de façades, peinture, isolation, isolation des
   combles, rénovation immobilière, démoussage/traitement des toitures. Modification soumise, en cours de
   vérification Solocal (~48h).
4. **Solocal** : email corrigé `villergestephane204@gmail.com` → `villegerstephane204@gmail.com`.

### Horaires harmonisés (2026-09-16, suite)

Le client confirme que les horaires réels sont ceux de Google (Lun-Ven 9h-17h + Sam 9h-12h). Corrigé côté
site : `data/config.json` (`openingHours` + nouveau `openingHoursSaturday`) et le schema JSON-LD
`OpeningHoursSpecification` dans les 7 pages qui le portaient (`index.html`,
`isolation-interieure-charente.html`, `nettoyage-facade-angouleme.html`,
`nettoyage-toiture-angouleme.html`, `peinture-exterieure-charente.html`,
`ravalement-facade-angouleme.html`, `zone-desservie-charente.html`). Aucun texte d'horaires n'était
affiché visiblement sur le site (uniquement dans les données structurées), donc pas de changement visuel.

### Instagram harmonisé (2026-09-16, suite)

Le client confirme que le bon compte est `@vprr.16` (celui déjà lié à Google Business Profile). Remplacé
partout sur le site (`data/config.json`, `humans.txt`, `llms.txt`, `includes/footer.html`, `merci.html` et
les 7 pages qui liaient l'ancien compte `@peinture_raval_renovation`).

### Galerie avant/après ajoutée sur l'accueil (2026-09-16, suite)

Ajout d'une vraie galerie avant/après hébergée sur le site (`index.html`, section `#galerie`), en
complément du widget Instagram Elfsight (gardé, renommé "Suivez nos derniers chantiers"). 4 cartes
utilisant les photos déjà disponibles dans `media/services/` (ravalement, nettoyage façade, nettoyage
toiture, peinture extérieure), avec `alt` descriptifs incluant "Angoulême", liens vers chaque page de
service. Images ajoutées au `sitemap.xml` (balises `image:image` sur l'URL d'accueil) pour l'indexation
Google Images. Testé visuellement en local, rendu conforme au design system.

Reste à faire si/quand disponible : remplacer par de vraies photos de chantiers récents (celles utilisées
sont les mêmes que sur les pages de service, pas de nouveau contenu visuel pour l'instant) — voir aussi la
note de la session précédente sur l'absence de photo pour la page Isolation.

### Pas fait / reste à faire

- Fiche PagesJaunes orpheline (`pros/61413918`, nom "Peinture Raval Rénovation" sans "Villeger") non
  gérée par le compte Solocal actuel — nécessite de contacter le support PagesJaunes directement pour la
  faire fusionner/supprimer. Expliqué au client, pas prioritaire pour l'instant.
- Publier des actualités/photos et connecter Facebook sur Solocal pour améliorer le score d'engagement
  (51% actuellement, secteur à 56%).
- Vérifier après le délai de traitement (10 min Google / 48h Solocal) que les changements sont bien passés
  en production sur les deux plateformes.

---

## 2026-09-16 (suite) — Création de la page Isolation intérieure

**Fait :**

- Créé `isolation-interieure-charente.html`, sur le modèle des 4 autres pages de service (même structure :
  hero, problème, solution, réassurance, zone d'intervention, tarifs, contact, FAQ, schémas JSON-LD
  LocalBusiness/Service/BreadcrumbList/FAQPage).
- Contenu cadré selon `decisions.md` : isolation des combles, des murs par l'intérieur et remplacement de
  menuiseries — **pas d'ITE**. Une section et une question FAQ dédiées clarifient explicitement ce point et
  redirigent vers les pages peinture extérieure / ravalement de façade pour les besoins liés à la façade.
- Pas de photo de chantier "isolation" disponible dans `media/` → hero avec un visuel icône (`.hero-placeholder`,
  déjà prévu dans le CSS existant) plutôt qu'une fausse photo avant/après. **À remplacer par de vraies photos
  dès qu'un chantier d'isolation est documenté** (voir `blockers.md` si besoin de rappel).
- Lien ajouté partout où les 4 autres services apparaissent : menu (toutes les pages + template blog),
  footer (`includes/footer.html`), page d'accueil (5ᵉ carte `.svc-card`), `sitemap.xml`, redirection URL
  propre dans `netlify.toml`.
- Testé en local (`npx serve .`) : rendu visuel conforme au design system, carte homepage et page complète
  vérifiées par capture d'écran.
- `npm test` : 6/6 tests passent toujours après ces changements.

**Pas fait / prochaine étape :**

- Vraies photos de chantier isolation (dès disponibilité).
- Vérifier si `data/config.json` doit être mis à jour pour refléter le nouveau périmètre (isolation
  intérieure uniquement) — actuellement ce fichier n'est de toute façon pas rendu sur le site (voir
  `architecture.md`, code mort `config-loader.js`), donc non bloquant, mais à nettoyer un jour pour éviter
  la confusion.

---

## 2026-09-16 — Audit initial + premières corrections urgentes

**Contexte** : audit SEO complet demandé par le client (site + objectif Google Business Profile /
Solocal). Audit complet livré en document séparé (voir `README.md`). Mise en place de ce dossier de
documentation à la demande du client, pour tracer le travail, les blocages et les choix techniques.

**Fait aujourd'hui :**

1. **Titres `<title>` trop longs sur le blog (7 articles)** — jusqu'à 166 caractères, tronqués par
   Google. Ajout d'un champ frontmatter optionnel `seoTitle` (voir `architecture.md`) pour raccourcir la
   balise `<title>` sans toucher au H1 affiché sur la page. Modifié :
   `scripts/build-blog.js`, `blog/template-article.html`, `.pages.yml`, et les 7 fichiers
   `content/blog/*.md`. Rebuild fait (`npm run build:blog`).
2. **Meta descriptions trop longues (5 pages)** — `zone-desservie-charente.html` (258 → 145
   caractères), `index.html` (181 → 137), `peinture-exterieure-charente.html` (180 → 140),
   `nettoyage-toiture-angouleme.html` (176 → 150), `mentions-legales.html` (175 → 139).
3. **Découverte** : `assets/js/config-loader.js` est du code mort — cible des sélecteurs CSS
   (`.services-grid`, `.service-card`) qui n'existent plus dans `index.html` (renommés `.svc-grid`,
   `.svc-card` lors d'une refonte). Conséquence : le service "Isolation" défini dans
   `data/config.json` ne s'affiche jamais sur le site. Détail dans `architecture.md`.
4. **Décision actée avec le client** sur le périmètre du service Isolation (isolation intérieure
   réelle, pas d'isolation extérieure sauf via peinture de façade) — voir `decisions.md`.

**Pas fait / prochaine étape :**

- Créer la page de service "Isolation intérieure" (contenu + HTML + lien homepage + sitemap).
- Vraie galerie photos avant/après en complément du widget Instagram.
- Points nécessitant votre action : voir `blockers.md` (accès GMB, correction fiches PagesJaunes/Solocal,
  process d'avis clients).

**Rien commité ni poussé sur Netlify/GitHub à ce stade** — modifications locales uniquement, en attente
de votre feu vert pour commit/push.
