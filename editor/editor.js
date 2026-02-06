/**
 * Isometry Dot Editor
 * Interactive editor for tuning dot animation parameters
 */

// ===================
// ASSET DATA (imported from project)
// ===================

// These will be loaded from the asset files
let ASSETS = {};

// ===================
// DEFAULT CONFIG
// ===================

const CONFIG = {
  video: {
    width: 1920,
    height: 1080,
    fps: 30,
    backgroundColor: '#000000',
  },
  particles: {
    count: 2000,
    defaultSize: 3,
    color: '#ffffff',
    dotOpacity: 0.85,
  },
  scenes: {
    logo: {
      dotSize: 9,
      gap: 4,
      verticalOffset: 20,
    },
    brain: {
      scale: 0.85,
      offsetX: 0,
      offsetY: 0,
      dotScale: 0.9,
      sourceWidth: 540,
      sourceHeight: 395,
    },
    bci: {
      scale: 1.05,
      offsetX: 0,
      offsetY: 0,
      dotScale: 0.85,
      filterBorder: true,
      borderLeft: 320,
      borderRight: 1230,
      borderTop: 340,
      borderBottom: 700,
      sourceWidth: 1536,
      sourceHeight: 1049,
    },
    clinical: {
      scale: 1.25,
      offsetX: 0,
      offsetY: 60,
      dotScale: 0.85,
      filterBorder: true,
      borderLeft: 130,
      borderRight: 1400,
      borderTop: 310,
      borderBottom: 960,
      sourceWidth: 1536,
      sourceHeight: 1272,
    },
    assistive: {
      scale: 1.25,
      offsetX: 0,
      offsetY: 120,
      dotScale: 0.85,
      filterBorder: true,
      borderLeft: 110,
      borderRight: 1480,
      borderTop: 240,
      borderBottom: 9999,
      sourceWidth: 1536,
      sourceHeight: 1237,
    },
  },
};

// ===================
// STATE
// ===================

let currentScene = 'logo';
let currentFrame = 0;
let isPlaying = false;
let animationId = null;

// ===================
// CANVAS SETUP
// ===================

const canvas = document.getElementById('preview-canvas');
const ctx = canvas.getContext('2d');
const WIDTH = CONFIG.video.width;
const HEIGHT = CONFIG.video.height;

// Scale canvas for display
function resizeCanvas() {
  const container = document.getElementById('canvas-container');
  const containerRect = container.getBoundingClientRect();
  const aspectRatio = WIDTH / HEIGHT;
  
  let displayWidth = containerRect.width - 40;
  let displayHeight = displayWidth / aspectRatio;
  
  if (displayHeight > containerRect.height - 40) {
    displayHeight = containerRect.height - 40;
    displayWidth = displayHeight * aspectRatio;
  }
  
  canvas.style.width = displayWidth + 'px';
  canvas.style.height = displayHeight + 'px';
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ===================
// LOGO GENERATION
// ===================

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

function generateLogoPoints() {
  const cfg = CONFIG.scenes.logo;
  const text = "ISOMETRY";
  const rows = 5;
  const chars = text.split("");
  const colsPerChar = chars.map(c => FONT[c] ? FONT[c][0].length : 0);
  const totalCols = colsPerChar.reduce((a, b) => a + b, 0) + (chars.length - 1);
  const startX = WIDTH / 2 - (totalCols * (cfg.dotSize + cfg.gap)) / 2;
  const startY = HEIGHT / 2 - (rows * (cfg.dotSize + cfg.gap)) / 2 + cfg.verticalOffset;
  
  const pts = [];
  let cursor = 0;
  chars.forEach(ch => {
    const glyph = FONT[ch];
    if (!glyph) return;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < glyph[r].length; c++) {
        if (glyph[r][c] === '1') {
          pts.push({
            x: startX + (cursor + c) * (cfg.dotSize + cfg.gap),
            y: startY + r * (cfg.dotSize + cfg.gap),
            r: cfg.dotSize / 2
          });
        }
      }
    }
    cursor += glyph[0].length + 1;
  });
  return pts;
}

// ===================
// ASSET TRANSFORMATION
// ===================

function transformAsset(source, sceneName) {
  const cfg = CONFIG.scenes[sceneName];
  if (!cfg || !source) return [];
  
  const fitScale = Math.min(WIDTH / cfg.sourceWidth, HEIGHT / cfg.sourceHeight) * cfg.scale;
  const ox = WIDTH / 2 - (cfg.sourceWidth * fitScale) / 2 + cfg.offsetX;
  const oy = HEIGHT / 2 - (cfg.sourceHeight * fitScale) / 2 + cfg.offsetY;
  
  let filtered = source;
  if (cfg.filterBorder) {
    filtered = source.filter(([x, y]) => {
      return x >= cfg.borderLeft && x <= cfg.borderRight && 
             y >= cfg.borderTop && y <= cfg.borderBottom;
    });
  }
  
  return filtered.map(([x, y, r]) => ({
    x: x * fitScale + ox,
    y: y * fitScale + oy,
    r: r * fitScale * cfg.dotScale
  }));
}

