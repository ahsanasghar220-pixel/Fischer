import { memo, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import BundleCard from './BundleCard'
import type { Bundle } from '@/api/bundles'

interface BundleCarouselProps {
  bundles: Bundle[]
  title?: string
  subtitle?: string
  autoPlay?: boolean
  autoPlayInterval?: number
  onQuickView?: (bundle: Bundle) => void
  onAddToCart?: (bundle: Bundle) => void
}

const BundleCarousel = memo(function BundleCarousel({
  bundles,
  title = 'Bundle Offers',
  subtitle,
  autoPlay = true,
  autoPlayInterval = 5000,
  onQuickView,
  onAddToCart,
}: BundleCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [direction, setDirection] = useState(0)

  const itemsPerView = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  }

  // Get visible items count based on screen size (simplified for SSR)
  const getVisibleCount = () => {
    if (typeof window === 'undefined') return itemsPerView.desktop
    if (window.innerWidth < 640) return itemsPerView.mobile
    if (window.innerWidth < 1024) return itemsPerView.tablet
    return itemsPerView.desktop
  }

  const [visibleCount, setVisibleCount] = useState(getVisibleCount())

  useEffect(() => {
    const handleResize = () => setVisibleCount(getVisibleCount())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const maxIndex = Math.max(0, bundles.length - visibleCount)

  const goToNext = useCallback(() => {
    setDirection(1)
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }, [maxIndex])

  const goToPrev = useCallback(() => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }, [maxIndex])

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }

  // Auto-play
  useEffect(() => {
    if (!autoPlay || isPaused || bundles.length <= visibleCount) return

    const interval = setInterval(goToNext, autoPlayInterval)
    return () => clearInterval(interval)
  }, [autoPlay, isPaused, autoPlayInterval, goToNext, bundles.length, visibleCount])

  if (bundles.length === 0) return null

  // Adjust visible count based on actual bundle count to prevent duplication
  const actualVisibleCount = Math.min(visibleCount, bundles.length)
  const visibleBundles = bundles.slice(currentIndex, currentIndex + actualVisibleCount)

  // Only loop bundles if we have more than what's visible and we're at the end
  if (visibleBundles.length < actualVisibleCount && bundles.length > actualVisibleCount) {
    const remaining = actualVisibleCount - visibleBundles.length
    visibleBundles.push(...bundles.slice(0, remaining))
  }

  return (
    <section
      className="relative py-12 lg:py-20"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header */}
      <div className="container mx-auto px-4 mb-8">
        <div className="flex items-end justify-between">
          <div>
            <motion.h2
              className="text-3xl lg:text-4xl font-bold text-dark-900 dark:text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {title}
            </motion.h2>
            {subtitle && (
              <motion.p
                className="mt-2 text-dark-500 dark:text-dark-400"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                {subtitle}
              </motion.p>
            )}
          </div>

          {/* Navigation Arrows */}
          {bundles.length > visibleCount && (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={goToPrev}
                className="p-3 rounded-full bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-300 hover:bg-primary-500 hover:text-white transition-all duration-300"
                aria-label="Previous"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button
                onClick={goToNext}
                className="p-3 rounded-full bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-300 hover:bg-primary-500 hover:text-white transition-all duration-300"
                aria-label="Next"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Carousel Container */}
      <div className="container mx-auto px-4 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            className={`grid gap-6 ${
              visibleCount === 1 ? 'grid-cols-1' :
              visibleCount === 2 ? 'grid-cols-2' :
              'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}
            initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {visibleBundles.map((bundle, index) => (
              <motion.div
                key={`${bundle.id}-${currentIndex}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <BundleCard
                  bundle={bundle}
                  onQuickView={onQuickView}
                  onAddToCart={onAddToCart}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots Indicator */}
      {bundles.length > visibleCount && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 h-2 bg-primary-500 rounded-full'
                  : 'w-2 h-2 bg-dark-300 dark:bg-dark-600 rounded-full hover:bg-primary-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Mobile Swipe Hint */}
      {bundles.length > 1 && (
        <p className="text-center text-xs text-dark-400 dark:text-dark-500 mt-4 sm:hidden">
          Swipe to see more
        </p>
      )}
    </section>
  )
})

export default BundleCarousel
