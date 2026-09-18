/**
 * @file Sélecteur personnalisé accessible ("Type de projet" du formulaire de contact)
 * Implémente le pattern ARIA listbox : navigation clavier + lecteurs d'écran.
 */

(function() {
  'use strict';

  function initAppleSelect(root) {
    const trigger = root.querySelector('.apple-select-trigger');
    const dropdown = root.querySelector('.apple-select-dropdown');
    const valueLabel = root.querySelector('.apple-select-value');
    const hiddenInput = root.querySelector('input[type="hidden"]');
    const options = Array.from(root.querySelectorAll('.apple-select-option'));

    if (!trigger || !dropdown || !valueLabel || !hiddenInput || !options.length) return;

    let activeIndex = -1;

    // Certaines pages pré-remplissent la valeur cachée avec le service de la page
    // (ex. value="ravalement" sur la page Ravalement) : refléter cette pré-sélection
    // visuellement et dans les attributs ARIA au chargement.
    if (hiddenInput.value) {
      const preselected = options.find((opt) => opt.dataset.value === hiddenInput.value);
      if (preselected) {
        preselected.classList.add('selected');
        preselected.setAttribute('aria-selected', 'true');
        valueLabel.classList.remove('placeholder');
      }
    }

    function open() {
      root.classList.add('active');
      trigger.setAttribute('aria-expanded', 'true');
      const selected = options.findIndex(opt => opt.classList.contains('selected'));
      focusOption(selected >= 0 ? selected : 0);
    }

    function close(returnFocus) {
      root.classList.remove('active');
      trigger.setAttribute('aria-expanded', 'false');
      activeIndex = -1;
      if (returnFocus) trigger.focus();
    }

    function isOpen() {
      return root.classList.contains('active');
    }

    function focusOption(index) {
      if (index < 0 || index >= options.length) return;
      activeIndex = index;
      options.forEach((opt, i) => opt.setAttribute('tabindex', i === index ? '0' : '-1'));
      options[index].focus();
    }

    function selectOption(option) {
      options.forEach(opt => {
        opt.classList.remove('selected');
        opt.setAttribute('aria-selected', 'false');
      });
      option.classList.add('selected');
      option.setAttribute('aria-selected', 'true');

      valueLabel.textContent = option.textContent.trim();
      valueLabel.classList.remove('placeholder');

      hiddenInput.value = option.dataset.value || '';
      hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    trigger.addEventListener('click', () => {
      if (isOpen()) {
        close(false);
      } else {
        open();
      }
    });

    trigger.addEventListener('keydown', e => {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        if (!isOpen()) open();
      } else if (e.key === 'Escape' && isOpen()) {
        close(true);
      }
    });

    options.forEach((option, index) => {
      option.addEventListener('click', () => {
        selectOption(option);
        close(true);
      });

      option.addEventListener('keydown', e => {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            focusOption(Math.min(index + 1, options.length - 1));
            break;
          case 'ArrowUp':
            e.preventDefault();
            focusOption(Math.max(index - 1, 0));
            break;
          case 'Home':
            e.preventDefault();
            focusOption(0);
            break;
          case 'End':
            e.preventDefault();
            focusOption(options.length - 1);
            break;
          case 'Enter':
          case ' ':
            e.preventDefault();
            selectOption(option);
            close(true);
            break;
          case 'Escape':
            e.preventDefault();
            close(true);
            break;
          case 'Tab':
            close(false);
            break;
        }
      });
    });

    document.addEventListener('click', e => {
      if (isOpen() && !root.contains(e.target)) {
        close(false);
      }
    });
  }

  function init() {
    document.querySelectorAll('.apple-select').forEach(initAppleSelect);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
