'use strict';
/**
 * Lecture des articles de blog (content/blog/*.md), partagée par scripts/build-blog.js (pages d'articles)
 * et scripts/build-pages.js (section « Nos guides » des pages de service et de ville).
 *
 *   parseFrontmatter(texte)  → { frontmatter, body }
 *   serviceOf(frontmatter)   → entrée de SERVICE_LINKS (champ `service`, sinon déduit de la catégorie) ou undefined
 *   listArticles()           → articles publiés (hors brouillons), du plus récent au plus ancien
 */
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://vprr.fr';
const BLOG_DIR = path.join(__dirname, '..', '..', 'content', 'blog');

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

    // Scalaire YAML "plain" sur plusieurs lignes (Pages CMS replie les textes longs) :
    // les lignes suivantes indentées font partie de la valeur.
    i += 1;
    if (!/^["'\[]/.test(m[2] ?? '')) {
      const cont = [];
      while (i < lines.length && lines[i].trim() !== '' && isIndented(lines[i]) && !/^\s*-\s+/.test(lines[i])) {
        cont.push(stripIndent(lines[i]));
        i += 1;
      }
      if (cont.length) value = `${value} ${cont.join(' ')}`.replace(/\s+/g, ' ').trim();
    }
    frontmatter[key] = coerceScalar(value);
  }

  return { frontmatter, body: match[2].trim() };
}

function normalizeTextForMatch(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Pages de service vers lesquelles un article peut renvoyer (champ `service` ou catégorie).
const SERVICE_LINKS = [
  { key: 'ravalement', match: ['ravalement'], url: `${SITE_URL}/ravalement-facade-angouleme.html`, label: 'ravalement de façade à Angoulême', question: 'Un projet de ravalement ?', prestation: 'ravalement' },
  { key: 'nettoyage-facade', match: ['facade'], url: `${SITE_URL}/nettoyage-facade-angouleme.html`, label: 'nettoyage de façade à Angoulême', question: 'Une façade à nettoyer ?', prestation: 'nettoyage-facade' },
  { key: 'toiture', match: ['toiture'], url: `${SITE_URL}/nettoyage-toiture-angouleme.html`, label: 'nettoyage de toiture à Angoulême', question: 'Une toiture à démousser ?', prestation: 'toiture' },
  { key: 'peinture', match: ['peinture'], url: `${SITE_URL}/peinture-exterieure-charente.html`, label: 'peinture extérieure en Charente', question: 'Une façade à repeindre ?', prestation: 'peinture' },
  { key: 'isolation', match: ['isolation'], url: `${SITE_URL}/isolation-interieure-charente.html`, label: 'isolation intérieure en Charente', question: 'Un projet d\'isolation ?', prestation: 'isolation' }
];

const OG_BY_SERVICE = { ravalement: 'og-ravalement', 'nettoyage-facade': 'og-nettoyage-facade', toiture: 'og-toiture', peinture: 'og-peinture', isolation: 'og-vprr' };

function serviceOf(frontmatter) {
  const key = normalizeTextForMatch(frontmatter.service || '');
  const category = normalizeTextForMatch(frontmatter.category || '');
  return SERVICE_LINKS.find((s) => s.key === key) || SERVICE_LINKS.find((s) => s.match.some((m) => category.includes(m)));
}

function listArticles() {
  return fs.readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => parseFrontmatter(fs.readFileSync(path.join(BLOG_DIR, f), 'utf8')).frontmatter)
    .filter((fm) => fm.draft !== true && fm.slug)
    .map((fm) => ({ ...fm, service: serviceOf(fm) }))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)) || String(a.slug).localeCompare(String(b.slug)));
}

module.exports = { parseFrontmatter, normalizeTextForMatch, SERVICE_LINKS, OG_BY_SERVICE, serviceOf, listArticles };
