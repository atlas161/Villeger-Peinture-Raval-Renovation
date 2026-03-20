/**
 * VPRR Blog Builder
 * Script de génération automatique des pages de blog statiques
 * 
 * Fonctionnalités :
 * - Parse les fichiers Markdown du dossier /content/blog/
 * - Génère des pages HTML statiques optimisées SEO
 * - Met à jour le sitemap.xml
 * - Gère les images et vidéos
 * - Génère un sommaire (TOC) automatique
 * 
 * Usage : node scripts/build-blog.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  contentDir: path.join(__dirname, '..', 'content', 'blog'),
  templatePath: path.join(__dirname, '..', 'blog', 'template-article.html'),
  outputDir: path.join(__dirname, '..', 'blog'),
  sitemapPath: path.join(__dirname, '..', 'sitemap.xml'),
  siteUrl: 'https://vprr.fr',
  blogUrl: 'https://vprr.fr/blog'
};

/**
 * Parse le frontmatter d'un fichier Markdown
 * @param {string} content - Contenu du fichier
 * @returns {Object} - { frontmatter: Object, body: string }
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) {
    return { 
      frontmatter: { 
        title: 'Article sans titre',
        slug: 'article',
        description: '',
        date: new Date().toISOString().split('T')[0],
        draft: true,
        tags: [],
        readtime: 5
      }, 
      body: content 
    };
  }

  const frontmatter = {};
  const raw = match[1].replace(/\r\n?/g, '\n');
  const lines = raw.split('\n');

  const isIndented = (line) => /^\s+/.test(line);
  const stripIndent = (line) => line.replace(/^\s+/, '');

  const coerceScalar = (value) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
    return value;
  };

  for (let i = 0; i < lines.length; ) {
    const line = lines[i];
    if (!line.trim()) {
      i += 1;
      continue;
    }

    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!m) {
      i += 1;
      continue;
    }

    const key = m[1];
    let value = m[2] ?? '';

    if (value === '|' || value === '>') {
      const mode = value;
      i += 1;
      const parts = [];
      while (i < lines.length && (lines[i].trim() === '' || isIndented(lines[i]))) {
        if (lines[i].trim() === '') {
          parts.push('');
          i += 1;
          continue;
        }
        parts.push(stripIndent(lines[i]));
        i += 1;
      }
      frontmatter[key] = mode === '>'
        ? parts.join(' ').replace(/\s+/g, ' ').trim()
        : parts.join('\n').replace(/\n+$/g, '');
      continue;
    }

    if (value === '') {
      const next = lines[i + 1];
      if (typeof next === 'string' && /^\s*-\s+/.test(next)) {
        i += 1;
        const items = [];
        while (i < lines.length && /^\s*-\s+/.test(lines[i])) {
          items.push(lines[i].replace(/^\s*-\s+/, '').trim().replace(/^['"]|['"]$/g, ''));
          i += 1;
        }
        frontmatter[key] = items;
        continue;
      }

      if (typeof next === 'string' && isIndented(next)) {
        i += 1;
        const parts = [];
        while (i < lines.length && (lines[i].trim() === '' || isIndented(lines[i]))) {
          if (lines[i].trim() === '') {
            parts.push('');
            i += 1;
            continue;
          }
          parts.push(stripIndent(lines[i]));
          i += 1;
        }
        frontmatter[key] = parts.join(' ').replace(/\s+/g, ' ').trim();
        continue;
      }

      frontmatter[key] = '';
      i += 1;
      continue;
    }

    if (value.startsWith('"') && !value.endsWith('"')) {
      let combined = value;
      i += 1;
      while (i < lines.length) {
        combined += `\n${lines[i]}`;
        if (lines[i].trim().endsWith('"')) {
          i += 1;
          break;
        }
        i += 1;
      }
      const unquoted = combined.replace(/^"/, '').replace(/"$/, '');
      frontmatter[key] = unquoted.replace(/\s+/g, ' ').trim();
      continue;
    }

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        value = value.slice(1, -1).split(',').map(s => s.trim().replace(/['"]/g, ''));
      } catch {
        value = [];
      }
      frontmatter[key] = value;
      i += 1;
      continue;
    }

    frontmatter[key] = coerceScalar(value);
    i += 1;
  }

  return { frontmatter, body: match[2].trim() };
}

/**
 * Convertit Markdown en HTML
 * Support : headers, gras, italique, liens, listes, images, vidéos, citations, tableaux
 */
