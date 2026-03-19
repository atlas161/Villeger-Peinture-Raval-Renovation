/**
 * VPRR Blog - Chargement dynamique des articles
 * Charge les articles depuis /content/blog/ et les affiche dans la grille
 */

// Configuration
const ARTICLES_PER_PAGE = 9;
let currentPage = 1;
let allArticles = [];
let filteredArticles = [];

// Cache des articles
const articlesCache = new Map();

/**
 * Parse le frontmatter d'un fichier Markdown
 * @param {string} content - Contenu du fichier Markdown
 * @returns {Object} - { frontmatter: Object, body: string }
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };
  
  const frontmatter = {};
  const lines = match[1].split('\n');
  
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      
      // Enlever les guillemets si présents
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      // Parser les arrays (tags)
      if (value.startsWith('[') && value.endsWith(']')) {
        try {
          value = JSON.parse(value.replace(/'/g, '"'));
        } catch {
          value = value.slice(1, -1).split(',').map(s => s.trim());
        }
      }
      
      frontmatter[key] = value;
    }
  }
  
  return { frontmatter, body: match[2].trim() };
}

/**
 * Convertit Markdown simple en HTML
 * @param {string} markdown - Texte Markdown
 * @returns {string} - HTML
 */
function markdownToHtml(markdown) {
  return markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Gras et italique
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Liens
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // Paragraphes
    .replace(/\n\n/g, '</p><p>')
    // Listes
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    // Citations
    .replace(/^> (.*$)/gim, '<blockquote><p>$1</p></blockquote>');
}

/**
 * Génère un extrait à partir du contenu
 * @param {string} content - Contenu HTML ou Markdown
 * @param {number} length - Longueur souhaitée
 * @returns {string} - Extrait
 */
