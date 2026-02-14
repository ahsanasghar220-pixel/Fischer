import { memo, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

export interface BannerSlide {
  image: string
  imageAlt?: string
  title?: string
  subtitle?: string
  description?: string
  ctaText?: string
  ctaLink?: string
  textPosition?: 'left' | 'center' | 'right'
  overlay?: boolean
}

interface BannerCarouselProps {
  slides: BannerSlide[]
  autoPlay?: boolean
  autoPlayInterval?: number
  height?: 'sm' | 'md' | 'lg' | 'xl'
}

const heightClasses = {
  sm: 'aspect-[16/5] md:aspect-auto md:h-[400px]',
  md: 'aspect-[16/5] md:aspect-auto md:h-[500px]',
  lg: 'aspect-[16/5] md:aspect-auto md:h-[600px]',
  xl: 'aspect-[16/5] md:aspect-auto md:h-[700px]',
}

const positionClasses = {
  left: 'items-start text-left',
  center: 'items-center text-center',
  right: 'items-end text-right',
}

const BannerCarousel = memo(function BannerCarousel({
  slides,
  autoPlay = true,
  autoPlayInterval = 5000,
  height = 'lg',
}: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [direction, setDirection] = useState(0)

  const goToNext = useCallback(() => {
    setDirection(1)
    setCurrentIndex((prev) => (prev >= slides.length - 1 ? 0 : prev + 1))
  }, [slides.length])

  const goToPrev = useCallback(() => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev <= 0 ? slides.length - 1 : prev - 1))
  }, [slides.length])

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }

  // Auto-play
  useEffect(() => {
    if (!autoPlay || isPaused || slides.length <= 1) return

    const interval = setInterval(goToNext, autoPlayInterval)
    return () => clearInterval(interval)
  }, [autoPlay, isPaused, autoPlayInterval, goToNext, slides.length])

  if (slides.length === 0) return null

  const slide = slides[currentIndex]
  const textPos = slide.textPosition ?? 'center'
  const showOverlay = slide.overlay !== false

  return (
    <div
      className={`relative w-full ${heightClasses[height]} overflow-hidden bg-dark-900`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentIndex}
          className="absolute inset-0"
          initial={{ opacity: 0, x: direction > 0 ? 80 : -80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction > 0 ? -80 : 80 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Background Image */}
          <img
            src={slide.image}
            alt={slide.imageAlt ?? 'Banner'}
            className="w-full h-full object-contain md:object-cover"
          />

          {/* Overlay */}
          {showOverlay && (
            <div className="absolute inset-0 bg-gradient-to-r from-dark-900/70 via-dark-900/50 to-dark-900/70" />
          )}

          {/* Content */}
          {(slide.title || slide.subtitle || slide.description) && (
            <div className="absolute inset-0 flex items-center">
              <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`flex flex-col ${positionClasses[textPos]} space-y-2 md:space-y-6`}>
                  {slide.subtitle && (
                    <motion.p
                      className="text-primary-400 text-xs md:text-base font-semibold tracking-wider uppercase"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {slide.subtitle}
                    </motion.p>
                  )}

                  {slide.title && (
                    <motion.h2
                      className="text-xl md:text-5xl lg:text-6xl font-bold text-white max-w-4xl"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {slide.title}
                    </motion.h2>
                  )}

                  {slide.description && (
                    <motion.p
                      className="text-sm md:text-xl text-white/90 max-w-2xl"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      {slide.description}
                    </motion.p>
                  )}

                  {slide.ctaText && slide.ctaLink && (
                    <motion.div
                      className="pt-1 md:pt-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Link
                        to={slide.ctaLink}
                        className="inline-flex items-center gap-1.5 px-4 py-2 md:px-8 md:py-4 text-sm md:text-base bg-primary-500 hover:bg-primary-400
                                 text-dark-900 font-bold rounded-xl transition-all duration-300
                                 hover:scale-105 hover:shadow-xl hover:shadow-primary-500/50"
                      >
                        {slide.ctaText}
                        <ArrowRightIcon className="w-4 h-4 md:w-5 md:h-5" />
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Arrow Navigation */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-10 p-2 md:p-3 rounded-full
                     bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition-all duration-300"
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-10 p-2 md:p-3 rounded-full
                     bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition-all duration-300"
            aria-label="Next slide"
          >
            <ChevronRightIcon className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'w-8 h-2 bg-primary-500'
                  : 'w-2 h-2 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
})

export default BannerCarousel
