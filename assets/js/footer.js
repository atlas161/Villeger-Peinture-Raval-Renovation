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

  // Gestion de la bannière de cookies (RGPD) + chargement conditionnel de Google Tag Manager
  function initCookieBanner() {
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('accept-cookies');
    const rejectBtn = document.getElementById('reject-cookies');
    const settingsBtn = document.getElementById('cookie-settings');
    const modal = document.getElementById('cookie-settings-modal');
    const saveBtn = document.getElementById('save-cookie-settings');
    const analyticsCheckbox = document.getElementById('analytics-cookies');

    if (!cookieBanner) return;

    // Vérifier si le consentement a déjà été donné
    const cookieConsent = localStorage.getItem('cookie-consent');
    if (cookieConsent) {
      cookieBanner.style.display = 'none';
      if (cookieConsent === 'accepted' && localStorage.getItem('analytics-cookies') !== 'false') {
        loadGoogleTagManager();
      }
      return;
    }

    // Afficher la bannière (différé pour ne pas impacter le LCP)
    const showBanner = () => {
      cookieBanner.style.display = 'block';
    };
    const bannerTimeout = setTimeout(showBanner, 1000);
    ['scroll', 'click', 'touchstart'].forEach(evt => {
      window.addEventListener(evt, function handler() {
        clearTimeout(bannerTimeout);
        showBanner();
        window.removeEventListener(evt, handler);
      }, { once: true, passive: true });
    });

    // Gérer les clics
    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        localStorage.setItem('cookie-consent', 'accepted');
        localStorage.setItem('analytics-cookies', 'true');
        cookieBanner.style.display = 'none';
        loadGoogleTagManager();
      });
    }

    if (rejectBtn) {
      rejectBtn.addEventListener('click', () => {
        localStorage.setItem('cookie-consent', 'rejected');
        localStorage.setItem('analytics-cookies', 'false');
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
        const analyticsCookies = analyticsCheckbox ? analyticsCheckbox.checked : false;
        localStorage.setItem('cookie-consent', analyticsCookies ? 'accepted' : 'rejected');
        localStorage.setItem('analytics-cookies', analyticsCookies ? 'true' : 'false');
        modal.style.display = 'none';
        cookieBanner.style.display = 'none';

        if (analyticsCookies) {
          loadGoogleTagManager();
        }
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

  // Charge Google Tag Manager une seule fois, uniquement après consentement analytics
  function loadGoogleTagManager() {
    if (window.gtmLoaded) return;
    window.gtmLoaded = true;

    const gtmId = window.GTM_ID || 'GTM-NKPGDBPG';

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtm.js?id=' + gtmId;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    });
    window.dataLayer.push({
      event: 'cookie_consent_granted',
      analytics_storage: 'granted',
      ad_storage: 'granted'
    });
  }

  // Inclure le footer quand le DOM est chargé
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', includeFooter);
  } else {
    includeFooter();
  }
})();
