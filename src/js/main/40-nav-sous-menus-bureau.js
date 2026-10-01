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

    // « Services » n'est pas une page : un clic (ou Entrée) ouvre seulement le sous-menu, sans naviguer.
    // Sur mobile, l'ouverture/fermeture est gérée par 50-nav-menu-mobile.js (qui passe après celui-ci).
    const trigger = li.querySelector('a.nav-link');
    if (trigger) {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        if (!isDesktopNav()) return;
        clearTimeout(closeTimer);
        closeAll();
        li.classList.add('submenu-open');
      });
    }

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
