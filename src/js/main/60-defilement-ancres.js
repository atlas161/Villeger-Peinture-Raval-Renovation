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
