/**
 * Isometry Dot Editor - Full Interactive Editor
 * Select, edit colors, add/remove dots
 */

// ===================
// STATE
// ===================

let dots = []; // Array of { x, y, r, color, selected }
let currentScene = 'logo';
let currentTool = 'select';
let currentColor = '#ffffff';
let currentSize = 3;

// Canvas state
let zoom = 1;
let panX = 0;
let panY = 0;
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let selectionBox = null;
let lassoPoints = [];
let isPanning = false;
let spacePressed = false;

// Source dimensions
const WIDTH = 1920;
const HEIGHT = 1080;

// Assets
let ASSETS = {};

// ===================
// CANVAS SETUP
// ===================

const canvasArea = document.getElementById('canvas-area');
const mainCanvas = document.getElementById('main-canvas');
const selCanvas = document.getElementById('selection-canvas');
const mainCtx = mainCanvas.getContext('2d');
const selCtx = selCanvas.getContext('2d');

function resizeCanvases() {
  const rect = canvasArea.getBoundingClientRect();
  mainCanvas.width = rect.width;
  mainCanvas.height = rect.height;
  selCanvas.width = rect.width;
  selCanvas.height = rect.height;
  render();
}

window.addEventListener('resize', resizeCanvases);

// ===================
// COORDINATE TRANSFORMS
// ===================

function screenToWorld(sx, sy) {
  const rect = mainCanvas.getBoundingClientRect();
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  return {
    x: (sx - cx - panX) / zoom + WIDTH / 2,
    y: (sy - cy - panY) / zoom + HEIGHT / 2
  };
}

function worldToScreen(wx, wy) {
  const rect = mainCanvas.getBoundingClientRect();
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  return {
    x: (wx - WIDTH / 2) * zoom + cx + panX,
    y: (wy - HEIGHT / 2) * zoom + cy + panY
  };
}

// ===================
// RENDERING
// ===================

function render() {
  const w = mainCanvas.width;
  const h = mainCanvas.height;
  
  // Clear
  mainCtx.fillStyle = '#000';
  mainCtx.fillRect(0, 0, w, h);
  
  // Draw boundary
  const tl = worldToScreen(0, 0);
  const br = worldToScreen(WIDTH, HEIGHT);
  mainCtx.strokeStyle = '#333';
  mainCtx.lineWidth = 1;
  mainCtx.strokeRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
  
  // Draw dots
  for (const dot of dots) {
    const pos = worldToScreen(dot.x, dot.y);
    const r = dot.r * zoom;
    
    // Draw dot
    mainCtx.beginPath();
    mainCtx.arc(pos.x, pos.y, Math.max(r, 1), 0, Math.PI * 2);
    mainCtx.fillStyle = dot.color || '#ffffff';
    mainCtx.fill();
    
    // Draw selection ring
    if (dot.selected) {
      mainCtx.strokeStyle = '#00d9ff';
      mainCtx.lineWidth = 2;
      mainCtx.beginPath();
      mainCtx.arc(pos.x, pos.y, Math.max(r + 4, 6), 0, Math.PI * 2);
      mainCtx.stroke();
    }
  }
  
  // Update status
  updateStatus();
}

function renderSelection() {
  const w = selCanvas.width;
  const h = selCanvas.height;
  
  selCtx.clearRect(0, 0, w, h);
  
  // Draw selection box
  if (selectionBox) {
    selCtx.strokeStyle = '#00d9ff';
    selCtx.lineWidth = 1;
    selCtx.setLineDash([5, 5]);
    selCtx.strokeRect(
      selectionBox.x, selectionBox.y,
      selectionBox.w, selectionBox.h
    );
    selCtx.fillStyle = 'rgba(0, 217, 255, 0.1)';
    selCtx.fillRect(
      selectionBox.x, selectionBox.y,
      selectionBox.w, selectionBox.h
    );
    selCtx.setLineDash([]);
  }
  
  // Draw lasso
  if (lassoPoints.length > 1) {
    selCtx.strokeStyle = '#00d9ff';
    selCtx.lineWidth = 1;
    selCtx.setLineDash([5, 5]);
    selCtx.beginPath();
    selCtx.moveTo(lassoPoints[0].x, lassoPoints[0].y);
    for (let i = 1; i < lassoPoints.length; i++) {
      selCtx.lineTo(lassoPoints[i].x, lassoPoints[i].y);
    }
    selCtx.stroke();
    selCtx.setLineDash([]);
  }
}

// ===================
// DOT OPERATIONS
// ===================

