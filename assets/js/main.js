/**
 * @file Script principal pour l'interactivité du site VPRR.
 * Gère la navigation mobile, le scroll-spy, les animations et la carte.
 */

// Attend que le DOM soit entièrement chargé avant d'exécuter le script.
document.addEventListener("DOMContentLoaded", () => {
  // --- GESTION DE LA NAVIGATION ---

  // Sélection des éléments du DOM nécessaires pour la navigation
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".primary-nav");
  const navLinks = Array.from(document.querySelectorAll('.primary-nav .menu a.nav-link'));
  const navButtons = Array.from(document.querySelectorAll('.primary-nav .menu a.btn'));

  const normalizePath = (p) => {
    const raw = typeof p === 'string' ? p : '';
    const noIndex = raw.replace(/\/index\.html$/i, '/');
    return noIndex.endsWith('/') ? noIndex : `${noIndex}/`;
  };

  const navDebugEnabled = (() => {
    try {
      const qs = new URLSearchParams(window.location.search || '');
      if (qs.has('debugNav')) return true;
      return (localStorage.getItem('vprr-debug-nav') || '') === '1';
    } catch (_) {
      return false;
    }
  })();

  if (navDebugEnabled && !window.__vprrNavDebugBound) {
    window.__vprrNavDebugBound = true;

    try {
      const originalPushState = history.pushState ? history.pushState.bind(history) : null;
      const originalReplaceState = history.replaceState ? history.replaceState.bind(history) : null;

      if (originalPushState) {
        history.pushState = function (...args) {
          const url = args[2];
          console.groupCollapsed('[nav] pushState', url);
          console.trace();
          console.groupEnd();
          return originalPushState(...args);
        };
      }

      if (originalReplaceState) {
        history.replaceState = function (...args) {
          const url = args[2];
          console.groupCollapsed('[nav] replaceState', url);
          console.trace();
          console.groupEnd();
          return originalReplaceState(...args);
        };
      }

      window.addEventListener('hashchange', () => {
        console.groupCollapsed('[nav] hashchange', window.location.href);
        console.trace();
        console.groupEnd();
      });

      window.addEventListener('popstate', () => {
        console.groupCollapsed('[nav] popstate', window.location.href);
        console.trace();
        console.groupEnd();
      });

      document.addEventListener('click', (e) => {
        const a = e.target && e.target.closest ? e.target.closest('a') : null;
        if (!a) return;
        const href = a.getAttribute('href');
        console.log('[nav] click', { href, resolved: a.href });
      }, true);
    } catch (_) {}
  }

  document.addEventListener('click', (e) => {
    const serviceCard = e.target && e.target.closest ? e.target.closest('a.service-cta-card') : null;
    if (!serviceCard) return;
    const href = serviceCard.getAttribute('href');
    if (!href || href.startsWith('#')) return;

    e.preventDefault();
    e.stopPropagation();
    window.location.assign(serviceCard.href);
  }, true);
  
  // S'assure que les boutons CTA ne sont pas considérés comme des liens de navigation actifs.
  navButtons.forEach((b) => { 
    b.classList.remove('active'); 
    b.removeAttribute('aria-current'); 
  });
  
  /**
   * Met à jour l'état visuel du lien de navigation actif.
   * @param {HTMLElement} link - Le lien à marquer comme actif.
   */
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

  const initDesktopSubmenus = () => {
    if (!window.matchMedia || !window.matchMedia('(min-width: 992px)').matches) return;
    const items = Array.from(document.querySelectorAll('.primary-nav .has-submenu'));
    if (items.length === 0) return;

    const closeAll = () => {
      items.forEach((li) => li.classList.remove('submenu-open'));
    };

    items.forEach((li) => {
      if (li.__vprrSubmenuBound) return;
      li.__vprrSubmenuBound = true;

      let openTimer = null;
      let closeTimer = null;

      const open = () => {
        clearTimeout(closeTimer);
        clearTimeout(openTimer);
        openTimer = setTimeout(() => {
          closeAll();
          li.classList.add('submenu-open');
        }, 160);
      };

      const close = () => {
        clearTimeout(openTimer);
        clearTimeout(closeTimer);
        closeTimer = setTimeout(() => {
          li.classList.remove('submenu-open');
        }, 220);
      };

      li.addEventListener('mouseenter', open);
      li.addEventListener('mouseleave', close);
      li.addEventListener('focusin', open);
      li.addEventListener('focusout', close);

      const submenu = li.querySelector('.submenu');
      if (submenu) {
        submenu.addEventListener('click', () => {
          li.classList.remove('submenu-open');
        });
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAll();
    }, { passive: true });

    document.addEventListener('click', (e) => {
      const within = e.target && e.target.closest ? e.target.closest('.primary-nav .has-submenu') : null;
      if (!within) closeAll();
    }, true);
  };

  initDesktopSubmenus();

  // --- GESTION DU MENU MOBILE ---
  if (burger && nav) {
    // Variable pour éviter les doubles clics
    let isProcessing = false;
    
    // Variables pour gérer la position du scroll
    let scrollPosition = 0;
    
    function burgerActivateHandler(e) {
      if (e && typeof e.preventDefault === 'function') e.preventDefault();
      if (e && typeof e.stopPropagation === 'function') e.stopPropagation();

      if (isProcessing) return;
      isProcessing = true;
      
      const isOpen = nav.classList.contains("open");
      
      if (isOpen) {
        // Fermer le menu
        nav.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
        document.body.classList.remove('nav-open');
        
        // Restaurer la position du scroll
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.height = '';
        window.scrollTo(0, scrollPosition);
      } else {
        // Sauvegarder la position du scroll avant d'ouvrir le menu
        scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        
        // Ouvrir le menu
        nav.classList.add("open");
        burger.setAttribute("aria-expanded", "true");
        document.body.classList.add('nav-open');
        
        // Fixer le body pour empêcher le scroll arrière
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollPosition}px`;
        document.body.style.width = '100%';
      }
      
      // Réinitialiser rapidement pour la réactivité
      setTimeout(() => {
        isProcessing = false;
      }, 300);
    }

    if (!burger.__vprrBurgerBound) {
      burger.__vprrBurgerBound = true;

      let lastPointerActivationAt = 0;

      if ('PointerEvent' in window) {
        burger.addEventListener('pointerup', (e) => {
          lastPointerActivationAt = Date.now();
          burgerActivateHandler(e);
        }, { passive: false });
      } else {
        burger.addEventListener('touchend', (e) => {
          lastPointerActivationAt = Date.now();
          burgerActivateHandler(e);
        }, { passive: false });
      }

      burger.addEventListener('click', (e) => {
        if (Date.now() - lastPointerActivationAt < 700) {
          if (e && typeof e.preventDefault === 'function') e.preventDefault();
          if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
          return;
        }
        burgerActivateHandler(e);
      }, { passive: false });
    }

    // Fonction pour fermer le menu mobile proprement
    const closeMenu = () => {
      if (nav.classList.contains("open")) {
        nav.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
        document.body.classList.remove('nav-open');
        
        // Restaurer la position du scroll sur le body
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.height = '';
        window.scrollTo(0, scrollPosition);
        
        return true;
      }
      return false;
    };

    // Ferme automatiquement le menu mobile après avoir cliqué sur un lien.
    const allMenuLinks = nav.querySelectorAll("a.nav-link, a.btn");
    
    allMenuLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute('href');
        
        // Si c'est une ancre interne (hash sur la même page)
        if (href && (href.startsWith('#') || href.includes('#'))) {
          // On ferme le menu
          closeMenu();
          setActive(link);
        }
      });
    });

    // Amélioration de l'accessibilité : ferme le menu avec la touche 'Échap'.
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    }, { passive: true });

    // Amélioration de l'accessibilité : permet la navigation au clavier dans le menu.
    navLinks.forEach((a, idx) => {
      a.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          const next = navLinks[(idx + 1) % navLinks.length];
          next.focus();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          const prev = navLinks[(idx - 1 + navLinks.length) % navLinks.length];
          prev.focus();
        }
      });
    });
  }

  // --- SMOOTH SCROLL AMÉLIORÉ ---
  // Gère le défilement fluide pour les liens d'ancrage internes uniquement
  document.querySelectorAll('a[href^="#"], a[href*=".html#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href) return;
      
      // On extrait l'ID de la cible (ex: #services ou index.html#services)
      const targetId = href.includes('#') ? href.substring(href.indexOf('#')) : null;
      if (!targetId || targetId === '#') return;
      
      let url = null;
      try {
        url = new URL(href, window.location.href);
      } catch (_) {}

      const currentPath = normalizePath(window.location.pathname);
      const targetPath = url ? normalizePath(url.pathname) : currentPath;
      const isSamePage = !url || (url.origin === window.location.origin && targetPath === currentPath);
      if (!href.startsWith('#') && !isSamePage) return;

      if (targetId === '#top') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        
        // Petite pause pour laisser le temps au menu de se fermer et au layout de se stabiliser
        setTimeout(() => {
          const headerHeight = document.querySelector('.site-header')?.offsetHeight || 60;
          const rect = target.getBoundingClientRect();
          const targetPosition = Math.max(0, rect.top + window.pageYOffset - headerHeight + 4);
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          
          // Mettre à jour l'URL sans saut de page
          if (history.pushState) {
            history.pushState(null, null, targetId);
          } else {
            location.hash = targetId;
          }
        }, 40);
      }
    });
  });

  // --- SCROLL SPY AMÉLIORÉ ---
  // Met en surbrillance le lien de navigation correspondant à la section visible à l'écran.
  const isSamePageHashLink = (href) => {
    if (typeof href !== 'string') return false;
    if (!href.includes('#')) return false;
    if (href.startsWith('#')) return true;
    try {
      const u = new URL(href, window.location.href);
      return u.origin === window.location.origin && normalizePath(u.pathname) === normalizePath(window.location.pathname);
    } catch (_) {
      return false;
    }
  };

  const sectionLinks = Array.from(document.querySelectorAll('.primary-nav .menu a.nav-link[href*="#"]'))
    .filter(a => isSamePageHashLink(a.getAttribute('href')));
  const idFromHref = (href) => {
  if (typeof href !== 'string') return '';
  const hashIndex = href.indexOf('#');
  return hashIndex !== -1 ? href.substring(hashIndex + 1) : '';
};
  const targets = sectionLinks
    .map(a => ({ a, el: document.getElementById(idFromHref(a.getAttribute('href'))) }));
  
  // Garder une référence de tous les liens pour la navigation
  const allLinks = sectionLinks;

  const observeSections = () => {
    // Cache des positions des sections (évite le layout thrashing)
    let sectionPositions = [];
    let lastActiveHash = null;
    let cachedViewportHeight = window.innerHeight; // Cache la hauteur viewport
    
    // Calculer les positions une seule fois, puis recalculer au resize
    const updatePositions = () => {
      // Lire toutes les dimensions en une seule passe (batch read)
      const positions = [];
      const scrollY = window.scrollY;
      cachedViewportHeight = window.innerHeight; // Mettre à jour au resize
      
      for (const { a, el } of targets.filter(x => !!x.el)) {
        const rect = el.getBoundingClientRect();
        positions.push({
          a,
          top: rect.top + scrollY,
          bottom: rect.top + scrollY + rect.height
        });
      }
      
      sectionPositions = positions;
    };
    
    // Différer le calcul initial après le premier rendu
    requestAnimationFrame(() => {
      requestAnimationFrame(updatePositions);
    });
    
    const onScroll = () => {
      // Utiliser la hauteur viewport cachée (pas de lecture DOM)
      const scrollPosition = window.scrollY + cachedViewportHeight / 3;
      let currentSection = null;
      
      // Utiliser les positions cachées (pas de getBoundingClientRect)
      for (const section of sectionPositions) {
        if (scrollPosition >= section.top && scrollPosition < section.bottom) {
          currentSection = section.a;
          break;
        }
      }
      
      // Si aucune section trouvée, prendre la plus proche
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
        const hashPart = typeof href === 'string' && href.includes('#') ? href.substring(href.indexOf('#')) : null;
        // Éviter les mises à jour inutiles
        if (hashPart && hashPart !== '#' && hashPart !== lastActiveHash) {
          lastActiveHash = hashPart;
          setActive(currentSection);
          if (history.replaceState) {
            history.replaceState(null, null, hashPart);
          }
        }
      }
    };
    
    // Throttle pour les performances
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
    
    // Recalculer les positions au resize (debounced)
    let resizeTimeout;
    const onResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updatePositions, 150);
    };
    
    window.addEventListener('scroll', throttledScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    
    // Différer l'appel initial pour ne pas bloquer le rendu
    requestAnimationFrame(() => {
      requestAnimationFrame(onScroll);
    });
  };

  // Différer l'initialisation du scroll spy
  requestAnimationFrame(observeSections);

  // --- SCROLL REVEAL ANIMATIONS ---
  const initScrollReveal = () => {
    const revealElements = document.querySelectorAll(
      '.service-card, .faq-item, .contact-panel, .zone-map-container, .zone-address, .zone-cities, .zone-note'
    );
    
    if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Ajouter la classe initiale
      revealElements.forEach(el => {
        el.classList.add('reveal-hidden');
      });
      
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            // Délai progressif pour effet cascade
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

  const initFaqAccordions = () => {
    const allDetails = Array.from(document.querySelectorAll('.faq-accordion details'));
    if (allDetails.length === 0) return;

    allDetails.forEach((detail) => {
      if (detail.__vprrFaqBound) return;
      detail.__vprrFaqBound = true;

      detail.addEventListener("toggle", () => {
        if (!detail.open) return;

        const container = detail.closest('.faq-accordion');
        if (container && container.dataset && container.dataset.faqExclusive === '0') return;

        const siblings = container ? Array.from(container.querySelectorAll('details')) : [];
        siblings.forEach((otherDetail) => {
          if (otherDetail !== detail && otherDetail.open) {
            otherDetail.removeAttribute("open");
          }
        });
      });
    });
  };

  const initFaqPageControls = () => {
    const controls = document.querySelector('[data-faq-controls]');
    if (!controls) return;

    const accordion = document.querySelector('.faq-accordion');
    if (!accordion) return;

    const details = Array.from(accordion.querySelectorAll('details'));
    const filterButtons = Array.from(controls.querySelectorAll('[data-faq-filter]'));
    const expandBtn = controls.querySelector('[data-faq-expand]');
    const collapseBtn = controls.querySelector('[data-faq-collapse]');

    const setFilter = (filterValue) => {
      filterButtons.forEach((btn) => {
        const isActive = btn.getAttribute('data-faq-filter') === filterValue;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      details.forEach((d) => {
        const cat = d.getAttribute('data-faq-category') || '';
        const visible = filterValue === 'all' || cat === filterValue;
        d.hidden = !visible;
        if (!visible) d.removeAttribute('open');
      });
    };

    if (filterButtons.length > 0) {
      filterButtons.forEach((btn) => {
        if (btn.__vprrFaqFilterBound) return;
        btn.__vprrFaqFilterBound = true;
        btn.addEventListener('click', () => setFilter(btn.getAttribute('data-faq-filter') || 'all'));
      });
      setFilter(filterButtons[0].getAttribute('data-faq-filter') || 'all');
    }

    const visibleDetails = () => details.filter((d) => !d.hidden);

    if (expandBtn && !expandBtn.__vprrBound) {
      expandBtn.__vprrBound = true;
      expandBtn.addEventListener('click', () => {
        visibleDetails().forEach((d) => d.setAttribute('open', ''));
      });
    }

    if (collapseBtn && !collapseBtn.__vprrBound) {
      collapseBtn.__vprrBound = true;
      collapseBtn.addEventListener('click', () => {
        visibleDetails().forEach((d) => d.removeAttribute('open'));
      });
    }
  };

  initFaqAccordions();
  initFaqPageControls();

  // --- CARROUSEL AVIS ---
  const initReviewsCarousels = () => {
    const carousels = Array.from(document.querySelectorAll('[data-reviews-carousel]'));
    if (carousels.length === 0) return;

    carousels.forEach((carousel) => {
      const track = carousel.querySelector('[data-reviews-track]');
      const prev = carousel.querySelector('[data-reviews-prev]');
      const next = carousel.querySelector('[data-reviews-next]');
      if (!track) return;

      const baseCards = Array.from(track.querySelectorAll('.review-card'));
      if (baseCards.length === 0) return;

      const realCount = baseCards.length;
      const MAX_CLONES = 4;

      let index = 0;
      let looping = false;
      let cloneCount = 0;

      const getGap = () => {
        try {
          const gap = window.getComputedStyle(track).gap || '0px';
          const px = parseFloat(gap);
          return Number.isFinite(px) ? px : 0;
        } catch (_) {
          return 0;
        }
      };

      const getPerView = () => {
        const w = window.innerWidth || 0;
        if (w >= 1200) return 3;
        if (w >= 640) return 2;
        return 1;
      };

      const getCardWidth = () => {
        const card = track.querySelector('.review-card');
        if (!card) return 0;
        const rect = card.getBoundingClientRect();
        return rect && rect.width ? rect.width : card.offsetWidth || 0;
      };

      const setTransitionEnabled = (enabled) => {
        track.style.transition = enabled ? '' : 'none';
      };

      const applyTransform = () => {
        const delta = (getCardWidth() + getGap()) * index;
        track.style.transform = `translate3d(${-delta}px, 0, 0)`;
      };

      const setButtonsState = () => {
        if (!prev && !next) return;

        const perView = getPerView();
        const canLoop = realCount > perView;

        if (canLoop) {
          if (prev) prev.disabled = false;
          if (next) next.disabled = false;
          return;
        }

        const maxIndex = Math.max(0, realCount - perView);
        index = Math.max(0, Math.min(index, maxIndex));
        if (prev) prev.disabled = index <= 0;
        if (next) next.disabled = index >= maxIndex;
      };

      const removeClones = () => {
        const clones = Array.from(track.querySelectorAll('[data-reviews-clone]'));
        clones.forEach((el) => el.remove());
      };

      const refreshReadMore = () => {
        const cards = Array.from(track.querySelectorAll('.review-card'));
        if (cards.length === 0) return;

        const updateOverflow = (card) => {
          const text = card.querySelector('.review-text');
          const btn = card.querySelector('[data-review-more]');
          if (!text || !btn) return;

          const wasExpanded = card.classList.contains('is-expanded');
          card.classList.remove('is-expanded');
          btn.setAttribute('aria-expanded', 'false');
          btn.textContent = 'Lire la suite';

          requestAnimationFrame(() => {
            const overflows = text.scrollHeight - text.clientHeight > 1;
            card.classList.toggle('has-overflow', overflows);
            if (wasExpanded && overflows) {
              card.classList.add('is-expanded');
              btn.setAttribute('aria-expanded', 'true');
              btn.textContent = 'Réduire';
            }
          });
        };

        cards.forEach((card) => {
          const btn = card.querySelector('[data-review-more]');
          if (!btn) return;
          if (btn.__vprrBound) return;
          btn.__vprrBound = true;

          btn.addEventListener('click', () => {
            const expanded = !card.classList.contains('is-expanded');
            card.classList.toggle('is-expanded', expanded);
            btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
            btn.textContent = expanded ? 'Réduire' : 'Lire la suite';
          });

          updateOverflow(card);
        });
      };

      const ensureLooping = () => {
        const perView = getPerView();
        const canLoop = realCount > perView;

        if (!canLoop) {
          if (looping) {
            removeClones();
            looping = false;
            cloneCount = 0;
            index = 0;
            setTransitionEnabled(false);
            applyTransform();
            track.getBoundingClientRect();
            setTransitionEnabled(true);
          }
          setButtonsState();
          refreshReadMore();
          return;
        }

        if (looping) {
          setButtonsState();
          refreshReadMore();
          return;
        }

        cloneCount = Math.min(MAX_CLONES, realCount);
        const cards = Array.from(track.querySelectorAll('.review-card'));
        const prefix = cards.slice(-cloneCount).map((c) => {
          const clone = c.cloneNode(true);
          clone.setAttribute('data-reviews-clone', '');
          return clone;
        });
        const suffix = cards.slice(0, cloneCount).map((c) => {
          const clone = c.cloneNode(true);
          clone.setAttribute('data-reviews-clone', '');
          return clone;
        });

        prefix.reverse().forEach((c) => track.insertBefore(c, track.firstChild));
        suffix.forEach((c) => track.appendChild(c));

        looping = true;
        index = cloneCount;

        setTransitionEnabled(false);
        applyTransform();
        track.getBoundingClientRect();
        setTransitionEnabled(true);
        setButtonsState();
        refreshReadMore();
      };

      const move = (dir) => {
        index += dir;
        applyTransform();
        setButtonsState();
      };

      const normalizeLoopPosition = () => {
        if (!looping) return;

        if (index < cloneCount) {
          index = index + realCount;
          setTransitionEnabled(false);
          applyTransform();
          track.getBoundingClientRect();
          setTransitionEnabled(true);
          return;
        }

        if (index >= cloneCount + realCount) {
          index = index - realCount;
          setTransitionEnabled(false);
          applyTransform();
          track.getBoundingClientRect();
          setTransitionEnabled(true);
        }
      };

      if (!track.__vprrReviewsBound) {
        track.__vprrReviewsBound = true;
        track.addEventListener('transitionend', (e) => {
          if (e && e.propertyName && e.propertyName !== 'transform') return;
          normalizeLoopPosition();
        });
      }

      if (prev && !prev.__vprrBound) {
        prev.__vprrBound = true;
        prev.addEventListener('click', () => move(-1));
      }
      if (next && !next.__vprrBound) {
        next.__vprrBound = true;
        next.addEventListener('click', () => move(1));
      }

      let resizeTimer = null;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          if (looping) {
            const realIndex = ((index - cloneCount) % realCount + realCount) % realCount;
            index = cloneCount + realIndex;
            setTransitionEnabled(false);
            applyTransform();
            track.getBoundingClientRect();
            setTransitionEnabled(true);
            setButtonsState();
            refreshReadMore();
            return;
          }

          setTransitionEnabled(false);
          setButtonsState();
          applyTransform();
          track.getBoundingClientRect();
          setTransitionEnabled(true);
          refreshReadMore();
        }, 120);
      }, { passive: true });

      ensureLooping();
      setTransitionEnabled(false);
      applyTransform();
      track.getBoundingClientRect();
      setTransitionEnabled(true);
      refreshReadMore();
    });
  };

  initReviewsCarousels();

  // --- CARTE ZONE D'INTERVENTION CHARENTE ---
  const initZoneMap = () => {
    if (window.ZoneMapLeaflet && typeof window.ZoneMapLeaflet.initZoneMap === 'function') {
      window.ZoneMapLeaflet.initZoneMap({ containerId: 'zone-map', rootMargin: '100px' });
    }
  };
  
  if (document.readyState === 'complete') {
    initZoneMap();
  } else {
    window.addEventListener('load', initZoneMap, { once: true });
  }
  

  // --- ANNÉE DYNAMIQUE DANS LE FOOTER ---
  const updateCurrentYear = () => {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  };

  // --- INITIALISATION AU CHARGEMENT ---
  window.addEventListener('load', () => {
    
    // Mettre à jour l'année
    updateCurrentYear();
  }, { once: true });
});
