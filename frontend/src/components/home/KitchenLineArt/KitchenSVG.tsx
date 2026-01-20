import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { useState, useRef, useMemo, memo, useCallback } from 'react'

interface KitchenSVGProps {
  onProductClick: (productId: string, event: React.MouseEvent) => void
  activeProductId: string | null
}

interface ProductHotspot {
  id: string
  cx: number
  cy: number
  label: string
}

const productHotspots: ProductHotspot[] = [
  { id: 'hood', cx: 400, cy: 120, label: 'Kitchen Hood' },
  { id: 'hob', cx: 400, cy: 320, label: 'Built-in Hob' },
  { id: 'cooler', cx: 120, cy: 480, label: 'Water Cooler' },
  { id: 'geyser', cx: 680, cy: 480, label: 'Geyser' },
  { id: 'airfryer', cx: 220, cy: 280, label: 'Air Fryer' },
  { id: 'oven', cx: 580, cy: 280, label: 'Oven Toaster' },
]

// PERFORMANCE: Use CSS animations via style tag instead of framer-motion for particles
// This reduces JavaScript overhead significantly

// Floating dust particles - simplified with CSS animation class
const DustParticle = memo(({ x, y, delay }: { x: number; y: number; delay: number }) => (
  <circle
    cx={x}
    cy={y}
    r="1.5"
    className="fill-primary-300/40"
    style={{
      animation: `dustFloat ${6 + delay * 2}s linear ${delay}s infinite`,
      willChange: 'transform, opacity',
    }}
  />
))
DustParticle.displayName = 'DustParticle'

// Particle component - simplified with CSS
const Particle = memo(({ x, y, delay, duration }: { x: number; y: number; delay: number; duration: number }) => (
  <circle
    cx={x}
    cy={y}
    r="2"
    className="fill-primary-400/30"
    style={{
      animation: `particleFloat ${duration}s ease-out ${delay}s infinite`,
      willChange: 'transform, opacity',
    }}
  />
))
Particle.displayName = 'Particle'

// Animated fire/flames under hob burners - simplified with CSS
const Flame = memo(({ cx, delay }: { cx: number; delay: number }) => (
  <g style={{ willChange: 'transform' }}>
    <path
      d={`M${cx},390 Q${cx - 8},385 ${cx - 4},375 Q${cx},370 ${cx},365 Q${cx + 2},370 ${cx + 4},375 Q${cx + 8},385 ${cx},390 Z`}
      className="fill-orange-500/70"
      style={{
        animation: `flameFlicker 0.3s ease-in-out ${delay}s infinite`,
        transformOrigin: `${cx}px 390px`,
        willChange: 'transform, opacity',
      }}
    />
    <path
      d={`M${cx},387 Q${cx - 5},383 ${cx - 2},375 Q${cx},372 ${cx},368 Q${cx + 1},372 ${cx + 2},375 Q${cx + 5},383 ${cx},387 Z`}
      className="fill-yellow-400/80"
      style={{
        animation: `flameFlicker 0.25s ease-in-out ${delay + 0.1}s infinite`,
        transformOrigin: `${cx}px 387px`,
        willChange: 'transform, opacity',
      }}
    />
  </g>
))
Flame.displayName = 'Flame'

// Boiling water bubbles - simplified with CSS animation
const Bubble = memo(({ cx, cy, delay }: { cx: number; cy: number; delay: number }) => (
  <circle
    cx={cx}
    cy={cy}
    r="3"
    className="fill-blue-300/60 stroke-blue-400/40"
    strokeWidth="1"
    style={{
      animation: `bubbleRise 2.5s ease-out ${delay}s infinite`,
      willChange: 'transform, opacity',
    }}
  />
))
Bubble.displayName = 'Bubble'

// Steam particles - simplified with CSS
const SteamParticle = memo(({ cx, delay }: { cx: number; delay: number }) => (
  <path
    d={`M${cx},375 Q${cx - 5},360 ${cx},345 Q${cx + 5},330 ${cx},315`}
    className="stroke-gray-400/50 fill-none"
    strokeWidth="2.5"
    strokeLinecap="round"
    style={{
      animation: `steamRise 2.5s ease-out ${delay}s infinite`,
      willChange: 'transform, opacity',
    }}
  />
))
SteamParticle.displayName = 'SteamParticle'

// Water droplet for cooler - simplified with CSS
const WaterDrop = memo(({ delay }: { delay: number }) => (
  <ellipse
    cx="105"
    cy="475"
    rx="2"
    ry="3"
    className="fill-blue-400/70"
    style={{
      animation: `waterDrop 1.5s ease-in ${delay}s infinite`,
      willChange: 'transform, opacity',
    }}
  />
))
WaterDrop.displayName = 'WaterDrop'

// Water ripple effect - simplified with CSS
const WaterRipple = memo(({ delay }: { delay: number }) => (
  <ellipse
    cx="120"
    cy="455"
    rx="15"
    ry="3"
    className="stroke-blue-400/40 fill-none"
    strokeWidth="1"
    style={{
      animation: `rippleExpand 2s ease-out ${delay}s infinite`,
      willChange: 'transform, opacity',
    }}
  />
))
WaterRipple.displayName = 'WaterRipple'

// Sparkle particles - simplified, removed individual line animations
const Sparkle = memo(({ x, y, delay }: { x: number; y: number; delay: number }) => (
  <circle
    cx={x}
    cy={y}
    r="2"
    className="fill-yellow-400/80"
    style={{
      animation: `sparkle 1.5s ease-in-out ${delay}s infinite`,
      willChange: 'transform, opacity',
    }}
  />
))
Sparkle.displayName = 'Sparkle'

