/**
 * Script d'optimisation de l'image hero
 * Crée des versions responsives pour différentes tailles d'écran
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputPath = path.join(__dirname, '..', 'data', 'hero.webp');
const outputDir = path.join(__dirname, '..', 'data');

// Tailles responsives (largeur en pixels)
const sizes = [
  { width: 400, suffix: '-400w' },   // Mobile
  { width: 800, suffix: '-800w' },   // Tablet
  { width: 1200, suffix: '-1200w' }, // Desktop
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
    
    await sharp(inputPath)
      .resize(size.width, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ 
        quality: 80,
        effort: 6 
      })
      .toFile(outputPath);
    
    const newSize = fs.statSync(outputPath).size;
    console.log(`✅ hero${size.suffix}.webp: ${(newSize / 1024).toFixed(0)} KB`);
  }

  // Créer aussi une version optimisée de l'original (compressée)
  const optimizedPath = path.join(outputDir, 'hero-optimized.webp');
  await sharp(inputPath)
    .resize(1200, null, { withoutEnlargement: true })
    .webp({ quality: 80, effort: 6 })
    .toFile(optimizedPath);
  
  const optimizedSize = fs.statSync(optimizedPath).size;
  console.log(`\n🎯 hero-optimized.webp (principal): ${(optimizedSize / 1024).toFixed(0)} KB`);
  
  console.log('\n✨ Optimisation terminée!');
  console.log('\n📝 Prochaines étapes:');
  console.log('   1. Remplacer data/hero.webp par data/hero-optimized.webp');
  console.log('   2. Ou utiliser les versions responsives avec srcset');
}

optimizeHero().catch(console.error);
