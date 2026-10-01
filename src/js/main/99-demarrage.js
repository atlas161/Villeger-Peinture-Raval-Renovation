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
  initReviewsCarousels();
  initZoneMap();
  initMobileCtaBar();
  initFooterYear();
});