function markdownToHtml(markdown) {
  const normalizeNewlines = (s) => String(s || '').replace(/\r\n?/g, '\n');

  const escapeHtml = (s) =>
    String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const parseImage = (text) => {
    const m = text.match(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/);
    if (!m) return null;
    return { alt: m[1] || '', url: m[2] || '', title: m[3] || '' };
  };

  const renderInline = (text) => {
    let out = escapeHtml(text);

    out = out.replace(/(?<!!)\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    out = out.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/\*(.+?)\*/g, '<em>$1</em>');
    out = out.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
    out = out.replace(/__(.+?)__/g, '<strong>$1</strong>');
    out = out.replace(/_(.+?)_/g, '<em>$1</em>');

    out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g, (match, alt, url, title) => {
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
      return `<img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" loading="lazy"${titleAttr}>`;
    });

    return out;
  };

  const renderVideo = (url) => {
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      return `<div class="video-wrapper"><iframe src="https://www.youtube.com/embed/${videoId}" title="Vidéo YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
    }
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      const videoId = vimeoMatch[1];
      return `<div class="video-wrapper"><iframe src="https://player.vimeo.com/video/${videoId}" title="Vidéo Vimeo" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
    }
    const safeUrl = escapeHtml(url);
    return `<p><a href="${safeUrl}" target="_blank" rel="noopener noreferrer">Voir la vidéo</a></p>`;
  };

  const slugify = (text) =>
    String(text || '')
      .toLowerCase()
      .replace(/&amp;|&lt;|&gt;/g, ' ')
      .replace(/<\/?[^>]+>/g, ' ')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);

  const isHr = (line) => /^\s*([-*_]\s*){3,}$/.test(line);

  const parseTableRow = (line) => {
    const trimmed = line.trim();
    const normalized = trimmed.replace(/^\|/, '').replace(/\|$/, '');
    return normalized.split('|').map((c) => c.trim());
  };

  const isTableSeparatorRow = (line) => {
    const cells = parseTableRow(line);
    if (cells.length === 0) return false;
    return cells.every((c) => /^:?-{3,}:?$/.test(c));
  };

  const looksLikeTableRow = (line) => {
    const t = line.trim();
    if (!t) return false;
    if (!t.includes('|')) return false;
    const cells = parseTableRow(t);
    return cells.length >= 2;
  };

  const isUnorderedItem = (line) => /^\s*[-*+]\s+/.test(line);
  const isOrderedItem = (line) => /^\s*\d+\.\s+/.test(line);
  const stripUnorderedMarker = (line) => line.replace(/^\s*[-*+]\s+/, '');
  const stripOrderedMarker = (line) => line.replace(/^\s*\d+\.\s+/, '');

  const headers = [];
  const lines = normalizeNewlines(markdown).split('\n');
  const blocks = [];
  let i = 0;

  const isBlockStart = (line, nextLine) => {
    const t = (line || '').trim();
    if (!t) return false;
    if (/^#{1,3}\s+/.test(t)) return true;
    if (/^>\s?/.test(t)) return true;
    if (isHr(t)) return true;
    if (/^\s*!\[/.test(line) && /^\s*!\[[^\]]*\]\([^)]+\)\s*$/.test(line)) return true;
    if (/^\s*\[video\]\((https?:\/\/[^)]+)\)\s*$/.test(line)) return true;
    if (looksLikeTableRow(t) && nextLine && isTableSeparatorRow(nextLine)) return true;
    if (isUnorderedItem(line) || isOrderedItem(line)) return true;
    return false;
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    const headerMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const rawText = headerMatch[2].trim();
      const inlineHtml = renderInline(rawText);
      const id = slugify(inlineHtml) || `section-${headers.length + 1}`;
      headers.push({ level, text: rawText, id });
      blocks.push(`<h${level} id="${id}">${inlineHtml}</h${level}>`);
      i += 1;
      continue;
    }

    if (isHr(trimmed)) {
      blocks.push('<hr>');
      i += 1;
      continue;
    }

    const imageOnlyMatch = line.match(/^\s*!\[[^\]]*\]\([^)]+\)\s*$/);
    if (imageOnlyMatch) {
      const img = parseImage(trimmed);
      if (img) {
        const titleAttr = img.title ? ` title="${escapeHtml(img.title)}"` : '';
        const caption = img.title ? `<figcaption>${escapeHtml(img.title)}</figcaption>` : '';
        blocks.push(`<figure><img src="${escapeHtml(img.url)}" alt="${escapeHtml(img.alt)}" loading="lazy"${titleAttr}>${caption}</figure>`);
        i += 1;
        continue;
      }
    }

    const videoMatch = trimmed.match(/^\[video\]\((https?:\/\/[^)]+)\)\s*$/);
    if (videoMatch) {
      blocks.push(renderVideo(videoMatch[1]));
      i += 1;
      continue;
    }

    if (trimmed.startsWith('>')) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i += 1;
      }
      const quoteText = quoteLines.join(' ').trim();
      blocks.push(`<blockquote><p>${renderInline(quoteText)}</p></blockquote>`);
      continue;
    }

    if (looksLikeTableRow(trimmed) && i + 1 < lines.length && isTableSeparatorRow(lines[i + 1])) {
      const headerCells = parseTableRow(lines[i]).map(renderInline);
      i += 2;

      const bodyRows = [];
      while (i < lines.length && looksLikeTableRow(lines[i])) {
        const rowCells = parseTableRow(lines[i]).map(renderInline);
        bodyRows.push(rowCells);
        i += 1;
      }

      const thead = `<thead><tr>${headerCells.map((c) => `<th scope="col">${c}</th>`).join('')}</tr></thead>`;
      const tbody = bodyRows.length
        ? `<tbody>${bodyRows
            .map((row) => `<tr>${row.map((c) => `<td>${c}</td>`).join('')}</tr>`)
            .join('')}</tbody>`
        : '<tbody></tbody>';

      blocks.push(`<div class="table-wrapper"><table>${thead}${tbody}</table></div>`);
      continue;
    }

    if (isUnorderedItem(line) || isOrderedItem(line)) {
      const ordered = isOrderedItem(line);
      const items = [];

      while (i < lines.length) {
        const current = lines[i];
        if (!current.trim()) {
          i += 1;
          continue;
        }

        const isItem = ordered ? isOrderedItem(current) : isUnorderedItem(current);
        if (!isItem) break;

        let itemText = ordered ? stripOrderedMarker(current) : stripUnorderedMarker(current);
        i += 1;

        while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i], lines[i + 1])) {
          itemText += ` ${lines[i].trim()}`;
          i += 1;
        }

        items.push(itemText.trim());
      }

      const tag = ordered ? 'ol' : 'ul';
      blocks.push(`<${tag}>${items.map((it) => `<li>${renderInline(it)}</li>`).join('')}</${tag}>`);
      continue;
    }

    const paragraphLines = [];
    while (i < lines.length) {
      const cur = lines[i];
      if (!cur.trim()) break;
      if (isBlockStart(cur, lines[i + 1]) && paragraphLines.length > 0) break;
      if (isBlockStart(cur, lines[i + 1]) && paragraphLines.length === 0) break;
      paragraphLines.push(cur.trim());
      i += 1;
    }

    if (paragraphLines.length) {
      blocks.push(`<p>${renderInline(paragraphLines.join(' '))}</p>`);
      continue;
    }

    i += 1;
  }

  return { html: blocks.join('\n'), headers };
}

