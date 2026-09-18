/**
 * @file Actions communes aux pages d'article de blog (copier le lien de partage).
 */

(function() {
  'use strict';

  function copyArticleLink(button) {
    navigator.clipboard.writeText(window.location.href).then(function() {
      const icon = button.querySelector('i');
      const originalClass = icon ? icon.className : '';
      if (icon) icon.className = 'fa-solid fa-check';
      button.setAttribute('aria-label', 'Lien copié !');
      setTimeout(function() {
        if (icon) icon.className = originalClass;
        button.setAttribute('aria-label', 'Copier le lien');
      }, 2000);
    }, function(err) {
      console.error('Erreur lors de la copie :', err);
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    const copyBtn = document.querySelector('.share-btn.copy');
    if (copyBtn) {
      copyBtn.addEventListener('click', function() {
        copyArticleLink(copyBtn);
      });
    }
  });
})();
