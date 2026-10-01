/* GÉNÉRÉ par scripts/build-bundles.js depuis src/js/main/ — ne pas éditer ce fichier. */
(() => {
/* ▸ 00-utilitaires.js */
/**
 * Utilitaires partagés par les modules de main.js.
 * Les fichiers de src/js/main/ sont concaténés (dans l'ordre de leur numéro) par
 * scripts/build-bundles.js : ils partagent donc la même portée, sans import/export.
 */

// Chemin normalisé (sans index.html, avec « / » final) pour comparer deux URL de la même page.
const normalizePath = (p) => {
  const raw = typeof p === 'string' ? p : '';
  const noIndex = raw.replace(/\/index\.html$/i, '/');
  return noIndex.endsWith('/') ? noIndex : `${noIndex}/`;
};

// Le menu est « bureau » à partir de 992 px, « burger » en dessous (aligné sur le CSS).
// Testé au moment de l'événement (et non au chargement) : la fenêtre peut être redimensionnée.
const isDesktopNav = () => !!window.matchMedia && window.matchMedia('(min-width: 992px)').matches;
const isMobileNav = () => !!window.matchMedia && window.matchMedia('(max-width: 991px)').matches;

// Empêche le clavier/lecteur d'écran d'atteindre le contenu caché derrière le menu mobile
// plein écran (sans ça, Tab pouvait faire sortir le focus sur des liens invisibles de la
// page, masqués par l'overlay du menu — voir docs/ux-ui-responsive-audit.md).
const setBackgroundInert = (isInert) => {
  document.querySelectorAll('#main-content, #site-footer-wrapper').forEach((el) => {
    if (isInert) el.setAttribute('inert', '');
    else el.removeAttribute('inert');
  });
};

// Mouvement réduit demandé par l'utilisateur ?
const prefersReducedMotion = () =>
  !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ▸ 10-video-hero.js */
/**
 * Hero : la page s'affiche tout de suite (image d'attente en CSS). La vidéo Vimeo démarre
 * (Vimeo adapte la qualité) et apparaît en fondu par-dessus l'image d'attente ; on force le mode auto après 3 s.
 */

const shouldLoadHeroVideo = () => {
  const conn = navigator.connection || {};
  if (conn.saveData) return false;
  if (/(^|slow-)2g|3g/.test(conn.effectiveType || '')) return false;
  return true;
};

// Charge l'API Vimeo une seule fois (script injecté à la demande).
const ensureVimeoApi = () => new Promise((resolve, reject) => {
  if (window.Vimeo && window.Vimeo.Player) return resolve();
  const existing = document.querySelector('script[data-vimeo-player-api]');
  if (existing) {
    existing.addEventListener('load', () => resolve(), { once: true });
    existing.addEventListener('error', () => reject(new Error('Vimeo Player API load error')), { once: true });
    return;
  }
  const s = document.createElement('script');
  s.src = 'https://player.vimeo.com/api/player.js';
  s.async = true;
  s.setAttribute('data-vimeo-player-api', '1');
  s.addEventListener('load', () => resolve(), { once: true });
  s.addEventListener('error', () => reject(new Error('Vimeo Player API load error')), { once: true });
  document.head.appendChild(s);
});

const startHeroVideo = (heroVimeo) => {
  heroVimeo.src = heroVimeo.dataset.src;
  const showVideo = () => heroVimeo.classList.add('is-playing');
  // Filet de sécurité : si l'API Vimeo ne répond pas, on affiche quand même la vidéo au bout de 4 s.
  const fallbackTimer = window.setTimeout(showVideo, 4000);

  ensureVimeoApi()
    .then(() => {
      const player = new window.Vimeo.Player(heroVimeo);
      let isReady = false;
      const onTimeUpdate = (data) => {
        const t = data && typeof data.seconds === 'number' ? data.seconds : 0;
        if (t > 0.05 && !isReady) {
          isReady = true;
          window.clearTimeout(fallbackTimer);
          showVideo();
          try { player.off('timeupdate', onTimeUpdate); } catch (_) {}
          // Montée en qualité progressive : on repasse en automatique après quelques secondes de lecture.
          window.setTimeout(() => {
            try { player.setQuality('auto').catch(() => {}); } catch (_) {}
          }, 3000);
        }
      };
      player.on('timeupdate', onTimeUpdate);
    })
    .catch(() => { window.clearTimeout(fallbackTimer); showVideo(); });
};

const initHeroVideo = () => {
  const heroBg = document.querySelector('.hero-bg');
  const heroVimeo = heroBg ? heroBg.querySelector('iframe.hero-video') : null;
  if (!heroBg || !heroVimeo) return;

  if (prefersReducedMotion()) {
    heroVimeo.remove();
  } else if (!shouldLoadHeroVideo()) {
    // Économiseur de données ou connexion lente : on garde l'image d'attente (la vidéo pèse ~19 Mo).
    // La vidéo se lance sur tous les écrans (téléphone et tablette compris) dans les autres cas.
    heroVimeo.remove();
  } else {
    startHeroVideo(heroVimeo);
  }
};

/* ▸ 20-cartes-services.js */
/**
 * Cartes de service (a.service-cta-card) : le clic ouvre toujours la page, même si un autre
 * script a intercepté l'événement (écouteur en phase de capture).
 */

const initServiceCardLinks = () => {
  document.addEventListener('click', (e) => {
    const serviceCard = e.target && e.target.closest ? e.target.closest('a.service-cta-card') : null;
    if (!serviceCard) return;
    const href = serviceCard.getAttribute('href');
    if (!href || href.startsWith('#')) return;

    e.preventDefault();
    e.stopPropagation();
    window.location.assign(serviceCard.href);
  }, true);
};

/* ▸ 30-nav-etat-actif.js */
/**
 * Lien de navigation « actif » (classe .active + aria-current).
 */

// S'assure que les boutons CTA du menu ne sont pas considérés comme des liens de navigation actifs.
const clearActiveOnNavButtons = (navButtons) => {
  navButtons.forEach((b) => {
    b.classList.remove('active');
    b.removeAttribute('aria-current');
  });
};

/**
 * Met à jour l'état visuel du lien de navigation actif.
 * @param {HTMLElement[]} navLinks - Tous les liens du menu.
 * @param {HTMLElement} link - Le lien à marquer comme actif.
 */
const setActiveNavLink = (navLinks, link) => {
  navLinks.forEach((a) => {
    a.classList.remove('active');
    a.removeAttribute('aria-current');
  });
  if (link) {
    link.classList.add('active');
    link.setAttribute('aria-current', 'page');
  }
};

/* ▸ 40-nav-sous-menus-bureau.js */
/**
 * Sous-menus du menu « bureau » (≥ 992 px) : ouverture au survol / au focus, avec de courts délais.
 * Le survol n'ouvre le sous-menu qu'en affichage ordinateur : la largeur est testée au moment de
 * l'événement (isDesktopNav), sinon un redimensionnement de fenêtre laisse le survol actif dans le
 * menu burger et « Services » s'ouvre au moindre passage de souris.
 */

const initDesktopSubmenus = () => {
  if (!window.matchMedia) return;
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
      if (!isDesktopNav()) return;
      clearTimeout(closeTimer);
      clearTimeout(openTimer);
      openTimer = setTimeout(() => {
        if (!isDesktopNav()) return;
        closeAll();
        li.classList.add('submenu-open');
      }, 160);
    };

    const close = () => {
      if (!isDesktopNav()) return;
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
    if (!isDesktopNav()) return;
    const within = e.target && e.target.closest ? e.target.closest('.primary-nav .has-submenu') : null;
    if (!within) closeAll();
  }, true);
};

