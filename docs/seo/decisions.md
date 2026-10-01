# Décisions produit/contenu — SEO VPRR

Décisions actées avec le client, pour éviter de refaire le débat plus tard.

## Périmètre du service "Isolation" (2026-09-16)

**Question posée** : le site (titre de la page d'accueil, meta descriptions, `data/config.json`)
mentionne "isolation" comme service, mais aucune page dédiée n'existe. Fallait-il créer une page, ou
retirer la mention ?

**Réponse du client** : VPRR fait bien de l'isolation, mais :

- **Isolation extérieure (ITE)** : non, sauf indirectement via les peintures/enduits de façade
  (fonction hydrofuge/isolante de certains revêtements — à rattacher à la page Peinture extérieure /
  Ravalement, pas à présenter comme de l'ITE à part entière).
- **Isolation intérieure** : oui, service réel (combles, murs par l'intérieur, etc.).

**Décision** : créer une page de service dédiée à l'**isolation intérieure** (et non "isolation" au sens
large), avec un intitulé et un contenu qui ne créent pas d'attente sur de l'ITE. Le lien entre peinture
extérieure et amélioration hydrofuge/isolante reste mentionné sur la page Peinture extérieure existante,
pas comme un service d'isolation à part.

**Statut** : fait le 2026-09-16 — page `isolation-interieure-charente.html` créée, liée depuis le menu, le
footer, la page d'accueil (5ᵉ carte de service) et le sitemap. Une FAQ dédiée clarifie explicitement
l'absence d'ITE et redirige vers les pages peinture extérieure / ravalement de façade.

## Décisions du 2026-09-29

- **Services toiture/isolation** : les prestations affichées (réfection de tuiles, gouttières/zinguerie, Velux,
  isolation combles/murs/fenêtres) sont validées par le client — ne pas les retirer du JSON-LD.
- **Vidéo hero** : se lance au démarrage sur tous les écrans (téléphone compris, décision du client le 2026-09-30) ; image d'attente seulement en économiseur de données, connexion lente ou « mouvement réduit ».
- **Galerie Instagram (Elfsight)** : conservée, citée dans les mentions légales.
- **Robots IA** : autorisés (objectif : apparaître dans ChatGPT & co.) — `llms.txt` maintenu.
- **Coordonnées officielles** : 05 45 91 22 70 ; lun–ven 9 h–17 h, sam 9 h–12 h. SARL, SIREN 934 010 216,
  TVA FR02 934 010 216.

## Design (2026-10-01)

- **Thème clair** conservé (pas de mode sombre).
- **Boutons** : pilule, animation sobre (assombrissement seul, jamais de soulèvement ni d'ombre qui grandit).
- **Logo du site** : variante **B2** choisie (4 lignes « Villéger / Peinture / Ravalement / Rénovation », porte allongée à la hauteur du texte, jamais « VPRR ») mais **pas déployée** : le logo d'origine reste en ligne jusqu'à nouvel ordre. Détail : [`../design/logo-b2.md`](../design/logo-b2.md).
- **Or** : `--brand-accent` = décor seulement ; texte doré sur clair = `--brand-accent-text`, sur sombre = `--brand-accent-on-dark`.

## Tarifs affichés (2026-10-03) — référence unique

Fourchettes **TTC, particulier, Charente, hors échafaudage** (échafaudage : 8 à 15 €/m² de façade). Toute page, FAQ ou article qui cite un prix doit reprendre ce tableau :

| Prestation | Fourchette | Détail |
|---|---|---|
| Ravalement de façade | 25–90 €/m² | nettoyage + peinture 25–40 · réfection d'enduit 40–65 · ravalement complet 60–90 · exemple 100 m² : 4 500–7 000 € échafaudage compris |
| Nettoyage de façade | 8–30 €/m² | démoussage + traitement 8–15 · hydro-gommage 15–30 · hydrofuge +5–8 · exemple 80 m² : 1 200–2 000 € |
| Nettoyage de toiture | 8–25 €/m² | démoussage 8–12 · + anti-mousse 12–18 · + hydrofuge 18–25 · exemple 100 m² : 1 200–1 800 € |
| Peinture extérieure | 20–65 €/m² | rafraîchissement 20–30 · avec préparation 30–45 · haute performance 45–65 · exemple 100 m² : 3 000–4 500 € |
| Isolation intérieure | 18–70 €/m² | combles perdus (soufflage) 18–30 · rampants 40–65 · murs (doublage) 45–70 · exemple 80 m² de combles : 1 500–2 400 € |
| Rénovation intérieure (blog) | 150–1 000 €/m² | rafraîchissement 150–300 · intermédiaire 300–600 · lourde 600–1 000+ |

TVA : 10 % (logement de plus de 2 ans), 5,5 % possible pour certains travaux d'isolation. Les fourchettes sont des estimations éditoriales de marché provincial : **à faire valider par le client** (A9 de la feuille de route). Source unique de la FAQ des pages de service : la section `faq` de `page.json` (le JSON-LD en est dérivé) ; FAQ générale : `faq-renovation-angouleme.html` (l'accueil en reprend 5 questions avec les mêmes réponses) — un test vérifie que le JSON-LD reprend les questions affichées.