// ===================
// RENDERING
// ===================

function render() {
  ctx.fillStyle = CONFIG.video.backgroundColor;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  
  let points = [];
  
  if (currentScene === 'logo') {
    points = generateLogoPoints();
  } else if (ASSETS[currentScene]) {
    points = transformAsset(ASSETS[currentScene], currentScene);
  }
  
  // Draw dots
  ctx.fillStyle = CONFIG.particles.color;
  ctx.globalAlpha = CONFIG.particles.dotOpacity;
  
  for (const p of points) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * (CONFIG.particles.defaultSize / 3), 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.globalAlpha = 1;
  
  // Draw dot count
  ctx.fillStyle = '#666';
  ctx.font = '24px monospace';
  ctx.fillText(`${points.length} dots`, 20, HEIGHT - 20);
}

// ===================
// UI GENERATION
// ===================

function generateSceneControls() {
  const container = document.getElementById('scene-controls');
  const cfg = CONFIG.scenes[currentScene];
  
  if (!cfg) {
    container.innerHTML = '<div class="section"><p style="color: #666; font-size: 12px;">Select a scene to edit</p></div>';
    return;
  }
  
  let html = `<div class="section"><div class="section-title">${currentScene} Settings</div>`;
  
  if (currentScene === 'logo') {
    html += `
      <div class="control-group">
        <div class="control-label">
          <span>Dot Size</span>
          <span class="control-value" id="logo-dotSize-value">${cfg.dotSize}</span>
        </div>
        <input type="range" id="logo-dotSize" min="4" max="20" step="1" value="${cfg.dotSize}">
      </div>
      <div class="control-group">
        <div class="control-label">
          <span>Gap</span>
          <span class="control-value" id="logo-gap-value">${cfg.gap}</span>
        </div>
        <input type="range" id="logo-gap" min="1" max="10" step="1" value="${cfg.gap}">
      </div>
      <div class="control-group">
        <div class="control-label">
          <span>Vertical Offset</span>
          <span class="control-value" id="logo-verticalOffset-value">${cfg.verticalOffset}</span>
        </div>
        <input type="range" id="logo-verticalOffset" min="-100" max="100" step="5" value="${cfg.verticalOffset}">
      </div>
    `;
  } else {
    html += `
      <div class="control-group">
        <div class="control-label">
          <span>Scale</span>
          <span class="control-value" id="${currentScene}-scale-value">${cfg.scale}</span>
        </div>
        <input type="range" id="${currentScene}-scale" min="0.5" max="2" step="0.05" value="${cfg.scale}">
      </div>
      <div class="control-group">
        <div class="control-label">
          <span>Offset X</span>
          <span class="control-value" id="${currentScene}-offsetX-value">${cfg.offsetX}</span>
        </div>
        <input type="range" id="${currentScene}-offsetX" min="-300" max="300" step="10" value="${cfg.offsetX}">
      </div>
      <div class="control-group">
        <div class="control-label">
          <span>Offset Y</span>
          <span class="control-value" id="${currentScene}-offsetY-value">${cfg.offsetY}</span>
        </div>
        <input type="range" id="${currentScene}-offsetY" min="-300" max="300" step="10" value="${cfg.offsetY}">
      </div>
      <div class="control-group">
        <div class="control-label">
          <span>Dot Scale</span>
          <span class="control-value" id="${currentScene}-dotScale-value">${cfg.dotScale}</span>
        </div>
        <input type="range" id="${currentScene}-dotScale" min="0.5" max="1.5" step="0.05" value="${cfg.dotScale}">
      </div>
    `;
    
    if (cfg.filterBorder !== undefined) {
      html += `
        <div class="control-group">
          <div class="checkbox-row">
            <input type="checkbox" id="${currentScene}-filterBorder" ${cfg.filterBorder ? 'checked' : ''}>
            <label for="${currentScene}-filterBorder">Filter Border</label>
          </div>
        </div>
      `;
      
      if (cfg.filterBorder) {
        html += `
          <div class="control-group">
            <div class="control-label">
              <span>Border Left</span>
              <span class="control-value" id="${currentScene}-borderLeft-value">${cfg.borderLeft}</span>
            </div>
            <input type="range" id="${currentScene}-borderLeft" min="0" max="500" step="10" value="${cfg.borderLeft}">
          </div>
          <div class="control-group">
            <div class="control-label">
              <span>Border Right</span>
              <span class="control-value" id="${currentScene}-borderRight-value">${cfg.borderRight}</span>
            </div>
            <input type="range" id="${currentScene}-borderRight" min="1000" max="1536" step="10" value="${cfg.borderRight}">
          </div>
          <div class="control-group">
            <div class="control-label">
              <span>Border Top</span>
              <span class="control-value" id="${currentScene}-borderTop-value">${cfg.borderTop}</span>
            </div>
            <input type="range" id="${currentScene}-borderTop" min="0" max="500" step="10" value="${cfg.borderTop}">
          </div>
          <div class="control-group">
            <div class="control-label">
              <span>Border Bottom</span>
              <span class="control-value" id="${currentScene}-borderBottom-value">${cfg.borderBottom}</span>
            </div>
            <input type="range" id="${currentScene}-borderBottom" min="500" max="1500" step="10" value="${cfg.borderBottom}">
          </div>
        `;
      }
    }
  }
  
  html += '</div>';
  container.innerHTML = html;
  
  // Attach event listeners
  attachControlListeners();
}