/* ▸ 50-nav-menu-mobile.js */
/**
 * Menu mobile (burger) : ouverture/fermeture du panneau plein écran, sous-menus avec bouton
 * « Retour », fermeture à Échap / au clic sur un lien d'ancre, flèches ← → entre les liens.
 */

const stopEvent = (e) => {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();
  if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
};

const initMobileMenu = ({ burger, nav, navLinks }) => {
  if (!burger || !nav) return;

  let isProcessing = false;   // évite les doubles clics
  let scrollPosition = 0;     // position de la page avant l'ouverture (le body est figé pendant)

  // --- Ouverture / fermeture du panneau ---

  const lockBodyScroll = () => {
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = '100%';
  };

  const unlockBodyScroll = () => {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.height = '';
    window.scrollTo(0, scrollPosition);
  };

  const burgerActivateHandler = (e) => {
    stopEvent(e);
    if (isProcessing) return;
    isProcessing = true;

    if (nav.classList.contains('open')) {
      nav.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Ouvrir le menu');
      document.body.classList.remove('nav-open');
      setBackgroundInert(false);
      unlockBodyScroll();
    } else {
      // La position est sauvegardée avant tout changement d'état, puis le body est figé.
      scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      nav.classList.add('open');
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Fermer le menu');
      document.body.classList.add('nav-open');
      setBackgroundInert(true);
      lockBodyScroll();
    }

    // Réinitialiser rapidement pour la réactivité
    setTimeout(() => { isProcessing = false; }, 300);
  };

  const bindBurger = () => {
    if (burger.__vprrBurgerBound) return;
    burger.__vprrBurgerBound = true;

    let lastPointerActivationAt = 0;
    const onPointerActivate = (e) => {
      lastPointerActivationAt = Date.now();
      burgerActivateHandler(e);
    };

    if ('PointerEvent' in window) burger.addEventListener('pointerup', onPointerActivate, { passive: false });
    else burger.addEventListener('touchend', onPointerActivate, { passive: false });

    // Le « click » synthétisé juste après un appui tactile est ignoré (sinon le menu se rouvrirait).
    burger.addEventListener('click', (e) => {
      if (Date.now() - lastPointerActivationAt < 700) {
        stopEvent(e);
        return;
      }
      burgerActivateHandler(e);
    }, { passive: false });
  };

  // --- Sous-menus ---

  const closeAllMobileSubmenus = () => {
    const openItems = nav.querySelectorAll('.has-submenu.submenu-open');
    openItems.forEach((li) => {
      li.classList.remove('submenu-open');
      const trigger = li.querySelector('a.nav-link');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
    nav.classList.remove('submenu-active');
    return openItems.length > 0;
  };

  // Ferme le menu mobile proprement ; renvoie true s'il était ouvert.
  const closeMenu = () => {
    if (!nav.classList.contains('open')) return false;
    closeAllMobileSubmenus();
    nav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Ouvrir le menu');
    document.body.classList.remove('nav-open');
    setBackgroundInert(false);
    unlockBodyScroll();
    return true;
  };

  const ensureSubmenuBack = (submenu) => {
    if (!submenu || submenu.querySelector('.submenu-back-item')) return;
    const backLi = document.createElement('li');
    backLi.className = 'submenu-back-item';
    const backBtn = document.createElement('button');
    backBtn.type = 'button';
    backBtn.className = 'submenu-back-btn';
    backBtn.innerHTML = '<span>Retour</span>';
    backBtn.addEventListener('click', (e) => {
      stopEvent(e);
      closeAllMobileSubmenus();
    });
    backLi.appendChild(backBtn);
    submenu.insertBefore(backLi, submenu.firstChild);
  };

  const bindSubmenus = () => {
    Array.from(nav.querySelectorAll('.has-submenu')).forEach((li) => {
      const trigger = li.querySelector('a.nav-link');
      const submenu = li.querySelector('.submenu');
      if (!trigger || !submenu) return;
      if (li.__vprrMobileSubmenuBound) return;
      li.__vprrMobileSubmenuBound = true;

      trigger.setAttribute('aria-expanded', 'false');
      ensureSubmenuBack(submenu);

      trigger.addEventListener('click', (e) => {
        if (!isMobileNav()) return;
        if (!nav.classList.contains('open')) return;
        stopEvent(e);
        if (e && typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();

        const isOpen = li.classList.contains('submenu-open');
        closeAllMobileSubmenus();
        if (!isOpen) {
          li.classList.add('submenu-open');
          nav.classList.add('submenu-active');
          trigger.setAttribute('aria-expanded', 'true');
          ensureSubmenuBack(submenu);
        }
      }, { passive: false });

      Array.from(submenu.querySelectorAll('a[href]')).forEach((a) => {
        a.addEventListener('click', () => {
          if (!isMobileNav()) return;
          closeAllMobileSubmenus();
          closeMenu();
        });
      });
    });
  };

  // --- Liens du menu et clavier ---

  // Ferme automatiquement le menu mobile après un clic sur un lien d'ancre.
  const bindMenuLinks = () => {
    nav.querySelectorAll('a.nav-link, a.btn').forEach((link) => {
      link.addEventListener('click', () => {
        if (isMobileNav() && nav.classList.contains('open') && link.closest && link.closest('.has-submenu')) return;
        const href = link.getAttribute('href');
        // Ancre interne (hash sur la même page) : on ferme le menu
        if (href && (href.startsWith('#') || href.includes('#'))) {
          closeMenu();
          setActiveNavLink(navLinks, link);
        }
      });
    });
  };

  const bindKeyboard = () => {
    // Accessibilité : Échap ferme d'abord les sous-menus, puis le menu.
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (!closeAllMobileSubmenus()) closeMenu();
      }
    }, { passive: true });

    // Accessibilité : flèches gauche/droite entre les liens du menu.
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
  };

  bindBurger();
  bindSubmenus();
  bindMenuLinks();
  bindKeyboard();
};

