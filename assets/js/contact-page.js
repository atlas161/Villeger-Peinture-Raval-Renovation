/**
 * @file Page de contact : pré-sélectionne le service (?service=ravalement…) dans le menu déroulant,
 * renseigne le champ caché « service » (libellé envoyé avec la demande) et la page d'origine.
 */
(function () {
  'use strict';

  var SERVICES = {
    ravalement: 'Ravalement de façade',
    'nettoyage-facade': 'Nettoyage de façade',
    toiture: 'Toiture & Couverture',
    peinture: 'Peinture',
    isolation: 'Isolation',
    renovation: 'Rénovation intérieure',
    autre: 'Autre'
  };

  function init() {
    var params = new URLSearchParams(window.location.search);
    var key = params.get('service');

    var source = document.getElementById('contact-source');
    if (source) {
      try {
        var ref = document.referrer ? new URL(document.referrer) : null;
        source.value = ref && ref.origin === window.location.origin ? ref.pathname : 'direct';
      } catch (e) { source.value = 'direct'; }
    }

    if (!key || !Object.prototype.hasOwnProperty.call(SERVICES, key)) return;
    var service = document.getElementById('contact-service');
    if (service) service.value = SERVICES[key];
    // Pré-sélection sans ouvrir le menu (un clic déplacerait le focus et ferait défiler la page).
    var select = document.getElementById('apple-select');
    var option = select && select.querySelector('.apple-select-option[data-value="' + key + '"]');
    if (!option) return;
    select.querySelectorAll('.apple-select-option').forEach(function (o) {
      o.classList.remove('selected');
      o.setAttribute('aria-selected', 'false');
    });
    option.classList.add('selected');
    option.setAttribute('aria-selected', 'true');
    var label = select.querySelector('.apple-select-value');
    if (label) {
      label.textContent = option.textContent.trim();
      label.classList.remove('placeholder');
    }
    var hidden = document.getElementById('contact-prestation');
    if (hidden) hidden.value = key;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 0); });
  else setTimeout(init, 0);
})();