// Sink water drip - simplified with CSS
const SinkDrip = memo(({ delay }: { delay: number }) => (
  <ellipse
    cx="620"
    cy="360"
    rx="1.5"
    ry="2.5"
    className="fill-blue-400/80"
    style={{
      animation: `waterDrop 1.2s ease-in ${delay}s infinite`,
      willChange: 'transform, opacity',
    }}
  />
))
SinkDrip.displayName = 'SinkDrip'

// Heat distortion waves - simplified with CSS
const HeatWave = memo(({ x, y, delay }: { x: number; y: number; delay: number }) => (
  <path
    d={`M${x - 10},${y} Q${x - 5},${y - 5} ${x},${y} Q${x + 5},${y + 5} ${x + 10},${y}`}
    className="stroke-orange-400/30 fill-none"
    strokeWidth="1.5"
    style={{
      animation: `heatWave 1s ease-in-out ${delay}s infinite`,
      transformOrigin: `${x}px ${y}px`,
      willChange: 'transform, opacity',
    }}
  />
))
HeatWave.displayName = 'HeatWave'

// CSS Keyframes for performance - defined as a style element
const CSSKeyframes = () => (
  <style>{`
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
      0% { opacity: 0; stroke-dashoffset: 100; }
      50% { opacity: 0.7; stroke-dashoffset: 0; transform: translateY(-10px); }
      100% { opacity: 0; stroke-dashoffset: 0; transform: translateY(-25px); }
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
  `}</style>
)