/* ▸ 60-defilement-ancres.js */
/**
 * Défilement fluide vers les ancres internes (#section ou page.html#section sur la même page),
 * en tenant compte de la hauteur de l'en-tête fixe.
 */

const initSmoothScroll = () => {
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
      if (!target) return;
      e.preventDefault();

      // Petite pause pour laisser le temps au menu de se fermer et au layout de se stabiliser
      setTimeout(() => {
        const headerHeight = document.querySelector('.site-header')?.offsetHeight || 60;
        const rect = target.getBoundingClientRect();
        const targetPosition = Math.max(0, rect.top + window.pageYOffset - headerHeight + 4);

        window.scrollTo({ top: targetPosition, behavior: 'smooth' });

        // Mettre à jour l'URL sans saut de page
        if (history.pushState) {
          history.pushState(null, null, targetId);
        } else {
          location.hash = targetId;
        }
      }, 40);
    });
  });
};

/* ▸ 70-scroll-spy.js */
/**
 * Scroll-spy : met en surbrillance le lien du menu correspondant à la section visible à l'écran.
 * Positions des sections mises en cache (pas de lecture du DOM au scroll), scroll limité à une
 * mise à jour par image, recalcul au redimensionnement.
 */

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

const idFromHref = (href) => {
  if (typeof href !== 'string') return '';
  const hashIndex = href.indexOf('#');
  return hashIndex !== -1 ? href.substring(hashIndex + 1) : '';
};

