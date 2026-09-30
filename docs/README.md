# Documentation du site VPRR — par où commencer

Site : **https://vprr.fr** · dépôt GitHub `atlas161/Villeger-Peinture-Raval-Renovation` · hébergeur Netlify.
Ce dossier est la mémoire du projet : on y retrouve ce qui a été fait, pourquoi, et comment reprendre.

## Lire dans cet ordre

1. [`../CLAUDE.md`](../CLAUDE.md) — règles de travail et pièges (chargé automatiquement par Claude Code).
2. [`seo/architecture.md`](./seo/architecture.md) — **comment le site est construit** (build, pages générées, CSS/JS,
   cookies, formulaires, tests, recettes). À lire avant de toucher au code.
3. [`changelog.md`](./changelog.md) — **tout ce qui a changé, par date et par commit** (avec l'état actuel en chiffres).
4. [`seo/`](./seo/) — suivi du chantier SEO : `README.md` (état), `journal.md`, `blockers.md` (ce qui attend une action
   du client), `decisions.md` (décisions produit actées).

## Tous les documents

| Fichier | Contenu | Statut |
|---|---|---|
| [`changelog.md`](./changelog.md) | Historique complet des changements | **à mettre à jour à chaque déploiement** |
| [`seo/architecture.md`](./seo/architecture.md) | Architecture technique de référence | à jour au 2026-09-30 |
| [`seo/README.md`](./seo/README.md), [`journal.md`](./seo/journal.md), [`blockers.md`](./seo/blockers.md), [`decisions.md`](./seo/decisions.md) | Suivi SEO | vivant |
| [`audit-complet-2026-09-29.md`](./audit-complet-2026-09-29.md) | Audit perf/RGPD/SEO/sécurité + sessions de correction | clos (tout traité, voir la fin du fichier) |
| [`audit-structure-design-2026-09-29.md`](./audit-structure-design-2026-09-29.md) | Audit routes/structure/design system + plan en 9 étapes | plan exécuté, reste listé en fin de fichier |
| [`design-audit-2026-09-21.md`](./design-audit-2026-09-21.md) | 8 bugs visuels corrigés + pistes de redesign | historique |
| [`ux-ui-responsive-audit.md`](./ux-ui-responsive-audit.md) | Audit UX/UI/responsive | historique |
| [`code-quality-refactor.md`](./code-quality-refactor.md) | Chantier qualité de code + méthode « aucun changement visuel » | historique + méthode |

## Ce qu'il reste à faire (au 2026-09-30)

**Côté client / comptes externes** (détail : [`seo/blockers.md`](./seo/blockers.md)) :
- Créer dans Google Tag Manager les déclencheurs pour `phone_click`, `quote_cta_click`, `generate_lead`.
- Nom de l'assureur décennale à ajouter aux mentions légales.
- Fiche PagesJaunes doublon (61413918), process d'avis Google, Google Business Profile.

**Côté site** (dette technique connue, dans l'ordre de valeur) :
- Pages « ville » : le gabarit de pages est prêt, il manque un modèle de contenu (texte généré à partir du nom de
  la commune) — voir `seo/architecture.md` §4.2.
- Tokeniser le reste du design system (échelle typographique, ombres, breakpoints, z-index, composant bouton unique).
- Durcir la CSP : externaliser les scripts inline de l'accueil (retirer `'unsafe-inline'`).
- Convention d'URL : passer aux URLs sans `.html` (décision SEO, 301 à prévoir).
- Charger Vimeo / Elfsight / carte OSM après clic ou consentement.
- Autres pistes de condensation mobile non demandées : carrousel des avis de l'accueil, zone de l'accueil.

## Vérifier une modification (méthode utilisée pendant les chantiers)

Objectif : prouver « aucun changement visuel » (ou mesurer un changement voulu) avant de pousser.

1. `npm test` (20 tests) puis `npm run build` ; servir `dist/` avec `cd dist && npx serve . -l <port>`.
2. **Hauteur de page** à 3 tailles (375 / 768 / 1440 px) et débordement horizontal, en local et en production
   (`document.documentElement.scrollHeight`, `scrollWidth > innerWidth`). Deux mesures identiques = aucune dérive.
3. **CSS** : re-substituer les variables par leur valeur et comparer au CSS d'avant (preuve caractère pour caractère
   pour les remplacements de tokens) ; pour du CSS supprimé, vérifier que les sélecteurs ne matchent aucun élément.
4. **HTML généré** : comparer avec `git show HEAD:<page>` après normalisation (commentaires, espaces, JSON-LD parsé).
5. **Comportement** : cliquer réellement (bannière cookies, menu déroulant, slider, boutons « Voir plus »…).
6. Pousser **étape par étape** (un commit = une idée), attendre le déploiement, revérifier la prod.

Pièges rencontrés :
- Le volet de prévisualisation est parfois masqué : les transitions CSS y sont figées (mesurer avec
  `transition: none`) et les captures d'écran peuvent sortir **blanches** (refaire la capture, ou mesurer le DOM).
- Ne pas redimensionner une fenêtre sans recharger avant de mesurer (états de page qui traînent) ; mesurer après
  rechargement, avec ~3 s d'attente.
- `npx serve` met en cache les redirections 301 dans le navigateur : changer de port en cas de doute.
- La CSP de production bloque les `<iframe>` internes : mesurer la prod page par page, pas en iframe.
- Sous Windows, arrêter `serve dist` avant `npm run build` (sinon `EPERM`).
