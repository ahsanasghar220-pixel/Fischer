import { memo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import AnimatedSection from '@/components/ui/AnimatedSection'
import type { Category } from './types'

// Get features for a category - prefer API data, fallback to defaults
function getCategoryFeatures(category: Category): string[] {
  if (category.features && category.features.length > 0) {
    return category.features
  }
  return ['Premium Quality', 'Energy Efficient', '1 Year Warranty', 'Latest Technology']
}

// Category Showcase - Clean Split-Screen Layout
interface CategoryShowcaseProps {
  category: Category
  index: number
  categoryVideos: Record<string, string>
  isMobile?: boolean
}

const CategoryShowcase = memo(function CategoryShowcase({
  category,
  index,
  categoryVideos,
  isMobile = false,
}: CategoryShowcaseProps) {
  const ref = useRef(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)
  // Load video when it's near the viewport (once), play/pause as it enters/exits
  const isNearViewport = useInView(videoContainerRef, { once: true, margin: '200px 0px' })
  const isVideoInView = useInView(videoContainerRef, { once: false, amount: 0.3 })
  const isEven = index % 2 === 0
  const videoSrc = categoryVideos[category.slug]

  // Auto-play video when in view (desktop only)
  useEffect(() => {
    if (isMobile) return
    const video = videoRef.current
    if (!video || !videoSrc) return

    if (isVideoInView) {
      video.play().catch(() => {
        // Video autoplay prevented - user interaction required
      })
    } else {
      video.pause()
    }
  }, [isVideoInView, videoSrc, isMobile])

  return (
    <motion.div
      ref={ref}
      // On mobile: skip animation (initial=false renders at animate values immediately, no JS animation frames)
      initial={isMobile ? false : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        isMobile
          ? { duration: 0 }
          : {
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }
      }
      className={`grid grid-cols-2 gap-3 sm:gap-5 md:gap-8 lg:gap-14 items-center ${!isEven ? 'flex-row-reverse' : ''}`}
    >
      {/* Video/Image Side */}
      <div ref={videoContainerRef} className={`relative ${!isEven ? 'order-2' : ''}`}>
        <div className="relative aspect-video rounded-lg sm:rounded-xl overflow-hidden shadow-sm sm:shadow-xl bg-dark-100 dark:bg-dark-900">
          {!isMobile && videoSrc && isNearViewport ? (
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-100 to-dark-200 dark:from-dark-800 dark:to-dark-900">
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="text-dark-400 dark:text-dark-600 text-sm">{category.name}</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content Side */}
      <div className={`${!isEven ? 'order-1' : ''}`}>
        <div className="space-y-1.5 sm:space-y-4 md:space-y-6">
          <h3 className="text-sm sm:text-xl md:text-2xl lg:text-4xl font-bold text-dark-900 dark:text-white leading-tight">
            {category.name}
          </h3>

          {/* Features list — 3 on mobile, 6 on sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-3 md:gap-4">
            {getCategoryFeatures(category)
              .slice(0, 6)
              .map((feature, i) => (
                <div key={i} className={`items-center gap-1 sm:gap-3 min-w-0 ${i >= 3 ? 'hidden sm:flex' : 'flex'}`}>
                  <div className="w-3 h-3 sm:w-5 sm:h-5 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircleIcon className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                  </div>
                  <span className="text-dark-700 dark:text-dark-300 text-[10px] sm:text-sm md:text-base font-medium line-clamp-1">{feature}</span>
                </div>
              ))}
          </div>

          {/* CTA — text link on mobile, filled button on sm+ */}
          <div className="pt-0.5 sm:pt-2">
            <Link
              to={`/category/${category.slug}`}
              className="group inline-flex items-center gap-1 sm:gap-2
                         text-primary-600 dark:text-primary-400 text-[11px] font-semibold
                         sm:px-5 sm:py-2.5 md:px-6 md:py-3 sm:rounded-xl
                         sm:bg-primary-500 sm:dark:bg-primary-600 sm:text-white sm:text-sm md:text-base
                         sm:hover:bg-primary-600 sm:dark:hover:bg-primary-700
                         sm:hover:shadow-lg sm:hover:-translate-y-0.5
                         transition-all duration-300"
            >
              <span className="sm:hidden">View all</span>
              <span className="hidden sm:inline">Explore {category.name}</span>
              <ArrowRightIcon className="w-2.5 h-2.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 sm:group-hover:translate-x-0 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
})

interface CategoriesSectionProps {
  categories: Category[]
  videoCategories?: Category[]
  categoryVideos: Record<string, string>
  isMobile: boolean
  title?: string
  subtitle?: string
}

export default function CategoriesSection({
  categories,
  videoCategories,
  categoryVideos,
  isMobile,
  title = 'Explore Our Collections',
  subtitle = 'Each category carefully curated with premium quality and innovative designs',
}: CategoriesSectionProps) {
  if (categories.length === 0) return null

  const displayCategories = videoCategories?.length
    ? videoCategories
    : categories.filter((c) => categoryVideos[c.slug])

  return (
    <section className="section bg-white dark:bg-dark-900">
      <div className="container-xl">
        <AnimatedSection animation="fade-up" duration={800} easing="gentle">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-dark-900 dark:text-white mb-4">
              {title}
            </h2>
            <p className="text-lg text-dark-600 dark:text-dark-400 max-w-2xl mx-auto">{subtitle}</p>
          </div>
        </AnimatedSection>
        <div className="space-y-6 sm:space-y-12 md:space-y-16 lg:space-y-20 overflow-hidden max-w-5xl mx-auto">
          {displayCategories.map((category, index) => (
            <CategoryShowcase
              key={category.id}
              category={category}
              index={index}
              categoryVideos={categoryVideos}
              isMobile={isMobile}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