function findDotAt(wx, wy, threshold = 10) {
  const th = threshold / zoom;
  for (let i = dots.length - 1; i >= 0; i--) {
    const dot = dots[i];
    const dx = dot.x - wx;
    const dy = dot.y - wy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= Math.max(dot.r, th)) {
      return dot;
    }
  }
  return null;
}

function selectDotsInBox(x1, y1, x2, y2, additive = false) {
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  
  if (!additive) {
    dots.forEach(d => d.selected = false);
  }
  
  for (const dot of dots) {
    if (dot.x >= minX && dot.x <= maxX && dot.y >= minY && dot.y <= maxY) {
      dot.selected = true;
    }
  }
}

function selectDotsInLasso(points, additive = false) {
  if (!additive) {
    dots.forEach(d => d.selected = false);
  }
  
  for (const dot of dots) {
    if (pointInPolygon(dot.x, dot.y, points)) {
      dot.selected = true;
    }
  }
}

function pointInPolygon(x, y, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

function getSelectedDots() {
  return dots.filter(d => d.selected);
}

function setSelectedColor(color) {
  for (const dot of dots) {
    if (dot.selected) {
      dot.color = color;
    }
  }
  render();
}

function setSelectedSize(size) {
  for (const dot of dots) {
    if (dot.selected) {
      dot.r = size;
    }
  }
  render();
}

function deleteSelected() {
  dots = dots.filter(d => !d.selected);
  render();
  updateSelectionCount();
}

function selectAll() {
  dots.forEach(d => d.selected = true);
  render();
  updateSelectionCount();
}

function deselectAll() {
  dots.forEach(d => d.selected = false);
  render();
  updateSelectionCount();
}

function invertSelection() {
  dots.forEach(d => d.selected = !d.selected);
  render();
  updateSelectionCount();
}

function addDot(x, y) {
  dots.push({
    x, y,
    r: currentSize,
    color: currentColor,
    selected: false
  });
  render();
}

// ===================
// EVENT HANDLERS
// ===================

mainCanvas.addEventListener('mousedown', (e) => {
  const rect = mainCanvas.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;
  const world = screenToWorld(sx, sy);
  
  // Pan with space or middle mouse
  if (spacePressed || e.button === 1 || currentTool === 'pan') {
    isPanning = true;
    dragStart = { x: e.clientX - panX, y: e.clientY - panY };
    mainCanvas.style.cursor = 'grabbing';
    return;
  }
  
  isDragging = true;
  dragStart = { x: sx, y: sy };
  
  if (currentTool === 'select') {
    const dot = findDotAt(world.x, world.y);
    if (dot) {
      if (!e.shiftKey && !dot.selected) {
        deselectAll();
      }
      dot.selected = true;
      render();
      updateSelectionCount();
    } else if (!e.shiftKey) {
      deselectAll();
    }
  } else if (currentTool === 'box-select') {
    selectionBox = { x: sx, y: sy, w: 0, h: 0 };
  } else if (currentTool === 'lasso') {
    lassoPoints = [{ x: sx, y: sy }];
  } else if (currentTool === 'draw') {
    addDot(world.x, world.y);
  } else if (currentTool === 'erase') {
    const dot = findDotAt(world.x, world.y);
    if (dot) {
      dots = dots.filter(d => d !== dot);
      render();
    }
  }
});

mainCanvas.addEventListener('mousemove', (e) => {
  const rect = mainCanvas.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;
  const world = screenToWorld(sx, sy);
  
  // Update position display
  document.getElementById('status-pos').textContent = 
    `x: ${Math.round(world.x)}, y: ${Math.round(world.y)}`;
  
  if (isPanning) {
    panX = e.clientX - dragStart.x;
    panY = e.clientY - dragStart.y;
    render();
    return;
  }
  
  if (!isDragging) return;
  
  if (currentTool === 'box-select' && selectionBox) {
    selectionBox.w = sx - selectionBox.x;
    selectionBox.h = sy - selectionBox.y;
    renderSelection();
  } else if (currentTool === 'lasso') {
    lassoPoints.push({ x: sx, y: sy });
    renderSelection();
  } else if (currentTool === 'draw') {
    // Draw continuously
    addDot(world.x, world.y);
  } else if (currentTool === 'erase') {
    const dot = findDotAt(world.x, world.y);
    if (dot) {
      dots = dots.filter(d => d !== dot);
      render();
    }
  }
});

mainCanvas.addEventListener('mouseup', (e) => {
  if (isPanning) {
    isPanning = false;
    mainCanvas.style.cursor = currentTool === 'pan' ? 'grab' : 'crosshair';
    return;
  }
  
  if (!isDragging) return;
  isDragging = false;
  
  const rect = mainCanvas.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;
  
  if (currentTool === 'box-select' && selectionBox) {
    const p1 = screenToWorld(selectionBox.x, selectionBox.y);
    const p2 = screenToWorld(selectionBox.x + selectionBox.w, selectionBox.y + selectionBox.h);
    selectDotsInBox(p1.x, p1.y, p2.x, p2.y, e.shiftKey);
    selectionBox = null;
    renderSelection();
    render();
    updateSelectionCount();
  } else if (currentTool === 'lasso' && lassoPoints.length > 2) {
    const worldPoints = lassoPoints.map(p => screenToWorld(p.x, p.y));
    selectDotsInLasso(worldPoints, e.shiftKey);
    lassoPoints = [];
    renderSelection();
    render();
    updateSelectionCount();
  }
});

mainCanvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const rect = mainCanvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  
  const oldZoom = zoom;
  const delta = e.deltaY > 0 ? 0.9 : 1.1;
  zoom = Math.max(0.1, Math.min(10, zoom * delta));
  
  // Zoom toward mouse position
  const scale = zoom / oldZoom;
  panX = mx - scale * (mx - panX);
  panY = my - scale * (my - panY);
  
  updateZoomIndicator();
  render();
});

