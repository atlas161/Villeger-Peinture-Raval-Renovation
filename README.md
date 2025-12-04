# 🏠 VPRR - Villéger Peinture Raval Rénovation

[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR-BADGE-ID/deploy-status)](https://app.netlify.com/sites/vprr/deploys)

Site web vitrine pour **Villéger Peinture Raval Rénovation**, entreprise spécialisée en rénovation à Angoulême et en Charente.

🌐 **Site en production** : [https://vprr.fr](https://vprr.fr)

---

## 📁 Structure du projet

```
vprr.fr/
├── 📄 index.html              # Page principale
├── 📄 mentions-legales.html   # Mentions légales
├── 📄 merci.html              # Page de confirmation formulaire
├── 📄 404.html                # Page d'erreur 404
│
├── 📁 assets/                 # Ressources du site
│   ├── 📁 css/                # Feuilles de style
│   │   ├── styles.css         # Styles principaux
│   │   ├── nav.css            # Navigation
│   │   ├── hero.css           # Section hero
│   │   ├── contact.css        # Section contact
│   │   ├── faq.css            # Section FAQ
│   │   ├── zone.css           # Section zone d'intervention
│   │   └── cookies.css        # Bannière cookies
│   │
│   ├── 📁 js/                 # Scripts JavaScript
│   │   ├── main.js            # Script principal
│   │   ├── config-loader.js   # Chargeur de configuration
│   │   ├── form-security.js   # Sécurité formulaire anti-spam
│   │   ├── performance.js     # Optimisations de performance
│   │   └── cookies.js         # Gestion des cookies
│   │
│   ├── 📁 img/                # Images du site
│   └── 📁 fonts/              # Polices personnalisées
│
├── 📁 media/                  # Médias de l'entreprise
│   ├── VPRR-LOGO.svg          # Logo principal (vectoriel)
│   └── 📁 favicon/            # Favicons
│
├── 📁 data/                   # Données configurables
│   ├── config.json            # ⭐ Configuration du site
│   └── README.md              # Documentation config
│
├── 📁 .well-known/            # Fichiers standards web
│   └── security.txt           # Contact sécurité
│
├── 📄 robots.txt              # Instructions pour les robots
├── 📄 sitemap.xml             # Plan du site pour SEO
├── 📄 llms.txt                # Infos pour les IA
├── 📄 humans.txt              # Crédits humains
├── 📄 netlify.toml            # Configuration Netlify
├── 📄 _redirects              # Redirections Netlify
├── 📄 .gitignore              # Fichiers ignorés par Git
└── 📄 .editorconfig           # Config éditeur
```

---

## ⚡ Modifier le contenu du site

### Via le fichier de configuration

Le contenu du site est centralisé dans `data/config.json`. Vous pouvez modifier :

| Section | Ce que vous pouvez changer |
|---------|---------------------------|
| `hero` | Titre, sous-titre, image d'accueil, boutons |
| `services` | Les 4 cartes de services |
| `faq` | Questions et réponses |
| `zone` | Liste des villes desservies |
| `business` | Email, téléphone, adresse, réseaux sociaux |
| `sections` | Titres de chaque section |

### Workflow de mise à jour

```bash
# 1. Modifier data/config.json
# 2. Commit et push
git add .
git commit -m "Mise à jour du contenu"
git push

# 3. Netlify déploie automatiquement (< 1 min)
```

---

## 🔧 Développement local

### Prérequis
- Un navigateur web moderne
- Un serveur local (optionnel mais recommandé)

### Lancer le site en local

**Option 1 : VS Code Live Server**
1. Installer l'extension "Live Server"
2. Clic droit sur `index.html` > "Open with Live Server"

**Option 2 : Python**
```bash
# Python 3
python -m http.server 8000

# Puis ouvrir http://localhost:8000
```

**Option 3 : Node.js**
```bash
npx serve .
```

---

## 🚀 Déploiement

Le site est hébergé sur **Netlify** avec déploiement automatique.

| Branche | URL | Description |
|---------|-----|-------------|
| `main` | https://vprr.fr | Production |

### Déployer manuellement
```bash
git push origin main
```

Netlify détecte automatiquement le push et déploie en ~30 secondes.

---

## 🔒 Sécurité

Le site implémente les bonnes pratiques de sécurité :

- ✅ HTTPS forcé (HSTS)
- ✅ Headers de sécurité (X-Frame-Options, CSP, etc.)
- ✅ Pas de dépendances npm vulnérables
- ✅ Formulaire protégé par Netlify
- ✅ Fichier `security.txt` pour la divulgation responsable

---

## 📊 SEO & Performance

### Optimisations SEO
- ✅ Balises meta complètes
- ✅ Open Graph pour les réseaux sociaux
- ✅ Schema.org (LocalBusiness, FAQ, etc.)
- ✅ Sitemap XML
- ✅ robots.txt optimisé pour les IA

### Performance
- ✅ Pas de framework lourd (Vanilla JS)
- ✅ CSS séparé par composant
- ✅ Images optimisées
- ✅ Cache agressif sur les assets
- ✅ Preload des ressources critiques

---

## 📞 Contact

**Villéger Peinture Raval Rénovation**
- 📧 Email : villergerstephane204@gmail.com
- 📱 Téléphone : 06 59 26 86 23
- 📍 Adresse : 136 Avenue de la République, 16340 L'Isle-d'Espagnac
- 📸 Instagram : [@peinture_raval_renovation](https://www.instagram.com/peinture_raval_renovation/)

---

## 📄 Licence

© 2025 Villéger Peinture Raval Rénovation. Tous droits réservés.
