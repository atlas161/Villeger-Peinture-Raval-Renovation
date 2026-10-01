/**
 * Barre mobile « Appeler / Devis » : masquée quand le formulaire (#contact) ou le pied de page
 * est à l'écran, pour ne pas recouvrir leur contenu.
 */

const initMobileCtaBar = () => {
  const ctaBar = document.querySelector('.mobile-cta-bar');
  if (!ctaBar || !('IntersectionObserver' in window)) return;

  const visible = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
    ctaBar.classList.toggle('is-hidden', visible.size > 0);
  });
  document.querySelectorAll('#contact, .site-footer').forEach((el) => io.observe(el));
};
