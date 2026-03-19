/**
 * Script d'optimisation de l'image hero
 * Crée des versions responsives pour différentes tailles d'écran
 * Basé sur les dimensions réelles d'affichage de PageSpeed Insights
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputPath = path.join(__dirname, '..', 'data', 'hero-1200w.webp');
const outputDir = path.join(__dirname, '..', 'data');

// Tailles responsives basées sur les dimensions réelles d'affichage
// Mobile: 382x255, Tablet: ~600px, Desktop: 779x520
const sizes = [
  { width: 400, suffix: '-400w', quality: 75 },   // Mobile (382px affiché)
  { width: 600, suffix: '-600w', quality: 75 },   // Tablet small
  { width: 800, suffix: '-800w', quality: 75 },   // Desktop (779px affiché)
  { width: 1200, suffix: '-1200w', quality: 75 }, // Large
];

async function optimizeHero() {
  console.log('🖼️  Optimisation de l\'image hero...\n');
  
  // Vérifier que le fichier existe
  if (!fs.existsSync(inputPath)) {
    console.error('❌ Fichier non trouvé:', inputPath);
    process.exit(1);
  }

  const metadata = await sharp(inputPath).metadata();
  console.log(`📐 Image originale: ${metadata.width}x${metadata.height}`);
  console.log(`📦 Taille originale: ${(fs.statSync(inputPath).size / 1024).toFixed(0)} KB\n`);

  // Créer les versions optimisées
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `hero${size.suffix}.webp`);
    if (path.resolve(outputPath) === path.resolve(inputPath)) {
      continue;
    }
    
    await sharp(inputPath)
      .resize(size.width, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ 
        quality: size.quality,
        effort: 6,
        smartSubsample: true
      })
      .toFile(outputPath);
    
    const newSize = fs.statSync(outputPath).size;
    console.log(`✅ hero${size.suffix}.webp: ${(newSize / 1024).toFixed(0)} KB`);
  }

  const mainPath = path.join(outputDir, 'hero.webp');
  await sharp(inputPath)
    .resize(800, null, { withoutEnlargement: true, fit: 'inside' })
    .webp({ quality: 75, effort: 6, smartSubsample: true })
    .toFile(mainPath);
  const mainSize = fs.statSync(mainPath).size;
  console.log(`✅ hero.webp: ${(mainSize / 1024).toFixed(0)} KB`);

  console.log('\n✨ Optimisation terminée!');
}

async function optimizeResponsiveWebp(input, outputBase, variants, aspect) {
  if (!fs.existsSync(input)) {
    throw new Error(`Fichier non trouvé: ${input}`);
  }

  for (const v of variants) {
    const outputPath = `${outputBase}-${v.width}w.webp`;
    if (path.resolve(outputPath) === path.resolve(input)) {
      continue;
    }
    const height = aspect ? Math.round((v.width * aspect.h) / aspect.w) : null;
    const position = aspect && aspect.position ? aspect.position : 'centre';
    const pipeline = sharp(input);
    await pipeline
      .resize(v.width, height, {
        withoutEnlargement: true,
        fit: height ? 'cover' : 'inside',
        position: height ? position : undefined
      })
      .webp({
        quality: v.quality,
        effort: 6,
        smartSubsample: true
      })
      .toFile(outputPath);
    const newSize = fs.statSync(outputPath).size;
    console.log(`✅ ${path.relative(path.join(__dirname, '..'), outputPath)}: ${(newSize / 1024).toFixed(0)} KB`);
  }
}

async function optimizeSiteImages() {
  const root = path.join(__dirname, '..');
  console.log('\n🧰 Optimisation des images services & blog...\n');

  const serviceVariants = [
    { width: 600, quality: 78 },
    { width: 900, quality: 78 },
    { width: 1200, quality: 78 }
  ];

  const blogVariants = [
    { width: 400, quality: 78 },
    { width: 600, quality: 78 },
    { width: 800, quality: 78 },
    { width: 1200, quality: 78 }
  ];

  const aspectServices = { w: 4, h: 3, position: 'centre' };
  const aspectBlog = { w: 16, h: 9, position: 'attention' };

  const tasks = [
    {
      input: path.join(root, 'media', 'services', 'nettoyage_facade', 'facade_avant-1200w.webp'),
      outputBase: path.join(root, 'media', 'services', 'nettoyage_facade', 'facade_avant'),
      variants: serviceVariants,
      aspect: aspectServices
    },
    {
      input: path.join(root, 'media', 'services', 'nettoyage_facade', 'facade_apres-1200w.webp'),
      outputBase: path.join(root, 'media', 'services', 'nettoyage_facade', 'facade_apres'),
      variants: serviceVariants,
      aspect: aspectServices
    },
    {
      input: path.join(root, 'media', 'services', 'nettoyag_toiture', 'toiture_avant-1200w.webp'),
      outputBase: path.join(root, 'media', 'services', 'nettoyag_toiture', 'toiture_avant'),
      variants: serviceVariants,
      aspect: aspectServices
    },
    {
      input: path.join(root, 'media', 'services', 'nettoyag_toiture', 'toiture_apres-1200w.webp'),
      outputBase: path.join(root, 'media', 'services', 'nettoyag_toiture', 'toiture_apres'),
      variants: serviceVariants,
      aspect: aspectServices
    },
    {
      input: path.join(root, 'media', 'services', 'ravalement_facade', 'ravalement_avant-1200w.webp'),
      outputBase: path.join(root, 'media', 'services', 'ravalement_facade', 'ravalement_avant'),
      variants: serviceVariants,
      aspect: aspectServices
    },
    {
      input: path.join(root, 'media', 'services', 'ravalement_facade', 'ravalement_apres-1200w.webp'),
      outputBase: path.join(root, 'media', 'services', 'ravalement_facade', 'ravalement_apres'),
      variants: serviceVariants,
      aspect: aspectServices
    },
    {
      input: path.join(root, 'media', 'services', 'peinture_exterieur', 'peinture_avant-1200w.webp'),
      outputBase: path.join(root, 'media', 'services', 'peinture_exterieur', 'peinture_avant'),
      variants: serviceVariants,
      aspect: aspectServices
    },
    {
      input: path.join(root, 'media', 'services', 'peinture_exterieur', 'peinture_apres-1200w.webp'),
      outputBase: path.join(root, 'media', 'services', 'peinture_exterieur', 'peinture_apres'),
      variants: serviceVariants,
      aspect: aspectServices
    },
    {
      input: path.join(root, 'media', 'blog', 'facade_hydrogommage.webp'),
      outputBase: path.join(root, 'media', 'blog', 'facade_hydrogommage'),
      variants: blogVariants,
      aspect: aspectBlog
    },
    {
      input: path.join(root, 'media', 'blog', 'peinture_ext.webp'),
      outputBase: path.join(root, 'media', 'blog', 'peinture_ext'),
      variants: blogVariants,
      aspect: aspectBlog
    }
  ];

  for (const t of tasks) {
    await optimizeResponsiveWebp(t.input, t.outputBase, t.variants, t.aspect);
  }
}

(async () => {
  await optimizeHero();
  await optimizeSiteImages();
})().catch(console.error);
