#!/usr/bin/env node
/**
 * Reverse Sync Assets Script
 * 
 * Syncs editor/assets.json back to src/assets/*.ts files
 * Use this when you've edited editor/assets.json directly
 * 
 * Usage:
 *   npm run sync-assets:reverse
 */

const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'src', 'assets');
const inputPath = path.join(__dirname, '..', 'editor', 'assets.json');

const assetFiles = {
  logo: 'logoDots.ts',
  brain: 'brainDots.ts',
  bci: 'brainToComputerDots.ts',
  clinical: 'clinicalDots.ts',
  assistive: 'assistiveDots.ts',
};

function reverseSync() {
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Error: ${inputPath} not found`);
    process.exit(1);
  }

  const assets = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  let totalDots = 0;

  for (const [name, filename] of Object.entries(assetFiles)) {
    if (!assets[name]) {
      console.warn(`⚠️  Warning: ${name} not found in editor/assets.json`);
      continue;
    }

    const dots = assets[name];
    const varName = name.toUpperCase() + '_DOTS_SOURCE';
    
    // Format dots array
    const dotsFormatted = dots.map(dot => {
      if (dot.length === 4) {
        // [x, y, r, color]
        return `  [${dot[0]}, ${dot[1]}, ${dot[2]}, "${dot[3]}"]`;
      } else {
        // [x, y, r]
        return `  [${dot[0]}, ${dot[1]}, ${dot[2]}]`;
      }
    }).join(',\n');

    const output = `// Auto-generated dot asset
// Synced from editor: ${new Date().toISOString()}

export const ${varName}: Array<[number, number, number${dots[0]?.length === 4 ? ', string' : ''}]> = [
${dotsFormatted}
];
`;

    const outputPath = path.join(assetsDir, filename);
    fs.writeFileSync(outputPath, output);
    totalDots += dots.length;
    console.log(`  ✓ ${filename}: ${dots.length} dots`);
  }

  console.log(`\n✅ Assets reversed successfully`);
  console.log(`   📁 Source: ${inputPath}`);
  console.log(`   📊 Total: ${totalDots} dots across ${Object.keys(assets).length} assets\n`);
}

try {
  reverseSync();
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
  process.exit(1);
}