// Keyboard
document.addEventListener('keydown', (e) => {
  if (e.key === ' ' && !spacePressed) {
    spacePressed = true;
    mainCanvas.style.cursor = 'grab';
  }
  
  if (e.key === 'v' || e.key === 'V') setTool('select');
  if (e.key === 'm' || e.key === 'M') setTool('box-select');
  if (e.key === 'l' || e.key === 'L') setTool('lasso');
  if (e.key === 'd' || e.key === 'D') setTool('draw');
  if (e.key === 'e' || e.key === 'E') setTool('erase');
  
  if (e.key === 'Escape') deselectAll();
  if (e.key === 'Delete' || e.key === 'Backspace') deleteSelected();
  if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
    e.preventDefault();
    selectAll();
  }
  
  if (e.key === '0') {
    zoom = 1;
    panX = 0;
    panY = 0;
    updateZoomIndicator();
    render();
  }
  
  if (e.key === '?' || e.key === '/') {
    document.getElementById('shortcuts-overlay').classList.toggle('show');
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === ' ') {
    spacePressed = false;
    mainCanvas.style.cursor = 'crosshair';
  }
});

// Prevent context menu
mainCanvas.addEventListener('contextmenu', e => e.preventDefault());

// ===================
// UI HANDLERS
// ===================

function setTool(tool) {
  currentTool = tool;
  document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tool === tool);
  });
  mainCanvas.style.cursor = tool === 'pan' ? 'grab' : 'crosshair';
}

document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
  btn.addEventListener('click', () => setTool(btn.dataset.tool));
});

// Scene selector
document.querySelectorAll('.scene-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.scene-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadScene(btn.dataset.scene);
  });
});

// Color presets
document.querySelectorAll('.color-preset').forEach(preset => {
  preset.addEventListener('click', () => {
    document.querySelectorAll('.color-preset').forEach(p => p.classList.remove('active'));
    preset.classList.add('active');
    currentColor = preset.dataset.color;
    document.getElementById('color-picker').value = currentColor;
    document.getElementById('color-hex').value = currentColor;
    setSelectedColor(currentColor);
  });
});

// Color picker
document.getElementById('color-picker').addEventListener('input', (e) => {
  currentColor = e.target.value;
  document.getElementById('color-hex').value = currentColor;
  document.querySelectorAll('.color-preset').forEach(p => p.classList.remove('active'));
  setSelectedColor(currentColor);
});

document.getElementById('color-hex').addEventListener('change', (e) => {
  let val = e.target.value;
  if (!val.startsWith('#')) val = '#' + val;
  if (/^#[0-9a-fA-F]{6}$/.test(val)) {
    currentColor = val;
    document.getElementById('color-picker').value = currentColor;
    document.querySelectorAll('.color-preset').forEach(p => p.classList.remove('active'));
    setSelectedColor(currentColor);
  }
});

// Size slider
document.getElementById('size-slider').addEventListener('input', (e) => {
  currentSize = parseFloat(e.target.value);
  document.getElementById('size-value').textContent = currentSize;
  setSelectedSize(currentSize);
});

