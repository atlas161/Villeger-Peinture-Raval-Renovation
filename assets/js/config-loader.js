/**
 * @file Chargeur de configuration pour le site VPRR.
 * Charge config.json et applique les données dynamiquement au DOM.
 * Permet de modifier le contenu du site via un simple fichier JSON.
 */

(function() {
  'use strict';

  const CONFIG_PATH = 'data/config.json';

  /**
   * Charge et applique la configuration du site
   */
  async function loadConfig() {
    try {
      const response = await fetch(CONFIG_PATH);
      if (!response.ok) {
        console.warn('[Config] Fichier config.json non trouvé, utilisation des valeurs par défaut');
        return;
      }
      
      const config = await response.json();
      applyConfig(config);
      
      // Stocker la config globalement pour d'autres scripts
      window.VPRR_CONFIG = config;
      
      // Émettre un événement pour signaler que la config est chargée
      document.dispatchEvent(new CustomEvent('vprr:config-loaded', { detail: config }));
      
    } catch (error) {
      console.error('[Config] Erreur lors du chargement:', error);
    }
  }

  /**
   * Applique la configuration au DOM
   * @param {Object} config - Configuration chargée depuis config.json
   */
  function applyConfig(config) {
    // === HERO SECTION ===
    applyHeroConfig(config.hero);
    
    // === SERVICES ===
    applyServicesConfig(config.services, config.sections?.services);
    
    // === FAQ ===
    applyFaqConfig(config.faq, config.sections?.faq);
    
    // === CONTACT INFO ===
    applyContactConfig(config.business);
    
    // === ZONE D'INTERVENTION ===
    applyZoneConfig(config.zone, config.business, config.sections?.zone);
    
    // === SECTIONS HEADERS ===
    applySectionHeaders(config.sections);
    
    // === FORM OPTIONS ===
    applyFormOptions(config.contactForm);
    
    // === META / SEO (pour les scripts dynamiques) ===
    updateSchemaOrg(config);
  }

  /**
   * Applique la configuration du Hero
   */
  function applyHeroConfig(hero) {
    if (!hero) return;
    
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;
    
    // Titre
    const h1 = heroSection.querySelector('h1');
    if (h1 && hero.title) h1.textContent = hero.title;
    
    // Sous-titre
    const subtitle = heroSection.querySelector('.hero-content > p');
    if (subtitle && hero.subtitle) subtitle.textContent = hero.subtitle;
    
    // Image
    const img = heroSection.querySelector('.hero-media img');
    if (img && hero.image) {
      img.src = hero.image;
      if (hero.imageAlt) img.alt = hero.imageAlt;
    }
    
    // CTAs
    const ctaPrimary = heroSection.querySelector('.hero-actions .btn-primary');
    const ctaSecondary = heroSection.querySelector('.hero-actions .btn-secondary');
    
    if (ctaPrimary && hero.ctaPrimary) {
      ctaPrimary.textContent = hero.ctaPrimary.text;
      ctaPrimary.href = hero.ctaPrimary.link;
    }
    
    if (ctaSecondary && hero.ctaSecondary) {
      ctaSecondary.textContent = hero.ctaSecondary.text;
      ctaSecondary.href = hero.ctaSecondary.link;
    }
  }

  /**
   * Applique la configuration des services
   */
  function applyServicesConfig(services, sectionConfig) {
    if (!services || !Array.isArray(services)) return;
    
    const servicesGrid = document.querySelector('.services-grid');
    if (!servicesGrid) return;
    
    // Vider et reconstruire les services
    servicesGrid.innerHTML = '';
    
    services.forEach(service => {
      const article = document.createElement('article');
      article.className = 'service-card';
      article.innerHTML = `
        <div class="service-icon"><i class="${service.icon}" aria-hidden="true"></i></div>
        <h3>${escapeHtml(service.title)}</h3>
        <p>${escapeHtml(service.description)}</p>
        <ul class="service-details">
          ${service.details.map(detail => `<li>${escapeHtml(detail)}</li>`).join('')}
        </ul>
      `;
      servicesGrid.appendChild(article);
    });
  }

  /**
   * Applique la configuration de la FAQ
   */
  function applyFaqConfig(faq, sectionConfig) {
    if (!faq || !Array.isArray(faq)) return;
    
    const faqAccordion = document.querySelector('.faq-accordion');
    if (!faqAccordion) return;
    
    // Vider et reconstruire la FAQ
    faqAccordion.innerHTML = '';
    
    faq.forEach(item => {
      const details = document.createElement('details');
      details.className = 'faq-item';
      details.innerHTML = `
        <summary class="faq-question">${escapeHtml(item.question)}</summary>
        <div class="faq-answer">
          <p>${item.answer}</p>
        </div>
      `;
      faqAccordion.appendChild(details);
    });
    
    // Réinitialiser l'accordéon exclusif
    initFaqAccordion();
  }

  /**
   * Réinitialise le comportement d'accordéon exclusif pour la FAQ
   */
  function initFaqAccordion() {
    const details = document.querySelectorAll('.faq-accordion details');
    details.forEach((detail) => {
      detail.addEventListener('toggle', () => {
        if (detail.open) {
          details.forEach((otherDetail) => {
            if (otherDetail !== detail && otherDetail.open) {
              otherDetail.removeAttribute('open');
            }
          });
        }
      });
    });
  }

  /**
   * Applique les informations de contact partout dans le site
   */
  function applyContactConfig(business) {
    if (!business) return;
    
    // Téléphone
    document.querySelectorAll('a[href^="tel:"]').forEach(el => {
      el.href = `tel:${business.phone}`;
      // Mettre à jour le texte si c'est le numéro affiché
      if (el.textContent.match(/^\d{2}\s?\d{2}/)) {
        el.textContent = business.phoneDisplay;
      }
    });
    
    // Email
    document.querySelectorAll('a[href^="mailto:"]').forEach(el => {
      el.href = `mailto:${business.email}`;
      if (el.textContent.includes('@')) {
        el.textContent = business.email;
      }
    });
    
    // Instagram
    if (business.socialMedia?.instagram) {
      document.querySelectorAll('a[href*="instagram.com"]').forEach(el => {
        el.href = business.socialMedia.instagram;
      });
    }
    
    // Google Review
    if (business.socialMedia?.googleReview) {
      document.querySelectorAll('a[href*="g.page"]').forEach(el => {
        el.href = business.socialMedia.googleReview;
      });
    }
    
    // Adresse dans le footer et contact
    const addressElements = document.querySelectorAll('.contact-info-text p, .footer-contacts li');
    addressElements.forEach(el => {
      if (el.textContent.includes('Avenue') || el.textContent.includes('République')) {
        el.textContent = business.address.full;
      }
    });
  }

  /**
   * Applique la configuration de la zone d'intervention
   */
  function applyZoneConfig(zone, business, sectionConfig) {
    if (!zone) return;
    
    // Liste des villes
    const citiesList = document.querySelector('.zone-cities-list');
    if (citiesList && zone.cities) {
      citiesList.innerHTML = zone.cities.map(city => `<li>${escapeHtml(city)}</li>`).join('');
    }
    
    // Adresse dans la zone
    const zoneAddress = document.querySelector('.zone-address address');
    if (zoneAddress && business?.address) {
      zoneAddress.innerHTML = `
        ${business.address.street}<br>
        ${business.address.postalCode} ${business.address.city}<br>
        Charente, France
      `;
    }
    
    // Lien Google Maps
    if (business?.googleMapsUrl) {
      const mapsLink = document.querySelector('.zone-address-link');
      if (mapsLink) mapsLink.href = business.googleMapsUrl;
    }
  }

  /**
   * Applique les en-têtes de section
   */
  function applySectionHeaders(sections) {
    if (!sections) return;
    
    Object.entries(sections).forEach(([sectionId, config]) => {
      const section = document.getElementById(sectionId);
      if (!section) return;
      
      const eyebrow = section.querySelector('.section-eyebrow, .zone-eyebrow, .contact-eyebrow');
      const title = section.querySelector('h2');
      const subtitle = section.querySelector('.section-header > p:last-child, .zone-header > p:last-child, .contact-header > p:last-child');
      
      if (eyebrow && config.eyebrow) eyebrow.textContent = config.eyebrow;
      if (title && config.title) title.textContent = config.title;
      if (subtitle && config.subtitle) subtitle.textContent = config.subtitle;
    });
  }

  /**
   * Applique les options du formulaire de contact
   */
  function applyFormOptions(contactForm) {
    if (!contactForm?.prestationOptions) return;
    
    const dropdown = document.querySelector('.apple-select-dropdown');
    if (!dropdown) return;
    
    dropdown.innerHTML = contactForm.prestationOptions
      .map(opt => `<div class="apple-select-option" data-value="${opt.value}">${escapeHtml(opt.label)}</div>`)
      .join('');
  }

  /**
   * Met à jour les données Schema.org dynamiquement
   */
  function updateSchemaOrg(config) {
    // Les données Schema.org sont dans le HTML statique
    // Cette fonction peut être utilisée pour des mises à jour dynamiques si nécessaire
    
    // Mise à jour de la FAQ Schema
    if (config.faq) {
      const faqSchema = document.querySelector('script[type="application/ld+json"]:not([id])');
      // La FAQ Schema est déjà dans le HTML, on pourrait la mettre à jour ici si nécessaire
    }
  }

  /**
   * Échappe les caractères HTML pour éviter les injections XSS
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Charger la configuration au chargement du DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadConfig);
  } else {
    loadConfig();
  }

})();
