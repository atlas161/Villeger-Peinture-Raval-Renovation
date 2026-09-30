# Documentation SEO — VPRR (vprr.fr)

Suivi du chantier SEO long terme du site VPRR (Villéger Peinture Raval Rénovation).
Tout ce qu'on fait, les blocages, les décisions et les choix techniques sont documentés ici
pour qu'on puisse reprendre le fil à tout moment sans perdre le contexte.

> Vue d'ensemble de toute la documentation : [`../README.md`](../README.md) — historique complet par commit :
> [`../changelog.md`](../changelog.md) · reste à faire : [`../roadmap.md`](../roadmap.md).

## Fichiers

- [`journal.md`](./journal.md) — historique daté de tout ce qui a été fait, session par session.
- [`blockers.md`](./blockers.md) — ce qui bloque et nécessite une action de votre part (accès, décisions, comptes externes).
- [`architecture.md`](./architecture.md) — comment le site est construit techniquement (utile avant de toucher au code).
- [`decisions.md`](./decisions.md) — décisions produit/contenu actées (ex. périmètre du service Isolation).

## Où trouver l'audit complet

L'audit SEO initial complet (technique, contenu, performance, local, plan d'action) est un document
Claude séparé, partagé le 2026-09-16 : demandez le lien si besoin, il n'est pas dupliqué ici pour éviter
d'avoir deux versions qui divergent. Ce dossier `docs/seo/` sert de log d'exécution du plan d'action,
pas de duplicata de l'audit.

## État global (mis à jour à chaque session)

Voir [`journal.md`](./journal.md) pour le détail. Résumé rapide de ce qui est fait vs à faire :

- [x] Titres `<title>` trop longs sur les 7 articles de blog → raccourcis via un nouveau champ `seoTitle`.
- [x] Meta descriptions trop longues sur 5 pages principales → raccourcies.
- [x] Page de service dédiée "Isolation intérieure" (isolation intérieure uniquement, pas d'ITE — voir `decisions.md`).
- [x] Vraie galerie photos avant/après hébergée sur le site (en plus du widget Instagram) — voir
      `journal.md` pour la limite actuelle (photos réutilisées des pages de service, pas de nouveau
      contenu visuel).
- [ ] Nettoyage des fiches PagesJaunes/Solocal incohérentes (nécessite accès, voir `blockers.md`).
- [ ] Process de demande d'avis Google après chantier.
- [ ] Audit Google Business Profile détaillé (nécessite accès, voir `blockers.md`).
- [x] Audit complet 2026-09-29 (perf 61 → 99, RGPD, sécurité/CSP, titres ≤ 60 car., NAP aligné) — voir
      [`../audit-complet-2026-09-29.md`](../audit-complet-2026-09-29.md).
- [x] Structure du site : publication par `dist/`, pages de service générées, blog réorganisé, ménage — voir
      [`../changelog.md`](../changelog.md).
- [x] Mesure : cookies « tout accepter / tout refuser », Clarity + GTM après consentement, événements de conversion.
- [ ] Déclencheurs GTM pour les événements de conversion (voir `blockers.md` §4).
- [ ] Pages « ville » (gabarit prêt, contenu à écrire).