// Actions
document.getElementById('select-all-btn').addEventListener('click', selectAll);
document.getElementById('deselect-btn').addEventListener('click', deselectAll);
document.getElementById('invert-btn').addEventListener('click', invertSelection);
document.getElementById('delete-btn').addEventListener('click', deleteSelected);
document.getElementById('shortcuts-btn').addEventListener('click', () => {
  document.getElementById('shortcuts-overlay').classList.toggle('show');
});

// Export
document.getElementById('export-btn').addEventListener('click', () => {
  const code = generateAssetCode();
  navigator.clipboard.writeText(code).then(() => showToast('Copied to clipboard!'));
});

document.getElementById('download-btn').addEventListener('click', () => {
  const code = generateAssetCode();
  const blob = new Blob([code], { type: 'text/typescript' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${currentScene}Dots.ts`;
  a.click();
  URL.revokeObjectURL(url);
  showToast(`Downloaded ${currentScene}Dots.ts`);
});

// ===================
// UTILITIES
// ===================

function updateSelectionCount() {
  const count = getSelectedDots().length;
  document.getElementById('selection-count').textContent = count;
}

function updateStatus() {
  document.getElementById('status-dots').textContent = `${dots.length} dots`;
}

function updateZoomIndicator() {
  document.getElementById('zoom-indicator').textContent = `${Math.round(zoom * 100)}%`;
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

function generateAssetCode() {
  const name = currentScene.toUpperCase() + '_DOTS_SOURCE';
  let code = `// Generated by Isometry Editor\n`;
  code += `// ${new Date().toISOString()}\n\n`;
  code += `export const ${name}: Array<[number, number, number, string]> = [\n`;
  
  for (const dot of dots) {
    code += `  [${dot.x.toFixed(3)}, ${dot.y.toFixed(3)}, ${dot.r.toFixed(3)}, "${dot.color}"],\n`;
  }
  
  code += `];\n`;
  return code;
}

// ===================
// SCENE LOADING
// ===================

function loadScene(sceneName) {
  currentScene = sceneName;
  dots = [];
  
  if (sceneName === 'logo') {
    dots = generateLogoDots();
  } else if (ASSETS[sceneName]) {
    // Load from bundled assets
    const source = ASSETS[sceneName];
    for (const [x, y, r] of source) {
      dots.push({ x, y, r, color: '#ffffff', selected: false });
    }
  }
  
  // Reset view
  zoom = 0.5;
  panX = 0;
  panY = 0;
  updateZoomIndicator();
  render();
  updateStatus();
}

function generateLogoDots() {
  const FONT = {
    I: ["111", "010", "010", "010", "111"],
    S: ["1111", "1000", "1110", "0001", "1110"],
    O: ["1111", "1001", "1001", "1001", "1111"],
    M: ["10001", "11011", "10101", "10001", "10001"],
    E: ["1111", "1000", "1110", "1000", "1111"],
    T: ["11111", "00100", "00100", "00100", "00100"],
    R: ["1110", "1001", "1110", "1010", "1001"],
    Y: ["10001", "01010", "00100", "00100", "00100"],
  };
  
  const dotSize = 9;
  const gap = 4;
  const text = "ISOMETRY";
  const rows = 5;
  const chars = text.split("");
  const colsPerChar = chars.map(c => FONT[c] ? FONT[c][0].length : 0);
  const totalCols = colsPerChar.reduce((a, b) => a + b, 0) + (chars.length - 1);
  const startX = WIDTH / 2 - (totalCols * (dotSize + gap)) / 2;
  const startY = HEIGHT / 2 - (rows * (dotSize + gap)) / 2 + 20;
  
  const result = [];
  let cursor = 0;
  chars.forEach(ch => {
    const glyph = FONT[ch];
    if (!glyph) return;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < glyph[r].length; c++) {
        if (glyph[r][c] === '1') {
          result.push({
            x: startX + (cursor + c) * (dotSize + gap),
            y: startY + r * (dotSize + gap),
            r: dotSize / 2,
            color: '#ffffff',
            selected: false
          });
        }
      }
    }
    cursor += glyph[0].length + 1;
  });
  return result;
}

// ===================
// LOAD ASSETS & INIT
// ===================

async function init() {
  try {
    const response = await fetch('assets.json');
    ASSETS = await response.json();
    console.log('Assets loaded:', Object.keys(ASSETS));
  } catch (e) {
    console.warn('Could not load assets.json:', e);
  }
  
  resizeCanvases();
  loadScene('logo');
}

init();
