# Refonte qualité de code — état d'avancement

Chantier séparé du suivi SEO (`docs/seo/`) : demande du client de remettre le code du site aux bonnes
pratiques (HTML/CSS/JS, accessibilité, performance) **sans changer le rendu visuel actuel**, plus un
audit responsive. Ce fichier sert de point de reprise pour une nouvelle session — lisez-le avant de
continuer ce chantier.

## État au 2026-09-20

- **Branche** : `claude/gallant-lovelace-nv4z75`
- **PR #1** (atlas161/Villeger-Peinture-Raval-Renovation) : **mergée** dans `main`, déployée en prod sur
  vprr.fr.
- **PR #2** : https://github.com/atlas161/Villeger-Peinture-Raval-Renovation/pull/2 — **ouverte, verte
  (CI + deploy preview Netlify OK, `mergeable_state: clean`), en attente de review/merge par le client**.
  Contient 3 commits (`fe01729`, `89acddc`, `fd0d545`). Le client a dit qu'il reviendrait dessus
  "le lendemain" (pas de date précise donnée) — ne pas la merger sans son feu vert explicite.
- Aucun changement en attente non commité au moment de la rédaction de ce fichier.

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

## Ce qui reste à faire (pas traité, par ordre approximatif de valeur)

1. **Styles inline du contenu propre à chaque page de service** (~350 restants au total) : fiche
   chantier (image avant/après + liste "Zone/Support/Problèmes/Solution/Durée"), section "pourquoi nous
   choisir" (icônes badge couleur primary/accent, déjà vues côté FAQ — mêmes classes réutilisables),
   bandeau CTA final, backgrounds de section alternés (blanc/surface-alt/dégradé). Contrairement aux
   lots déjà traités, ce contenu **n'est pas identique mot pour mot** d'une page à l'autre (textes,
   parfois couleurs d'accent différentes) — vérifier au cas par cas plutôt qu'un simple copier-coller de
   classes.
2. **~174 `!important` restants** (dont 86 dans `styles.css`, jamais audités un par un dans ce
   chantier — pourraient contenir d'autres hacks du même genre que celui documenté plus haut).
3. **`.apple-select` sans `<fieldset>`/`<legend>`** groupant nom/téléphone dans le formulaire — a11y
   nice-to-have, pas un défaut bloquant.
4. **Décision produit en attente** (pas un TODO technique, à poser au client) : le hack
   `*[style*="border-radius"]` rend le cercle d'icône du bloc "Explorez tous nos articles" du blog
   (`.blog-cta-icon`) comme un carré arrondi au lieu d'un cercle. Ce n'était probablement pas voulu à
   l'origine mais fait partie du rendu actuel du site — demander au client s'il veut qu'on corrige
   (nécessite de cibler la règle globale plus précisément, ou de retirer `.blog-cta-icon` de son
   périmètre) avant de le changer, puisque ça change un rendu visuel actuel.

## Repères pratiques

- `npm test` — 6 tests Node, doivent rester verts.
- `npm run build:blog` — à relancer après toute modif de `content/blog/*.md` ou du template blog.
- `npm run sync:header` — à relancer après toute modif du gabarit dans `scripts/sync-header.js`.
- Ne jamais commit/push ni merger de PR sans validation explicite du client (règle déjà dans
  `CLAUDE.md`).
