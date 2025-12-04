/**
 * @file Script principal pour l'interactivité du site VPRR.
 * Gère la navigation mobile, le scroll-spy, les animations et la carte.
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- GESTION DE LA NAVIGATION ---
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".primary-nav");
  const navLinks = Array.from(document.querySelectorAll('.primary-nav .menu a.nav-link'));
  const navButtons = Array.from(document.querySelectorAll('.primary-nav .menu a.btn'));
  
  navButtons.forEach((b) => { 
    b.classList.remove('active'); 
    b.removeAttribute('aria-current'); 
  });
  
  const setActive = (link) => {
    navLinks.forEach(a => {
      a.classList.remove('active');
      a.removeAttribute('aria-current');
    });
    if (link) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  };

  // --- GESTION DU MENU MOBILE ---
  if (burger && nav) {
    burger.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(isOpen));
      document.body.classList.toggle('nav-open', isOpen);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
        burger.focus();
      }
    }, { passive: true });

    nav.querySelectorAll("a[href^='#']").forEach((link) => {
      link.addEventListener("click", (e) => {
        setActive(link);
        nav.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
        document.body.classList.remove('nav-open');
        
        const href = link.getAttribute('href') || '';
        if (href === '#top') {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });

    navLinks.forEach((a, idx) => {
      a.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          navLinks[(idx + 1) % navLinks.length].focus();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          navLinks[(idx - 1 + navLinks.length) % navLinks.length].focus();
        }
      });
    });
  }

  // --- SMOOTH SCROLL ---
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#top') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const headerHeight = document.querySelector('.site-header')?.offsetHeight || 72;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    });
  });

  // --- SCROLL SPY OPTIMISÉ ---
  const sectionLinks = Array.from(document.querySelectorAll('.primary-nav .menu a.nav-link[href^="#"]'));
  const idFromHref = (href) => href.replace('#','');
  const targets = sectionLinks
    .map(a => ({ a, el: document.getElementById(idFromHref(a.getAttribute('href'))) }))
    .filter(x => !!x.el);

  const observeSections = () => {
    let sectionPositions = [];
    let lastActiveHref = null;
    let cachedViewportHeight = window.innerHeight;
    
    const updatePositions = () => {
      const positions = [];
      const scrollY = window.scrollY;
      cachedViewportHeight = window.innerHeight;
      
      for (const { a, el } of targets) {
        const rect = el.getBoundingClientRect();
        positions.push({
          a,
          top: rect.top + scrollY,
          bottom: rect.top + scrollY + rect.height
        });
      }
      sectionPositions = positions;
    };
    
    requestAnimationFrame(() => {
      requestAnimationFrame(updatePositions);
    });
    
    const onScroll = () => {
      const scrollPosition = window.scrollY + cachedViewportHeight / 3;
      let currentSection = null;
      
      for (const section of sectionPositions) {
        if (scrollPosition >= section.top && scrollPosition < section.bottom) {
          currentSection = section.a;
          break;
        }
      }
      
      if (!currentSection && sectionPositions.length > 0) {
        let bestDistance = Infinity;
        for (const section of sectionPositions) {
          const distance = Math.abs(scrollPosition - section.top);
          if (distance < bestDistance) {
            bestDistance = distance;
            currentSection = section.a;
          }
        }
      }
      
      if (currentSection) {
        const href = currentSection.getAttribute('href');
        if (href !== lastActiveHref) {
          lastActiveHref = href;
          setActive(currentSection);
          if (history.replaceState && href) {
            history.replaceState(null, null, href);
          }
        }
      }
    };
    
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          onScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    let resizeTimeout;
    const onResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updatePositions, 150);
    };
    
    window.addEventListener('scroll', throttledScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    
    requestAnimationFrame(() => {
      requestAnimationFrame(onScroll);
    });
  };

  requestAnimationFrame(observeSections);

  // --- SCROLL REVEAL ANIMATIONS ---
  const initScrollReveal = () => {
    const revealElements = document.querySelectorAll(
      '.service-card, .zone-map-container, .zone-address, .zone-cities, .zone-note'
    );
    
    if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealElements.forEach(el => el.classList.add('reveal-hidden'));
      
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('reveal-visible');
              entry.target.classList.remove('reveal-hidden');
            }, index * 100);
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
      
      revealElements.forEach(el => revealObserver.observe(el));
    }
  };
  
  initScrollReveal();

  // --- CARTE ZONE D'INTERVENTION ---
  const initZoneMap = () => {
    const mapContainer = document.getElementById('zone-map');
    if (!mapContainer || typeof L === 'undefined') return;

    const headquarters = [45.6580, 0.1920];

    const map = L.map('zone-map', {
      center: [45.65, 0.15],
      zoom: 9,
      zoomControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      dragging: false,
      touchZoom: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '',
      subdomains: 'abcd',
      maxZoom: 19,
      opacity: 0.6
    }).addTo(map);

    fetch('https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-version-simplifiee.geojson')
      .then(response => response.json())
      .then(data => {
        const charenteFeature = data.features.find(feature => 
          feature.properties.code === '16' || feature.properties.nom === 'Charente'
        );
        
        if (charenteFeature) {
          L.geoJSON(charenteFeature, {
            style: {
              color: '#673A12',
              weight: 3,
              opacity: 0.9,
              fillColor: '#A88B5E',
              fillOpacity: 0.15
            }
          }).addTo(map);
          
          const charenteLayer = L.geoJSON(charenteFeature);
          map.fitBounds(charenteLayer.getBounds(), { padding: [20, 20] });
        }
      })
      .catch(console.warn);

    const hqIcon = L.divIcon({
      className: 'hq-marker-centered',
      html: '<div class="hq-pulse-ring"></div><div class="hq-marker-dot"></div>',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
    
    const hqMarker = L.marker(headquarters, { 
      icon: hqIcon, 
      zIndexOffset: 1000,
      alt: 'Siège VPRR - L\'Isle-d\'Espagnac',
      title: 'Siège VPRR'
    }).addTo(map);

    hqMarker.bindPopup(`
      <div class="zone-popup-hq-new">
        <div class="popup-address">
          <strong>136 Avenue de la République</strong><br>
          16340 L'Isle-d'Espagnac
        </div>
        <a href="https://www.google.com/maps/dir/?api=1&destination=136+Avenue+de+la+R%C3%A9publique,+16340+L'Isle-d'Espagnac" 
           target="_blank" class="popup-directions-btn">
          Lancer l'itinéraire
        </a>
      </div>
    `, { className: 'zone-popup-new', closeButton: false, offset: [0, -15], autoPan: false });

    setTimeout(() => hqMarker.openPopup(), 1500);
  };

  // Attendre que Leaflet soit chargé (lazy-loaded)
  const waitForLeaflet = () => {
    if (typeof L !== 'undefined') {
      initZoneMap();
    } else {
      const checkLeaflet = setInterval(() => {
        if (typeof L !== 'undefined') {
          clearInterval(checkLeaflet);
          initZoneMap();
        }
      }, 200);
      setTimeout(() => clearInterval(checkLeaflet), 10000);
    }
  };
  
  if (document.readyState === 'complete') {
    waitForLeaflet();
  } else {
    window.addEventListener('load', waitForLeaflet, { once: true });
  }

  // --- ANNÉE DYNAMIQUE ---
  const updateCurrentYear = () => {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  };

  window.addEventListener('load', updateCurrentYear, { once: true });
});