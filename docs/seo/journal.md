# Journal SEO — VPRR

Log daté de toutes les sessions de travail sur le chantier SEO. Le plus récent en haut.

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
