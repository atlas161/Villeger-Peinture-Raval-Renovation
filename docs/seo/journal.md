# Journal SEO — VPRR

Log daté de toutes les sessions de travail sur le chantier SEO. Le plus récent en haut.

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
