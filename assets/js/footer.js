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

  // Bannière de cookies (RGPD) : choix binaire « tout accepter » / « tout refuser », mémorisé dans localStorage
  // ('cookie-consent' = 'accepted' | 'rejected'). Google Tag Manager et Microsoft Clarity ne sont chargés
  // qu'après un « tout accepter ».
  function initCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    if (!banner) return;

    const read = () => { try { return localStorage.getItem('cookie-consent'); } catch (_) { return null; } };
    const write = (value) => { try { localStorage.setItem('cookie-consent', value); } catch (_) {} };
    const clear = () => { try { localStorage.removeItem('cookie-consent'); } catch (_) {} };

    // Ancienne clé (bannière avec paramètres) : plus utilisée
    try { localStorage.removeItem('analytics-cookies'); } catch (_) {}

    const hide = () => {
      banner.classList.remove('cookie-banner-visible');
      banner.style.display = 'none';
    };
    const show = () => {
      banner.style.display = 'flex';
      void banner.offsetWidth; // reflow : déclenche la transition d'apparition
      banner.classList.add('cookie-banner-visible');
    };

    // Retire le consentement déjà donné aux outils de mesure (si chargés dans cette page)
    const revokeAnalytics = () => {
      try {
        if (typeof window.clarity === 'function') {
          window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' });
          window.clarity('consent', false);
        }
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'cookie_consent_revoked', analytics_storage: 'denied', ad_storage: 'denied' });
      } catch (_) {}
    };

    const accept = () => {
      write('accepted');
      hide();
      loadAnalytics();
    };
    const reject = () => {
      const hadAccepted = read() === 'accepted';
      write('rejected');
      hide();
      if (hadAccepted) revokeAnalytics();
    };

    const acceptBtn = document.getElementById('accept-cookies');
    const rejectBtn = document.getElementById('reject-cookies');
    if (acceptBtn) acceptBtn.addEventListener('click', accept);
    if (rejectBtn) rejectBtn.addEventListener('click', reject);

    // « Gérer mes cookies » (pied de page, mentions légales) : réaffiche la bannière sur place, sans recharger
    // ni déplacer la page. Le choix précédent reste en vigueur tant que le visiteur n'en fait pas un nouveau.
    document.querySelectorAll('[data-open-cookie-settings]').forEach((el) => {
      el.addEventListener('click', (ev) => {
        ev.preventDefault();
        show();
        if (acceptBtn) acceptBtn.focus({ preventScroll: true });
      });
    });

    // Choix déjà fait : on applique et on n'affiche rien
    const consent = read();
    if (consent) {
      hide();
      if (consent === 'accepted') loadAnalytics();
      return;
    }

    // Première visite : bannière affichée après 1 s (ou dès la première interaction), pour ne pas peser sur le LCP
    let shown = false;
    const showFirst = () => {
      if (shown || read()) return;
      shown = true;
      show();
    };
    const timer = setTimeout(showFirst, 1000);
    ['scroll', 'touchstart', 'keydown'].forEach((evt) => {
      window.addEventListener(evt, () => { clearTimeout(timer); showFirst(); }, { once: true, passive: true });
    });
  }

  // Outils de mesure d'audience : chargés UNIQUEMENT après consentement aux cookies d'analyse
  function loadAnalytics() {
    loadGoogleTagManager();
    loadMicrosoftClarity();
    trackConversions();
  }

  // Suivi des conversions (clic téléphone, clic « devis », formulaire envoyé) : événements envoyés à GTM
  // (dataLayer) et à Clarity, uniquement tant que le visiteur a accepté les cookies de mesure.
  function trackConversions() {
    if (window.conversionTrackingOn) return;
    window.conversionTrackingOn = true;

    const consented = () => {
      try { return localStorage.getItem('cookie-consent') === 'accepted'; } catch (_) { return false; }
    };
    const send = (name, params) => {
      if (!consented()) return;
      const data = Object.assign({ page: location.pathname }, params);
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(Object.assign({ event: name }, data));
      if (typeof window.clarity === 'function') window.clarity('event', name);
    };
    // Emplacement du bouton cliqué, pour comparer barre mobile / en-tête / hero / pied de page
    const placement = (el) => {
      if (el.closest('.mobile-cta-bar')) return 'barre_mobile';
      if (el.closest('.site-header')) return 'menu';
      if (el.closest('.service-hero, #home, .hero')) return 'hero';
      if (el.closest('.site-footer')) return 'pied_de_page';
      if (el.closest('#contact, .contact-cta-section')) return 'contact';
      return 'page';
    };

    document.addEventListener('click', (ev) => {
      const a = ev.target.closest && ev.target.closest('a[href]');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      if (href.indexOf('tel:') === 0) send('phone_click', { placement: placement(a) });
      else if (/(^|\/)contact\.html(\?[^#]*)?$/.test(href)) send('quote_cta_click', { placement: placement(a) });
    }, { passive: true });

    // Page de remerciement = formulaire envoyé avec succès (le visiteur y est redirigé par /api/contact)
    if (/\/merci(\.html)?$/.test(location.pathname)) send('generate_lead', { method: 'formulaire' });
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
