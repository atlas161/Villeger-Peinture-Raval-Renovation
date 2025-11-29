// Configuration EmailJS
// IMPORTANT: Remplacez ces valeurs par vos propres identifiants EmailJS
const EMAILJS_CONFIG = {
    publicKey: 'YOUR_PUBLIC_KEY', // À remplacer par votre clé publique EmailJS
    serviceId: 'YOUR_SERVICE_ID', // À remplacer par votre service ID
    templateId: 'YOUR_TEMPLATE_ID' // À remplacer par votre template ID
};

// Initialisation d'EmailJS
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser EmailJS avec la clé publique
    emailjs.init(EMAILJS_CONFIG.publicKey);
    
    // Gérer la soumission du formulaire
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Gérer le sélecteur personnalisé
    initCustomSelect();
});

// Fonction pour gérer la soumission du formulaire
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const messagesDiv = document.getElementById('form-messages');
    
    // Désactiver le bouton et changer le texte
    submitButton.disabled = true;
    submitButton.textContent = 'Envoi en cours...';
    
    try {
        // Récupérer les données du formulaire
        const formData = new FormData(form);
        const templateParams = {
            nom: formData.get('nom'),
            email: formData.get('email'),
            telephone: formData.get('telephone'),
            prestation: formData.get('prestation'),
            message: formData.get('message'),
            to_email: 'villergerstephane204@gmail.com'
        };
        
        // Envoyer l'email via EmailJS
        const response = await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            templateParams
        );
        
        // Succès
        showMessage('Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.', 'success');
        form.reset();
        resetCustomSelect();
        
    } catch (error) {
        console.error('Erreur lors de l\'envoi:', error);
        showMessage('Une erreur est survenue lors de l\'envoi. Veuillez réessayer ou nous contacter directement.', 'error');
    } finally {
        // Réactiver le bouton
        submitButton.disabled = false;
        submitButton.textContent = 'Envoyer';
    }
}

// Fonction pour afficher les messages
function showMessage(message, type) {
    const messagesDiv = document.getElementById('form-messages');
    messagesDiv.className = `form-messages ${type}`;
    messagesDiv.textContent = message;
    messagesDiv.style.display = 'block';
    
    // Faire défiler vers le message
    messagesDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Masquer le message après 10 secondes pour les succès
    if (type === 'success') {
        setTimeout(() => {
            messagesDiv.style.display = 'none';
        }, 10000);
    }
}

// Fonction pour initialiser le sélecteur personnalisé
function initCustomSelect() {
    const selectContainer = document.getElementById('apple-select');
    const trigger = selectContainer?.querySelector('.apple-select-trigger');
    const dropdown = selectContainer?.querySelector('.apple-select-dropdown');
    const hiddenInput = document.getElementById('contact-prestation');
    const valueSpan = selectContainer?.querySelector('.apple-select-value');
    
    if (!selectContainer || !trigger || !dropdown || !hiddenInput || !valueSpan) return;
    
    // Ouvrir/fermer le dropdown
    trigger.addEventListener('click', function() {
        const isOpen = dropdown.style.display === 'block';
        dropdown.style.display = isOpen ? 'none' : 'block';
        selectContainer.classList.toggle('open', !isOpen);
    });
    
    // Gérer la sélection d'une option
    const options = dropdown.querySelectorAll('.apple-select-option');
    options.forEach(option => {
        option.addEventListener('click', function() {
            const value = this.getAttribute('data-value');
            const text = this.textContent;
            
            hiddenInput.value = value;
            valueSpan.textContent = text;
            valueSpan.classList.remove('placeholder');
            
            dropdown.style.display = 'none';
            selectContainer.classList.remove('open');
        });
    });
    
    // Fermer le dropdown si on clique ailleurs
    document.addEventListener('click', function(event) {
        if (!selectContainer.contains(event.target)) {
            dropdown.style.display = 'none';
            selectContainer.classList.remove('open');
        }
    });
}

// Fonction pour réinitialiser le sélecteur personnalisé
function resetCustomSelect() {
    const selectContainer = document.getElementById('apple-select');
    const valueSpan = selectContainer?.querySelector('.apple-select-value');
    const hiddenInput = document.getElementById('contact-prestation');
    
    if (valueSpan && hiddenInput) {
        valueSpan.textContent = 'Choisir un service';
        valueSpan.classList.add('placeholder');
        hiddenInput.value = '';
    }
}
