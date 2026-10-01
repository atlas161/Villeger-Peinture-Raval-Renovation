/**
 * Widget d'avis Google (Featurable) sur l'accueil : le conteneur [data-featurable-async] est rempli
 * par le script de Featurable, chargé seulement quand la section approche de l'écran (n'alourdit pas
 * le premier affichage). Domaine autorisé dans la CSP de netlify.toml et cité dans les mentions légales.
 */

const FEATURABLE_SCRIPT = 'https://featurable.com/assets/bundle.js';

const loadFeaturableWidget = () => {
  if (document.querySelector('script[data-featurable-bundle]')) return;
  const s = document.createElement('script');
  s.src = FEATURABLE_SCRIPT;
  s.charset = 'UTF-8';
  s.defer = true;
  s.setAttribute('data-featurable-bundle', '1');
  document.head.appendChild(s);
};

const initReviewsWidget = () => {
  const widget = document.querySelector('[data-featurable-async]');
  if (!widget) return;

  if (!('IntersectionObserver' in window)) {
    loadFeaturableWidget();
    return;
  }
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    io.disconnect();
    loadFeaturableWidget();
  }, { rootMargin: '400px 0px' });
  io.observe(widget);
};
