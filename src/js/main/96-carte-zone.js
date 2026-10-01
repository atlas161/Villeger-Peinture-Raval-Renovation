/**
 * Carte de la zone d'intervention (Leaflet, chargée à la demande par zone-map-leaflet.js).
 * L'initialisation attend la fin du chargement de la page pour ne pas concurrencer le rendu.
 */

const initZoneMap = () => {
  const start = () => {
    if (window.ZoneMapLeaflet && typeof window.ZoneMapLeaflet.initZoneMap === 'function') {
      window.ZoneMapLeaflet.initZoneMap({ containerId: 'zone-map', rootMargin: '100px' });
    }
  };

  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
};
