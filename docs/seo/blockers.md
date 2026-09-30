# Blocages — nécessitent une action de votre part

## 1. Accès Google Business Profile — RÉSOLU (2026-09-16)

Accès obtenu via l'extension Claude in Chrome (votre session Google déjà connectée dans Chrome). Audit
fait, voir `journal.md` du 2026-09-16 pour le détail complet. Je ne peux toujours pas saisir de mot de
passe ni modifier les paramètres du compte sans votre feu vert explicite à chaque fois — mais la
consultation et les corrections de contenu (catégories, description, etc.) sont possibles avec votre
accord ponctuel.

## 2. Accès Solocal Manager — RÉSOLU (2026-09-16)

Même chose : accès obtenu via Claude in Chrome (session déjà connectée sur `manager.solocal.com`).
C'est le même compte qui gère la fiche PagesJaunes `pagesjaunes.fr/pros/63546590`. Audit fait, voir
`journal.md`.

**Reste un vrai blocage** : la deuxième fiche PagesJaunes trouvée publiquement,
`pagesjaunes.fr/pros/61413918` (nom "Peinture Raval Rénovation", sans "Villeger"), ne semble pas être
gérée par ce même compte Solocal Manager (un seul établissement "VPRR Rénovation" apparaît dans le
compte connecté). Il s'agit probablement d'une fiche orpheline créée séparément (ancien import,
doublon automatique). Pour la faire fusionner ou supprimer, il faut passer par le formulaire de
réclamation PagesJaunes en tant que représentant légal, ou contacter le support Solocal en signalant le
doublon — je ne peux pas le faire à votre place.

**Statut** : en attente de votre action pour la fiche doublon uniquement.

## 3. Process de demande d'avis Google

Décision à prendre côté vous : comment souhaitez-vous relancer les clients pour un avis après chantier
(SMS automatique, QR code sur site, carte de visite avec lien, mail de fin de chantier) ? Le lien direct
existe déjà (`g.page/r/CZZJ5Bogt13fEBM/review`, dans le pied de page et la section avis), il manque juste le process
régulier. Dites-moi quel canal vous préférez et je peux préparer le texte/support (SMS, QR code, etc.).

**Statut** : en attente de votre préférence.

## 4. Google Tag Manager : déclencheurs des nouveaux événements (à faire par vous — 2026-09-30)

Le site envoie maintenant, **uniquement après « Tout accepter »**, trois événements dans le `dataLayer` :
`phone_click`, `quote_cta_click` (paramètre `placement` : `barre_mobile`, `menu`, `hero`, `pied_de_page`,
`contact`, `page`) et `generate_lead` (page de remerciement). Ils apparaissent tout seuls dans Microsoft Clarity
(événements personnalisés), mais **pour les avoir dans Google Analytics il faut créer, dans le conteneur GTM
`GTM-NKPGDBPG`, un déclencheur « Événement personnalisé » par nom d'événement + une balise GA4 « Événement »
associée** (et marquer `generate_lead` comme conversion dans GA4). Je n'ai pas accès au conteneur GTM.

**Statut** : en pause (2026-09-30). GA4 créé : propriété `556837484`, flux « VPRR Accueil », ID de mesure `G-173V5FGW2S`. Reste à faire dans GTM : balise Google (ID ci-dessus, déclencheur Initialization – All Pages), 3 déclencheurs « Événement personnalisé », 3 balises événement GA4, test en Aperçu + DebugView, publication, puis `generate_lead` en conversion. Prévu via Claude dans Chrome. Ne jamais coller le `gtag.js` dans le site (traceur avant consentement).

## 5. Nom de l'assureur décennale / RC Pro

Non communiqué : les mentions légales disent « attestation communiquée sur simple demande ». L'affichage du nom
de l'assureur est obligatoire pour un artisan du bâtiment. À ajouter dans la section « Assurances » de
`mentions-legales.html` (et éventuellement `llms.txt`).

**Statut** : en attente du nom de l'assureur (et éventuellement du n° de contrat / de la zone couverte).
