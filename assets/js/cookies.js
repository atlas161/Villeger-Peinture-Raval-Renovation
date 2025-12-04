// Gestion des cookies RGPD avec Google Tag Manager
document.addEventListener('DOMContentLoaded', function() {
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptCookiesBtn = document.getElementById('accept-cookies');
    const rejectCookiesBtn = document.getElementById('reject-cookies');
    const cookieSettingsBtn = document.getElementById('cookie-settings');
    const cookieSettingsModal = document.getElementById('cookie-settings-modal');
    const saveCookieSettingsBtn = document.getElementById('save-cookie-settings');
    const analyticsCheckbox = document.getElementById('analytics-cookies');
    
    // Vérifier si l'utilisateur a déjà fait un choix concernant les cookies
    if (!getCookie('cookie_consent')) {
        // Différer l'affichage de la bannière pour ne pas impacter le LCP
        // Attendre que le contenu principal soit affiché (après 2.5s ou interaction)
        const showBanner = () => {
            if (cookieBanner) {
                cookieBanner.style.display = 'block';
                cookieBanner.classList.add('cookie-banner-visible');
            }
        };
        
        // Afficher après 2.5s ou à la première interaction
        const bannerTimeout = setTimeout(showBanner, 2500);
        ['scroll', 'click', 'touchstart'].forEach(function(e) {
            window.addEventListener(e, function handler() {
                clearTimeout(bannerTimeout);
                showBanner();
                window.removeEventListener(e, handler);
            }, { once: true, passive: true });
        });
    } else if (getCookie('cookie_consent') === 'all' && getCookie('analytics_cookies') === 'true') {
        // Charger GTM si déjà accepté
        loadGoogleTagManager();
    }
    
    // Accepter tous les cookies
    if (acceptCookiesBtn) {
        acceptCookiesBtn.addEventListener('click', function() {
            setCookie('cookie_consent', 'all', 365);
            setCookie('analytics_cookies', 'true', 365);
            if (cookieBanner) cookieBanner.style.display = 'none';
            loadGoogleTagManager();
        });
    }
    
    // Refuser tous les cookies (sauf ceux strictement nécessaires)
    if (rejectCookiesBtn) {
        rejectCookiesBtn.addEventListener('click', function() {
            setCookie('cookie_consent', 'necessary', 365);
            setCookie('analytics_cookies', 'false', 365);
            if (cookieBanner) cookieBanner.style.display = 'none';
        });
    }
    
    // Afficher les paramètres avancés
    if (cookieSettingsBtn && cookieSettingsModal) {
        cookieSettingsBtn.addEventListener('click', function() {
            cookieSettingsModal.style.display = 'block';
        });
    }
    
    // Sauvegarder les paramètres
    if (saveCookieSettingsBtn) {
        saveCookieSettingsBtn.addEventListener('click', function() {
            const analyticsAccepted = analyticsCheckbox ? analyticsCheckbox.checked : false;
            setCookie('cookie_consent', analyticsAccepted ? 'all' : 'necessary', 365);
            setCookie('analytics_cookies', analyticsAccepted ? 'true' : 'false', 365);
            if (cookieSettingsModal) cookieSettingsModal.style.display = 'none';
            if (cookieBanner) cookieBanner.style.display = 'none';
            
            if (analyticsAccepted) {
                loadGoogleTagManager();
            }
        });
    }
    
    // Fermer la modale en cliquant en dehors
    window.addEventListener('click', function(event) {
        if (cookieSettingsModal && event.target === cookieSettingsModal) {
            cookieSettingsModal.style.display = 'none';
        }
    });
});

// Fonction pour définir un cookie
function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = 'expires=' + d.toUTCString();
    document.cookie = name + '=' + value + ';' + expires + ';path=/;SameSite=Lax;Secure';
}

// Fonction pour récupérer un cookie
function getCookie(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Fonction pour charger Google Tag Manager (uniquement après consentement)
function loadGoogleTagManager() {
    // Éviter de charger GTM plusieurs fois
    if (window.gtmLoaded) return;
    window.gtmLoaded = true;
    
    const gtmId = window.GTM_ID || 'GTM-NKPGDBPG';
    
    // Charger le script GTM
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtm.js?id=' + gtmId;
    document.head.appendChild(script);
    
    // Initialiser dataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        'gtm.start': new Date().getTime(),
        'event': 'gtm.js'
    });
    
    // Envoyer l'événement de consentement
    window.dataLayer.push({
        'event': 'cookie_consent_granted',
        'analytics_storage': 'granted',
        'ad_storage': 'granted'
    });
    
    console.log('✅ Google Tag Manager chargé après consentement');
}
