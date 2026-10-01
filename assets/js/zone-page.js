/**
 * @file Page « Zone d'intervention » :
 *  - recherche instantanée d'une commune (filtre des puces, message de réponse).
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

  var toArray = function (list) {
    return Array.prototype.slice.call(list);
  };

  function init() {
    var input = document.getElementById('zone-search');
    var result = document.getElementById('zone-search-result');
    var empty = document.getElementById('zone-search-empty');
    if (!input || !result) return;

    var cities = toArray(document.querySelectorAll('li[data-zone-city]')).map(function (li) {
      var name = li.textContent.trim();
      return { el: li, name: name, key: normalize(name) };
    });
    var sectors = toArray(document.querySelectorAll('[data-zone-sector]'));
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

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