const observeSections = (targets, navLinks) => {
  let sectionPositions = [];
  let lastActiveHash = null;
  let cachedViewportHeight = window.innerHeight;

  // Calculer les positions une seule fois, puis recalculer au resize (lecture groupée).
  const updatePositions = () => {
    const positions = [];
    const scrollY = window.scrollY;
    cachedViewportHeight = window.innerHeight;

    for (const { a, el } of targets.filter((x) => !!x.el)) {
      const rect = el.getBoundingClientRect();
      positions.push({ a, top: rect.top + scrollY, bottom: rect.top + scrollY + rect.height });
    }
    sectionPositions = positions;
  };

  // Différer le calcul initial après le premier rendu
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
        setActiveNavLink(navLinks, currentSection);
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

  // Différer l'appel initial pour ne pas bloquer le rendu
  requestAnimationFrame(() => {
    requestAnimationFrame(onScroll);
  });
};

const initScrollSpy = (navLinks) => {
  const sectionLinks = Array.from(document.querySelectorAll('.primary-nav .menu a.nav-link[href*="#"]'))
    .filter((a) => isSamePageHashLink(a.getAttribute('href')));
  const targets = sectionLinks
    .map((a) => ({ a, el: document.getElementById(idFromHref(a.getAttribute('href'))) }));

  // Différer l'initialisation du scroll spy
  requestAnimationFrame(() => observeSections(targets, navLinks));
};

