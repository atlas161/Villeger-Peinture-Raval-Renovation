/**
 * @file Sécurité du formulaire de contact VPRR
 * Protection contre les bots, spam et soumissions abusives
 */

(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════════════════
  
  const CONFIG = {
    // Délai minimum entre le chargement et la soumission (en ms)
    // Un humain met au moins 5 secondes pour remplir un formulaire
    MIN_FILL_TIME: 5000,
    
    // Délai entre deux soumissions (en ms) - 60 secondes
    RATE_LIMIT_DELAY: 60000,
    
    // Nombre max de soumissions par session
    MAX_SUBMISSIONS_PER_SESSION: 3,
    
    // Clé localStorage pour le rate limiting
    STORAGE_KEY: 'vprr_form_submissions',
    
    // Patterns d'email suspects (spam)
    SUSPICIOUS_EMAIL_PATTERNS: [
      /test@test/i,
      /admin@/i,
      /spam/i,
      /\.ru$/i,
      /\.cn$/i,
      /@mailinator/i,
      /@tempmail/i,
      /@throwaway/i,
      /@guerrillamail/i,
      /@10minutemail/i
    ],
    
    // Mots suspects dans le message (spam typique)
    SPAM_KEYWORDS: [
      'viagra', 'cialis', 'casino', 'lottery', 'winner', 'bitcoin',
      'crypto', 'investment opportunity', 'make money fast', 'click here',
      'free money', 'nigerian prince', 'inheritance', 'million dollars'
    ]
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // VARIABLES
  // ═══════════════════════════════════════════════════════════════════════════
  
  let formLoadTime = null;
  let isSubmitting = false;

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALISATION
  // ═══════════════════════════════════════════════════════════════════════════
  
  function init() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    // Enregistrer le moment du chargement
    formLoadTime = Date.now();
    
    // Définir le timestamp dans le champ caché
    const timestampField = document.getElementById('form-timestamp');
    if (timestampField) {
      timestampField.value = formLoadTime.toString();
    }

    // Ajouter la validation au submit
    form.addEventListener('submit', handleSubmit);
    
    // Validation en temps réel de l'email
    const emailField = document.getElementById('contact-email');
    if (emailField) {
      emailField.addEventListener('blur', validateEmail);
      emailField.addEventListener('input', clearEmailError);
    }

    // Validation du téléphone
    const phoneField = document.getElementById('contact-telephone');
    if (phoneField) {
      phoneField.addEventListener('input', formatPhoneNumber);
    }

    console.log('[Form Security] Protection activée');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GESTION DE LA SOUMISSION
  // ═══════════════════════════════════════════════════════════════════════════
  
  function handleSubmit(e) {
    const form = e.target;
    
    // Empêcher les doubles soumissions
    if (isSubmitting) {
      e.preventDefault();
      return false;
    }

    // Vérification 1: Honeypot (si rempli = bot)
    const honeypot = form.querySelector('input[name="bot-field"]');
    if (honeypot && honeypot.value !== '') {
      e.preventDefault();
      console.warn('[Form Security] Bot détecté via honeypot');
      showError('Une erreur est survenue. Veuillez réessayer.');
      return false;
    }

    // Vérification 2: Temps de remplissage minimum
    const fillTime = Date.now() - formLoadTime;
    if (fillTime < CONFIG.MIN_FILL_TIME) {
      e.preventDefault();
      console.warn('[Form Security] Soumission trop rapide:', fillTime, 'ms');
      showError('Veuillez prendre le temps de remplir le formulaire correctement.');
      return false;
    }

    // Vérification 3: Rate limiting
    if (!checkRateLimit()) {
      e.preventDefault();
      showError('Vous avez déjà envoyé un message récemment. Veuillez patienter avant de réessayer.');
      return false;
    }

    // Vérification 4: Email valide et non suspect
    const emailField = document.getElementById('contact-email');
    if (emailField && !isValidEmail(emailField.value)) {
      e.preventDefault();
      showFieldError(emailField, 'Veuillez entrer une adresse email valide.');
      emailField.focus();
      return false;
    }

    // Vérification 5: Détection de spam dans le message
    const messageField = document.getElementById('contact-message');
    if (messageField && containsSpam(messageField.value)) {
      e.preventDefault();
      console.warn('[Form Security] Contenu spam détecté');
      showError('Votre message a été identifié comme indésirable. Veuillez le reformuler.');
      return false;
    }

    // Vérification 6: Longueur minimale du message
    if (messageField && messageField.value.trim().length < 10) {
      e.preventDefault();
      showFieldError(messageField, 'Votre message est trop court. Décrivez brièvement votre projet.');
      messageField.focus();
      return false;
    }

    // Tout est OK - enregistrer la soumission
    isSubmitting = true;
    recordSubmission();
    
    // Désactiver le bouton pour éviter les doubles clics
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Envoi en cours...';
    }

    console.log('[Form Security] Formulaire validé, envoi autorisé');
    return true;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VALIDATION EMAIL
  // ═══════════════════════════════════════════════════════════════════════════
  
  function isValidEmail(email) {
    // Vérification format basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }

    // Vérification patterns suspects
    for (const pattern of CONFIG.SUSPICIOUS_EMAIL_PATTERNS) {
      if (pattern.test(email)) {
        console.warn('[Form Security] Email suspect détecté:', email);
        return false;
      }
    }

    // Vérification domaine valide (au moins 2 caractères après le point)
    const domain = email.split('@')[1];
    const tld = domain.split('.').pop();
    if (tld.length < 2) {
      return false;
    }

    return true;
  }

  function validateEmail(e) {
    const email = e.target.value;
    if (email && !isValidEmail(email)) {
      showFieldError(e.target, 'Adresse email invalide');
    }
  }

  function clearEmailError(e) {
    clearFieldError(e.target);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FORMATAGE TÉLÉPHONE
  // ═══════════════════════════════════════════════════════════════════════════
  
  function formatPhoneNumber(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    // Format français: 06 12 34 56 78
    if (value.length > 0) {
      if (value.startsWith('33')) {
        value = '0' + value.substring(2);
      }
      
      let formatted = '';
      for (let i = 0; i < value.length && i < 10; i++) {
        if (i > 0 && i % 2 === 0) {
          formatted += ' ';
        }
        formatted += value[i];
      }
      e.target.value = formatted;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DÉTECTION SPAM
  // ═══════════════════════════════════════════════════════════════════════════
  
  function containsSpam(text) {
    const lowerText = text.toLowerCase();
    
    // Vérifier les mots-clés spam
    for (const keyword of CONFIG.SPAM_KEYWORDS) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return true;
      }
    }

    // Vérifier trop de liens
    const urlCount = (text.match(/https?:\/\//gi) || []).length;
    if (urlCount > 2) {
      return true;
    }

    // Vérifier caractères répétés excessifs (ex: "aaaaaa")
    if (/(.)\1{5,}/.test(text)) {
      return true;
    }

    return false;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RATE LIMITING
  // ═══════════════════════════════════════════════════════════════════════════
  
  function checkRateLimit() {
    try {
      const data = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '{}');
      const now = Date.now();

      // Nettoyer les anciennes entrées (plus de 24h)
      if (data.submissions) {
        data.submissions = data.submissions.filter(
          time => now - time < 24 * 60 * 60 * 1000
        );
      } else {
        data.submissions = [];
      }

      // Vérifier le nombre de soumissions
      if (data.submissions.length >= CONFIG.MAX_SUBMISSIONS_PER_SESSION) {
        console.warn('[Form Security] Limite de soumissions atteinte');
        return false;
      }

      // Vérifier le délai depuis la dernière soumission
      const lastSubmission = data.submissions[data.submissions.length - 1];
      if (lastSubmission && now - lastSubmission < CONFIG.RATE_LIMIT_DELAY) {
        const waitTime = Math.ceil((CONFIG.RATE_LIMIT_DELAY - (now - lastSubmission)) / 1000);
        console.warn('[Form Security] Rate limit - attendre', waitTime, 'secondes');
        return false;
      }

      return true;
    } catch (e) {
      // En cas d'erreur localStorage, autoriser
      return true;
    }
  }

  function recordSubmission() {
    try {
      const data = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '{}');
      if (!data.submissions) {
        data.submissions = [];
      }
      data.submissions.push(Date.now());
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      // Ignorer les erreurs localStorage
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // AFFICHAGE DES ERREURS
  // ═══════════════════════════════════════════════════════════════════════════
  
  function showError(message) {
    // Supprimer l'ancienne erreur si elle existe
    const existingError = document.querySelector('.form-error-global');
    if (existingError) {
      existingError.remove();
    }

    // Créer le message d'erreur
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error-global';
    errorDiv.innerHTML = `
      <i class="fa-solid fa-exclamation-circle"></i>
      <span>${message}</span>
    `;
    errorDiv.style.cssText = `
      background: #fee2e2;
      border: 1px solid #ef4444;
      color: #dc2626;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      animation: shake 0.5s ease-in-out;
    `;

    // Insérer avant le formulaire
    const form = document.getElementById('contact-form');
    if (form) {
      form.insertBefore(errorDiv, form.firstChild);
      
      // Scroll vers l'erreur
      errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Supprimer après 5 secondes
      setTimeout(() => {
        errorDiv.remove();
      }, 5000);
    }
  }

  function showFieldError(field, message) {
    clearFieldError(field);
    
    const errorSpan = document.createElement('span');
    errorSpan.className = 'field-error';
    errorSpan.textContent = message;
    errorSpan.style.cssText = `
      color: #dc2626;
      font-size: 12px;
      margin-top: 4px;
      display: block;
    `;
    
    field.style.borderColor = '#ef4444';
    field.parentNode.appendChild(errorSpan);
  }

  function clearFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }
    field.style.borderColor = '';
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STYLES CSS DYNAMIQUES
  // ═══════════════════════════════════════════════════════════════════════════
  
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
      }
      
      .visually-hidden {
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
      }
      
      .contact-form button[type="submit"]:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    `;
    document.head.appendChild(style);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DÉMARRAGE
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Injecter les styles
  injectStyles();
  
  // Initialiser quand le DOM est prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
