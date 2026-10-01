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
