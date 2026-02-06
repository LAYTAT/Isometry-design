#!/usr/bin/env node
/**
 * Simple dev server for the Isometry Editor
 * Serves static files and allows loading asset data
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3333;
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

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  
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