/**
 * Génère le sommaire (TOC) à partir des headers
 */
function generateTOC(headers) {
  if (headers.length === 0) return '';
  
  const items = headers.map(h => {
    const className = h.level === 2 ? 'toc-h2' : 'toc-h3';
    return `<li class="${className}"><a href="#${h.id}">${h.text}</a></li>`;
  }).join('');
  
  return `<ul>${items}</ul>`;
}

/**
 * Génère les tags en HTML
 */
function generateTags(tags) {
  if (!Array.isArray(tags) || tags.length === 0) return '';
  
  return tags.map(tag => 
    `<a href="./?tag=${encodeURIComponent(tag)}" class="tag-link">${tag}</a>`
  ).join('');
}

/**
 * Formate une date
 */
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return {
    iso: date.toISOString(),
    formatted: date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  };
}

function normalizePublicPath(p) {
  if (typeof p !== 'string' || !p) return '';
  if (p.startsWith('http://') || p.startsWith('https://')) return p;
  return p.startsWith('/') ? p : `/${p}`;
}

function fileExistsFromRoot(publicPath) {
  const rel = typeof publicPath === 'string' ? publicPath.replace(/^\//, '') : '';
  if (!rel) return false;
  try {
    return fs.existsSync(path.join(__dirname, '..', rel));
  } catch (_) {
    return false;
  }
}

function deriveWebpVariants(imagePublicPath) {
  const normalized = normalizePublicPath(imagePublicPath);
  if (!normalized) {
    return {
      ogPublic: '',
      heroSrc: '',
      heroSrcset: '',
      heroSizes: '(max-width: 768px) 100vw, 900px'
    };
  }

  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return {
      ogPublic: normalized,
      heroSrc: normalized,
      heroSrcset: '',
      heroSizes: '(max-width: 768px) 100vw, 900px'
    };
  }

  const isWebp = normalized.toLowerCase().endsWith('.webp');
  if (!isWebp) {
    return {
      ogPublic: normalized,
      heroSrc: normalized,
      heroSrcset: '',
      heroSizes: '(max-width: 768px) 100vw, 900px'
    };
  }

  const base = normalized.slice(0, -'.webp'.length);
  const v400 = `${base}-400w.webp`;
  const v600 = `${base}-600w.webp`;
  const v800 = `${base}-800w.webp`;
  const v1200 = `${base}-1200w.webp`;

  const ogPublic = fileExistsFromRoot(v1200) ? v1200 : normalized;
  const heroSrc = fileExistsFromRoot(v800) ? v800 : normalized;
  const parts = [];
  if (fileExistsFromRoot(v400)) parts.push(`${v400} 400w`);
  if (fileExistsFromRoot(v600)) parts.push(`${v600} 600w`);
  if (fileExistsFromRoot(v800)) parts.push(`${v800} 800w`);
  if (fileExistsFromRoot(v1200)) parts.push(`${v1200} 1200w`);

  return {
    ogPublic,
    heroSrc,
    heroSrcset: parts.join(', '),
    heroSizes: '(max-width: 768px) 100vw, 900px'
  };
}

