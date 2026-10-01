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
