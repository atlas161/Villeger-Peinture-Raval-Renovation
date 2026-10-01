# Pages CMS — guide d'utilisation (client et développeur)

Pages CMS ([app.pagescms.org](https://app.pagescms.org)) est l'interface qui permet de modifier le site **sans toucher au code** :
on se connecte avec son compte GitHub, on choisit le dépôt `atlas161/Villeger-Peinture-Raval-Renovation`, branche `main`.
Chaque enregistrement crée un commit ; Netlify republie le site en ≈ 1 minute.

## Ce qu'on peut modifier

| Menu (barre de gauche) | Ce que ça change |
|---|---|
| **Réalisations (photos de chantiers)** | la page *Réalisations* : une carte avant/après par chantier |
| **Pages de service** → *Ravalement, Nettoyage façade, Nettoyage toiture, Peinture, Isolation* | tout le texte et les photos de chaque page de service (en-tête, problème, solution, FAQ…) |
| **Tarifs (prix au m²)** | les fourchettes de prix des 5 pages de service, au même endroit |
| **À propos** | la page *À propos* : portrait de Stéphane Villéger, parcours, engagements, informations clés |
| **Textes communs** | communes desservies, descriptions des services, cartes « Pourquoi nous choisir » (partagées par toutes les pages) |
| **Articles de blog** | les articles |

Dans chaque page de service, les blocs sont numérotés **dans l'ordre où ils apparaissent sur le site** (1. Référencement, 2. En-tête, 3. Avant/après, 4. Problème…).

## Recettes

### Ajouter un chantier avant/après
1. **Réalisations** → dans « Chantiers », cliquer **Ajouter**.
2. **Photo AVANT** → *Importer* : choisir la photo sur l'ordinateur ou le téléphone (JPG, PNG ou WebP, n'importe quelle taille : le site la
   redimensionne et la convertit automatiquement). Idem **Photo APRÈS**.
3. Remplir le titre (ex. « Ravalement de façade à Soyaux »), choisir la catégorie (sert au filtre de la page) et la page service liée ;
   la commune et la durée sont facultatives.
4. *Enregistrer*. Pour cacher un chantier sans le supprimer : cocher **Brouillon**.

> Conseil photos : même cadrage avant et après, format paysage, lumière du jour. Les cartes affichent les photos en 4/3 (le bord peut être rogné).

### Ajouter le portrait de Stéphane Villéger
**À propos** → bloc « Portrait du dirigeant » : *Importer* la photo, remplir la description de la photo, la fonction et le texte du parcours.
La section « Qui est derrière VPRR » n'apparaît sur le site **que lorsque la photo et le texte sont tous les deux remplis**.

### Changer un prix
**Tarifs (prix au m²)** → ouvrir la prestation → modifier les 3 cartes (format `25-40 €/m²`). **Puis** mettre à jour la réponse à la
question « Quel est le prix… » dans la FAQ de la page de service concernée (et sur la page FAQ générale) : si les chiffres ne correspondent
pas, la vérification automatique du site (`npm test`) le signale au développeur.

### Changer les photos de l'en-tête d'une page de service
**Pages de service** → la page → bloc « 2. En-tête » : *Photo AVANT* puis *Photo APRÈS* (importer ou choisir une photo déjà importée).
Sans photos, une icône s'affiche à la place (cas de l'isolation). Le bloc « Avant / Après » plus bas réutilise les mêmes photos, sauf si l'on en renseigne d'autres.

### Modifier une question de FAQ
**Pages de service** → la page → « 11. Questions fréquentes ». Les questions sont aussi envoyées à Google : réponses complètes et exactes.

## Bon à savoir
- **Titre Google** : 60 caractères maximum (au-delà Google le coupe). **Description Google** : ≈ 160 caractères.
- Les **icônes** se choisissent dans une liste (pas besoin de connaître les codes).
- Les **adresses des pages** et le **référencement technique** (données structurées) ne sont volontairement pas modifiables : ils sont gérés par le développeur.
- Après un enregistrement, attendre ≈ 1 minute puis recharger le site (Ctrl+F5).
- Les photos importées vont dans le dossier `media/uploads/`. Pour une photo déjà en ligne, utiliser « Choisir » plutôt que de la réimporter.
- En cas d'erreur d'affichage après une modification, rien n'est perdu : chaque enregistrement est un commit GitHub, annulable.

## Pour le développeur
- La configuration est **générée** : `scripts/cms-config.js` → `npm run build:cms` → `.pages.yml`. Ne pas éditer `.pages.yml`.
- `npm test` (fichier `tests/cms.test.js`) vérifie que `.pages.yml` est à jour, que **chaque clé de chaque JSON est déclarée** (une clé non déclarée
  serait supprimée à la première sauvegarde dans l'éditeur), que les photos citées existent et que les prix de `content/tarifs.json` se retrouvent dans la FAQ.
- Les pages HTML à la racine sont régénérées au déploiement (`npm run build` côté Netlify) : après une modification faite via le CMS, le HTML
  commité peut être en retard sur le JSON jusqu'à la prochaine exécution locale de `npm run build:pages` / `build:content` (sans effet sur le site publié).
- Architecture des données et des générateurs : [`seo/architecture.md`](./seo/architecture.md) §4.2.
- Photos : `scripts/lib/media.js` (variantes WebP historiques ou Netlify Image CDN `/.netlify/images`).
