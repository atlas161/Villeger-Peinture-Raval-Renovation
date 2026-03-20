/**
 * Blog Home - Affichage dynamique des derniers articles sur la page d'accueil
 */

// Configuration
const MAX_ARTICLES_DISPLAY = 3; // Afficher maximum 3 articles

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
    
    // Limiter au nombre maximum d'articles à afficher
    const articlesToDisplay = sortedArticles.slice(0, MAX_ARTICLES_DISPLAY);
    
    // Mettre à jour la grille d'articles
    updateBlogGrid(articlesToDisplay);
    
  } catch (error) {
    console.error('Erreur lors du chargement des articles:', error);
  }
}

/**
 * Met à jour la grille d'articles sur la page d'accueil
 */
function updateBlogGrid(articles) {
  const grid = document.querySelector('.blog-preview-grid');
  if (!grid) return;
  
  // Garder uniquement le premier article (existant) et ajouter les autres
  const existingArticles = grid.querySelectorAll('.blog-preview-card');
  
  // Si on a déjà des articles, on les met à jour
  if (existingArticles.length > 0) {
    // Mettre à jour le premier article si nécessaire
    if (articles.length > 0) {
      updateFirstArticle(existingArticles[0], articles[0]);
    }
    
    // Ajouter les articles supplémentaires
    for (let i = 1; i < Math.min(articles.length, MAX_ARTICLES_DISPLAY); i++) {
      const articleCard = createArticleCard(articles[i]);
      if (articleCard) {
        // Insérer avant le dernier élément (le CTA vers tous les articles)
        const lastElement = grid.lastElementChild;
        grid.insertBefore(articleCard, lastElement);
      }
    }
  }
}

/**
 * Met à jour le premier article existant
 */
function updateFirstArticle(existingCard, article) {
  const link = existingCard.querySelector('.blog-preview-link');
  if (!link) return;
  
  // Mettre à jour le lien
  link.href = `blog/${article.slug}.html`;
  
  // Mettre à jour l'image
  const img = existingCard.querySelector('.blog-preview-image img');
  if (img) {
    const imageSrc = article.imageSrc || article.image || '';
    const imageSrcset = article.imageSrcset || '';
    const imageSizes = article.imageSizes || '';
    if (imageSrc) {
      img.src = imageSrc;
    }
    if (imageSrcset) {
      img.setAttribute('srcset', imageSrcset);
      if (imageSizes) img.setAttribute('sizes', imageSizes);
    } else {
      img.removeAttribute('srcset');
      img.removeAttribute('sizes');
    }
    img.alt = article.title || img.alt;
  }
  
  // Mettre à jour le tag
  const tag = existingCard.querySelector('.blog-preview-image div');
  if (tag && article.category) {
    tag.textContent = article.category;
  }
  
  // Mettre à jour le contenu
  const title = existingCard.querySelector('.blog-preview-content h3');
  if (title) {
    title.textContent = article.title;
  }
  
  const description = existingCard.querySelector('.blog-preview-content p');
  if (description) {
    description.textContent = article.description;
  }
  
  // Mettre à jour le temps de lecture
  const meta = existingCard.querySelector('.blog-preview-meta');
  if (meta && article.readtime) {
    meta.textContent = `${article.readtime} min de lecture`;
  }
}

/**
 * Crée une carte d'article pour la page d'accueil
 */
function createArticleCard(article) {
  const imgSrc = article.imageSrc || article.image || '';
  const imgSrcset = article.imageSrcset || '';
  const imgSizes = article.imageSizes || '';
  const template = `
    <article class="blog-preview-card" style="background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(45, 36, 30, 0.08); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid rgba(103, 58, 18, 0.08);">
      <a href="blog/${article.slug}.html" class="blog-preview-link" style="text-decoration: none; color: inherit; display: flex; flex-direction: column; height: 100%;">
        <div class="blog-preview-image" style="position: relative; width: 100%; padding-top: 56.25%; overflow: hidden; background: #F5F2EE;">
          <img src="${imgSrc}" ${imgSrcset ? `srcset="${imgSrcset}"${imgSizes ? ` sizes="${imgSizes}"` : ''}` : ''} alt="${article.title}" loading="lazy" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease;">
          <div style="position: absolute; top: 16px; left: 16px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); padding: 6px 14px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; color: #673A12; letter-spacing: 0.02em;">${article.category || 'Conseil'}</div>
        </div>
        <div class="blog-preview-content" style="padding: var(--space-lg); flex: 1; display: flex; flex-direction: column;">
          <h3 style="font-size: 1.25rem; font-weight: 600; color: #2D241E; margin-bottom: var(--space-sm); line-height: 1.4; transition: color 0.2s ease;">${article.title}</h3>
          <p style="font-size: 0.9375rem; color: #6B5D52; line-height: 1.6; margin-bottom: var(--space-md); flex: 1;">${article.description}</p>
          <div style="display: flex; align-items: center; gap: var(--space-sm); color: #8B7355; font-size: 0.875rem;">
            <i class="fa-regular fa-clock" aria-hidden="true" style="font-size: 0.875rem;"></i>
            <span>${article.readtime || 5} min de lecture</span>
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
  if (document.querySelector('.blog-preview-grid')) {
    loadBlogArticles();
  }
});
