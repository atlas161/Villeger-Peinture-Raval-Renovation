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
