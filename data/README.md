# Configuration du site VPRR

Ce dossier contient le fichier de configuration central du site.

## Fichier `config.json`

Ce fichier permet de modifier facilement le contenu du site sans toucher au code HTML.

### Comment modifier le site

1. Ouvrez `config.json` dans un éditeur de texte
2. Modifiez les valeurs souhaitées
3. Sauvegardez le fichier
4. Faites un commit et push :
   ```bash
   git add data/config.json
   git commit -m "Mise à jour du contenu"
   git push
   ```
5. Le site sera automatiquement mis à jour sur Netlify

### Sections modifiables

#### Informations de l'entreprise (`business`)
- `email` : Adresse email de contact
- `phone` : Numéro de téléphone (format international)
- `phoneDisplay` : Numéro affiché (format lisible)
- `address` : Adresse complète
- `socialMedia` : Liens Instagram, Google Review

#### Section Hero (`hero`)
- `title` : Titre principal de la page d'accueil
- `subtitle` : Texte descriptif sous le titre
- `image` : Chemin vers l'image d'accueil
- `imageAlt` : Description de l'image pour l'accessibilité
- `ctaPrimary` / `ctaSecondary` : Boutons d'action

#### Services (`services`)
Tableau des 4 services avec pour chacun :
- `icon` : Classe Font Awesome de l'icône
- `title` : Titre du service
- `description` : Description courte
- `details` : Liste des prestations

#### FAQ (`faq`)
Tableau de questions/réponses :
- `question` : La question
- `answer` : La réponse (HTML autorisé pour le gras, italique)

#### Zone d'intervention (`zone`)
- `cities` : Liste des villes desservies

#### En-têtes de sections (`sections`)
Pour chaque section (services, galerie, zone, faq, contact) :
- `eyebrow` : Petit texte au-dessus du titre
- `title` : Titre de la section
- `subtitle` : Description sous le titre

### Exemples de modifications courantes

#### Changer le numéro de téléphone
```json
"business": {
  "phone": "+33612345678",
  "phoneDisplay": "06 12 34 56 78"
}
```

#### Ajouter une question à la FAQ
```json
"faq": [
  // ... questions existantes ...
  {
    "question": "Nouvelle question ?",
    "answer": "Réponse à la nouvelle question."
  }
]
```

#### Ajouter une ville desservie
```json
"zone": {
  "cities": [
    "Angoulême",
    "L'Isle-d'Espagnac",
    // ... autres villes ...
    "Nouvelle Ville"
  ]
}
```

#### Changer l'image d'accueil
1. Ajoutez votre nouvelle image dans `assets/img/`
2. Modifiez le config :
```json
"hero": {
  "image": "assets/img/nouvelle-image.jpg",
  "imageAlt": "Description de la nouvelle image"
}
```

### Notes importantes

- Le fichier doit rester un JSON valide (attention aux virgules)
- Les modifications sont appliquées au chargement de la page
- Testez localement avant de push en production
- Le HTML est autorisé dans les réponses FAQ (`<strong>`, `<em>`)

### Validation du JSON

Avant de commit, vérifiez que votre JSON est valide :
- Utilisez un validateur en ligne : https://jsonlint.com/
- Ou dans VS Code : clic droit > "Format Document"
