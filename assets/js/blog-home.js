/**
 * Blog Home - Affichage dynamique des derniers articles sur la page d'accueil
 */

(function() {
  'use strict';

// Configuration
const MAX_ARTICLES_DISPLAY = 12;

/**
 * Charge les articles depuis articles.json et les affiche sur la page d'accueil
 */
async function loadBlogArticles() {
  try {
    const response = await fetch(`blog/articles.json?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) {
      console.warn('Impossible de charger les articles du blog');
      return;
    }
    
    const articles = await response.json();
    if (!articles || articles.length === 0) {
      console.log('Aucun article trouvé');
      return;
    }
    
    // Trier par date (plus récent en premier)
    const sortedArticles = articles.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
    
    const articlesToDisplay = sortedArticles.filter((a) => !a.draft).slice(0, MAX_ARTICLES_DISPLAY);
    updateBlogCarousel(articlesToDisplay);
    
  } catch (error) {
    console.error('Erreur lors du chargement des articles:', error);
  }
}

/**
 * Met à jour le slider d'articles sur la page d'accueil
 */
function updateBlogCarousel(articles) {
  const carousel = document.querySelector('[data-blog-carousel]');
  if (!carousel) return;

  const viewport = carousel.querySelector('[data-carousel-viewport]');
  const track = carousel.querySelector('[data-carousel-track]');
  if (!viewport || !track) return;

  const cta = track.querySelector('[data-blog-cta]');

  track.querySelectorAll('.blog-preview-card').forEach((card) => {
    if (card.hasAttribute('data-blog-cta')) return;
    card.remove();
  });

  const frag = document.createDocumentFragment();
  for (const article of articles) {
    const card = createArticleCard(article);
    if (card) frag.appendChild(card);
  }

  if (cta) {
    track.insertBefore(frag, cta);
  } else {
    track.appendChild(frag);
  }

  viewport.scrollLeft = 0;
  initCarouselControls(carousel, viewport);
}

function initCarouselControls(carousel, viewport) {
  if (carousel.dataset.carouselInit === 'true') return;
  carousel.dataset.carouselInit = 'true';

  const prevBtn = carousel.querySelector('[data-carousel-prev]');
  const nextBtn = carousel.querySelector('[data-carousel-next]');
  const track = carousel.querySelector('[data-carousel-track]');

  const updateButtons = () => {
    if (!prevBtn || !nextBtn) return;
    const maxScroll = viewport.scrollWidth - viewport.clientWidth;
    prevBtn.disabled = viewport.scrollLeft <= 4;
    nextBtn.disabled = viewport.scrollLeft >= maxScroll - 4;
  };

  const scrollByPage = (dir) => {
    const delta = Math.max(280, Math.floor(viewport.clientWidth * 0.9));
    viewport.scrollBy({ left: dir * delta, behavior: 'smooth' });
  };

  if (prevBtn) prevBtn.addEventListener('click', () => scrollByPage(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => scrollByPage(1));

  let raf = 0;
  viewport.addEventListener('scroll', () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      updateButtons();
    });
  });

  window.addEventListener('resize', updateButtons);
  updateButtons();

  let isPointerDown = false;
  let startX = 0;
  let startY = 0;
  let startScrollLeft = 0;
  let moved = false;
  let activePointerId = null;
  let suppressClickUntil = 0;
  let startIndex = 0;

  const getCards = () => {
    if (!track) return [];
    return Array.from(track.querySelectorAll('.blog-preview-card'));
  };

  const getNearestIndex = (scrollLeft) => {
    const cards = getCards();
    if (cards.length === 0) return 0;
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < cards.length; i += 1) {
      const dist = Math.abs(cards[i].offsetLeft - scrollLeft);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }
    return bestIdx;
  };

  const scrollToIndex = (idx) => {
    const cards = getCards();
    if (cards.length === 0) return;
    const i = Math.max(0, Math.min(idx, cards.length - 1));
    viewport.scrollTo({ left: cards[i].offsetLeft, behavior: 'smooth' });
  };

  const onPointerDown = (e) => {
    if (!e || typeof e.pointerId !== 'number') return;
    const target = e.target && e.target.closest ? e.target.closest('a') : null;
    if (target) return;
    isPointerDown = true;
    moved = false;
    activePointerId = e.pointerId;
    startX = e.clientX;
    startY = e.clientY;
    startScrollLeft = viewport.scrollLeft;
    startIndex = getNearestIndex(startScrollLeft);
  };

  const onPointerMove = (e) => {
    if (!isPointerDown) return;
    if (activePointerId !== null && e.pointerId !== activePointerId) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (!moved) {
      if (Math.abs(dx) < 10) return;
      if (Math.abs(dy) > Math.abs(dx)) {
        isPointerDown = false;
        activePointerId = null;
        return;
      }
      moved = true;
      try { viewport.setPointerCapture(activePointerId); } catch (_) {}
    }
    e.preventDefault();
    viewport.scrollLeft = startScrollLeft - dx;
  };

  const onPointerUp = (e) => {
    if (activePointerId !== null && e.pointerId !== activePointerId) return;
    if (moved) {
      suppressClickUntil = Date.now() + 450;
      const delta = viewport.scrollLeft - startScrollLeft;
      const THRESHOLD = 24;
      if (Math.abs(delta) <= THRESHOLD) {
        scrollToIndex(startIndex);
      } else {
        scrollToIndex(startIndex + (delta > 0 ? 1 : -1));
      }
    }
    isPointerDown = false;
    activePointerId = null;
    try { viewport.releasePointerCapture(e.pointerId); } catch (_) {}
  };

  if (!viewport.__vprrDragBound && 'PointerEvent' in window) {
    viewport.__vprrDragBound = true;
    viewport.addEventListener('pointerdown', onPointerDown, { passive: true });
    viewport.addEventListener('pointermove', onPointerMove, { passive: false });
    viewport.addEventListener('pointerup', onPointerUp, { passive: true });
    viewport.addEventListener('pointercancel', onPointerUp, { passive: true });
    viewport.addEventListener('pointerleave', onPointerUp, { passive: true });

    viewport.addEventListener('click', (e) => {
      if (Date.now() < suppressClickUntil) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
  }
}

/**
 * Crée une carte d'article pour la page d'accueil
 */
function createArticleCard(article) {
  const imgSrc = article.imageSrc || article.image || '';
  const imgSrcset = article.imageSrcset || '';
  const imgSizes = article.imageSizes || '';

  const escapeHtml = (value) =>
    String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const normalizeText = (value) =>
    String(value || '')
      .replace(/\s+/g, ' ')
      .trim();

  const title = normalizeText(article.title);
  const description = normalizeText(article.description);
  const category = normalizeText(article.category) || 'Conseil';
  const readtime = article.readtime || 5;

  if (!article.slug || !title) return null;

  const template = `
    <article class="blog-preview-card">
      <a href="blog/${escapeHtml(article.slug)}.html" class="blog-preview-link">
        <div class="blog-preview-image">
          <img src="${escapeHtml(imgSrc)}" ${imgSrcset ? `srcset="${escapeHtml(imgSrcset)}"${imgSizes ? ` sizes="${escapeHtml(imgSizes)}"` : ''}` : ''} alt="${escapeHtml(title)}" loading="lazy">
          <div class="blog-preview-badge">${escapeHtml(category)}</div>
        </div>
        <div class="blog-preview-content">
          <h3 class="blog-preview-title">${escapeHtml(title)}</h3>
          <p class="blog-preview-excerpt">${escapeHtml(description)}</p>
          <div class="blog-preview-meta">
            <i class="fa-regular fa-clock" aria-hidden="true"></i>
            <span>${escapeHtml(readtime)} min de lecture</span>
            <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
          </div>
        </div>
      </a>
    </article>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = template.trim();
  return div.firstElementChild;
}

/**
 * Initialisation au chargement du DOM
 */
document.addEventListener('DOMContentLoaded', function() {
  // Vérifier si on est sur la page d'accueil
  if (document.querySelector('[data-blog-carousel]')) {
    loadBlogArticles();
  }
});

})();
