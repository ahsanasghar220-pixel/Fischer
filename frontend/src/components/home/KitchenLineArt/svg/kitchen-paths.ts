// Static SVG data for KitchenSVG component
// This file contains all static geometry data, hotspot definitions, and CSS keyframe strings.

// ---------------------------------------------------------------------------
// Product hotspot definitions
// ---------------------------------------------------------------------------

export interface ProductHotspot {
  id: string
  cx: number
  cy: number
  label: string
}

export const PRODUCT_HOTSPOTS: ProductHotspot[] = [
  { id: 'hood',     cx: 400, cy: 120, label: 'Kitchen Hood' },
  { id: 'hob',      cx: 400, cy: 320, label: 'Built-in Hob' },
  { id: 'cooler',   cx: 120, cy: 480, label: 'Water Cooler' },
  { id: 'geyser',   cx: 680, cy: 480, label: 'Geyser' },
  { id: 'airfryer', cx: 220, cy: 280, label: 'Air Fryer' },
  { id: 'oven',     cx: 580, cy: 280, label: 'Oven Toaster' },
]

// ---------------------------------------------------------------------------
// CSS keyframe animation strings
// ---------------------------------------------------------------------------

export const KITCHEN_CSS_KEYFRAMES = `
  @keyframes dustFloat {
    0% { opacity: 0; transform: translate(0, 0); }
    25% { opacity: 0.8; }
    50% { opacity: 0.4; transform: translate(5px, 30px); }
    100% { opacity: 0; transform: translate(0, 60px); }
  }
  @keyframes particleFloat {
    0% { opacity: 0; transform: translateY(0) scale(0); }
    50% { opacity: 0.6; transform: translateY(-25px) scale(1); }
    100% { opacity: 0; transform: translateY(-50px) scale(0.5); }
  }
  @keyframes flameFlicker {
    0%, 100% { opacity: 0.7; transform: scaleY(1) scaleX(1); }
    50% { opacity: 0.9; transform: scaleY(0.9) scaleX(0.85); }
  }
  @keyframes bubbleRise {
    0% { opacity: 0; transform: translateY(0) scale(0.5); }
    30% { opacity: 0.8; transform: translateY(-30px) scale(1.2); }
    100% { opacity: 0; transform: translateY(-80px) scale(0.3); }
  }
  @keyframes steamRise {
    0% { opacity: 0; transform: translateY(0) scaleY(0.3); }
    50% { opacity: 0.7; transform: translateY(-10px) scaleY(1); }
    100% { opacity: 0; transform: translateY(-25px) scaleY(0.8); }
  }
  @keyframes waterDrop {
    0% { opacity: 0; transform: translateY(0) scale(0.5); }
    50% { opacity: 0.9; transform: translateY(7px) scale(1); }
    100% { opacity: 0; transform: translateY(15px) scale(0.8); }
  }
  @keyframes rippleExpand {
    0% { opacity: 0; transform: scale(0.5); }
    50% { opacity: 0.6; transform: scale(1.3); }
    100% { opacity: 0; transform: scale(1.8); }
  }
  @keyframes sparkle {
    0%, 100% { opacity: 0; transform: scale(0); }
    50% { opacity: 1; transform: scale(1); }
  }
  @keyframes heatWave {
    0%, 100% { opacity: 0.3; transform: scaleY(1) translateY(0); }
    50% { opacity: 0.6; transform: scaleY(1.2) translateY(-2px); }
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.3; }
    50% { transform: scale(1.3); opacity: 0.6; }
  }
`

// ---------------------------------------------------------------------------
// Particle / ambient array seeds
// These define the positions and timing for memoised particle arrays so the
// component can derive the same values without recalculating them.
// ---------------------------------------------------------------------------

/** 10 dust particles inside the hood light beam */
export const DUST_PARTICLE_SEEDS = Array.from({ length: 10 }, (_, i) => ({
  key: `dust-${i}`,
  x: 340 + (i % 5) * 35,
  y: 180 + Math.floor(i / 5) * 40,
  delay: i * 0.3,
}))

/** 8 ambient floating particles along the bottom */
export const AMBIENT_PARTICLE_SEEDS = Array.from({ length: 8 }, (_, i) => ({
  key: `particle-${i}`,
  x: 80 + i * 90,
  y: 500 + Math.sin(i) * 40,
  delay: i * 0.4,
  duration: 4 + (i % 3),
}))

/** 6 boiling-water bubbles */
export const BUBBLE_SEEDS = Array.from({ length: 6 }, (_, i) => ({
  key: `bubble-${i}`,
  cx: 392 + (i % 3) * 8,
  cy: 348,
  delay: i * 0.5,
}))

/** 4 heat-wave paths above the hob */
export const HEAT_WAVE_SEEDS = Array.from({ length: 4 }, (_, i) => ({
  key: `heat-${i}`,
  x: 370 + i * 20,
  y: 340 - (i % 2) * 5,
  delay: i * 0.2,
}))

/** 5 sparkle positions scattered across the kitchen */
export const SPARKLE_POSITIONS = [
  { x: 380, y: 150 },
  { x: 580, y: 250 },
  { x: 250, y: 480 },
  { x: 420, y: 330 },
  { x: 520, y: 480 },
]

// ---------------------------------------------------------------------------
// Hob burner centres (cx values) used for flames and steam
// ---------------------------------------------------------------------------

/** 3 burner centres used for flame rendering */
export const HOB_BURNER_CX = [360, 400, 440] as const

/** 5 cx positions used for steam particle rendering (wider spread than flames) */
export const STEAM_PARTICLE_CX = [360, 380, 400, 420, 440] as const

// ---------------------------------------------------------------------------
// Floor-tile x-positions for the perspective lines
// ---------------------------------------------------------------------------

export const FLOOR_TILE_X_POSITIONS = [0, 100, 200, 300, 400, 500, 600, 700] as const

// ---------------------------------------------------------------------------
// Cabinet door x-positions for vertical divider lines
// ---------------------------------------------------------------------------

export const CABINET_DOOR_X_POSITIONS = [200, 300, 500, 600] as const

// ---------------------------------------------------------------------------
// Light-ray path seeds (3 diagonal rays through the window)
// ---------------------------------------------------------------------------

export const LIGHT_RAY_SEEDS = [0, 1, 2] as const
