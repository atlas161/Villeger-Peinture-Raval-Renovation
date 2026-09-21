# Refonte qualité de code — état d'avancement

Chantier séparé du suivi SEO (`docs/seo/`) : demande du client de remettre le code du site aux bonnes
pratiques (HTML/CSS/JS, accessibilité, performance) **sans changer le rendu visuel actuel**, plus un
audit responsive. Ce fichier sert de point de reprise pour une nouvelle session — lisez-le avant de
continuer ce chantier.

## État au 2026-09-21

- **Branche** : `main` (travail fait directement sur `main` depuis cette session, commits + push
  validés explicitement par le client à chaque étape).
- **PR #1 et #2** : mergées, déployées en prod. Le fichier mentionnait auparavant PR #2 comme "en
  attente de review" mais elle était en réalité déjà mergée (commit `cf6f279`) — vérifier toujours
  `git log`/`gh pr list` plutôt que de se fier à ce doc pour l'état exact des PR.
- **Commit `93d1c85`/`cfd0f5f`** : audit complet des `!important` CSS (`docs` ci-dessous, section
  "!important").
- **Commit `59c9859`** : extraction des styles inline restants des 5 pages de service (`docs` ci-dessous,
  section "styles inline pages de service").
- Aucun changement en attente non commité au moment de la rédaction de ce fichier.

## Audit `!important` (fait le 2026-09-21)

- **Bug racine trouvé** : `.btn` utilisait `border-radius: var(--radius-md)`, variable jamais définie
  (typo pour `--radius`) → avait fait accumuler ~15 règles `!important` en cascade pour forcer 12px sur
  les boutons. Corrigé (`var(--radius)`), permettant de supprimer tout ce bloc mort.
- **Piège rencontré** : une règle générique `button { border-radius: 12px !important }` supprimée à tort
  affectait en fait 7 autres boutons du site avec leur propre design (pilule/cercle) :
  `.burger`, `.reviews-btn`, `.faq-filter-btn`, `.blog-carousel-btn`, `.filter-btn`, `.share-btn.copy`,
  `.article-nav-btn`, `.submenu-back-btn`. Tous corrigés avec `border-radius: 12px` explicite + commentaire.
- `blog.css` : bloc entier de règles ciblant des classes de footer **mortes** (`.footer-col`,
  `.footer-links`, `.social-badge`...) supprimé — le footer réel (`includes/footer.html` via
  `footer.js`) utilise `.footer-title`, `.footer-link`, `.social-link` etc. depuis longtemps.
