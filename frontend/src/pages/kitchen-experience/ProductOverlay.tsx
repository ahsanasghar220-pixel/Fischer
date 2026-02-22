import { Link } from 'react-router-dom'
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline'
import AnimatedSection, { StaggeredChildren } from '@/components/ui/AnimatedSection'
import ScrollReveal, { Parallax, HoverCard } from '@/components/effects/ScrollReveal'
import type { Product } from '@/types'

// ─── Kitchen Zone Data ───────────────────────────────────────────────────────

export const kitchenZones = [
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
    description: "Gas and electric water heaters engineered for Pakistan's climate. Multiple safety systems ensure worry-free hot water year-round.",
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
    color: 'from-primary-500 to-primary-600',
    accent: 'bg-primary-500/10',
  },
]

// ─── Product Zone Card ────────────────────────────────────────────────────────

interface ProductZoneCardProps {
  zone: (typeof kitchenZones)[number]
  index: number
  products: Product[]
}

export function ProductZoneCard({ zone, index, products }: ProductZoneCardProps) {
  const isReversed = index % 2 === 1
  const product = products.find((p) => p.category?.slug === zone.categorySlug)

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

// ─── Product Zones Section ────────────────────────────────────────────────────

interface ProductZonesSectionProps {
  products: Product[]
}

export default function ProductZonesSection({ products }: ProductZonesSectionProps) {
  return (
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
  )
}
