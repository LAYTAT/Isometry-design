/**
 * ISOMETRY DESIGN CONFIGURATION
 * 
 * All tunable parameters in one place.
 * Edit this file to customize the animation without touching code.
 */

export const CONFIG = {
  // ===================
  // VIDEO SETTINGS
  // ===================
  video: {
    width: 1920,
    height: 1080,
    fps: 30,
    backgroundColor: '#000000',
  },

  // ===================
  // PARTICLE SETTINGS
  // ===================
  particles: {
    count: 2000,           // Total number of particles
    defaultSize: 3,        // Default dot radius
    color: '#ffffff',      // Dot color
    transitionEasing: 0.08, // How fast particles move (0.01 = slow, 0.15 = fast)
  },

  // ===================
  // TIMING (in frames at 30fps)
  // ===================
  // Each state defines when that scene STARTS
  // Duration = next state start - current state start
  timing: {
    // Scene order: logo hold → brain → bci → clinical → assistive → logo end → logo hold
    STATE_A: 0,     // Logo hold start
    STATE_B: 90,    // Logo → Brain transition (3s)
    STATE_C: 180,   // Brain → BCI transition (3s)
    STATE_D: 300,   // BCI → Clinical transition (4s)
    STATE_E: 420,   // Clinical → Assistive transition (4s)
    STATE_F: 540,   // Assistive → Logo transition (4s)
    STATE_G: 660,   // Logo hold end (4s)
    TOTAL_FRAMES: 765, // Total duration (25.5s)
  },

  // ===================
  // SCENE CONFIGURATIONS
  // ===================
  scenes: {
    logo: {
      // ISOMETRY text logo settings
      dotSize: 9,
      gap: 4,
      verticalOffset: 20, // Push text down from center
    },

    brain: {
      scale: 0.85,        // Size multiplier
      offsetX: 0,         // Horizontal shift from center
      offsetY: 0,         // Vertical shift from center
      dotScale: 0.9,      // Scale for individual dots
      // Source image dimensions (don't change unless regenerating asset)
      sourceWidth: 540,
      sourceHeight: 395,
    },

    bci: {
      scale: 1.05,
      offsetX: 0,
      offsetY: 0,
      dotScale: 0.85,
      // Border filter (removes rectangular frame from source)
      filterBorder: true,
      borderFilter: {
        // Dots with x < leftEdge OR x > rightEdge are filtered out
        // Same for y with topEdge and bottomEdge
        // Set to 0 to disable that edge filter
        leftEdge: 320,
        rightEdge: 1230,
        topEdge: 340,
        bottomEdge: 700,
        // Filter mode: 'corners' filters corners only, 'edges' filters entire edges
        mode: 'corners' as 'corners' | 'edges',
      },
      sourceWidth: 1536,
      sourceHeight: 1049,
    },

    clinical: {
      scale: 1.25,
      offsetX: 0,
      offsetY: 60,        // Shifted down
      dotScale: 0.85,
      filterBorder: true,
      borderFilter: {
        leftEdge: 130,
        rightEdge: 1400,
        topEdge: 310,
        bottomEdge: 960,
        mode: 'edges' as 'corners' | 'edges',
      },
      sourceWidth: 1536,
      sourceHeight: 1272,
    },

    assistive: {
      scale: 1.25,
      offsetX: 0,
      offsetY: 120,       // Shifted down more
      dotScale: 0.85,
      filterBorder: true,
      borderFilter: {
        leftEdge: 110,
        rightEdge: 1480,
        topEdge: 240,
        bottomEdge: 9999, // No bottom filter
        mode: 'edges' as 'corners' | 'edges',
      },
      sourceWidth: 1536,
      sourceHeight: 1237,
    },
  },

  // ===================
  // EASING CURVES
  // ===================
  easing: {
    // Available: 'linear', 'easeIn', 'easeOut', 'easeInOut', 'elastic'
    sceneTransition: 'easeInOut',
  },
};

// Type exports for use in other files
export type SceneConfig = typeof CONFIG.scenes.brain;
export type BorderFilter = typeof CONFIG.scenes.bci.borderFilter;
