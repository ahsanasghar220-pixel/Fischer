import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  SparklesIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ClockIcon,
  CheckBadgeIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline'
import api from '@/lib/api'
import AnimatedSection, { StaggeredChildren } from '@/components/ui/AnimatedSection'
import ScrollReveal, { TextReveal, Parallax, HoverCard } from '@/components/effects/ScrollReveal'
import KitchenLineArt from '@/components/home/KitchenLineArt'
import { useIsTouchDevice } from '@/hooks/useIsTouchDevice'

// ──────────────────────────────────────────
// Types
// ──────────────────────────────────────────

interface Product {
  id: number
  name: string
  slug: string
  price: number
  compare_price?: number
  primary_image?: string
  category?: { name: string; slug: string }
  short_description?: string
}

// ──────────────────────────────────────────
// Kitchen Zone Data
// ──────────────────────────────────────────

const kitchenZones = [
  {
    id: 'hood',
    name: 'Kitchen Hoods',
    categorySlug: 'kitchen-hoods',
    tagline: 'Breathe Fresh, Cook Bold',
    description: 'Powerful extraction meets sleek European design. Our range hoods eliminate smoke, grease, and odors — keeping your kitchen pristine.',
    features: ['Copper Winding Motor', 'Baffle Filters', 'LED Illumination', 'Low Noise'],
    color: 'from-slate-400 to-slate-600',
    accent: 'bg-slate-500/10',
  },
  {
    id: 'hob',
    name: 'Built-in Hobs',
    categorySlug: 'hobs',
    tagline: 'Precision Heat, Perfect Meals',
    description: 'From gentle simmering to rapid boiling, Fischer hobs deliver exact temperature control with premium brass burners and tempered glass.',
    features: ['Brass Burners', 'Auto-Ignition', 'Tempered Glass', 'Cast Iron Stands'],
    color: 'from-orange-400 to-red-500',
    accent: 'bg-orange-500/10',
  },
  {
    id: 'cooler',
    name: 'Water Coolers',
    categorySlug: 'water-coolers',
    tagline: 'Refreshment on Demand',
    description: 'Hot and cold water at the touch of a button. Built with food-grade stainless steel tanks and energy-efficient compressor cooling.',
    features: ['Compressor Cooling', 'SS Tank', 'Child Lock', 'Energy Efficient'],
    color: 'from-cyan-400 to-blue-500',
    accent: 'bg-cyan-500/10',
  },
  {
    id: 'geyser',
    name: 'Geysers',
    categorySlug: 'geysers',
    tagline: 'Instant Warmth, Always Ready',
    description: 'Gas and electric water heaters engineered for Pakistan\'s climate. Multiple safety systems ensure worry-free hot water year-round.',
    features: ['Instant Heating', 'Flame Failure', 'Anti-Freeze', 'Copper Heat Exchanger'],
    color: 'from-amber-400 to-orange-500',
    accent: 'bg-amber-500/10',
  },
  {
    id: 'airfryer',
    name: 'Air Fryers',
    categorySlug: 'air-fryers',
    tagline: 'Crispy Without the Guilt',
    description: 'Rapid air circulation technology delivers perfectly crispy results with up to 80% less oil. Healthier cooking, uncompromised taste.',
    features: ['360° Air Circ.', 'Digital Touch', 'Non-Stick Basket', '80% Less Oil'],
    color: 'from-emerald-400 to-green-500',
    accent: 'bg-emerald-500/10',
  },
  {
    id: 'oven',
    name: 'Oven Toasters',
    categorySlug: 'oven-toasters',
    tagline: 'Bake, Grill, Toast — All in One',
    description: 'Versatile countertop ovens with convection heating, rotisserie, and precise temperature control for every recipe in your repertoire.',
    features: ['Convection', 'Rotisserie', 'Timer Control', 'Multi-Rack'],
    color: 'from-rose-400 to-pink-500',
    accent: 'bg-rose-500/10',
  },
]

// ──────────────────────────────────────────
// Ambient Particles
// ──────────────────────────────────────────

function AmbientParticles({ count }: { count: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        delay: Math.random() * 5,
        duration: Math.random() * 8 + 12,
      })),
    [count]
  )

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary-400/20"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// ──────────────────────────────────────────
// Blueprint SVG Floor Plan
// ──────────────────────────────────────────

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

// ──────────────────────────────────────────
// Product Zone Card
// ──────────────────────────────────────────

