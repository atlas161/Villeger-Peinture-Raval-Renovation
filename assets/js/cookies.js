// Gestion des cookies RGPD
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
        cookieBanner.style.display = 'block';
    }
    
    // Accepter tous les cookies
    acceptCookiesBtn.addEventListener('click', function() {
        setCookie('cookie_consent', 'all', 365);
        setCookie('analytics_cookies', 'true', 365);
        cookieBanner.style.display = 'none';
        loadGoogleAnalytics();
    });
    
    // Refuser tous les cookies (sauf ceux strictement nécessaires)
    rejectCookiesBtn.addEventListener('click', function() {
        setCookie('cookie_consent', 'necessary', 365);
        setCookie('analytics_cookies', 'false', 365);
        cookieBanner.style.display = 'none';
    });
    
    // Afficher les paramètres avancés
    cookieSettingsBtn.addEventListener('click', function() {
        cookieSettingsModal.style.display = 'block';
    });
    
    // Sauvegarder les paramètres
    saveCookieSettingsBtn.addEventListener('click', function() {
        const analyticsAccepted = analyticsCheckbox.checked;
        setCookie('cookie_consent', analyticsAccepted ? 'all' : 'necessary', 365);
        setCookie('analytics_cookies', analyticsAccepted ? 'true' : 'false', 365);
        cookieSettingsModal.style.display = 'none';
        cookieBanner.style.display = 'none';
        
        if (analyticsAccepted) {
            loadGoogleAnalytics();
        }
    });
    
    // Fermer la modale en cliquant en dehors
    window.addEventListener('click', function(event) {
        if (event.target === cookieSettingsModal) {
            cookieSettingsModal.style.display = 'none';
        }
    });
    
    // Charger Google Analytics si accepté
    if (getCookie('cookie_consent') === 'all' && getCookie('analytics_cookies') === 'true') {
        loadGoogleAnalytics();
    }
});

// Fonction pour définir un cookie
function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = 'expires=' + d.toUTCString();
    document.cookie = name + '=' + value + ';' + expires + ';path=/;SameSite=Lax';
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

// Fonction pour charger Google Analytics
function loadGoogleAnalytics() {
    // Vérifier si Google Tag Manager est déjà chargé
    if (window.dataLayer && Array.isArray(window.dataLayer)) {
        window.dataLayer.push({
            'event': 'cookie_consent_update',
            'analytics_storage': 'granted'
        });
    }
}