function attachControlListeners() {
  const cfg = CONFIG.scenes[currentScene];
  if (!cfg) return;
  
  const controls = document.querySelectorAll('#scene-controls input');
  controls.forEach(input => {
    input.addEventListener('input', (e) => {
      const id = e.target.id;
      const parts = id.split('-');
      const prop = parts.slice(1).join('-');
      
      if (e.target.type === 'checkbox') {
        cfg[prop] = e.target.checked;
        generateSceneControls(); // Rebuild to show/hide border controls
      } else {
        const value = parseFloat(e.target.value);
        cfg[prop] = value;
        
        const valueDisplay = document.getElementById(id + '-value');
        if (valueDisplay) {
          valueDisplay.textContent = value;
        }
      }
      
      render();
    });
  });
}

// ===================
// GLOBAL CONTROLS
// ===================

document.getElementById('dotSize').addEventListener('input', (e) => {
  CONFIG.particles.defaultSize = parseFloat(e.target.value);
  document.getElementById('dotSize-value').textContent = e.target.value;
  render();
});

document.getElementById('dotOpacity').addEventListener('input', (e) => {
  CONFIG.particles.dotOpacity = parseFloat(e.target.value);
  document.getElementById('dotOpacity-value').textContent = e.target.value;
  render();
});

// ===================
// SCENE SELECTOR
// ===================

document.querySelectorAll('.scene-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.scene-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentScene = e.target.dataset.scene;
    generateSceneControls();
    render();
  });
});

// ===================
// PLAYBACK
// ===================

const playBtn = document.getElementById('play-btn');
const resetBtn = document.getElementById('reset-btn');
const timelineSlider = document.getElementById('timeline-slider');
const frameDisplay = document.getElementById('frame-display');
const timeDisplay = document.getElementById('time-display');

function updateTimeDisplay() {
  frameDisplay.textContent = currentFrame;
  const seconds = currentFrame / CONFIG.video.fps;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  timeDisplay.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
  timelineSlider.value = currentFrame;
}

playBtn.addEventListener('click', () => {
  isPlaying = !isPlaying;
  playBtn.textContent = isPlaying ? '⏸ Pause' : '▶ Play';
  
  if (isPlaying) {
    animate();
  } else {
    cancelAnimationFrame(animationId);
  }
});

resetBtn.addEventListener('click', () => {
  currentFrame = 0;
  updateTimeDisplay();
  render();
});

timelineSlider.addEventListener('input', (e) => {
  currentFrame = parseInt(e.target.value);
  updateTimeDisplay();
  // Could animate between scenes based on frame here
});

function animate() {
  if (!isPlaying) return;
  
  currentFrame++;
  if (currentFrame > 764) currentFrame = 0;
  
  updateTimeDisplay();
  render();
  
  animationId = requestAnimationFrame(animate);
}

// ===================
// EXPORT
// ===================