function KitchenSVG({ onProductClick, activeProductId }: KitchenSVGProps) {
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth spring physics for mouse tracking - reduced stiffness for less computation
  const springConfig = useMemo(() => ({ stiffness: 100, damping: 30, mass: 0.5 }), [])
  const mouseXSpring = useSpring(mouseX, springConfig)
  const mouseYSpring = useSpring(mouseY, springConfig)

  // Simplified parallax - use fewer layers for better performance
  const parallaxX1 = useTransform(mouseXSpring, [0, 800], [-6, 6])
  const parallaxY1 = useTransform(mouseYSpring, [0, 600], [-6, 6])
  const parallaxX2 = useTransform(mouseXSpring, [0, 800], [-3, 3])
  const parallaxY2 = useTransform(mouseYSpring, [0, 600], [-3, 3])
  // REMOVED parallaxX3, parallaxY3 for performance

  // Mouse follower glow effect - use transform for CSS positioning
  const glowTranslateX = useTransform(mouseXSpring, [0, 800], [-400, 400])
  const glowTranslateY = useTransform(mouseYSpring, [0, 600], [-300, 300])

  // Memoized mouse move handler
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 800
    const y = ((e.clientY - rect.top) / rect.height) * 600
    mouseX.set(x)
    mouseY.set(y)
  }, [mouseX, mouseY])

  // Memoize dust particles array - REDUCED from 30 to 10
  const dustParticles = useMemo(() =>
    [...Array(10)].map((_, i) => ({
      key: `dust-${i}`,
      x: 340 + (i % 5) * 35,
      y: 180 + Math.floor(i / 5) * 40,
      delay: i * 0.3
    })), [])

  // Memoize ambient particles - REDUCED from 20 to 8
  const ambientParticles = useMemo(() =>
    [...Array(8)].map((_, i) => ({
      key: `particle-${i}`,
      x: 80 + (i * 90),
      y: 500 + (Math.sin(i) * 40),
      delay: i * 0.4,
      duration: 4 + (i % 3)
    })), [])

  // Memoize bubbles - REDUCED from 12 to 6
  const bubbles = useMemo(() =>
    [...Array(6)].map((_, i) => ({
      key: `bubble-${i}`,
      cx: 392 + (i % 3) * 8,
      cy: 348,
      delay: i * 0.5
    })), [])

  // Memoize heat waves - REDUCED from 8 to 4
  const heatWaves = useMemo(() =>
    [...Array(4)].map((_, i) => ({
      key: `heat-${i}`,
      x: 370 + i * 20,
      y: 340 - (i % 2) * 5,
      delay: i * 0.2
    })), [])

  // Memoize sparkles - REDUCED from 9 to 5
  const sparkles = useMemo(() => [
    { x: 380, y: 150 }, { x: 580, y: 250 },
    { x: 250, y: 480 }, { x: 420, y: 330 }, { x: 520, y: 480 }
  ], [])

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 800 600"
      className="w-full h-auto"
      style={{ maxHeight: '70vh' }}
      onMouseMove={handleMouseMove}
    >
      {/* CSS Keyframes for GPU-accelerated animations */}
      <CSSKeyframes />

      {/* Simplified SVG filters - removed heavy filters for performance */}
      <defs>
        {/* Animated background gradient */}
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" className="text-gray-50 dark:text-dark-800">
            <animate attributeName="stop-color" values="#f9fafb;#f3f4f6;#f9fafb" dur="8s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" className="text-gray-100 dark:text-dark-900">
            <animate attributeName="stop-color" values="#f3f4f6;#e5e7eb;#f3f4f6" dur="8s" repeatCount="indefinite" />
          </stop>
        </linearGradient>

        {/* Glow filter with enhanced blur */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        {/* Intense glow for special effects */}
        <filter id="glowIntense" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
          <feColorMatrix in="coloredBlur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 2 0"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        {/* Heat distortion filter */}
        <filter id="heatDistortion">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" result="turbulence">
            <animate attributeName="baseFrequency" values="0.02;0.04;0.02" dur="1.5s" repeatCount="indefinite"/>
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="3" xChannelSelector="R" yChannelSelector="G"/>
        </filter>

        {/* Ripple effect filter */}
        <filter id="ripple">
          <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="1" result="turbulence">
            <animate attributeName="baseFrequency" from="0.01" to="0.02" dur="2s" repeatCount="indefinite"/>
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="2"/>
        </filter>

        {/* Light rays gradient for window */}
        <radialGradient id="lightRays" cx="50%" cy="30%">
          <stop offset="0%" style={{ stopColor: '#fbbf24', stopOpacity: 0.3 }}>
            <animate attributeName="stop-opacity" values="0.2;0.4;0.2" dur="4s" repeatCount="indefinite"/>
          </stop>
          <stop offset="50%" style={{ stopColor: '#f59e0b', stopOpacity: 0.1 }}>
            <animate attributeName="stop-opacity" values="0.05;0.15;0.05" dur="4s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" style={{ stopColor: '#d97706', stopOpacity: 0 }}/>
        </radialGradient>

        {/* Oven glow gradient */}
        <radialGradient id="ovenGlow" cx="50%" cy="50%">
          <stop offset="0%" style={{ stopColor: '#f97316', stopOpacity: 0.8 }}>
            <animate attributeName="stop-opacity" values="0.6;0.9;0.6" dur="2s" repeatCount="indefinite"/>
          </stop>
          <stop offset="70%" style={{ stopColor: '#fb923c', stopOpacity: 0.3 }}>
            <animate attributeName="stop-opacity" values="0.2;0.4;0.2" dur="2s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" style={{ stopColor: '#fed7aa', stopOpacity: 0 }}/>
        </radialGradient>

        {/* Air fryer fan gradient */}
        <radialGradient id="fanGradient" cx="50%" cy="50%">
          <stop offset="0%" style={{ stopColor: '#60a5fa', stopOpacity: 0.4 }}/>
          <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0 }}/>
        </radialGradient>

        {/* Geyser heat indicator gradient */}
        <linearGradient id="geyserHeat" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: 0.8 }}>
            <animate attributeName="offset" values="0%;30%;0%" dur="3s" repeatCount="indefinite"/>
          </stop>
          <stop offset="50%" style={{ stopColor: '#f97316', stopOpacity: 0.5 }}>
            <animate attributeName="offset" values="50%;80%;50%" dur="3s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" style={{ stopColor: '#fbbf24', stopOpacity: 0.2 }}/>
        </linearGradient>

        {/* Holographic shimmer gradient */}
        <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#a855f7', stopOpacity: 0.3 }}>
            <animate attributeName="offset" values="0%;100%;0%" dur="3s" repeatCount="indefinite"/>
          </stop>
          <stop offset="50%" style={{ stopColor: '#ec4899', stopOpacity: 0.3 }}>
            <animate attributeName="offset" values="50%;150%;50%" dur="3s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" style={{ stopColor: '#f43f5e', stopOpacity: 0.3 }}>
            <animate attributeName="offset" values="100%;200%;100%" dur="3s" repeatCount="indefinite"/>
          </stop>
        </linearGradient>

        {/* Counter reflection gradient */}
        <linearGradient id="counterReflection" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0 }}/>
          <stop offset="50%" style={{ stopColor: '#ffffff', stopOpacity: 0.1 }}>
            <animate attributeName="stop-opacity" values="0.05;0.15;0.05" dur="5s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0 }}/>
        </linearGradient>

        {/* Spotlight gradient for dramatic lighting */}
        <radialGradient id="spotlight" cx="50%" cy="30%">
          <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.4 }}>
            <animate attributeName="stop-opacity" values="0.3;0.5;0.3" dur="5s" repeatCount="indefinite"/>
          </stop>
          <stop offset="50%" style={{ stopColor: '#fef3c7', stopOpacity: 0.2 }}/>
          <stop offset="100%" style={{ stopColor: '#000000', stopOpacity: 0 }}/>
        </radialGradient>

        {/* Fridge glow gradient */}
        <radialGradient id="fridgeGlow" cx="50%" cy="50%">
          <stop offset="0%" style={{ stopColor: '#fef3c7', stopOpacity: 0.6 }}>
            <animate attributeName="stop-opacity" values="0.4;0.7;0.4" dur="3s" repeatCount="indefinite"/>
          </stop>
          <stop offset="70%" style={{ stopColor: '#fde68a', stopOpacity: 0.2 }}/>
          <stop offset="100%" style={{ stopColor: '#000000', stopOpacity: 0 }}/>
        </radialGradient>
      </defs>

      <rect
        x="0"
        y="0"
        width="800"
        height="600"
        fill="url(#bgGradient)"
        rx="16"
      />

      {/* Dramatic spotlight effect - using scale instead of rx/ry */}
      <motion.ellipse
        cx="400"
        cy="100"
        rx="250"
        ry="400"
        fill="url(#spotlight)"
        style={{ pointerEvents: 'none', mixBlendMode: 'overlay' }}
        animate={{
          scale: [0.96, 1.04, 0.96],
          opacity: [0.6, 0.8, 0.6]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Mouse follower glow - subtle cursor tracking effect - using CSS transform */}
      <motion.circle
        cx="400"
        cy="300"
        r="80"
        fill="url(#lightRays)"
        style={{
          pointerEvents: 'none',
          mixBlendMode: 'overlay',
          x: glowTranslateX,
          y: glowTranslateY,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 0.3 }}
      />

      {/* Light rays coming through window - god rays effect */}
      <g opacity="0.6">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.path
            key={i}
            d={`M${350 + i * 30},160 L${320 + i * 40},350`}
            className="stroke-yellow-300/20 fill-none"
            strokeWidth="15"
            strokeLinecap="round"
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
              pathLength: [0, 1, 1],
            }}
            transition={{
              opacity: { duration: 4, delay: i * 0.3, repeat: Infinity },
              pathLength: { duration: 2, delay: i * 0.2 }
            }}
            style={{ filter: 'blur(8px)' }}
          />
        ))}
      </g>

      {/* Floating dust particles in light beams - REDUCED from 30 to 10 */}
      <g>
        {dustParticles.map((p) => (
          <DustParticle key={p.key} x={p.x} y={p.y} delay={p.delay} />
        ))}
      </g>

      {/* Ambient floating particles - REDUCED from 20 to 8 */}
      <g>
        {ambientParticles.map((p) => (
          <Particle key={p.key} x={p.x} y={p.y} delay={p.delay} duration={p.duration} />
        ))}
      </g>

      {/* Kitchen Structure Lines with multiple parallax layers */}
      <motion.g
        className="stroke-gray-300 dark:stroke-dark-600"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ x: parallaxX1, y: parallaxY1 }}
      >
        {/* Wall outline with draw animation */}
        <motion.path
          d="M50 50 L750 50 L750 550 L50 550 Z"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          style={{ filter: 'url(#glow)' }}
        />

        {/* Window with animated draw */}
        <motion.rect
          x="300" y="60" width="200" height="100" rx="4"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
        <motion.line
          x1="400" y1="60" x2="400" y2="160"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        />
        <motion.line
          x1="300" y1="110" x2="500" y2="110"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        />

        {/* Window curtains - left curtain - using x transform for sway */}
        <motion.path
          d="M305 65 Q310 75 305 85 Q310 95 305 105 Q310 115 305 125 Q310 135 305 145 Q310 155 305 160 L305 65 Z"
          className="fill-blue-100/30 dark:fill-blue-900/20 stroke-none"
          animate={{
            x: [0, -2, 0, 2, 0],
            scaleX: [1, 0.95, 1, 1.02, 1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originX: '305px' }}
        />
        {/* Window curtains - right curtain - using x transform for sway */}
        <motion.path
          d="M495 65 Q490 75 495 85 Q490 95 495 105 Q490 115 495 125 Q490 135 495 145 Q490 155 495 160 L495 65 Z"
          className="fill-blue-100/30 dark:fill-blue-900/20 stroke-none"
          animate={{
            x: [0, 2, 0, -2, 0],
            scaleX: [1, 0.95, 1, 1.02, 1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          style={{ originX: '495px' }}
        />

        {/* Wall clock */}
        <motion.circle
          cx="150"
          cy="200"
          r="18"
          className="fill-white/80 dark:fill-dark-700/80"
          strokeWidth="2"
        />
        <motion.circle
          cx="150"
          cy="200"
          r="2"
          className="fill-gray-600 dark:fill-gray-400"
        />
        {/* Clock hour hand */}
        <motion.line
          x1="150"
          y1="200"
          x2="150"
          y2="188"
          className="stroke-gray-700 dark:stroke-gray-300"
          strokeWidth="2"
          strokeLinecap="round"
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
          style={{ originX: '150px', originY: '200px' }}
        />
        {/* Clock minute hand */}
        <motion.line
          x1="150"
          y1="200"
          x2="150"
          y2="183"
          className="stroke-gray-600 dark:stroke-gray-400"
          strokeWidth="1.5"
          strokeLinecap="round"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          style={{ originX: '150px', originY: '200px' }}
        />

        {/* Upper Cabinets with subtle shadows and animated doors */}
        <motion.rect
          x="100" y="70" width="150" height="80" rx="4"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        />
        {/* Left cabinet door that opens slightly on hover */}
        <motion.g
          whileHover={{
            x: -3,
            scaleX: 0.95,
            transition: { duration: 0.3 }
          }}
          style={{ originX: '100px', originY: '110px' }}
        >
          <motion.rect
            x="100" y="70" width="75" height="80" rx="4"
            className="fill-gray-100/5 dark:fill-dark-800/10 stroke-gray-300 dark:stroke-dark-600"
            strokeWidth="1"
          />
          {/* Cabinet door crack/opening light */}
          <motion.line
            x1="175" y1="70" x2="175" y2="150"
            className="stroke-yellow-300/0"
            strokeWidth="2"
            initial={{ opacity: 0 }}
            whileHover={{
              opacity: [0, 0.6, 0.6, 0],
              strokeOpacity: [0, 0.8, 0.8, 0]
            }}
            transition={{ duration: 0.5 }}
            style={{ filter: 'url(#glow)' }}
          />
        </motion.g>
        {/* Cabinet shadow that shifts */}
        <motion.rect
          x="105" y="152" width="145" height="8"
          className="fill-gray-400/10 dark:fill-dark-900/20 stroke-none"
          rx="2"
          animate={{
            opacity: [0.1, 0.2, 0.1],
            scaleX: [1, 1.05, 1]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.rect
          x="550" y="70" width="150" height="80" rx="4"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        />
        {/* Right cabinet door that opens slightly on hover */}
        <motion.g
          whileHover={{
            x: 3,
            scaleX: 0.95,
            transition: { duration: 0.3 }
          }}
          style={{ originX: '700px', originY: '110px' }}
        >
          <motion.rect
            x="625" y="70" width="75" height="80" rx="4"
            className="fill-gray-100/5 dark:fill-dark-800/10 stroke-gray-300 dark:stroke-dark-600"
            strokeWidth="1"
          />
          {/* Cabinet door crack/opening light */}
          <motion.line
            x1="625" y1="70" x2="625" y2="150"
            className="stroke-yellow-300/0"
            strokeWidth="2"
            initial={{ opacity: 0 }}
            whileHover={{
              opacity: [0, 0.6, 0.6, 0],
              strokeOpacity: [0, 0.8, 0.8, 0]
            }}
            transition={{ duration: 0.5 }}
            style={{ filter: 'url(#glow)' }}
          />
        </motion.g>
        {/* Cabinet shadow that shifts */}
        <motion.rect
          x="555" y="152" width="145" height="8"
          className="fill-gray-400/10 dark:fill-dark-900/20 stroke-none"
          rx="2"
          animate={{
            opacity: [0.1, 0.2, 0.1],
            scaleX: [1, 1.05, 1]
          }}
          transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
        />

        {/* Hood outline with glow and suction indicator */}
        <motion.path
          d="M280 170 L280 200 L520 200 L520 170 L480 170 L480 140 L320 140 L320 170 Z"
          className="stroke-gray-400 dark:stroke-dark-500"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.7 }}
          style={{ filter: 'url(#glow)' }}
        >
          <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" />
        </motion.path>
        {/* Hood extraction lines - suction effect */}
        {[0, 1, 2, 3].map((i) => (
          <motion.path
            key={`hood-suction-${i}`}
            d={`M${350 + i * 25},220 Q${353 + i * 25},200 ${350 + i * 25},180`}
            className="stroke-gray-400/30 fill-none"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{
              opacity: [0, 0.5, 0],
              pathLength: [0, 1, 1],
              y: [10, 0, -10]
            }}
            transition={{
              duration: 2,
              delay: i * 0.2,
              repeat: Infinity,
              ease: 'easeIn'
            }}
          />
        ))}

        {/* Counter/Cabinet base with draw animation */}
        <motion.path
          d="M100 350 L700 350 L700 400 L100 400 Z"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.8 }}
        />
        {/* Counter surface reflection */}
        <motion.rect
          x="100"
          y="350"
          width="600"
          height="50"
          fill="url(#counterReflection)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        />

        {/* Counter items - Knife block */}
        <motion.g>
          <motion.rect
            x="260" y="330" width="25" height="20" rx="2"
            className="fill-gray-700/40 dark:fill-gray-600/40"
            animate={{ y: [330, 328, 330] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Knife handles */}
          {[0, 1, 2].map((i) => (
            <motion.rect
              key={i}
              x={263 + i * 6} y="320" width="3" height="10" rx="1"
              className="fill-gray-400/60"
              animate={{
                y: [320, 318, 320],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.2
              }}
            />
          ))}
        </motion.g>

        {/* Counter items - Fruit bowl - using scaleY instead of ry */}
        <motion.g>
          <motion.ellipse
            cx="490" cy="345" rx="30" ry="8"
            className="fill-gray-300/30 dark:fill-gray-700/30"
            animate={{
              scaleY: [1, 1.125, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Fruits with subtle bobbing */}
          <motion.circle
            cx="480" cy="338" r="6"
            className="fill-red-500/50"
            animate={{
              y: [0, -1, 0],
              scale: [1, 1.02, 1]
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.circle
            cx="495" cy="340" r="5"
            className="fill-orange-500/50"
            animate={{
              y: [0, -1, 0],
              scale: [1, 1.02, 1]
            }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          />
          <motion.circle
            cx="488" cy="336" r="5"
            className="fill-yellow-500/50"
            animate={{
              y: [0, -1, 0],
              scale: [1, 1.02, 1]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          />
        </motion.g>
        <motion.path
          d="M100 400 L700 400 L700 540 L100 540 Z"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.9 }}
        />

        {/* Cabinet doors */}
        {[200, 300, 500, 600].map((x, i) => (
          <motion.line
            key={x}
            x1={x} y1="400" x2={x} y2="540"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 1 + (i * 0.1) }}
          />
        ))}

        {/* Hob outline with glow effect */}
        <motion.rect
          x="320" y="360" width="160" height="30" rx="4"
          className="stroke-gray-400 dark:stroke-dark-500"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 1.2 }}
          style={{ filter: 'url(#glow)' }}
        />
        {/* Hob burners with pulsing animation */}
        <motion.circle
          cx="360" cy="375" r="12"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ filter: 'url(#glow)' }}
        />
        <motion.circle
          cx="400" cy="375" r="15"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          style={{ filter: 'url(#glow)' }}
        />
        <motion.circle
          cx="440" cy="375" r="12"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          style={{ filter: 'url(#glow)' }}
        />

        {/* Pot on main burner */}
        <motion.ellipse
          cx="400" cy="350" rx="18" ry="5"
          className="stroke-gray-500 fill-gray-300/40 dark:fill-gray-600/40"
          strokeWidth="1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, -1, 0] }}
          transition={{ opacity: { delay: 1.5 }, y: { duration: 2, repeat: Infinity } }}
        />

        {/* Sink */}
        <rect x="550" y="360" width="80" height="30" rx="8" />
        <ellipse cx="590" cy="375" rx="25" ry="10" />

        {/* Faucet */}
        <path d="M610 350 L610 340 L620 340 L620 355" />

        {/* Sink water ripples */}
        <motion.ellipse
          cx="590" cy="376" rx="8" ry="2"
          className="stroke-blue-400/30 fill-none"
          strokeWidth="0.5"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: [0, 0.5, 0],
            scale: [0.5, 1.5, 2]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeOut'
          }}
        />

        {/* Air Fryer (left counter) with spinning fan animation */}
        <g className="stroke-gray-400 dark:stroke-dark-500">
          <motion.rect
            x="180" y="260" width="80" height="80" rx="8"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 1.4 }}
          />
          <motion.rect
            x="190" y="270" width="60" height="50" rx="4"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 1.5 }}
            fill="url(#fanGradient)"
          />
          {/* Spinning fan blades */}
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            style={{ originX: '220px', originY: '295px' }}
          >
            {[0, 90, 180, 270].map((angle) => (
              <motion.line
                key={angle}
                x1="220" y1="295" x2="235" y2="295"
                className="stroke-blue-500/60"
                strokeWidth="2"
                strokeLinecap="round"
                style={{
                  transformOrigin: '220px 295px',
                  transform: `rotate(${angle}deg)`
                }}
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            ))}
          </motion.g>
          <motion.circle
            cx="220" cy="330" r="5"
            animate={{ fill: ['rgba(244,180,44,0.2)', 'rgba(244,180,44,0.5)', 'rgba(244,180,44,0.2)'] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ filter: 'url(#glow)' }}
          />
        </g>

        {/* Oven Toaster (right counter) with pulsing interior glow */}
        <g className="stroke-gray-400 dark:stroke-dark-500">
          <motion.rect
            x="540" y="260" width="80" height="80" rx="8"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 1.4 }}
          />
          {/* Oven interior with glowing effect */}
          <motion.rect
            x="548" y="268" width="64" height="50" rx="4"
            fill="url(#ovenGlow)"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 1.5 }}
            style={{ filter: 'url(#glowIntense)' }}
          />
          {/* Heating coils */}
          <motion.line
            x1="555" y1="280" x2="605" y2="280"
            className="stroke-orange-500/80"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{
              pathLength: [0, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              pathLength: { duration: 1, delay: 1.6 },
              opacity: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
            }}
            style={{ filter: 'url(#glowIntense)' }}
          />
          <motion.line
            x1="555" y1="290" x2="605" y2="290"
            className="stroke-red-500/80"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{
              pathLength: [0, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              pathLength: { duration: 1, delay: 1.65 },
              opacity: { duration: 1.3, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }
            }}
            style={{ filter: 'url(#glowIntense)' }}
          />
          {/* Control knobs */}
          <motion.line
            x1="555" y1="330" x2="575" y2="330"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 1.7 }}
          />
          <motion.line
            x1="585" y1="330" x2="605" y2="330"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 1.8 }}
          />
        </g>

        {/* Water Cooler (floor left) with animated water and ripples - FRIDGE with door light */}
        <g className="stroke-gray-400 dark:stroke-dark-500">
          <motion.rect
            x="80" y="420" width="80" height="120" rx="8"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 1.8 }}
          />
          {/* Fridge door crack glow */}
          <motion.rect
            x="85" y="425" width="4" height="110"
            fill="url(#fridgeGlow)"
            className="stroke-none"
            animate={{
              opacity: [0.3, 0.7, 0.3],
              x: [85, 86, 85]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ filter: 'url(#glowIntense)' }}
          />
          {/* Water tank with bobbing water level */}
          <motion.rect
            x="90" y="430" width="60" height="40" rx="4"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 1.9 }}
          />
          <motion.rect
            x="90" y="445" width="60" height="25" rx="2"
            className="fill-blue-400/30 stroke-none"
            animate={{
              scaleY: [1, 1.08, 1],
              y: [0, -1, 0]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originY: '457.5px' }}
          />
          {/* Dispenser buttons */}
          <motion.circle
            cx="105" cy="500" r="8"
            className="fill-blue-400/40"
            animate={{
              scale: [1, 1.1, 1],
              fill: ['rgba(59,130,246,0.3)', 'rgba(59,130,246,0.5)', 'rgba(59,130,246,0.3)']
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ filter: 'url(#glow)' }}
          />
          <motion.circle
            cx="135" cy="500" r="8"
            className="fill-red-400/40"
            animate={{
              scale: [1, 1.1, 1],
              fill: ['rgba(239,68,68,0.3)', 'rgba(239,68,68,0.5)', 'rgba(239,68,68,0.3)']
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            style={{ filter: 'url(#glow)' }}
          />
        </g>

        {/* Geyser (floor right) with animated heat indicator and temperature bar */}
        <g className="stroke-gray-400 dark:stroke-dark-500">
          <motion.rect
            x="640" y="420" width="80" height="120" rx="8"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 1.8 }}
          />
          {/* Water tank with heat gradient */}
          <motion.rect
            x="650" y="430" width="60" height="60" rx="4"
            fill="url(#geyserHeat)"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 1.9 }}
            style={{ filter: 'url(#glow)' }}
          />
          {/* Temperature gauge */}
          <motion.circle
            cx="680" cy="510" r="15"
            className="fill-red-500/30"
            animate={{
              opacity: [0.6, 1, 0.6],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ filter: 'url(#glowIntense)' }}
          />
          {/* Temperature indicator cross */}
          <motion.path
            d="M670 510 L690 510 M680 500 L680 520"
            strokeWidth="2"
            strokeLinecap="round"
            animate={{
              stroke: ['rgba(239,68,68,0.6)', 'rgba(239,68,68,1)', 'rgba(239,68,68,0.6)'],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ transformOrigin: '680px 510px' }}
          />
          {/* Heat waves rising */}
          {[0, 1, 2].map((i) => (
            <motion.path
              key={i}
              d={`M${665 + i * 8},420 Q${668 + i * 8},410 ${665 + i * 8},400`}
              className="stroke-red-400/40 fill-none"
              strokeWidth="2"
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{
                opacity: [0, 0.6, 0],
                pathLength: [0, 1, 1],
                y: [0, -10]
              }}
              transition={{
                duration: 2,
                delay: i * 0.3,
                repeat: Infinity,
                ease: 'easeOut'
              }}
            />
          ))}
        </g>

        {/* Floor tiles pattern */}
        <g strokeWidth="1" className="stroke-gray-200 dark:stroke-dark-700">
          <line x1="50" y1="550" x2="750" y2="550" />
          {[0, 100, 200, 300, 400, 500, 600, 700].map(x => (
            <line key={x} x1={50 + x * 0.875} y1="550" x2={90 + x * 0.875} y2="600" />
          ))}
        </g>
      </motion.g>

      {/* Animated FLAMES under hob burners - cooking effect! */}
      <motion.g style={{ x: parallaxX2, y: parallaxY2 }}>
        {[360, 400, 440].map((cx, i) => (
          <Flame key={`flame-${cx}`} cx={cx} delay={i * 0.15} />
        ))}
      </motion.g>

      {/* Boiling water BUBBLES rising from pot - REDUCED from 12 to 6 */}
      <motion.g style={{ x: parallaxX2, y: parallaxY2 }}>
        {bubbles.map((b) => (
          <Bubble key={b.key} cx={b.cx} cy={b.cy} delay={b.delay} />
        ))}
      </motion.g>

      {/* STEAM particles with curling motion from hob */}
      <motion.g style={{ x: parallaxX2, y: parallaxY2 }}>
        {[360, 380, 400, 420, 440].map((cx, i) => (
          <SteamParticle key={`steam-${cx}`} cx={cx} delay={i * 0.3} />
        ))}
      </motion.g>

      {/* Heat DISTORTION waves above hot surfaces - REDUCED from 8 to 4 */}
      <motion.g style={{ x: parallaxX2, y: parallaxY2 }}>
        {heatWaves.map((h) => (
          <HeatWave key={h.key} x={h.x} y={h.y} delay={h.delay} />
        ))}
      </motion.g>

      {/* Water droplets for cooler */}
      <motion.g style={{ x: parallaxX2, y: parallaxY2 }}>
        {[0, 0.5, 1, 1.5].map((delay, i) => (
          <WaterDrop key={`drop-${i}`} delay={delay} />
        ))}
      </motion.g>

      {/* Water RIPPLES in cooler tank - REDUCED to 2 */}
      <motion.g style={{ x: parallaxX2, y: parallaxY2 }}>
        {[0, 0.8].map((delay, i) => (
          <WaterRipple key={`ripple-${i}`} delay={delay} />
        ))}
      </motion.g>

      {/* Enhanced heat waves from oven with distortion */}
      <motion.g style={{ x: parallaxX2, y: parallaxY2, filter: 'url(#heatDistortion)' }}>
        {[0, 0.2, 0.4, 0.6].map((delay, i) => (
          <motion.path
            key={`oven-heat-${i}`}
            d={`M${560 + i * 12},250 Q${565 + i * 12},240 ${560 + i * 12},230`}
            className="stroke-orange-400/40 fill-none"
            strokeWidth="2.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1, 1],
              opacity: [0, 0.6, 0],
              y: [0, -20]
            }}
            transition={{
              duration: 1.8,
              delay,
              repeat: Infinity,
              ease: 'easeOut'
            }}
          />
        ))}
      </motion.g>

      {/* Product Hotspots with PULSING GLOW and enhanced animations */}
      {productHotspots.map((hotspot, index) => {
        const isActive = activeProductId === hotspot.id
        const isHovered = hoveredHotspot === hotspot.id

        // Calculate distance from mouse to hotspot for magnetic effect
        const distanceX = useTransform(mouseXSpring, (x) => x - hotspot.cx)
        const distanceY = useTransform(mouseYSpring, (y) => y - hotspot.cy)
        const distance = useTransform([distanceX, distanceY], ([x, y]: number[]) => Math.sqrt(x * x + y * y))

        // Magnetic pull - hotspot moves slightly toward cursor when nearby
        const magnetX = useTransform(distance, [0, 100], [0, 0], {
          clamp: false,
          ease: (_t: number) => {
            const dist = distance.get()
            if (dist > 100) return 0
            return (distanceX.get() / dist) * (1 - dist / 100) * 8
          }
        })
        const magnetY = useTransform(distance, [0, 100], [0, 0], {
          clamp: false,
          ease: (_t: number) => {
            const dist = distance.get()
            if (dist > 100) return 0
            return (distanceY.get() / dist) * (1 - dist / 100) * 8
          }
        })

        return (
          <motion.g
            key={hotspot.id}
            className="cursor-pointer"
            onClick={(e) => onProductClick(hotspot.id, e)}
            onMouseEnter={() => setHoveredHotspot(hotspot.id)}
            onMouseLeave={() => setHoveredHotspot(null)}
            style={{ x: magnetX, y: magnetY }}
          >
            {/* INTENSE pulsing glow around active hotspots */}
            <motion.circle
              cx={hotspot.cx}
              cy={hotspot.cy}
              r="35"
              className="fill-primary-400/20"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: index * 0.2
              }}
              style={{ filter: 'url(#glowIntense)' }}
            />
            <motion.circle
              cx={hotspot.cx}
              cy={hotspot.cy}
              r="28"
              className="fill-primary-500/30"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: index * 0.2 + 0.2
              }}
              style={{ filter: 'url(#glowIntense)' }}
            />

            {/* Outer pulse rings - multiple for depth */}
            <motion.circle
              cx={hotspot.cx}
              cy={hotspot.cy}
              r="20"
              className="fill-transparent stroke-primary-500"
              strokeWidth="2"
              initial={{ scale: 1, opacity: 0 }}
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeOut',
                delay: index * 0.2
              }}
            />
            <motion.circle
              cx={hotspot.cx}
              cy={hotspot.cy}
              r="20"
              className="fill-transparent stroke-primary-400"
              strokeWidth="1.5"
              initial={{ scale: 1, opacity: 0 }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut',
                delay: index * 0.2 + 0.3
              }}
            />

            {/* Glow ring on hover */}
            {isHovered && (
              <motion.circle
                cx={hotspot.cx}
                cy={hotspot.cy}
                r="25"
                className="fill-transparent stroke-primary-400"
                strokeWidth="3"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: 1.2,
                  opacity: [0.4, 0],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: 'easeOut'
                }}
                style={{ filter: 'url(#glow)' }}
              />
            )}

            {/* Floating animation for hotspot */}
            <motion.g
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 2 + (index * 0.2),
                repeat: Infinity,
                ease: 'easeInOut',
                delay: index * 0.15
              }}
            >
              {/* Inner circle with magnetic effect */}
              <motion.circle
                cx={hotspot.cx}
                cy={hotspot.cy}
                r="12"
                className={`transition-colors duration-300 ${
                  isActive
                    ? 'fill-primary-500 stroke-primary-600'
                    : 'fill-primary-400/80 stroke-primary-500 hover:fill-primary-500'
                }`}
                strokeWidth="2"
                whileHover={{
                  scale: 1.3,
                  rotate: 180,
                  transition: { type: 'spring', stiffness: 300, damping: 15 }
                }}
                whileTap={{
                  scale: 0.9,
                  rotate: -90
                }}
                style={{ filter: isHovered ? 'url(#glow)' : 'none' }}
              />

              {/* Plus icon with rotation on hover */}
              <g className="pointer-events-none">
                <motion.line
                  x1={hotspot.cx - 5}
                  y1={hotspot.cy}
                  x2={hotspot.cx + 5}
                  y2={hotspot.cy}
                  className="stroke-white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  animate={isHovered ? { scaleX: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.5 }}
                />
                <motion.line
                  x1={hotspot.cx}
                  y1={hotspot.cy - 5}
                  x2={hotspot.cx}
                  y2={hotspot.cy + 5}
                  className="stroke-white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  animate={isHovered ? { scaleY: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.5 }}
                />
              </g>
            </motion.g>

            {/* Ripple effect on click */}
            {isActive && (
              <motion.circle
                cx={hotspot.cx}
                cy={hotspot.cy}
                r="15"
                className="fill-transparent stroke-primary-500"
                strokeWidth="3"
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{
                  scale: 2,
                  opacity: 0,
                }}
                transition={{
                  duration: 0.6,
                  ease: 'easeOut'
                }}
              />
            )}

            {/* Label on hover with animation */}
            <motion.g
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={isHovered ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 10, scale: 0.9 }}
              className="pointer-events-none"
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <motion.rect
                x={hotspot.cx - 50}
                y={hotspot.cy + 25}
                width="100"
                height="24"
                rx="4"
                className="fill-dark-900 dark:fill-dark-700"
                style={{ filter: 'url(#glow)' }}
              />
              <text
                x={hotspot.cx}
                y={hotspot.cy + 42}
                textAnchor="middle"
                className="fill-white text-xs font-medium"
              >
                {hotspot.label}
              </text>
            </motion.g>
          </motion.g>
        )
      })}

      {/* Sparkle particles throughout the kitchen - REDUCED from 9 to 5 */}
      <g>
        {sparkles.map((pos, i) => (
          <Sparkle key={`sparkle-${i}`} x={pos.x} y={pos.y} delay={i * 0.5} />
        ))}
      </g>

      {/* Sink water drips */}
      <g>
        {[0, 0.4, 0.8, 1.2].map((delay, i) => (
          <SinkDrip key={`drip-${i}`} delay={delay} />
        ))}
      </g>

      {/* Enhanced connecting lines between hotspots - animated data flow */}
      <motion.g
        className="stroke-primary-400/20"
        strokeWidth="1"
        fill="none"
        strokeDasharray="5,5"
      >
        <motion.path
          d={`M${productHotspots[0].cx},${productHotspots[0].cy} L${productHotspots[1].cx},${productHotspots[1].cy}`}
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.3 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 2 }}
        />
        {/* Animated flow particles along connection line - using x/y transforms */}
        <motion.circle
          cx={productHotspots[0].cx}
          cy={productHotspots[0].cy}
          r="2"
          className="fill-primary-400"
          animate={{
            x: [0, productHotspots[1].cx - productHotspots[0].cx],
            y: [0, productHotspots[1].cy - productHotspots[0].cy],
            opacity: [0, 0.8, 0]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />

        <motion.path
          d={`M${productHotspots[4].cx},${productHotspots[4].cy} L${productHotspots[2].cx},${productHotspots[2].cy}`}
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.3 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 2.2 }}
        />
        {/* Animated flow particles - using x/y transforms */}
        <motion.circle
          cx={productHotspots[4].cx}
          cy={productHotspots[4].cy}
          r="2"
          className="fill-primary-400"
          animate={{
            x: [0, productHotspots[2].cx - productHotspots[4].cx],
            y: [0, productHotspots[2].cy - productHotspots[4].cy],
            opacity: [0, 0.8, 0]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
        />

        <motion.path
          d={`M${productHotspots[5].cx},${productHotspots[5].cy} L${productHotspots[3].cx},${productHotspots[3].cy}`}
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.3 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 2.4 }}
        />
        {/* Animated flow particles - using x/y transforms */}
        <motion.circle
          cx={productHotspots[5].cx}
          cy={productHotspots[5].cy}
          r="2"
          className="fill-primary-400"
          animate={{
            x: [0, productHotspots[3].cx - productHotspots[5].cx],
            y: [0, productHotspots[3].cy - productHotspots[5].cy],
            opacity: [0, 0.8, 0]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        />
      </motion.g>

      {/* Fischer Logo watermark - static for performance */}
      <text
        x="750"
        y="580"
        textAnchor="end"
        className="fill-gray-300 dark:fill-dark-600 text-xs"
        style={{ fontFamily: 'Poppins, sans-serif', opacity: 0.5 }}
      >
        FISCHER
      </text>
    </svg>
  )
}

// Export memoized component to prevent unnecessary re-renders
export default memo(KitchenSVG)
