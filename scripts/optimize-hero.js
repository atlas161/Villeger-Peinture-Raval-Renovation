/**
 * Script d'optimisation de l'image hero
 * Crée des versions responsives pour différentes tailles d'écran
 * Basé sur les dimensions réelles d'affichage de PageSpeed Insights
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputPath = path.join(__dirname, '..', 'data', 'hero.webp');
const outputDir = path.join(__dirname, '..', 'data');

// Tailles responsives basées sur les dimensions réelles d'affichage
// Mobile: 382x255, Tablet: ~600px, Desktop: 779x520
const sizes = [
  { width: 400, suffix: '-400w', quality: 75 },   // Mobile (382px affiché)
  { width: 600, suffix: '-600w', quality: 75 },   // Tablet small
  { width: 800, suffix: '-800w', quality: 75 },   // Desktop (779px affiché)
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
        quality: size.quality,
        effort: 6,
        smartSubsample: true
      })
      .toFile(outputPath);
    
    const newSize = fs.statSync(outputPath).size;
    console.log(`✅ hero${size.suffix}.webp: ${(newSize / 1024).toFixed(0)} KB`);
  }

  // Version principale (800w = desktop standard)
  const mainPath = path.join(outputDir, 'hero.webp');
  // Backup de l'original si nécessaire
  const backupPath = path.join(outputDir, 'hero-original.webp');
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(inputPath, backupPath);
    console.log(`\n💾 Backup créé: hero-original.webp`);
  }
  
  // Remplacer hero.webp par la version 800w optimisée
  await sharp(inputPath)
    .resize(800, null, { withoutEnlargement: true })
    .webp({ quality: 75, effort: 6, smartSubsample: true })
    .toFile(mainPath);
  
  const mainSize = fs.statSync(mainPath).size;
  console.log(`\n🎯 hero.webp (principal): ${(mainSize / 1024).toFixed(0)} KB`);
  
  console.log('\n✨ Optimisation terminée!');
}

optimizeHero().catch(console.error);
