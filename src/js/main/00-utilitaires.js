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
