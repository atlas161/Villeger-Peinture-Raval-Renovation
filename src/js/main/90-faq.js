/**
 * FAQ : accordéons « un seul ouvert à la fois » (sauf data-faq-exclusive="0") et, sur la page FAQ,
 * recherche + filtres par catégorie + « tout ouvrir / tout fermer ».
 */

const initFaqAccordions = () => {
  const allDetails = Array.from(document.querySelectorAll('.faq-accordion details'));
  if (allDetails.length === 0) return;

  allDetails.forEach((detail) => {
    if (detail.__vprrFaqBound) return;
    detail.__vprrFaqBound = true;

    detail.addEventListener('toggle', () => {
      if (!detail.open) return;

      const container = detail.closest('.faq-accordion');
      if (container && container.dataset && container.dataset.faqExclusive === '0') return;

      const siblings = container ? Array.from(container.querySelectorAll('details')) : [];
      siblings.forEach((otherDetail) => {
        if (otherDetail !== detail && otherDetail.open) {
          otherDetail.removeAttribute('open');
        }
      });
    });
  });
};

const initFaqPageControls = () => {
  const controls = document.querySelector('[data-faq-controls]');
  if (!controls) return;

  const accordion = document.querySelector('.faq-accordion');
  if (!accordion) return;

  const details = Array.from(accordion.querySelectorAll('details'));
  const filterButtons = Array.from(controls.querySelectorAll('[data-faq-filter]'));
  const expandBtn = controls.querySelector('[data-faq-expand]');
  const collapseBtn = controls.querySelector('[data-faq-collapse]');
  const searchInput = controls.querySelector('[data-faq-search]');
  const countEl = controls.querySelector('[data-faq-count]');
  const emptyEl = document.querySelector('[data-faq-empty]');

  const normalize = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, ' ').toLowerCase().trim();
  const texts = new Map(details.map((d) => [d, normalize(d.textContent)]));
  let currentFilter = 'all';

  // Filtre de catégorie + recherche texte, combinés.
  const apply = () => {
    const q = normalize(searchInput ? searchInput.value : '');
    let shown = 0;
    details.forEach((d) => {
      const cat = d.getAttribute('data-faq-category') || '';
      const visible = (currentFilter === 'all' || cat === currentFilter) && (q === '' || texts.get(d).indexOf(q) !== -1);
      d.hidden = !visible;
      if (!visible) d.removeAttribute('open');
      else shown += 1;
    });
    if (countEl) countEl.textContent = shown + (shown > 1 ? ' questions' : ' question');
    if (emptyEl) emptyEl.hidden = shown !== 0;
  };

  const setFilter = (filterValue) => {
    currentFilter = filterValue;
    filterButtons.forEach((btn) => {
      const isActive = btn.getAttribute('data-faq-filter') === filterValue;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
    apply();
  };

  if (searchInput && !searchInput.__vprrBound) {
    searchInput.__vprrBound = true;
    searchInput.addEventListener('input', apply);
  }

  if (filterButtons.length > 0) {
    filterButtons.forEach((btn) => {
      if (btn.__vprrFaqFilterBound) return;
      btn.__vprrFaqFilterBound = true;
      btn.addEventListener('click', () => setFilter(btn.getAttribute('data-faq-filter') || 'all'));
    });
    setFilter(filterButtons[0].getAttribute('data-faq-filter') || 'all');
  }

  const visibleDetails = () => details.filter((d) => !d.hidden);

  if (expandBtn && !expandBtn.__vprrBound) {
    expandBtn.__vprrBound = true;
    expandBtn.addEventListener('click', () => {
      visibleDetails().forEach((d) => d.setAttribute('open', ''));
    });
  }

  if (collapseBtn && !collapseBtn.__vprrBound) {
    collapseBtn.__vprrBound = true;
    collapseBtn.addEventListener('click', () => {
      visibleDetails().forEach((d) => d.removeAttribute('open'));
    });
  }
};
