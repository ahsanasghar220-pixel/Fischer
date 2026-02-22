import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  SparklesIcon,
  ClockIcon,
  CheckBadgeIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline'
import AnimatedSection, { StaggeredChildren } from '@/components/ui/AnimatedSection'
import KitchenLineArt from '@/components/home/KitchenLineArt'

// ─── Blueprint Floor Plan ─────────────────────────────────────────────────────

function BlueprintFloorPlan() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const zoneMarkers = [
    { label: 'Hood', x: 190, y: 55 },
    { label: 'Hob', x: 190, y: 155 },
    { label: 'Cooler', x: 480, y: 80 },
    { label: 'Geyser', x: 480, y: 200 },
    { label: 'Air Fryer', x: 330, y: 120 },
    { label: 'Oven', x: 330, y: 220 },
  ]

  return (
    <div ref={ref} className="relative w-full max-w-2xl mx-auto">
      <svg viewBox="0 0 600 300" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Grid lines */}
        {Array.from({ length: 13 }, (_, i) => (
          <line key={`v${i}`} x1={i * 50} y1={0} x2={i * 50} y2={300} stroke="rgba(59,130,246,0.08)" strokeWidth={0.5} />
        ))}
        {Array.from({ length: 7 }, (_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 50} x2={600} y2={i * 50} stroke="rgba(59,130,246,0.08)" strokeWidth={0.5} />
        ))}

        {/* Kitchen outline */}
        <motion.path
          d="M 50 30 L 550 30 L 550 270 L 50 270 Z"
          stroke="rgba(59,130,246,0.4)"
          strokeWidth={2}
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />

        {/* Interior walls */}
        <motion.path
          d="M 270 30 L 270 150 M 270 180 L 270 270 M 50 150 L 270 150"
          stroke="rgba(59,130,246,0.25)"
          strokeWidth={1.5}
          strokeDasharray="8 4"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 2, delay: 0.5, ease: 'easeInOut' }}
        />

        {/* Countertop */}
        <motion.path
          d="M 80 100 L 240 100 L 240 130 L 80 130 Z"
          stroke="rgba(59,130,246,0.3)"
          strokeWidth={1}
          fill="rgba(59,130,246,0.03)"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 1.5, delay: 1, ease: 'easeInOut' }}
        />

        {/* Island */}
        <motion.path
          d="M 310 100 L 460 100 L 460 160 L 310 160 Z"
          stroke="rgba(59,130,246,0.3)"
          strokeWidth={1}
          fill="rgba(59,130,246,0.03)"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 1.5, delay: 1.2, ease: 'easeInOut' }}
        />

        {/* Measurement annotations */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 2 }}
        >
          <line x1={50} y1={20} x2={550} y2={20} stroke="rgba(59,130,246,0.2)" strokeWidth={0.5} />
          <text x={300} y={16} textAnchor="middle" fill="rgba(59,130,246,0.4)" fontSize={9} fontFamily="monospace">
            500 cm
          </text>
          <line x1={560} y1={30} x2={560} y2={270} stroke="rgba(59,130,246,0.2)" strokeWidth={0.5} />
          <text x={575} y={155} textAnchor="middle" fill="rgba(59,130,246,0.4)" fontSize={9} fontFamily="monospace" transform="rotate(90 575 155)">
            240 cm
          </text>
        </motion.g>

        {/* Zone markers */}
        {zoneMarkers.map((zone, i) => (
          <motion.g
            key={zone.label}
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 1.5 + i * 0.15 }}
            style={{ originX: `${zone.x}px`, originY: `${zone.y}px` }}
          >
            <circle cx={zone.x} cy={zone.y} r={16} fill="rgba(149,18,18,0.15)" stroke="rgba(149,18,18,0.5)" strokeWidth={1} />
            <circle cx={zone.x} cy={zone.y} r={4} fill="rgba(149,18,18,0.8)" />
            <text
              x={zone.x}
              y={zone.y + 28}
              textAnchor="middle"
              fill="rgba(59,130,246,0.6)"
              fontSize={10}
              fontFamily="monospace"
              fontWeight="bold"
            >
              {zone.label}
            </text>
          </motion.g>
        ))}

        {/* Scan line */}
        <motion.line
          x1={50}
          x2={550}
          stroke="rgba(149,18,18,0.15)"
          strokeWidth={1}
          initial={{ y1: 30, y2: 30 }}
          animate={isInView ? { y1: [30, 270, 30], y2: [30, 270, 30] } : {}}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
      </svg>
    </div>
  )
}

// ─── ExperienceViewer ─────────────────────────────────────────────────────────

export default function ExperienceViewer() {
  return (
    <>
      {/* Interactive Kitchen (KitchenLineArt) */}
      <section id="interactive-kitchen" className="relative">
        {/* Animated gradient border — top */}
        <motion.div
          className="h-px bg-gradient-to-r from-transparent via-primary-500 to-transparent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />

        <KitchenLineArt />

        {/* Animated gradient border — bottom */}
        <motion.div
          className="h-px bg-gradient-to-r from-transparent via-primary-500 to-transparent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </section>

      {/* Design Blueprint */}
      <section className="section relative overflow-hidden bg-[#0a1628] dark:bg-dark-950">
        {/* Blueprint grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="container-xl relative z-10">
          <AnimatedSection animation="fade-up" duration={800} threshold={0.1} easing="gentle">
            <div className="text-center mb-12">
              <span className="text-xs font-mono uppercase tracking-[0.3em] text-blue-400/60 mb-3 block">
                Blueprint View
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                The Fischer Kitchen Blueprint
              </h2>
              <p className="text-blue-200/40 max-w-xl mx-auto">
                Every zone, every appliance — meticulously planned for the modern Pakistani kitchen.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" duration={1000} threshold={0.05} easing="gentle">
            <BlueprintFloorPlan />
          </AnimatedSection>

          {/* Stats row */}
          <StaggeredChildren
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
            staggerDelay={120}
            duration={600}
            animation="fade-up"
            easing="bouncy"
            once
          >
            {[
              { icon: SparklesIcon, value: '6', label: 'Product Zones' },
              { icon: ClockIcon, value: '35+', label: 'Years Experience' },
              { icon: CheckBadgeIcon, value: '100%', label: 'Quality Tested' },
              { icon: WrenchScrewdriverIcon, value: '1 Year', label: 'Warranty' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center p-6 rounded-xl border border-blue-500/10 bg-blue-500/5"
              >
                <stat.icon className="w-6 h-6 text-blue-400/60 mx-auto mb-3" />
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1 font-mono">
                  {stat.value}
                </div>
                <div className="text-sm text-blue-300/40">{stat.label}</div>
              </div>
            ))}
          </StaggeredChildren>
        </div>
      </section>
    </>
  )
}
