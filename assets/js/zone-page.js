/**
 * @file Page « Zone d'intervention » :
 *  - recherche instantanée d'une commune (filtre des puces, message de réponse) ;
 *  - carte interactive chargée seulement au clic (aucune tuile OpenStreetMap avant l'action du visiteur).
 */
(function () {
  'use strict';

  var normalize = function (str) {
    return String(str || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[’']/g, ' ')
      .replace(/[-\s]+/g, ' ')
      .toLowerCase()
      .trim();
  };

  function initFinder() {
    var input = document.getElementById('zone-search');
    var result = document.getElementById('zone-search-result');
    var empty = document.getElementById('zone-search-empty');
    if (!input || !result) return;

    var cities = Array.prototype.slice.call(document.querySelectorAll('[data-zone-city]')).map(function (li) {
      return { el: li, name: li.textContent.trim(), key: normalize(li.textContent) };
    });
    var sectors = Array.prototype.slice.call(document.querySelectorAll('[data-zone-sector]'));
    var defaultText = result.textContent;

    function update() {
      var q = normalize(input.value);
      var matches = 0;
      var exact = null;
      cities.forEach(function (c) {
        var hit = q === '' || c.key.indexOf(q) !== -1;
        c.el.classList.toggle('is-dim', !hit);
        c.el.classList.toggle('is-match', q !== '' && hit);
        if (hit && q !== '') matches += 1;
        if (q !== '' && c.key === q) exact = c;
      });
      sectors.forEach(function (sec) {
        var any = q === '' || sec.querySelector('[data-zone-city].is-match');
        sec.classList.toggle('is-dim', !any);
      });
      if (empty) empty.hidden = !(q.length >= 3 && matches === 0);
      result.classList.toggle('is-yes', q !== '' && matches > 0);
      if (q === '') result.textContent = defaultText;
      else if (exact) result.textContent = 'Oui, nous intervenons à ' + exact.name + '.';
      else if (matches > 0) result.textContent = matches + (matches > 1 ? ' communes correspondent.' : ' commune correspond.');
      else result.textContent = q.length >= 3 ? 'Aucune commune de la liste ne correspond.' : defaultText;
    }

    input.addEventListener('input', update);
  }

  function initMapToggle() {
    var btn = document.getElementById('zone-map-toggle');
    var wrap = document.getElementById('zone-map-wrap');
    if (!btn || !wrap) return;
    var started = false;

    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      if (open) {
        wrap.hidden = true;
        btn.setAttribute('aria-expanded', 'false');
        btn.lastChild.textContent = ' Afficher la carte interactive';
        return;
      }
      wrap.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      btn.lastChild.textContent = ' Masquer la carte';
      if (!started && window.ZoneMapLeaflet && typeof window.ZoneMapLeaflet.initZoneMap === 'function') {
        started = true;
        window.ZoneMapLeaflet.initZoneMap({ containerId: 'zone-map', rootMargin: '0px' });
      }
      var map = window.ZoneMapLeaflet && window.ZoneMapLeaflet.getInstance && window.ZoneMapLeaflet.getInstance('zone-map');
      if (map && map.map && typeof map.map.invalidateSize === 'function') map.map.invalidateSize();
    });
  }

  function init() {
    initFinder();
    initMapToggle();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
