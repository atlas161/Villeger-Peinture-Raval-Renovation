// Footer inclusion script
(function() {
  'use strict';

  // Fonction pour charger et inclure le footer universel
  function includeFooter() {
    // Détecter si on est dans une page blog pour ajuster le chemin
    const isBlogPage = window.location.pathname.includes('/blog/');
    const footerFile = isBlogPage ? '../includes/footer.html' : 'includes/footer.html';

    // Charger le footer
    fetch(footerFile)
      .then(response => response.text())
      .then(html => {
        // Insérer le footer à la fin du body
        const footerContainer = document.createElement('div');
        footerContainer.innerHTML = html;
        document.body.appendChild(footerContainer);

        // Mettre à jour l'année courante
        const yearElement = document.getElementById('current-year');
        if (yearElement) {
          yearElement.textContent = new Date().getFullYear();
        }

        // Initialiser les scripts du footer (cookies, etc.)
        initializeFooterScripts();
      })
      .catch(error => {
        console.warn('Impossible de charger le footer:', error);
      });
  }

  // Initialiser les scripts spécifiques au footer
  function initializeFooterScripts() {
    // Script de gestion des cookies
    initCookieBanner();
    
    // Autres scripts du footer si nécessaire
  }

  // Gestion de la bannière de cookies
  function initCookieBanner() {
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('accept-cookies');
    const rejectBtn = document.getElementById('reject-cookies');
    const settingsBtn = document.getElementById('cookie-settings');
    const modal = document.getElementById('cookie-settings-modal');
    const saveBtn = document.getElementById('save-cookie-settings');

    if (!cookieBanner) return;

    // Vérifier si le consentement a déjà été donné
    const cookieConsent = localStorage.getItem('cookie-consent');
    if (cookieConsent) {
      cookieBanner.style.display = 'none';
      return;
    }

    // Afficher la bannière
    setTimeout(() => {
      cookieBanner.style.display = 'block';
    }, 1000);

    // Gérer les clics
    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        localStorage.setItem('cookie-consent', 'accepted');
        cookieBanner.style.display = 'none';
      });
    }

    if (rejectBtn) {
      rejectBtn.addEventListener('click', () => {
        localStorage.setItem('cookie-consent', 'rejected');
        cookieBanner.style.display = 'none';
      });
    }

    if (settingsBtn && modal) {
      settingsBtn.addEventListener('click', () => {
        modal.style.display = 'block';
      });
    }

    if (saveBtn && modal) {
      saveBtn.addEventListener('click', () => {
        const analyticsCookies = document.getElementById('analytics-cookies').checked;
        localStorage.setItem('cookie-consent', analyticsCookies ? 'accepted' : 'rejected');
        localStorage.setItem('analytics-cookies', analyticsCookies);
        modal.style.display = 'none';
        cookieBanner.style.display = 'none';
      });
    }

    // Fermer la modale en cliquant à l'extérieur
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      });
    }
  }

  // Inclure le footer quand le DOM est chargé
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', includeFooter);
  } else {
    includeFooter();
  }
})();
