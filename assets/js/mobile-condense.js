'use strict';
/**
 * Condensation mobile des pages de service (≤ 768px). Tout le contenu reste dans le HTML (lisible par les moteurs
 * de recherche et sans JavaScript) ; on ne fait que replier certains blocs sur petit écran.
 *
 *  - [data-m-limit="N"]  liste dont on n'affiche que les N premiers éléments + un bouton « Voir plus »
 *                        (libellé dans data-m-more ; ex. communes desservies, questions de la FAQ)
 *  - [data-m-collapse]   encadré replié derrière son premier titre <h3> (ex. « Prix au m² »)
 *
 * Sur ordinateur (> 768px), rien n'est replié.
 */
(function () {
  var mq = window.matchMedia('(max-width: 768px)');

  // ---- Listes limitées ------------------------------------------------------
  function setupLimited(list) {
    var limit = parseInt(list.getAttribute('data-m-limit'), 10);
    var items = Array.prototype.slice.call(list.children);
    if (!limit || items.length <= limit + 1) return; // rien à replier si le gain est de 0 ou 1 élément
    items.forEach(function (el, i) {
      if (i >= limit) el.classList.add('m-hidden');
    });
    var hidden = items.length - limit;
    var label = list.getAttribute('data-m-more') || 'Voir plus';

    var wrap = document.createElement('div');
    wrap.className = 'm-more-wrap';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-secondary btn--sm m-more';
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = label + ' (' + hidden + ')';
    btn.addEventListener('click', function () {
      var open = list.classList.toggle('is-expanded');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.textContent = open ? 'Voir moins' : label + ' (' + hidden + ')';
    });
    wrap.appendChild(btn);
    list.parentNode.insertBefore(wrap, list.nextSibling);
  }

  // ---- Encadrés repliables ----------------------------------------------------
  function setupCollapsible(box) {
    var trigger = box.querySelector(':scope > h3');
    if (!trigger) return;
    trigger.classList.add('m-trigger');
    trigger.setAttribute('role', 'button');
    trigger.setAttribute('tabindex', '0');

    function apply() {
      if (mq.matches) {
        if (!box.hasAttribute('data-m-init')) {
          box.setAttribute('data-m-init', '');
          box.classList.add('m-collapsed');
        }
      } else {
        box.classList.remove('m-collapsed');
        box.removeAttribute('data-m-init');
      }
      trigger.setAttribute('aria-expanded', box.classList.contains('m-collapsed') ? 'false' : 'true');
    }
    function toggle() {
      box.classList.toggle('m-collapsed');
      trigger.setAttribute('aria-expanded', box.classList.contains('m-collapsed') ? 'false' : 'true');
    }
    trigger.addEventListener('click', function () { if (mq.matches) toggle(); });
    trigger.addEventListener('keydown', function (e) {
      if (mq.matches && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        toggle();
      }
    });
    apply();
    if (mq.addEventListener) mq.addEventListener('change', apply);
  }

  function init() {
    document.querySelectorAll('[data-m-limit]').forEach(setupLimited);
    document.querySelectorAll('[data-m-collapse]').forEach(setupCollapsible);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
