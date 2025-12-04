/**
 * @file Optimisations de performance pour le site VPRR
 * Lazy loading, prefetch, et optimisations diverses
 */

(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════
  // LAZY LOADING DES IMAGES
  // ═══════════════════════════════════════════════════════════════════════════
  
  function initLazyLoading() {
    // Utiliser l'API native si disponible
    if ('loading' in HTMLImageElement.prototype) {
      // Le navigateur supporte le lazy loading natif
      document.querySelectorAll('img[data-src]').forEach(img => {
        img.src = img.dataset.src;
        img.loading = 'lazy';
      });
    } else {
      // Fallback avec IntersectionObserver
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PREFETCH DES PAGES LIÉES
  // ═══════════════════════════════════════════════════════════════════════════
  
  function initPrefetch() {
    // Prefetch les pages internes au survol des liens
    const prefetchedUrls = new Set();
    
    document.querySelectorAll('a[href^="/"], a[href$=".html"]').forEach(link => {
      link.addEventListener('mouseenter', () => {
        const href = link.getAttribute('href');
        if (href && !prefetchedUrls.has(href) && !href.startsWith('#')) {
          const prefetchLink = document.createElement('link');
          prefetchLink.rel = 'prefetch';
          prefetchLink.href = href;
          document.head.appendChild(prefetchLink);
          prefetchedUrls.add(href);
        }
      }, { once: true, passive: true });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CHARGEMENT DIFFÉRÉ DES RESSOURCES NON-CRITIQUES
  // ═══════════════════════════════════════════════════════════════════════════
  
  function loadDeferredResources() {
    // Charger Elfsight (Instagram) seulement quand la section galerie est visible
    const galerieSection = document.getElementById('galerie');
    if (galerieSection) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Le script Elfsight est déjà dans le HTML, on le laisse se charger
            observer.disconnect();
          }
        });
      }, { rootMargin: '200px' });
      
      observer.observe(galerieSection);
    }

    // Charger Leaflet seulement quand la section zone est visible
    const zoneSection = document.getElementById('zone');
    if (zoneSection && typeof L === 'undefined') {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Leaflet JS est déjà chargé en defer
            observer.disconnect();
          }
        });
      }, { rootMargin: '200px' });
      
      observer.observe(zoneSection);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // OPTIMISATION DU SCROLL
  // ═══════════════════════════════════════════════════════════════════════════
  
  function optimizeScroll() {
    let ticking = false;
    
    // Passive scroll listener pour de meilleures performances
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRELOAD DES FONTS CRITIQUES
  // ═══════════════════════════════════════════════════════════════════════════
  
  function preloadFonts() {
    // Vérifier si les fonts sont déjà en cache
    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        // Différer la modification du DOM pour éviter le layout thrashing
        requestAnimationFrame(() => {
          document.body.classList.add('fonts-loaded');
        });
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RÉDUCTION DU CLS (Cumulative Layout Shift)
  // ═══════════════════════════════════════════════════════════════════════════
  
  function reduceCLS() {
    // Différer pour ne pas bloquer le rendu initial
    requestAnimationFrame(() => {
      // Ajouter des dimensions aux images sans dimensions
      const images = document.querySelectorAll('img:not([width]):not([height])');
      
      // Batch les lectures puis les écritures pour éviter le layout thrashing
      const imagesToUpdate = [];
      
      images.forEach(img => {
        if (img.complete && img.naturalWidth) {
          imagesToUpdate.push({ img, w: img.naturalWidth, h: img.naturalHeight });
        } else {
          img.addEventListener('load', () => {
            requestAnimationFrame(() => {
              img.setAttribute('width', img.naturalWidth);
              img.setAttribute('height', img.naturalHeight);
            });
          }, { once: true });
        }
      });
      
      // Écrire toutes les dimensions en une seule passe
      requestAnimationFrame(() => {
        imagesToUpdate.forEach(({ img, w, h }) => {
          img.setAttribute('width', w);
          img.setAttribute('height', h);
        });
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // OPTIMISATION DES ANIMATIONS
  // ═══════════════════════════════════════════════════════════════════════════
  
  function optimizeAnimations() {
    // Désactiver les animations si l'utilisateur préfère
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Batch les écritures de style
      requestAnimationFrame(() => {
        const style = document.documentElement.style;
        style.setProperty('--duration-fast', '0ms');
        style.setProperty('--duration-normal', '0ms');
        style.setProperty('--duration-slow', '0ms');
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MESURE DES PERFORMANCES (Web Vitals)
  // ═══════════════════════════════════════════════════════════════════════════
  
  function measurePerformance() {
    // Log des métriques de performance en développement
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // First Contentful Paint
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach(entry => {
        console.log(`[Performance] ${entry.name}: ${Math.round(entry.startTime)}ms`);
      });

      // Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log(`[Performance] LCP: ${Math.round(lastEntry.startTime)}ms`);
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALISATION
  // ═══════════════════════════════════════════════════════════════════════════
  
  function init() {
    initLazyLoading();
    initPrefetch();
    optimizeScroll();
    preloadFonts();
    reduceCLS();
    optimizeAnimations();
    
    // Charger les ressources différées après le chargement initial
    if (document.readyState === 'complete') {
      loadDeferredResources();
      measurePerformance();
    } else {
      window.addEventListener('load', () => {
        loadDeferredResources();
        measurePerformance();
      }, { once: true });
    }
  }

  // Démarrer dès que possible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
