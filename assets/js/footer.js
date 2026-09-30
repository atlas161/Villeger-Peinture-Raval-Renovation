// Footer inclusion script
(function() {
  'use strict';

  // Fonction pour charger et inclure le footer universel
  function includeFooter() {
    // En production le footer est déjà inclus dans le HTML par scripts/build-site.js :
    // on ne fait que l'initialiser. Le fetch ci-dessous ne sert qu'en local (npx serve .).
    if (document.getElementById('site-footer-wrapper')) {
      const year = document.getElementById('current-year');
      if (year) year.textContent = new Date().getFullYear();
      initializeFooterScripts();
      return;
    }

    // Détecter si on est dans une page blog pour ajuster le chemin
    const isBlogPage = window.location.pathname.includes('/blog/');
    const footerFile = isBlogPage ? '../includes/footer.html' : 'includes/footer.html';

    // Charger le footer
    fetch(footerFile)
      .then(response => response.text())
      .then(html => {
        // Insérer le footer à la fin du body
        const footerContainer = document.createElement('div');
        footerContainer.id = 'site-footer-wrapper';
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

    // Liens/boutons « Gérer mes cookies » : on efface le choix mémorisé et on recharge pour réafficher la bannière
    document.querySelectorAll('[data-open-cookie-settings]').forEach((el) => {
      el.addEventListener('click', (ev) => {
        ev.preventDefault();
        try {
          if (typeof window.clarity === 'function') {
            window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' });
          }
          localStorage.removeItem('cookie-consent');
          localStorage.removeItem('analytics-cookies');
        } catch (_) {}
        window.location.reload();
      });
    });

    // Vérifier si le consentement a déjà été donné
    const cookieConsent = localStorage.getItem('cookie-consent');
    if (cookieConsent) {
      cookieBanner.style.display = 'none';
      if (cookieConsent === 'accepted' && localStorage.getItem('analytics-cookies') !== 'false') {
        loadAnalytics();
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
        loadAnalytics();
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
          loadAnalytics();
        } else if (typeof window.clarity === 'function') {
          window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' });
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

  // Outils de mesure d'audience : chargés UNIQUEMENT après consentement aux cookies d'analyse
  function loadAnalytics() {
    loadGoogleTagManager();
    loadMicrosoftClarity();
  }

  // Microsoft Clarity (analyse de navigation), chargé une seule fois
  function loadMicrosoftClarity() {
    if (window.clarityLoaded) return;
    window.clarityLoaded = true;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', 'ypwg9bye24');
    // Consentement déjà obtenu via notre bannière : analyse autorisée, publicité refusée
    window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' });
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
