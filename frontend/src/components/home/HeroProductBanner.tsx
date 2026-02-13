import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { useState, useEffect, useCallback } from 'react'
import { useIsTouchDevice } from '@/hooks/useIsTouchDevice'
import { useTouchSwipe } from '@/hooks/useTouchSwipe'

interface ProductHighlight {
  name: string
  category: string
  images: string[]  // Changed from image to images array
  href: string
  description: string
}

const products: ProductHighlight[] = [
  {
    name: 'Built-in Hood',
    category: 'Ventilation Solutions',
    images: [
      '/images/products/kitchen-hoods/fkh-h90-06s.webp',
      '/images/products/kitchen-hoods/fkh-t90-04sc.webp',
    ],
    href: '/category/built-in-hoods',
    description: 'Powerful airflow up to 1500 m³/h',
  },
  {
    name: 'Built-in Hob',
    category: 'Cooking Solutions',
    images: [
      '/images/products/kitchen-hobs/fbh-g78-3cb.webp',
      '/images/products/kitchen-hobs/fbh-g90-5sbf.webp',
      '/images/products/kitchen-hobs/fbh-ss76-3cb.webp',
    ],
    href: '/category/built-in-hobs',
    description: 'Premium brass burners with auto ignition',
  },
  {
    name: 'Oven Toaster',
    category: 'Baking Excellence',
    images: [
      '/images/products/oven-toasters/fot-2501c-full.webp',
      '/images/products/oven-toasters/fot-2501c-lit.webp',
      '/images/products/oven-toasters/fot-1901d-full.webp',
    ],
    href: '/category/oven-toasters',
    description: 'Convection technology, 35L-48L capacity',
  },
  {
    name: 'Air Fryer',
    category: 'Healthy Living',
    images: [
      '/images/products/air-fryers/faf-801wd.webp',
      '/images/products/air-fryers/faf-601wd.webp',
      '/images/products/air-fryers/faf-401wd.webp',
    ],
    href: '/category/air-fryers',
    description: 'Oil-free frying with digital controls',
  },
  {
    name: 'Water Dispenser',
    category: 'Water Solutions',
    images: [
      '/images/products/water-dispensers/fwd-1150.webp',
      '/images/products/water-dispensers/fwd-bottle.webp',
      '/images/products/water-dispensers/fwd-fountain.webp',
    ],
    href: '/category/water-dispensers',
    description: 'Hot & cold, food-grade stainless steel',
  },
]

// Product Card with Image Carousel
function ProductCard({ product, index }: { product: ProductHighlight; index: number }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const isTouchDevice = useIsTouchDevice()

  // Auto-cycle images on hover (desktop only)
  useEffect(() => {
    if (isTouchDevice || !isHovered || product.images.length <= 1) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
    }, 1500)

    return () => clearInterval(interval)
  }, [isHovered, product.images.length, isTouchDevice])

  // Reset to first image when hover ends (desktop only)
  useEffect(() => {
    if (!isHovered && !isTouchDevice) {
      setCurrentImageIndex(0)
    }
  }, [isHovered, isTouchDevice])

  // Swipe support for touch devices
  const swipeHandlers = useTouchSwipe({
    onSwipeLeft: useCallback(() => {
      if (product.images.length > 1) {
        setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
      }
    }, [product.images.length]),
    onSwipeRight: useCallback(() => {
      if (product.images.length > 1) {
        setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)
      }
    }, [product.images.length]),
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        to={product.href}
        className="block bg-white dark:bg-dark-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full flex flex-col min-h-[340px] md:min-h-[380px]"
      >
        {/* Image Container with Carousel */}
        <div
          className="h-[180px] md:h-[220px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-700 dark:to-dark-600 p-4 md:p-6 relative overflow-hidden flex-shrink-0 flex items-center justify-center"
          {...(isTouchDevice ? swipeHandlers : {})}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={product.images[currentImageIndex]}
              alt={`${product.name} - Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </AnimatePresence>

          {/* Image Indicators (Dots) - always visible on mobile */}
          {product.images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
              {product.images.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentImageIndex
                      ? 'bg-primary-500 w-4'
                      : 'bg-gray-400 dark:bg-dark-400'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 flex-grow flex flex-col">
          <div className="text-[10px] md:text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1 md:mb-2">
            {product.category}
          </div>
          <h3 className="text-base md:text-xl font-bold text-dark-900 dark:text-white mb-1 md:mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-tight">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold text-xs md:text-sm mt-auto">
            Explore
            <ArrowRightIcon className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function HeroProductBanner() {
  return (
    <section className="py-12 md:py-16 lg:py-24 bg-gradient-to-br from-dark-50 via-white to-primary-50/30 dark:from-dark-900 dark:via-dark-900 dark:to-dark-800">
      <div className="container-xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12 lg:mb-16 px-4"
        >
          <span className="inline-block px-3 py-1.5 md:px-4 md:py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-xs md:text-sm font-semibold mb-3 md:mb-4">
            Our Bestsellers
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold text-dark-900 dark:text-white font-display mb-2 md:mb-4">
            Discover Fischer Essentials
          </h2>
          <p className="text-sm md:text-lg text-dark-600 dark:text-dark-400 max-w-2xl mx-auto">
            Designed Appliances for Modern Living
          </p>
        </motion.div>

        {/* Products Grid - Horizontal scroll on mobile, grid on larger screens */}
        <div className="relative">
          <div className="md:grid md:grid-cols-2 lg:grid-cols-5 md:gap-6 lg:gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory scrollbar-hide pb-4 md:pb-0 -mx-4 md:mx-0">
            <div className="flex md:contents gap-4 md:gap-6 lg:gap-4 px-4 md:px-0">
              {products.map((product, index) => (
                <div key={product.name} className="flex-shrink-0 w-[260px] sm:w-[280px] md:w-auto snap-center md:snap-align-none">
                  <ProductCard product={product} index={index} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700
                     text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
          >
            View All Products
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