function ProductZoneCard({
  zone,
  index,
  products,
}: {
  zone: (typeof kitchenZones)[number]
  index: number
  products: Product[]
}) {
  const isReversed = index % 2 === 1
  const product = products.find(
    (p) => p.category?.slug === zone.categorySlug
  )

  const imageUrl = product?.primary_image
    ? product.primary_image.startsWith('http')
      ? product.primary_image
      : `/storage/${product.primary_image}`
    : null

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center ${isReversed ? 'lg:[direction:rtl]' : ''}`}>
      {/* Text Side */}
      <div className={isReversed ? 'lg:[direction:ltr]' : ''}>
        <ScrollReveal animation="fadeUp" delay={0.1}>
          <span className="text-xs font-mono uppercase tracking-[0.3em] text-dark-400 dark:text-dark-500 mb-2 block">
            Zone {String(index + 1).padStart(2, '0')}
          </span>
          <h3 className="text-3xl sm:text-4xl font-bold text-dark-900 dark:text-white mb-3">
            {zone.name}
          </h3>
          <p className={`text-lg font-semibold bg-gradient-to-r ${zone.color} bg-clip-text text-transparent mb-4`}>
            {zone.tagline}
          </p>
          <p className="text-dark-600 dark:text-dark-300 leading-relaxed mb-6">
            {zone.description}
          </p>
        </ScrollReveal>

        <StaggeredChildren
          className="flex flex-wrap gap-2 mb-8"
          staggerDelay={80}
          duration={600}
          animation="scale"
          easing="bouncy"
          once
        >
          {zone.features.map((feature) => (
            <span
              key={feature}
              className="px-3 py-1.5 text-xs font-medium rounded-full bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 border border-dark-200 dark:border-dark-700"
            >
              {feature}
            </span>
          ))}
        </StaggeredChildren>

        <ScrollReveal animation="fadeUp" delay={0.3}>
          <Link
            to={`/category/${zone.categorySlug}`}
            className="btn-elastic shine-sweep inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          >
            Explore {zone.name}
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </ScrollReveal>
      </div>

      {/* Image Side */}
      <div className={isReversed ? 'lg:[direction:ltr]' : ''}>
        <ScrollReveal animation={isReversed ? 'fadeLeft' : 'fadeRight'} delay={0.2}>
          <Parallax speed={0.3} direction="up">
            <HoverCard intensity={8}>
              <div className="relative group rounded-2xl overflow-hidden bg-gradient-to-br from-dark-100 to-dark-200 dark:from-dark-800 dark:to-dark-900 shadow-elegant aspect-[4/3]">
                {/* Gradient border effect */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${zone.color} opacity-20 group-hover:opacity-30 transition-opacity duration-500`} />
                <div className="absolute inset-[2px] rounded-2xl bg-white dark:bg-dark-900 overflow-hidden">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product?.name || zone.name}
                      className="w-full h-full object-contain p-6 transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <SparklesIcon className="w-16 h-16 text-dark-300 dark:text-dark-600" />
                    </div>
                  )}
                </div>
                {/* Shimmer overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            </HoverCard>
          </Parallax>
        </ScrollReveal>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────
// Main Page Component
// ──────────────────────────────────────────

export default function KitchenExperience() {
  const isTouchDevice = useIsTouchDevice()
  const heroRef = useRef<HTMLElement>(null)

  // Fetch featured products for zone showcase
  const { data: productsData } = useQuery({
    queryKey: ['kitchen-experience-products'],
    queryFn: async () => {
      const res = await api.get('/api/products/featured')
      return res.data?.data || res.data || []
    },
    staleTime: 5 * 60 * 1000,
  })

  const products: Product[] = productsData || []

  // Rotating gradient angle
  const [gradientAngle, setGradientAngle] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setGradientAngle((prev) => (prev + 0.3) % 360)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const particleCount = isTouchDevice ? 4 : 15

  return (
    <>
      <Helmet>
        <title>Kitchen Experience | Fischer</title>
        <meta
          name="description"
          content="Explore Fischer's interactive kitchen showroom. Discover premium kitchen hoods, hobs, coolers, geysers, air fryers, and ovens in an immersive experience."
        />
      </Helmet>

      {/* ==========================================
          SECTION 1: HERO - Cinematic Entrance
          ========================================== */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-dark-950"
      >
        {/* Animated radial gradient */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(ellipse at 50% 50%, rgba(149,18,18,0.3) 0%, transparent 70%)`,
            transform: `rotate(${gradientAngle}deg)`,
          }}
        />

        {/* Blueprint grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Ambient particles */}
        <AmbientParticles count={particleCount} />

        {/* Hero content */}
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
          <ScrollReveal animation="fadeUp" delay={0.2}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-sm font-medium mb-8">
              <SparklesIcon className="w-4 h-4" />
              Interactive Kitchen Showroom
            </span>
          </ScrollReveal>

          <div className="mb-6">
            <TextReveal
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight"
            >
              Your Kitchen, Elevated
            </TextReveal>
          </div>

          <div className="mb-2">
            <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-shimmer">
              {/* Empty span for shimmer line effect under heading — the TextReveal includes "Elevated" */}
            </span>
          </div>

          <ScrollReveal animation="fadeUp" delay={0.8}>
            <p className="text-lg sm:text-xl text-dark-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Explore our complete range of premium kitchen appliances in an immersive,
              blueprint-inspired experience. Click, discover, and envision your dream kitchen.
            </p>
          </ScrollReveal>

          <ScrollReveal animation="fadeUp" delay={1}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#interactive-kitchen"
                className="btn-elastic shine-sweep inline-flex items-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/20"
              >
                <SparklesIcon className="w-5 h-5" />
                Explore the Kitchen
              </a>
              <Link
                to="/shop"
                className="btn-elastic inline-flex items-center gap-2 px-8 py-4 border border-dark-600 hover:border-dark-400 text-dark-200 hover:text-white rounded-xl font-semibold text-lg transition-all duration-300"
              >
                Browse Products
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
            </div>
          </ScrollReveal>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDownIcon className="w-6 h-6 text-dark-500" />
          </motion.div>
        </div>
      </section>

      {/* ==========================================
          SECTION 2: Interactive Kitchen (KitchenLineArt)
          ========================================== */}
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

      {/* ==========================================
          SECTION 3: Product Showcase Strips (6 Zones)
          ========================================== */}
      <section className="section bg-white dark:bg-dark-950">
        <div className="container-xl">
          <AnimatedSection animation="fade-up" duration={800} threshold={0.1} easing="gentle">
            <div className="text-center mb-12 lg:mb-20">
              <span className="text-xs font-mono uppercase tracking-[0.3em] text-primary-500 mb-3 block">
                Product Zones
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-dark-900 dark:text-white mb-4">
                Six Zones, One Vision
              </h2>
              <p className="text-dark-500 dark:text-dark-400 max-w-xl mx-auto">
                Every Fischer appliance is designed to work in harmony — explore each zone of your dream kitchen.
              </p>
            </div>
          </AnimatedSection>

          <div className="space-y-20 lg:space-y-32">
            {kitchenZones.map((zone, index) => (
              <div key={zone.id} className="relative">
                {/* Background accent blob */}
                <div
                  className={`absolute -z-10 w-72 h-72 rounded-full blur-3xl opacity-20 ${zone.accent} ${
                    index % 2 === 0 ? '-left-20 top-0' : '-right-20 bottom-0'
                  }`}
                />
                <AnimatedSection animation="fade-up" duration={800} threshold={0.08} easing="gentle">
                  <ProductZoneCard zone={zone} index={index} products={products} />
                </AnimatedSection>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          SECTION 4: Design Blueprint
          ========================================== */}
      <section
        className="section relative overflow-hidden bg-[#0a1628] dark:bg-dark-950"
      >
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

      {/* ==========================================
          SECTION 5: CTA Section
          ========================================== */}
      <section className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-dark-900">
        {/* Breathing ambient blobs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary-400/20 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-dark-900/30 blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.2, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="container-xl relative z-10">
          <ScrollReveal animation="scaleUp">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Transform{' '}
                <span className="text-shimmer">Your Kitchen?</span>
              </h2>
              <p className="text-lg text-white/70 mb-10 leading-relaxed">
                From blueprint to reality — let Fischer bring your dream kitchen to life
                with premium European-inspired appliances, built for Pakistan.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/shop"
                  className="btn-elastic shine-sweep inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:bg-dark-50"
                >
                  Shop Now
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
                <Link
                  to="/contact"
                  className="btn-elastic inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 hover:border-white/60 text-white rounded-xl font-semibold text-lg transition-all duration-300"
                >
                  Contact Us
                </Link>
                <Link
                  to="/find-dealer"
                  className="btn-elastic inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 hover:border-white/60 text-white rounded-xl font-semibold text-lg transition-all duration-300"
                >
                  Visit Showroom
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  )
}
