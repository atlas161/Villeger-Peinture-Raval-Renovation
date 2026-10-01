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
