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
