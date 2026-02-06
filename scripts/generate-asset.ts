#!/usr/bin/env npx ts-node
/**
 * DOT ASSET GENERATOR
 * 
 * Converts an image with dots/circles into a TypeScript asset file.
 * 
 * Usage:
 *   npx ts-node scripts/generate-asset.ts <input-image> <output-name> [options]
 * 
 * Examples:
 *   npx ts-node scripts/generate-asset.ts ./my-dots.png myNewScene
 *   npx ts-node scripts/generate-asset.ts ./design.png wheelchair --threshold 128
 * 
 * Options:
 *   --threshold <0-255>  Brightness threshold for dot detection (default: 200)
 *   --min-radius <px>    Minimum dot radius to include (default: 1)
 *   --max-radius <px>    Maximum dot radius to include (default: 50)
 *   --invert             Invert colors (detect dark dots on light background)
 * 
 * The script detects circular shapes and outputs their center coordinates and radii.
 */

import * as fs from 'fs';
import * as path from 'path';

// Check if running directly
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log(`
DOT ASSET GENERATOR
===================

Converts an image with dots into a TypeScript asset file.

Usage:
  npx ts-node scripts/generate-asset.ts <input-image> <output-name> [options]

Arguments:
  input-image   Path to PNG/JPG image with dot pattern
  output-name   Name for the generated asset (e.g., "wheelchair" → wheelchairDots.ts)

Options:
  --threshold <0-255>  Brightness threshold (default: 200)
  --min-radius <px>    Minimum dot radius (default: 1)
  --max-radius <px>    Maximum dot radius (default: 50)
  --invert             Detect dark dots on light background

Example:
  npx ts-node scripts/generate-asset.ts ./assets/wheelchair.png wheelchair

This will create: src/assets/wheelchairDots.ts
`);
  process.exit(0);
}

async function main() {
  // Dynamic import for jimp (image processing)
  let Jimp: any;
  try {
    Jimp = (await import('jimp')).default;
  } catch (e) {
    console.error('Error: jimp not installed. Run: npm install jimp');
    process.exit(1);
  }

  const inputPath = args[0];
  const outputName = args[1];
  
  // Parse options
  let threshold = 200;
  let minRadius = 1;
  let maxRadius = 50;
  let invert = false;

  for (let i = 2; i < args.length; i++) {
    if (args[i] === '--threshold' && args[i + 1]) {
      threshold = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === '--min-radius' && args[i + 1]) {
      minRadius = parseFloat(args[i + 1]);
      i++;
    } else if (args[i] === '--max-radius' && args[i + 1]) {
      maxRadius = parseFloat(args[i + 1]);
      i++;
    } else if (args[i] === '--invert') {
      invert = true;
    }
  }

  console.log(`Processing: ${inputPath}`);
  console.log(`Output name: ${outputName}`);
  console.log(`Threshold: ${threshold}, Min radius: ${minRadius}, Max radius: ${maxRadius}`);

  // Load image
  const image = await Jimp.read(inputPath);
  const width = image.width;
  const height = image.height;

  console.log(`Image size: ${width} x ${height}`);

  // Find bright pixels (dots)
  const dots: Array<{ x: number; y: number; brightness: number }> = [];
  const visited = new Set<string>();

  image.scan(0, 0, width, height, function (x: number, y: number, idx: number) {
    const red = this.bitmap.data[idx];
    const green = this.bitmap.data[idx + 1];
    const blue = this.bitmap.data[idx + 2];
    const alpha = this.bitmap.data[idx + 3];
    
    // Calculate brightness
    let brightness = (red + green + blue) / 3;
    if (invert) brightness = 255 - brightness;
    
    // Check if this pixel is bright enough and visible
    if (alpha > 128 && brightness >= threshold) {
      dots.push({ x, y, brightness });
    }
  });

  console.log(`Found ${dots.length} bright pixels`);

  // Cluster nearby pixels into dots and estimate radius
  const clusters: Array<[number, number, number]> = []; // [x, y, radius]
  const clusterVisited = new Set<string>();

  function floodFill(startX: number, startY: number): { cx: number; cy: number; r: number } | null {
    const key = `${startX},${startY}`;
    if (clusterVisited.has(key)) return null;

    const pixels: Array<{ x: number; y: number }> = [];
    const queue = [{ x: startX, y: startY }];

    while (queue.length > 0) {
      const { x, y } = queue.shift()!;
      const k = `${x},${y}`;
      if (clusterVisited.has(k)) continue;
      
      // Check if this pixel is bright
      const idx = (y * width + x) * 4;
      const red = image.bitmap.data[idx];
      const green = image.bitmap.data[idx + 1];
      const blue = image.bitmap.data[idx + 2];
      const alpha = image.bitmap.data[idx + 3];
      
      let brightness = (red + green + blue) / 3;
      if (invert) brightness = 255 - brightness;
      
      if (alpha < 128 || brightness < threshold) continue;

      clusterVisited.add(k);
      pixels.push({ x, y });

      // Add neighbors
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          queue.push({ x: nx, y: ny });
        }
      }
    }

    if (pixels.length < 3) return null; // Too small

    // Calculate centroid
    let sumX = 0, sumY = 0;
    for (const p of pixels) {
      sumX += p.x;
      sumY += p.y;
    }
    const cx = sumX / pixels.length;
    const cy = sumY / pixels.length;

    // Estimate radius (average distance from centroid)
    let sumDist = 0;
    for (const p of pixels) {
      sumDist += Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2);
    }
    const avgDist = sumDist / pixels.length;
    const radius = avgDist * 1.2; // Slight adjustment for better visual match

    return { cx, cy, r: radius };
  }

  // Process all bright pixels
  for (const dot of dots) {
    const result = floodFill(dot.x, dot.y);
    if (result && result.r >= minRadius && result.r <= maxRadius) {
      clusters.push([
        Math.round(result.cx * 1000) / 1000,
        Math.round(result.cy * 1000) / 1000,
        Math.round(result.r * 1000) / 1000,
      ]);
    }
  }

  console.log(`Clustered into ${clusters.length} dots`);

  // Sort by Y then X for consistent output
  clusters.sort((a, b) => a[1] - b[1] || a[0] - b[0]);

  // Generate TypeScript file
  const varName = outputName.toUpperCase() + '_DOTS_SOURCE';
  const output = `// Auto-generated dot asset
// Source image: ${path.basename(inputPath)}
// Source image resolution: ${width} x ${height}
// Generated: ${new Date().toISOString()}

export const ${varName}: Array<[number, number, number]> = [
${clusters.map(([x, y, r]) => `  [${x}, ${y}, ${r}],`).join('\n')}
];
`;

  const outputPath = path.join(__dirname, '..', 'src', 'assets', `${outputName}Dots.ts`);
  fs.writeFileSync(outputPath, output);

  console.log(`\n✅ Generated: ${outputPath}`);
  console.log(`   ${clusters.length} dots exported`);
  console.log(`\nTo use this asset:`);
  console.log(`1. Import in targets.ts:`);
  console.log(`   import { ${varName} } from "../assets/${outputName}Dots";`);
  console.log(`2. Create a sampler function similar to existing ones`);
  console.log(`3. Add scene config in config.ts`);
}

main().catch(console.error);
