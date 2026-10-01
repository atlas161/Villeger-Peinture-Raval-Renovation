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
