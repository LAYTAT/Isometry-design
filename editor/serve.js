#!/usr/bin/env node
/**
 * Simple dev server for the Isometry Editor
 * Serves static files and allows loading asset data
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3333;
const ROOT = path.join(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.ts': 'text/plain',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};

const SCENE_TO_FILE = {
  logo: { file: 'logoDots.ts', varName: 'LOGO_DOTS_SOURCE' },
  brain: { file: 'brainDots.ts', varName: 'BRAIN_DOTS_SOURCE' },
  bci: { file: 'brainToComputerDots.ts', varName: 'BRAIN_TO_COMPUTER_DOTS_SOURCE' },
  clinical: { file: 'clinicalDots.ts', varName: 'CLINICAL_DOTS_SOURCE' },
  assistive: { file: 'assistiveDots.ts', varName: 'ASSISTIVE_DOTS_SOURCE' },
};

function rebundleAssets() {
  try {
    const { execFileSync } = require('child_process');
    execFileSync('node', [path.join(__dirname, 'bundle-assets.js')], { stdio: 'inherit' });
  } catch (e) {
    console.error('Failed to rebundle assets:', e.message);
  }
}

function handleSave(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try {
      const { scene, dots } = JSON.parse(body);
      const mapping = SCENE_TO_FILE[scene];
      if (!mapping) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unknown scene: ' + scene }));
        return;
      }

      // Always save with colors for consistency
      let code = '// Auto-generated dot asset\n';
      code += `// Saved from editor: ${new Date().toISOString()}\n\n`;
      code += `export const ${mapping.varName}: Array<[number, number, number, string]> = [\n`;
      for (const dot of dots) {
        code += `  [${dot.x.toFixed(3)}, ${dot.y.toFixed(3)}, ${dot.r.toFixed(3)}, "${dot.color || '#ffffff'}"],\n`;
      }
      code += '];\n';

      const filePath = path.join(ROOT, 'src', 'assets', mapping.file);
      fs.writeFileSync(filePath, code);
      console.log(`Saved ${dots.length} dots to ${mapping.file}`);

      // Re-bundle assets.json so editor refresh picks up changes
      rebundleAssets();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, file: mapping.file, count: dots.length }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
  });
}

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Save endpoint
  if (req.method === 'POST' && req.url === '/api/save') {
    handleSave(req, res);
    return;
  }

  let filePath;

  if (req.url === '/' || req.url === '/index.html') {
    filePath = path.join(__dirname, 'index.html');
  } else if (req.url.startsWith('/editor/')) {
    filePath = path.join(__dirname, req.url.replace('/editor/', ''));
  } else if (req.url.startsWith('/src/') || req.url.startsWith('/assets/')) {
    filePath = path.join(ROOT, req.url);
  } else {
    filePath = path.join(__dirname, req.url);
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('Not Found: ' + req.url);
      } else {
        res.writeHead(500);
        res.end('Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║       🎨 Isometry Dot Editor               ║
╠════════════════════════════════════════════╣
║                                            ║
║   Open in browser:                         ║
║   http://localhost:${PORT}                   ║
║                                            ║
║   Press Ctrl+C to stop                     ║
╚════════════════════════════════════════════╝
  `);
});