function generateConfigCode() {
  return `// Generated by Isometry Editor
// ${new Date().toISOString()}

export const CONFIG = {
  video: {
    width: ${CONFIG.video.width},
    height: ${CONFIG.video.height},
    fps: ${CONFIG.video.fps},
    backgroundColor: '${CONFIG.video.backgroundColor}',
  },

  particles: {
    count: ${CONFIG.particles.count},
    defaultSize: ${CONFIG.particles.defaultSize},
    color: '${CONFIG.particles.color}',
    transitionEasing: 0.08,
  },

  timing: {
    STATE_A: 0,
    STATE_B: 90,
    STATE_C: 180,
    STATE_D: 300,
    STATE_E: 420,
    STATE_F: 540,
    STATE_G: 660,
    TOTAL_FRAMES: 765,
  },

  scenes: {
    logo: {
      dotSize: ${CONFIG.scenes.logo.dotSize},
      gap: ${CONFIG.scenes.logo.gap},
      verticalOffset: ${CONFIG.scenes.logo.verticalOffset},
    },

    brain: {
      scale: ${CONFIG.scenes.brain.scale},
      offsetX: ${CONFIG.scenes.brain.offsetX},
      offsetY: ${CONFIG.scenes.brain.offsetY},
      dotScale: ${CONFIG.scenes.brain.dotScale},
      sourceWidth: ${CONFIG.scenes.brain.sourceWidth},
      sourceHeight: ${CONFIG.scenes.brain.sourceHeight},
    },

    bci: {
      scale: ${CONFIG.scenes.bci.scale},
      offsetX: ${CONFIG.scenes.bci.offsetX},
      offsetY: ${CONFIG.scenes.bci.offsetY},
      dotScale: ${CONFIG.scenes.bci.dotScale},
      filterBorder: ${CONFIG.scenes.bci.filterBorder},
      borderFilter: {
        leftEdge: ${CONFIG.scenes.bci.borderLeft},
        rightEdge: ${CONFIG.scenes.bci.borderRight},
        topEdge: ${CONFIG.scenes.bci.borderTop},
        bottomEdge: ${CONFIG.scenes.bci.borderBottom},
        mode: 'corners',
      },
      sourceWidth: ${CONFIG.scenes.bci.sourceWidth},
      sourceHeight: ${CONFIG.scenes.bci.sourceHeight},
    },

    clinical: {
      scale: ${CONFIG.scenes.clinical.scale},
      offsetX: ${CONFIG.scenes.clinical.offsetX},
      offsetY: ${CONFIG.scenes.clinical.offsetY},
      dotScale: ${CONFIG.scenes.clinical.dotScale},
      filterBorder: ${CONFIG.scenes.clinical.filterBorder},
      borderFilter: {
        leftEdge: ${CONFIG.scenes.clinical.borderLeft},
        rightEdge: ${CONFIG.scenes.clinical.borderRight},
        topEdge: ${CONFIG.scenes.clinical.borderTop},
        bottomEdge: ${CONFIG.scenes.clinical.borderBottom},
        mode: 'edges',
      },
      sourceWidth: ${CONFIG.scenes.clinical.sourceWidth},
      sourceHeight: ${CONFIG.scenes.clinical.sourceHeight},
    },

    assistive: {
      scale: ${CONFIG.scenes.assistive.scale},
      offsetX: ${CONFIG.scenes.assistive.offsetX},
      offsetY: ${CONFIG.scenes.assistive.offsetY},
      dotScale: ${CONFIG.scenes.assistive.dotScale},
      filterBorder: ${CONFIG.scenes.assistive.filterBorder},
      borderFilter: {
        leftEdge: ${CONFIG.scenes.assistive.borderLeft},
        rightEdge: ${CONFIG.scenes.assistive.borderRight},
        topEdge: ${CONFIG.scenes.assistive.borderTop},
        bottomEdge: ${CONFIG.scenes.assistive.borderBottom},
        mode: 'edges',
      },
      sourceWidth: ${CONFIG.scenes.assistive.sourceWidth},
      sourceHeight: ${CONFIG.scenes.assistive.sourceHeight},
    },
  },
};
`;
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

document.getElementById('export-btn').addEventListener('click', () => {
  const code = generateConfigCode();
  navigator.clipboard.writeText(code).then(() => {
    showToast('Config copied to clipboard!');
  });
});

document.getElementById('download-btn').addEventListener('click', () => {
  const code = generateConfigCode();
  const blob = new Blob([code], { type: 'text/typescript' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'config.ts';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Downloaded config.ts');
});

// ===================
// LOAD ASSETS
// ===================

async function loadAssets() {
  try {
    // Load bundled assets from JSON
    const response = await fetch('assets.json');
    const data = await response.json();
    
    ASSETS = data;
    
    for (const [name, dots] of Object.entries(ASSETS)) {
      console.log(`Loaded ${name}: ${dots.length} dots`);
    }
  } catch (e) {
    console.warn('Asset loading failed:', e);
    console.log('Run "node editor/bundle-assets.js" to generate assets.json');
  }
  
  // Initial render
  generateSceneControls();
  render();
}

// ===================
// INIT
// ===================

loadAssets();
