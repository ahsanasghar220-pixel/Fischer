import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useRef } from 'react'
import {
  SparklesIcon,
  ArrowRightIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'
import api from '@/lib/api'
import ScrollReveal, { TextReveal } from '@/components/effects/ScrollReveal'
import { useIsTouchDevice } from '@/hooks/useIsTouchDevice'
import type { Product } from '@/types'
import ExperienceViewer from './ExperienceViewer'
import ProductZonesSection from './ProductOverlay'

// ─── Ambient Particles ────────────────────────────────────────────────────────

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

// ─── Main Page ────────────────────────────────────────────────────────────────

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

      {/* Hero - Cinematic Entrance */}
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
              {/* Empty span for shimmer line effect under heading */}
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

      {/* Interactive Kitchen Viewer + Blueprint */}
      <ExperienceViewer />

      {/* Product Zone Showcase */}
      <ProductZonesSection products={products} />

      {/* CTA Section */}
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
