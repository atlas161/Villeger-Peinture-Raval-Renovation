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
