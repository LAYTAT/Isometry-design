#!/usr/bin/env node
/**
 * Bundle asset files into a single JSON for the editor
 */

const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'src', 'assets');
const outputPath = path.join(__dirname, 'assets.json');

const assetFiles = {
  logo: 'logoDots.ts',
  brain: 'brainDots.ts',
  bci: 'brainToComputerDots.ts',
  clinical: 'clinicalDots.ts',
  assistive: 'assistiveDots.ts',
};

const assets = {};

for (const [name, filename] of Object.entries(assetFiles)) {
  const filePath = path.join(assetsDir, filename);

  if (!fs.existsSync(filePath)) {
    console.warn(`Warning: ${filename} not found`);
    continue;
  }

  const content = fs.readFileSync(filePath, 'utf-8');

  // Extract array from TypeScript - handle both 3-tuple and 4-tuple (with color) formats
  const match = content.match(/export const \w+.*?:\s*Array<\[number,\s*number,\s*number(?:,\s*string)?\]>\s*=\s*\[([\s\S]*?)\];/);

  if (!match) {
    console.warn(`Warning: Could not parse ${filename}`);
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
  console.log(`Loaded ${name}: ${dots.length} dots`);
}

// Write bundled assets
fs.writeFileSync(outputPath, JSON.stringify(assets));
console.log(`\nBundled assets written to: ${outputPath}`);
console.log(`Total size: ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB`);