- `nav.css` : bloc entier supprimé, dupliquait exactement une règle de `styles.css` (le commentaire
  l'admettait déjà).
- `contact.css` : deux définitions concurrentes de `.form-actions` fusionnées en une seule (l'une avait
  `!important` pour forcer le centrage face à l'autre, plus récente, qui aurait sinon mis les CTA en
  `space-between`).
- **Laissé intact** (usages légitimes, ne pas retoucher sans raison) : tous les `!important` de
  `zone.css` (overrides Leaflet, bibliothèque tierce), de `utilities.css` (`.visually-hidden`, pattern
  a11y standard), et le hack documenté `*[style*="border-radius"]` dans `styles.css` (décision produit
  toujours en attente côté client, voir plus bas).
- Total restant : ~72 `!important` réels (hors mentions dans des commentaires), tous audités et jugés
  nécessaires.

## Styles inline pages de service (fait le 2026-09-21)

Réduit de ~330 à 2 attributs `style=""` sur les 5 pages de service (les 2 restants sont des variables
CSS `--pricing-card-accent` légitimes sur `ravalement-facade-angouleme.html`, pour les couleurs
d'accent des 3 paliers de prix — cas d'usage correct d'un style inline minimal plutôt qu'une classe par
palier).

Nouvelles classes ajoutées dans `assets/css/service-page.css` : bloc avant/après + fiche chantier
(`.before-after-*`, `.jobsheet-*`), CTA final en verre dépoli (`.cta-glass-*`), encart "nos autres
services" (`.related-services-*`), encart isolation (`.info-box`), tarifs + "pourquoi agir maintenant"
spécifiques à la page ravalement (`.pricing-*`, `.why-now-*`), variantes de mise en avant
(`.feature-card--highlight`, `.reassurance-item--accent`), petits blocs communs (`.section-note`,
`.service-card h3/p`, `.section-cta`). Nouvelle classe `.text-primary` dans `utilities.css` pour
l'emphase de texte inline.

**Piège rencontré (même famille que le hack border-radius documenté plus haut)** : plusieurs éléments
avaient un `border-radius` inline différent de 12px (16px, 18px, 10px, 14px, 24px) mais s'affichaient
déjà à 12px à cause de la règle `*[style*="border-radius"]`. En retirant l'attribut `style`, ce hack ne
s'applique plus à ces éléments : chaque nouvelle classe fixe donc explicitement `border-radius: 12px`
avec un commentaire expliquant pourquoi, pour préserver le rendu actuel identique.

## Méthode de travail à connaître avant de continuer

**Toujours vérifier "aucun changement visuel" par comparaison des styles calculés
(`getComputedStyle` via Playwright), pas seulement par diff de captures d'écran.** Deux pièges vécus
cette session :

1. Les captures d'écran `fullPage` de Playwright produisent de faux positifs/négatifs avec les
   animations "reveal on scroll" (IntersectionObserver + transition opacity) et la carte Leaflet : le
   redimensionnement de viewport pendant la capture peut déclencher les animations en plein milieu,
   ou au contraire ne pas déclencher le lazy-load. Solution utilisée : soit désactiver
   `transition`/`animation` via `page.addStyleTag` avant la capture, soit faire défiler réellement la
   page par petits pas avec des `waitForTimeout` avant de capturer, soit (le plus fiable) comparer
   `getComputedStyle(el)` élément par élément entre la version d'avant et d'après plutôt que des pixels.
2. **`assets/css/styles.css` contient une règle globale ancienne (bien avant ce chantier, commit
   `da8bd98`) qui piège toute extraction de style inline contenant "border-radius"** :
   ```css
   /* Forcer même sur les éléments avec styles inline */
   *[style*="border-radius"] {
     border-radius: 12px !important;
   }
   ```
   Tout élément qui a un `style="...border-radius:Xpx..."` inline s'affiche en réalité à **12px**,
   quelle que soit la valeur X écrite (18px, 20px, même `50%` → un cercle prévu s'affiche comme un
   carré arrondi). En extrayant un style inline vers une classe CSS, ne jamais copier la valeur littérale
   du style inline pour `border-radius` sans vérifier au préalable le rendu réel via
   `getComputedStyle` sur la version d'origine (`git show <commit avant le chantier>:<fichier>`).
   Cette règle n'a pas été touchée (hors scope, affecte tout le site) — juste contournée en assignant
   12px explicitement dans les nouvelles classes qui remplacent un style inline concerné. Si un jour on
   veut de vrais rayons différents (ex. le cercle d'icône du blog), il faudra cibler cette règle plus
   précisément ou la supprimer et corriger les rares cas où elle est vraiment utile.

Pour vérifier "no visual change" sur un lot de fichiers modifiés : comparer avec
`git show <sha_avant>:<fichier> > fichier.compare.html` servi depuis la racine du repo (pour que les
chemins relatifs des assets fonctionnent), ouvrir les deux versions avec Playwright, et comparer soit
des captures d'écran (avec les précautions ci-dessus), soit les styles calculés des sélecteurs
concernés. Toujours supprimer les fichiers `.compare.html` et scripts temporaires après usage (ne jamais
les laisser traîner dans le repo).

## Ce qui a été fait (chronologique, détail complet dans `docs/seo/journal.md`)

### PR #1 (mergée)
1. **Bugs fonctionnels réels trouvés et corrigés** :
   - `config-loader.js` (documenté à tort comme "code mort") écrasait silencieusement le FAQ, les
     villes, le contact, les titres de section et les options du formulaire de `index.html` au
     chargement — supprimé, HTML statique = source de vérité unique.
   - Bannière cookies active (`footer.js`) n'appelait jamais Google Tag Manager à l'acceptation —
     analytics cassés en prod. Fusionné avec `cookies.js` (mort, ne se déclenchait jamais).
   - `index.html` ne chargeait pas `responsive.css`/`utilities.css` contrairement aux 9 autres pages.
   - `<summary>` dupliqué invalide dans l'accordéon FAQ de la home.
   - Lien mort vers un article de blog orphelin (ancien slug jamais nettoyé par le build).
2. **Accessibilité** : erreurs de formulaire annoncées aux lecteurs d'écran (`role="alert"`,
   `aria-invalid`/`aria-describedby`).
3. **Dédoublonnage** :
   - ~35 styles inline de la Galerie/Blog de `index.html` → classes CSS dans `styles.css`.
   - `copyToClipboard()` dupliqué dans 9 fichiers de blog → `assets/js/blog-article.js`.
   - Les 5 pages de service (`ravalement-facade-angouleme.html`, `nettoyage-facade-angouleme.html`,
     `nettoyage-toiture-angouleme.html`, `peinture-exterieure-charente.html`,
     `isolation-interieure-charente.html`) avaient chacune un `<style>` de ~500 lignes dupliqué dans le
     `<head>` → extrait vers **`assets/css/service-page.css`** (nouveau fichier, chargé par les 5 pages
     avant `responsive.css`). Voir `docs/seo/architecture.md` pour le détail des petites variations
     préservées par page (ex. `.zone-tag` sur nettoyage-facade, `.hero-placeholder-text` sur isolation).
   - `.cta-final-compact` (cible d'~30 `!important` dans `responsive.css`) s'est révélé être du
     **code mort** (aucune page ne l'utilise) → supprimé entièrement.
   - `blog-home.js` mis dans une IIFE (polluait le scope global).

### PR #2 (ouverte, en attente de review)
4. **Header/nav dédupliqués sur les 10 pages HTML** via un nouveau script **`scripts/sync-header.js`**
   (`npm run sync:header` — **éditer le gabarit dans ce script, pas le HTML directement**, puis relancer
   la commande). `404.html` volontairement exclu (nav minimaliste délibérée, pas un oubli). Corrige au
   passage une faute d'accent du logo ("Villeger" → "Villéger", incohérente entre pages) et un
   `aria-label` incohérent sur la home ("RavalRenovation" → "VPRR - Accueil").
5. **Bug majeur trouvé pendant l'audit responsive** : `assets/js/form-security.js` (anti-spam du
   formulaire) et `assets/js/apple-select.js` (menu "Type de projet") n'étaient chargés **que sur
   `index.html`**. Sur les 5 pages de service (qui ont chacune leur propre formulaire de contact
   identique), le menu "Type de projet" était **totalement non cliquable** et le formulaire **sans
   aucune protection anti-spam**. Corrigé : les deux scripts sont maintenant chargés sur les 5 pages.
6. **Contraste WCAG corrigé** : `--color-text-muted` `#8B7D72` (~3.7:1) → `#77695E` (~5.3:1, AA).
7. **FAQ home** : 2 des 4 questions avaient un markup incohérent (wrapper icône reliquat d'une ancienne
   version) → uniformisé, CSS mort supprimé de `faq.css`.
8. **Audit responsive** (375/768/1024px) sur `index.html` + 5 pages de service + zone/FAQ : aucun
   overflow horizontal, aucun texte tronqué, menu burger mobile fonctionnel. Deux "bugs" suspectés
   pendant l'audit se sont révélés être des artefacts de capture d'écran (voir section méthode
   ci-dessus), pas des problèmes réels.
9. **Suite du nettoyage inline sur les 5 pages de service**, en 2 temps :
   - 7 patterns partagés (accordéon FAQ simple, cartes "Nos autres services") déjà porteurs d'une classe
     existante → extraits vers `service-page.css` (~236 attributs `style=""` supprimés).
   - Espacement de `.faq-answer` (règles de sélecteur descendant) + badges d'icône de la FAQ "Prix &
     Devis" (`.faq-icon-badge`, `.faq-icon-badge--accent`) → ~140 attributs `style=""` supprimés de plus.
   - **Découverte du hack `border-radius` documenté ci-dessus** en vérifiant rigoureusement cette
     extraction — a aussi permis de corriger une régression introduite plus tôt dans la session sur
     `index.html` (`.gallery-card`, `.blog-preview-card`, `.blog-preview-badge`, `.blog-cta-icon`
     avaient été extraits avec leur valeur inline d'origine au lieu du 12px réellement rendu).

Compteurs de styles inline restants sur les pages de service (après tout le travail ci-dessus) :
`ravalement-facade-angouleme.html` 174→100, `nettoyage-facade-angouleme.html` 120→63,
`nettoyage-toiture-angouleme.html` 120→63, `peinture-exterieure-charente.html` 120→63,
`isolation-interieure-charente.html` 92→42.

## Décisions produit actées

- **Hack `*[style*="border-radius"]` (2026-09-21)** : le client a tranché explicitement — le rendu
  visuel actuel doit être conservé tel quel partout, y compris là où le hack transforme un cercle prévu
  en carré à bord arrondi (ex. `.blog-cta-icon`). **Ne jamais "corriger" ce rendu** ; toute nouvelle
  extraction de style inline contenant un `border-radius` doit continuer à fixer explicitement
  `border-radius: 12px` (comme fait dans tout ce chantier), jamais la valeur inline d'origine.

## Ce qui reste à faire

Backlog initial épuisé au 2026-09-21 (fieldset/legend fait dans le commit `c600f64`, décision
border-radius actée). Voir le journal SEO/exploration ci-dessous pour la suite identifiée en continuant
le chantier.

## Repères pratiques

- `npm test` — 6 tests Node, doivent rester verts.
- `npm run build:blog` — à relancer après toute modif de `content/blog/*.md` ou du template blog.
- `npm run sync:header` — à relancer après toute modif du gabarit dans `scripts/sync-header.js`.
- Ne jamais commit/push ni merger de PR sans validation explicite du client (règle déjà dans
  `CLAUDE.md`).