/**
 * Détermine la catégorie principale
 */
function getCategory(tags, title) {
  const categoryMap = {
    'peinture': 'Peinture',
    'facade': 'Façade',
    'façade': 'Façade',
    'toiture': 'Toiture',
    'isolation': 'Isolation',
    'conseils': 'Conseils',
    'renovation': 'Rénovation',
    'raval': 'Ravalement'
  };
  
  const titleLower = title.toLowerCase();
  const allText = [...(Array.isArray(tags) ? tags : []), titleLower].join(' ');
  
  for (const [key, value] of Object.entries(categoryMap)) {
    if (allText.includes(key)) return value;
  }
  
  return 'Conseils';
}

/**
 * Génère le HTML d'une page article avec navigation
 */
function generateArticleHTML(frontmatter, content, template, prevArticle, nextArticle) {
  const { html: bodyHtml, headers } = markdownToHtml(content);
  const toc = generateTOC(headers);
  const tagsHtml = generateTags(frontmatter.tags);
  const date = formatDate(frontmatter.date);
  const category = getCategory(frontmatter.tags, frontmatter.title);
  const tagsString = Array.isArray(frontmatter.tags) ? frontmatter.tags.join(', ') : '';
  const readTime = frontmatter.readtime || 5;
  
  const coverImage = frontmatter.image || '/data/hero.webp';
  const variants = deriveWebpVariants(coverImage);
  const ogImageUrl = variants.ogPublic?.startsWith('http')
    ? variants.ogPublic
    : `${CONFIG.siteUrl}${variants.ogPublic}`;
  const heroImageSrc = variants.heroSrc || coverImage || '';
  const heroImageSrcset = variants.heroSrcset || '';
  const heroImageSizes = variants.heroSizes || '(max-width: 768px) 100vw, 900px';
  
  // Navigation prev/next
  const prevUrl = prevArticle ? `./${prevArticle.slug}.html` : '#';
  const prevTitle = prevArticle ? prevArticle.title : 'Premier article';
  const prevDisabled = prevArticle ? '' : 'disabled';
  
  const nextUrl = nextArticle ? `./${nextArticle.slug}.html` : '#';
  const nextTitle = nextArticle ? nextArticle.title : 'Dernier article';
  const nextDisabled = nextArticle ? '' : 'disabled';
  
  // Remplacements dans le template
  const replacements = {
    '{{TITLE}}': frontmatter.title,
    '{{DESCRIPTION}}': frontmatter.description,
    '{{SLUG}}': frontmatter.slug,
    '{{DATE_ISO}}': date.iso,
    '{{DATE_MODIFIED}}': date.iso,
    '{{DATE_FORMATTED}}': date.formatted,
    '{{OG_IMAGE_URL}}': ogImageUrl,
    '{{HERO_IMAGE_SRC}}': heroImageSrc,
    '{{HERO_IMAGE_SRCSET}}': heroImageSrcset,
    '{{HERO_IMAGE_SIZES}}': heroImageSizes,
    '{{TAGS}}': tagsString,
    '{{CATEGORY}}': category,
    '{{READ_TIME}}': readTime,
    '{{CONTENT}}': bodyHtml,
    '{{TOC}}': toc,
    '{{TAGS_LIST}}': tagsHtml,
    '{{URL_ENCODED}}': encodeURIComponent(`${CONFIG.blogUrl}/${frontmatter.slug}.html`),
    '{{TITLE_ENCODED}}': encodeURIComponent(frontmatter.title),
    '{{PREV_ARTICLE_URL}}': prevUrl,
    '{{PREV_ARTICLE_TITLE}}': prevTitle,
    '{{PREV_DISABLED}}': prevDisabled,
    '{{NEXT_ARTICLE_URL}}': nextUrl,
    '{{NEXT_ARTICLE_TITLE}}': nextTitle,
    '{{NEXT_DISABLED}}': nextDisabled
  };
  
  let html = template;
  for (const [key, value] of Object.entries(replacements)) {
    html = html.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
  }
  
  return html;
}

