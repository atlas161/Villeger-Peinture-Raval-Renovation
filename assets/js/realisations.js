/**
 * @file Page « Réalisations » : filtre des chantiers par prestation (façade, toiture, peinture).
 */
(function () {
  'use strict';

  function init() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-real-filter]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-real-category]'));
    if (!buttons.length || !cards.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var value = btn.getAttribute('data-real-filter');
        buttons.forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('active', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        cards.forEach(function (card) {
          card.hidden = !(value === 'all' || card.getAttribute('data-real-category') === value);
        });
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