function generateExcerpt(content, length = 160) {
  // Enlever le Markdown/HTML basique
  const text = content
    .replace(/#+ /g, '')
    .replace(/\*\*|\*|__/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (text.length <= length) return text;
  return text.slice(0, length).replace(/\s+\S*$/, '') + '...';
}

/**
 * Détermine la catégorie d'un article à partir des tags ou du titre
 * @param {Object} article - Article avec frontmatter
 * @returns {string} - Catégorie
 */
function getCategory(article) {
  const tags = article.tags || [];
  const title = article.title || '';
  const titleLower = title.toLowerCase();
  
  if (tags.includes('peinture') || titleLower.includes('peinture')) return 'peinture';
  if (tags.includes('facade') || tags.includes('façade') || titleLower.includes('façade')) return 'facade';
  if (tags.includes('toiture') || titleLower.includes('toiture')) return 'toiture';
  if (tags.includes('isolation') || titleLower.includes('isolation')) return 'isolation';
  if (tags.includes('conseils') || titleLower.includes('conseil')) return 'conseils';
  
  return 'conseils';
}

/**
 * Charge la liste des articles disponibles
 * @returns {Promise<Array>} - Liste des articles
 */
async function loadArticlesList() {
  try {
    // Charger les articles depuis le fichier JSON généré par le build
    const response = await fetch('./articles.json');
    if (!response.ok) {
      throw new Error('Impossible de charger articles.json');
    }
    const articles = await response.json();
    return articles.filter(a => !a.draft);
  } catch (error) {
    console.error('Erreur lors du chargement des articles:', error);
    return [];
  }
}

/**
 * Crée le HTML d'une carte d'article
 * @param {Object} article - Article
 * @returns {string} - HTML de la carte
 */
function createArticleCard(article) {
  const category = getCategory(article);
  const categoryLabels = {
    peinture: 'Peinture',
    facade: 'Façade',
    toiture: 'Toiture',
    isolation: 'Isolation',
    conseils: 'Conseils'
  };
  
  const date = new Date(article.date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const normalizePublicPath = (p) => {
    if (!p || typeof p !== 'string') return '';
    if (p.startsWith('http://') || p.startsWith('https://')) return p;
    return p.startsWith('/') ? p : `/${p}`;
  };

  const deriveWebpVariant = (p, w) => {
    const normalized = normalizePublicPath(p);
    if (!normalized.toLowerCase().endsWith('.webp')) return normalized;
    return normalized.slice(0, -'.webp'.length) + `-${w}w.webp`;
  };

  const baseImage = normalizePublicPath(article.image);
  const imageSrc = baseImage ? deriveWebpVariant(baseImage, 600) : '';
  const imageSrcset = baseImage && baseImage.toLowerCase().endsWith('.webp')
    ? [
        `${deriveWebpVariant(baseImage, 400)} 400w`,
        `${deriveWebpVariant(baseImage, 600)} 600w`,
        `${deriveWebpVariant(baseImage, 800)} 800w`,
        `${deriveWebpVariant(baseImage, 1200)} 1200w`
      ].join(', ')
    : '';
  
  return `
    <article class="article-card" data-category="${category}" data-date="${article.date}">
      <a href="./${article.slug}.html" class="article-link" aria-label="Lire ${article.title}">
        <div class="article-image">
          <img src="${imageSrc || baseImage}" ${imageSrcset ? `srcset=\"${imageSrcset}\" sizes=\"(max-width: 768px) 100vw, 600px\"` : ''} alt="${article.title}" loading="lazy" width="600" height="338">
          <span class="article-tag">${categoryLabels[category] || 'Conseil'}</span>
        </div>
        <div class="article-content">
          <div class="article-meta">
            <span><i class="fa-regular fa-calendar" aria-hidden="true"></i> ${date}</span>
            <span class="meta-separator">·</span>
            <span><i class="fa-regular fa-clock" aria-hidden="true"></i> ${article.readtime || 5} min</span>
          </div>
          <h2 class="article-title">${article.title}</h2>
          <p class="article-excerpt">${article.description}</p>
          <span class="article-cta">
            Lire l'article
            <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
          </span>
        </div>
      </a>
    </article>
  `;
}

/**
 * Affiche les articles dans la grille
 * @param {Array} articles - Articles à afficher
 * @param {number} page - Page actuelle
 */
function displayArticles(articles, page = 1) {
  const grid = document.getElementById('articles-grid');
  const pagination = document.getElementById('pagination');
  const pageInfo = document.getElementById('page-info');
  const prevBtn = document.getElementById('prev-page');
  const nextBtn = document.getElementById('next-page');
  const emptyState = document.getElementById('empty-state');
  
  // Afficher état vide si pas d'articles
  if (articles.length === 0) {
    grid.style.display = 'none';
    pagination.style.display = 'none';
    emptyState.style.display = 'flex';
    return;
  }
  
  grid.style.display = 'grid';
  emptyState.style.display = 'none';
  
  // Pagination
  const totalPages = Math.ceil(articles.length / ARTICLES_PER_PAGE);
  const startIndex = (page - 1) * ARTICLES_PER_PAGE;
  const endIndex = startIndex + ARTICLES_PER_PAGE;
  const pageArticles = articles.slice(startIndex, endIndex);
  
  // Générer HTML
  grid.innerHTML = pageArticles.map(createArticleCard).join('');
  
  // Mettre à jour pagination
  if (totalPages > 1) {
    pagination.style.display = 'flex';
    pageInfo.textContent = `Page ${page} sur ${totalPages}`;
    prevBtn.disabled = page === 1;
    nextBtn.disabled = page === totalPages;
  } else {
    pagination.style.display = 'none';
  }
}

/**
 * Filtre les articles par catégorie
 * @param {string} category - Catégorie à filtrer
 */
function filterArticles(category) {
  if (category === 'all') {
    filteredArticles = [...allArticles];
  } else {
    filteredArticles = allArticles.filter(article => {
      const articleCategory = getCategory(article);
      return articleCategory === category;
    });
  }
  
  currentPage = 1;
  displayArticles(filteredArticles, currentPage);
}

/**
 * Initialise les écouteurs d'événements
 */
function initEventListeners() {
  // Filtres
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Mettre à jour état actif
      filterButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      
      // Filtrer
      filterArticles(btn.dataset.filter);
    });
  });
  
  // Pagination
  const prevBtn = document.getElementById('prev-page');
  const nextBtn = document.getElementById('next-page');
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        displayArticles(filteredArticles, currentPage);
        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
      if (currentPage < totalPages) {
        currentPage++;
        displayArticles(filteredArticles, currentPage);
        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
}

/**
 * Initialise le blog
 */
async function initBlog() {
  allArticles = await loadArticlesList();
  filteredArticles = [...allArticles];
  
  displayArticles(filteredArticles, currentPage);
  initEventListeners();
}

// Démarrer quand le DOM est prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBlog);
} else {
  initBlog();
}