/* ▸ 80-apparition-au-scroll.js */
/**
 * Apparition progressive des blocs au défilement (classes reveal-hidden / reveal-visible).
 * Désactivée en « mouvement réduit » ; sans IntersectionObserver, rien n'est masqué.
 */

const initScrollReveal = () => {
  const revealElements = document.querySelectorAll(
    '.service-card, .faq-item, .contact-panel, .zone-map-container, .zone-address, .zone-cities, .zone-note'
  );

  if (!('IntersectionObserver' in window) || prefersReducedMotion()) return;

  revealElements.forEach((el) => {
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

  revealElements.forEach((el) => revealObserver.observe(el));
};

/* ▸ 90-faq.js */
/**
 * FAQ : accordéons « un seul ouvert à la fois » (sauf data-faq-exclusive="0") et, sur la page FAQ,
 * recherche + filtres par catégorie + « tout ouvrir / tout fermer ».
 */

const initFaqAccordions = () => {
  const allDetails = Array.from(document.querySelectorAll('.faq-accordion details'));
  if (allDetails.length === 0) return;

  allDetails.forEach((detail) => {
    if (detail.__vprrFaqBound) return;
    detail.__vprrFaqBound = true;

    detail.addEventListener('toggle', () => {
      if (!detail.open) return;

      const container = detail.closest('.faq-accordion');
      if (container && container.dataset && container.dataset.faqExclusive === '0') return;

      const siblings = container ? Array.from(container.querySelectorAll('details')) : [];
      siblings.forEach((otherDetail) => {
        if (otherDetail !== detail && otherDetail.open) {
          otherDetail.removeAttribute('open');
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
  const searchInput = controls.querySelector('[data-faq-search]');
  const countEl = controls.querySelector('[data-faq-count]');
  const emptyEl = document.querySelector('[data-faq-empty]');

  const normalize = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, ' ').toLowerCase().trim();
  const texts = new Map(details.map((d) => [d, normalize(d.textContent)]));
  let currentFilter = 'all';

  // Filtre de catégorie + recherche texte, combinés.
  const apply = () => {
    const q = normalize(searchInput ? searchInput.value : '');
    let shown = 0;
    details.forEach((d) => {
      const cat = d.getAttribute('data-faq-category') || '';
      const visible = (currentFilter === 'all' || cat === currentFilter) && (q === '' || texts.get(d).indexOf(q) !== -1);
      d.hidden = !visible;
      if (!visible) d.removeAttribute('open');
      else shown += 1;
    });
    if (countEl) countEl.textContent = shown + (shown > 1 ? ' questions' : ' question');
    if (emptyEl) emptyEl.hidden = shown !== 0;
  };

  const setFilter = (filterValue) => {
    currentFilter = filterValue;
    filterButtons.forEach((btn) => {
      const isActive = btn.getAttribute('data-faq-filter') === filterValue;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
    apply();
  };

  if (searchInput && !searchInput.__vprrBound) {
    searchInput.__vprrBound = true;
    searchInput.addEventListener('input', apply);
  }

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

/* ▸ 95-widget-avis.js */
/**
 * Widget d'avis Google (Featurable) sur l'accueil : le conteneur [data-featurable-async] est rempli
 * par le script de Featurable, chargé seulement quand la section approche de l'écran (n'alourdit pas
 * le premier affichage). Domaine autorisé dans la CSP de netlify.toml et cité dans les mentions légales.
 */

const FEATURABLE_SCRIPT = 'https://featurable.com/assets/bundle.js';

const loadFeaturableWidget = () => {
  if (document.querySelector('script[data-featurable-bundle]')) return;
  const s = document.createElement('script');
  s.src = FEATURABLE_SCRIPT;
  s.charset = 'UTF-8';
  s.defer = true;
  s.setAttribute('data-featurable-bundle', '1');
  document.head.appendChild(s);
};

const initReviewsWidget = () => {
  const widget = document.querySelector('[data-featurable-async]');
  if (!widget) return;

  if (!('IntersectionObserver' in window)) {
    loadFeaturableWidget();
    return;
  }
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    io.disconnect();
    loadFeaturableWidget();
  }, { rootMargin: '400px 0px' });
  io.observe(widget);
};

/* ▸ 96-carte-zone.js */
/**
 * Carte de la zone d'intervention (Leaflet, chargée à la demande par zone-map-leaflet.js).
 * L'initialisation attend la fin du chargement de la page pour ne pas concurrencer le rendu.
 */

const initZoneMap = () => {
  const start = () => {
    if (window.ZoneMapLeaflet && typeof window.ZoneMapLeaflet.initZoneMap === 'function') {
      window.ZoneMapLeaflet.initZoneMap({ containerId: 'zone-map', rootMargin: '100px' });
    }
  };

  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
};

/* ▸ 97-barre-appel-mobile.js */
/**
 * Barre mobile « Appeler / Devis » : masquée quand le formulaire (#contact) ou le pied de page
 * est à l'écran, pour ne pas recouvrir leur contenu.
 */

const initMobileCtaBar = () => {
  const ctaBar = document.querySelector('.mobile-cta-bar');
  if (!ctaBar || !('IntersectionObserver' in window)) return;

  const visible = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
    ctaBar.classList.toggle('is-hidden', visible.size > 0);
  });
  document.querySelectorAll('#contact, .site-footer').forEach((el) => io.observe(el));
};

/* ▸ 98-annee-footer.js */
/**
 * Année courante dans le pied de page (#current-year), mise à jour au chargement de la page.
 */

const updateCurrentYear = () => {
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
};

const initFooterYear = () => {
  window.addEventListener('load', updateCurrentYear, { once: true });
};

/* ▸ 99-demarrage.js */
/**
 * Point d'entrée : au chargement du DOM, on récupère les éléments du menu et on lance chaque
 * module. L'ordre d'initialisation est celui de l'ancien main.js monolithique.
 */

document.addEventListener('DOMContentLoaded', () => {
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.primary-nav');
  const navLinks = Array.from(document.querySelectorAll('.primary-nav .menu a.nav-link'));
  const navButtons = Array.from(document.querySelectorAll('.primary-nav .menu a.btn'));

  initHeroVideo();
  initServiceCardLinks();
  clearActiveOnNavButtons(navButtons);
  initDesktopSubmenus();
  initMobileMenu({ burger, nav, navLinks });
  initSmoothScroll();
  initScrollSpy(navLinks);
  initScrollReveal();
  initFaqAccordions();
  initFaqPageControls();
  initReviewsWidget();
  initZoneMap();
  initMobileCtaBar();
  initFooterYear();
});
})();
