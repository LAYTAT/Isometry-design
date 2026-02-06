#!/usr/bin/env node
/**
 * Sync Assets Script
 * 
 * Synchronizes src/assets/*.ts files with editor/assets.json
 * 
 * Usage:
 *   npm run sync-assets          # One-time sync
 *   npm run sync-assets:watch    # Watch mode (auto-sync on changes)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const assetsDir = path.join(__dirname, '..', 'src', 'assets');
const outputPath = path.join(__dirname, '..', 'editor', 'assets.json');

const assetFiles = {
  logo: 'logoDots.ts',
  brain: 'brainDots.ts',
  bci: 'brainToComputerDots.ts',
  clinical: 'clinicalDots.ts',
  assistive: 'assistiveDots.ts',
};

function bundleAssets() {
  const assets = {};
  let totalDots = 0;

  for (const [name, filename] of Object.entries(assetFiles)) {
    const filePath = path.join(assetsDir, filename);

    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  Warning: ${filename} not found`);
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    // Extract array from TypeScript - handle both 3-tuple and 4-tuple (with color) formats
    const match = content.match(/export const \w+.*?:\s*Array<\[number,\s*number,\s*number(?:,\s*string)?\]>\s*=\s*\[([\s\S]*?)\];/);

    if (!match) {
      console.warn(`⚠️  Warning: Could not parse ${filename}`);
      continue;
    }

    // Parse the array content
    const arrayContent = match[1];
    const dots = [];

    // Match each [x, y, r] or [x, y, r, "color"] tuple
    const tupleRegex = /\[\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\s*(?:,\s*"([^"]+)")?\s*\]/g;
    let tupleMatch;

    while ((tupleMatch = tupleRegex.exec(arrayContent)) !== null) {
      const entry = [
        parseFloat(tupleMatch[1]),
        parseFloat(tupleMatch[2]),
        parseFloat(tupleMatch[3])
      ];
      if (tupleMatch[4]) {
        entry.push(tupleMatch[4]);
      }
      dots.push(entry);
    }

    assets[name] = dots;
    totalDots += dots.length;
    console.log(`  ✓ ${name}: ${dots.length} dots`);
  }

  // Write bundled assets
  fs.writeFileSync(outputPath, JSON.stringify(assets));
  const sizeKB = (fs.statSync(outputPath).size / 1024).toFixed(1);
  
  console.log(`\n✅ Assets synced successfully`);
  console.log(`   📁 Output: ${outputPath}`);
  console.log(`   📊 Total: ${totalDots} dots across ${Object.keys(assets).length} assets`);
  console.log(`   💾 Size: ${sizeKB} KB\n`);
}

function watchAssets() {
  console.log(`👀 Watching ${assetsDir} for changes...\n`);

  fs.watch(assetsDir, (eventType, filename) => {
    if (filename && filename.endsWith('.ts')) {
      console.log(`📝 Detected change: ${filename}`);
      try {
        bundleAssets();
      } catch (error) {
        console.error(`❌ Failed to sync assets: ${error.message}\n`);
      }
    }
  });

  // Keep the process running
  process.on('SIGINT', () => {
    console.log('\n👋 Stopped watching assets');
    process.exit(0);
  });
}

// Main
const command = process.argv[2];

if (command === 'watch') {
  watchAssets();
} else {
  try {
    bundleAssets();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}