/**
 * Met à jour le sitemap.xml avec les articles du blog
 */
function updateSitemap(articles) {
  console.log('📄 Mise à jour du sitemap...');
  
  let sitemap;
  try {
    sitemap = fs.readFileSync(CONFIG.sitemapPath, 'utf-8');
  } catch (err) {
    console.log('   Création d\'un nouveau sitemap...');
    sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
  }
  
  const urlRegex = /<url>[\s\S]*?<\/url>/g;
  const existingUrls = sitemap.match(urlRegex) || [];

  const extractLoc = (urlBlock) => {
    const m = urlBlock.match(/<loc>\s*([^<]+)\s*<\/loc>/);
    return m ? m[1].trim() : '';
  };

  const isBlogUrl = (loc) => {
    if (!loc) return false;
    return loc === `${CONFIG.blogUrl}/` || loc.startsWith(`${CONFIG.blogUrl}/`);
  };

  const dedupeByLoc = (blocks) => {
    const seen = new Set();
    const out = [];
    for (const b of blocks) {
      const loc = extractLoc(b);
      if (!loc) continue;
      if (seen.has(loc)) continue;
      seen.add(loc);
      out.push(b);
    }
    return out;
  };

  const nonBlogUrls = dedupeByLoc(
    existingUrls.filter((b) => {
      const loc = extractLoc(b);
      if (!loc) return false;
      if (!loc.startsWith(CONFIG.siteUrl)) return false;
      return !isBlogUrl(loc);
    })
  );
  
  // Générer les URLs des articles
  const blogUrls = articles.map(article => {
    const date = new Date(article.date).toISOString().split('T')[0];
    return `  <url>
    <loc>${CONFIG.blogUrl}/${article.slug}.html</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
  });
  
  // URL de la page blog index
  const blogIndexUrl = `  <url>
    <loc>${CONFIG.blogUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
  
  // Reconstruire le sitemap
  const allUrls = [...nonBlogUrls, blogIndexUrl, ...blogUrls];
  const newSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allUrls.join('\n')}
</urlset>`;
  
  fs.writeFileSync(CONFIG.sitemapPath, newSitemap, 'utf-8');
  console.log(`   ✅ ${articles.length + 1} URLs ajoutées au sitemap`);
}

/**
 * Génère le fichier JSON des articles pour le chargement dynamique
 */
function generateArticlesJSON(articles) {
  const jsonPath = path.join(CONFIG.outputDir, 'articles.json');
  const publicArticles = articles
    .filter(a => !a.draft)
    .map(a => ({
      slug: a.slug,
      title: a.title,
      description: a.description,
      date: a.date,
      image: normalizePublicPath(a.image || '/data/hero.webp'),
      imageSrc: deriveWebpVariants(a.image || '/data/hero.webp').heroSrc || normalizePublicPath(a.image || '/data/hero.webp'),
      imageSrcset: deriveWebpVariants(a.image || '/data/hero.webp').heroSrcset || '',
      imageSizes: deriveWebpVariants(a.image || '/data/hero.webp').heroSizes || '(max-width: 768px) 100vw, 600px',
      tags: a.tags,
      readtime: a.readtime || 5,
      category: getCategory(a.tags, a.title)
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  
  fs.writeFileSync(jsonPath, JSON.stringify(publicArticles, null, 2), 'utf-8');
  console.log(`   ✅ articles.json généré (${publicArticles.length} articles)`);
}

/**
 * Fonction principale
 */
async function build() {
  console.log('🏗️  VPRR Blog Builder');
  console.log('   Génération des pages statiques...\n');
  
  // Vérifier que les dossiers existent
  if (!fs.existsSync(CONFIG.contentDir)) {
    console.error('❌ Dossier content/blog introuvable !');
    console.log('   Création du dossier...');
    fs.mkdirSync(CONFIG.contentDir, { recursive: true });
  }
  
  if (!fs.existsSync(CONFIG.templatePath)) {
    console.error('❌ Template article introuvable :', CONFIG.templatePath);
    process.exit(1);
  }
  
  // Lire le template
  const template = fs.readFileSync(CONFIG.templatePath, 'utf-8');
  
  // Lire les fichiers Markdown
  const files = fs.readdirSync(CONFIG.contentDir)
    .filter(f => f.endsWith('.md'))
    .sort();
  
  console.log(`📚 ${files.length} fichier(s) Markdown trouvé(s)\n`);
  
  // Première passe : parser tous les articles
  const parsedArticles = [];
  const errors = [];
  
  for (const file of files) {
    try {
      const filePath = path.join(CONFIG.contentDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const { frontmatter, body } = parseFrontmatter(content);
      
      if (!frontmatter.title) {
        throw new Error('Titre manquant');
      }
      if (!frontmatter.slug) {
        frontmatter.slug = file.replace('.md', '');
      }
      
      parsedArticles.push({
        ...frontmatter,
        file,
        body
      });
    } catch (err) {
      console.error(`   ❌ Erreur parsing ${file}: ${err.message}`);
      errors.push({ file, error: err.message });
    }
  }
  
  // Trier par date (du plus récent au plus ancien)
  parsedArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Deuxième passe : générer les HTML avec navigation
  for (let i = 0; i < parsedArticles.length; i++) {
    const article = parsedArticles[i];
    console.log(`   📝 ${article.file}...`);
    
    try {
      // Déterminer prev/next
      const prevArticle = i < parsedArticles.length - 1 ? parsedArticles[i + 1] : null;
      const nextArticle = i > 0 ? parsedArticles[i - 1] : null;
      
      // Générer le HTML avec navigation
      const html = generateArticleHTML(article, article.body, template, prevArticle, nextArticle);
      
      // Sauvegarder
      const outputPath = path.join(CONFIG.outputDir, `${article.slug}.html`);
      fs.writeFileSync(outputPath, html, 'utf-8');
      
      console.log(`      ✅ ${article.slug}.html`);
    } catch (err) {
      console.error(`      ❌ Erreur: ${err.message}`);
      errors.push({ file: article.file, error: err.message });
    }
  }
  
  console.log('\n📊 Résumé :');
  console.log(`   ${parsedArticles.length} article(s) généré(s)`);
  if (errors.length > 0) {
    console.log(`   ${errors.length} erreur(s)`);
  }
  
  // Mettre à jour le sitemap
  console.log('');
  updateSitemap(parsedArticles);
  
  // Générer articles.json
  generateArticlesJSON(parsedArticles);
  
  console.log('\n✅ Build terminé !');
  console.log(`   📁 Articles générés dans : ${CONFIG.outputDir}`);
  
  if (errors.length > 0) {
    process.exit(1);
  }
}

// Exécution
build().catch(err => {
  console.error('❌ Erreur fatale :', err);
  process.exit(1);
});
