import { memo } from 'react'
import { motion } from 'framer-motion'
import { StaggerContainer, StaggerItem } from '@/components/effects/ScrollReveal'
import BundleCard from './BundleCard'
import type { Bundle } from '@/api/bundles.types'

interface BundleGridProps {
  bundles: Bundle[]
  title?: string
  subtitle?: string
  columns?: 2 | 3 | 4
  onQuickView?: (bundle: Bundle) => void
  onAddToCart?: (bundle: Bundle) => void
}

const BundleGrid = memo(function BundleGrid({
  bundles,
  title = 'Featured Bundles',
  subtitle,
  columns = 3,
  onQuickView,
  onAddToCart,
}: BundleGridProps) {
  if (bundles.length === 0) return null

  const gridCols = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }

  return (
    <section className="py-12 lg:py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <motion.h2
                className="text-3xl lg:text-4xl font-bold text-dark-900 dark:text-white"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                {title}
              </motion.h2>
            )}
            {subtitle && (
              <motion.p
                className="mt-3 text-lg text-dark-500 dark:text-dark-400 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                {subtitle}
              </motion.p>
            )}
          </div>
        )}

        {/* Grid */}
        <StaggerContainer
          className={`grid grid-cols-1 ${gridCols[columns]} gap-6 lg:gap-8`}
          staggerDelay={0.1}
        >
          {bundles.map((bundle) => (
            <StaggerItem key={bundle.id}>
              <BundleCard
                bundle={bundle}
                onQuickView={onQuickView}
                onAddToCart={onAddToCart}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
})

export default BundleGrid
