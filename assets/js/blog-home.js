/**
 * Blog Home - Affichage dynamique des derniers articles sur la page d'accueil
 */

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
    <article class="blog-preview-card" style="background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(45, 36, 30, 0.08); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid rgba(103, 58, 18, 0.08);">
      <a href="blog/${escapeHtml(article.slug)}.html" class="blog-preview-link" style="text-decoration: none; color: inherit; display: flex; flex-direction: column; height: 100%;">
        <div class="blog-preview-image" style="position: relative; width: 100%; padding-top: 56.25%; overflow: hidden; background: #F5F2EE;">
          <img src="${escapeHtml(imgSrc)}" ${imgSrcset ? `srcset="${escapeHtml(imgSrcset)}"${imgSizes ? ` sizes="${escapeHtml(imgSizes)}"` : ''}` : ''} alt="${escapeHtml(title)}" loading="lazy" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease;">
          <div style="position: absolute; top: 16px; left: 16px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); padding: 6px 14px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; color: #673A12; letter-spacing: 0.02em;">${escapeHtml(category)}</div>
        </div>
        <div class="blog-preview-content" style="padding: var(--space-lg); flex: 1; display: flex; flex-direction: column;">
          <h3 class="blog-preview-title" style="font-size: 1.25rem; font-weight: 600; color: #2D241E; margin-bottom: var(--space-sm); line-height: 1.4; transition: color 0.2s ease;">${escapeHtml(title)}</h3>
          <p class="blog-preview-excerpt" style="font-size: 0.9375rem; color: #6B5D52; line-height: 1.6; margin-bottom: var(--space-md); flex: 1;">${escapeHtml(description)}</p>
          <div style="display: flex; align-items: center; gap: var(--space-sm); color: #8B7355; font-size: 0.875rem;">
            <i class="fa-regular fa-clock" aria-hidden="true" style="font-size: 0.875rem;"></i>
            <span>${escapeHtml(readtime)} min de lecture</span>
            <i class="fa-solid fa-arrow-right" aria-hidden="true" style="margin-left: auto; font-size: 0.875rem; transition: transform 0.2s ease;"></i>
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
