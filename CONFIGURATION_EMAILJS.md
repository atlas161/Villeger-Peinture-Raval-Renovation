# Configuration EmailJS pour le Formulaire de Contact

## 🚀 Étapes de Configuration

### 1. Créer un compte EmailJS
1. Allez sur [https://www.emailjs.com/](https://www.emailjs.com/)
2. Créez un compte gratuit
3. Confirmez votre email

### 2. Configurer le service email
1. Dans le dashboard EmailJS, allez dans **"Email Services"**
2. Cliquez sur **"Add New Service"**
3. Choisissez **Gmail** (recommandé)
4. Connectez votre compte Gmail `villergerstephane204@gmail.com`
5. Notez le **Service ID** généré (ex: `service_xyz123`)

### 3. Créer un template d'email
1. Allez dans **"Email Templates"**
2. Cliquez sur **"Create New Template"**
3. Utilisez ce template :

```html
Sujet: Nouveau message de contact - {{nom}}

Bonjour,

Vous avez reçu un nouveau message via le formulaire de contact du site web :

Nom : {{nom}}
Email : {{email}}
Téléphone : {{telephone}}
Type de projet : {{prestation}}

Message :
{{message}}

---
Ce message a été envoyé automatiquement depuis le site web.
```

4. Notez le **Template ID** généré (ex: `template_abc456`)

### 4. Obtenir la clé publique
1. Allez dans **"Account"** > **"General"**
2. Copiez votre **Public Key** (ex: `user_def789`)

### 5. Mettre à jour le fichier JavaScript
Ouvrez le fichier `assets/js/contact.js` et remplacez les valeurs dans `EMAILJS_CONFIG` :

```javascript
const EMAILJS_CONFIG = {
    publicKey: 'user_def789',        // Votre Public Key
    serviceId: 'service_xyz123',     // Votre Service ID
    templateId: 'template_abc456'    // Votre Template ID
};
```

## 🧪 Test du Formulaire

1. Ouvrez votre site web
2. Allez à la section Contact
3. Remplissez le formulaire avec des données de test
4. Cliquez sur "Envoyer"
5. Vérifiez que vous recevez l'email sur `villergerstephane204@gmail.com`

## 📋 Template EmailJS Recommandé

### Variables disponibles :
- `{{nom}}` - Nom du contact
- `{{email}}` - Email du contact  
- `{{telephone}}` - Téléphone du contact
- `{{prestation}}` - Type de projet sélectionné
- `{{message}}` - Message du contact
- `{{to_email}}` - Email de destination (villergerstephane204@gmail.com)

### Template HTML complet :
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #673A12; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #673A12; }
        .footer { background: #eee; padding: 15px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Nouveau message de contact</h2>
        </div>
        <div class="content">
            <div class="field">
                <span class="label">Nom :</span> {{nom}}
            </div>
            <div class="field">
                <span class="label">Email :</span> {{email}}
            </div>
            <div class="field">
                <span class="label">Téléphone :</span> {{telephone}}
            </div>
            <div class="field">
                <span class="label">Type de projet :</span> {{prestation}}
            </div>
            <div class="field">
                <span class="label">Message :</span><br>
                {{message}}
            </div>
        </div>
        <div class="footer">
            Ce message a été envoyé depuis le site web Villéger Peinture Raval Rénovation.
        </div>
    </div>
</body>
</html>
```

## 🔧 Dépannage

### Le formulaire ne s'envoie pas :
1. Vérifiez que les identifiants dans `contact.js` sont corrects
2. Ouvrez la console du navigateur (F12) pour voir les erreurs
3. Vérifiez que votre service EmailJS est actif

### Emails non reçus :
1. Vérifiez le dossier spam de `villergerstephane204@gmail.com`
2. Vérifiez que le service Gmail est bien connecté dans EmailJS
3. Testez avec l'outil de test d'EmailJS

### Limite gratuite :
- EmailJS gratuit : 200 emails/mois
- Pour plus : passez au plan payant

## 📞 Support
En cas de problème, contactez le support EmailJS ou consultez leur documentation : [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
