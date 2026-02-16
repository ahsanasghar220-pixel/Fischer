import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { useState, useEffect, useCallback } from 'react'
import { useIsTouchDevice } from '@/hooks/useIsTouchDevice'
import { useTouchSwipe } from '@/hooks/useTouchSwipe'
import ProductCarousel from '@/components/products/ProductCarousel'

export interface ProductHighlight {
  name: string
  category: string
  images: string[]
  href: string
  description: string
}

const defaultProducts: ProductHighlight[] = [
  {
    name: 'Built-in Hood',
    category: 'Ventilation Solutions',
    images: [
      '/images/products/kitchen-hoods/FKH-H90-06S/1.webp',
      '/images/products/kitchen-hoods/FKH-T90-04SC/1.webp',
    ],
    href: '/category/kitchen-hoods',
    description: 'Powerful airflow up to 1500 m³/h',
  },
  {
    name: 'Built-in Hob',
    category: 'Cooking Solutions',
    images: [
      '/images/products/kitchen-hobs/FBH-G78-3CB/1.webp',
      '/images/products/kitchen-hobs/FBH-G90-5SBF/1.webp',
      '/images/products/kitchen-hobs/FBH-SS76-3CB/1.webp',
    ],
    href: '/category/kitchen-hobs',
    description: 'Premium brass burners with auto ignition',
  },
  {
    name: 'Oven Toaster',
    category: 'Baking Excellence',
    images: [
      '/images/products/oven-toasters/FOT-2501C/1.webp',
      '/images/products/oven-toasters/FOT-2501C/2.webp',
      '/images/products/oven-toasters/FOT-1901D/1.webp',
    ],
    href: '/category/oven-toasters',
    description: 'Convection technology, 35L-48L capacity',
  },
  {
    name: 'Air Fryer',
    category: 'Healthy Living',
    images: [
      '/images/products/air-fryers/FAF-801WD/1.webp',
      '/images/products/air-fryers/FAF-601WD/1.webp',
      '/images/products/air-fryers/FAF-401WD/1.webp',
    ],
    href: '/category/air-fryers',
    description: 'Oil-free frying with digital controls',
  },
  {
    name: 'Water Dispenser',
    category: 'Water Solutions',
    images: [
      '/images/products/water-dispensers/1.webp',
      '/images/products/water-dispensers/2.webp',
      '/images/products/water-dispensers/3.webp',
    ],
    href: '/category/water-dispensers',
    description: 'Hot & cold, food-grade stainless steel',
  },
]

// Product Card with Image Carousel
function ProductCard({ product }: { product: ProductHighlight }) {
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
    <div
      className="group h-full py-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        to={product.href}
        className="block bg-white dark:bg-dark-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full flex flex-col"
      >
        {/* Image Container with Carousel */}
        <div
          className="h-[150px] md:h-[220px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-700 dark:to-dark-600 p-3 md:p-6 relative overflow-hidden flex-shrink-0 flex items-center justify-center"
          {...(isTouchDevice ? swipeHandlers : {})}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={product.images[currentImageIndex]}
              alt={`${product.name} - Image ${currentImageIndex + 1}`}
              width={220}
              height={220}
              loading="lazy"
              decoding="async"
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
                      : 'bg-gray-500 dark:bg-dark-400'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-3 md:p-5 flex-grow flex flex-col gap-0.5 md:gap-1">
          <div className="text-[10px] md:text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
            {product.category}
          </div>
          <h3 className="text-sm md:text-lg font-bold text-dark-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-snug">
            {product.name}
          </h3>
          <div className="flex items-center gap-1.5 text-primary-600 dark:text-primary-400 font-semibold text-xs md:text-sm mt-auto pt-1">
            Explore
            <ArrowRightIcon className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </div>
  )
}

interface HeroProductBannerProps {
  products?: ProductHighlight[]
  title?: string
  subtitle?: string
  badgeText?: string
}

export default function HeroProductBanner({ products: propProducts, title, subtitle, badgeText }: HeroProductBannerProps) {
  const products = propProducts?.length ? propProducts : defaultProducts

  return (
    <section className="py-10 md:py-16 lg:py-24 bg-gradient-to-br from-dark-50 via-white to-primary-50/30 dark:from-dark-900 dark:via-dark-900 dark:to-dark-800 overflow-hidden">
      {/* Section Header */}
      <div className="container-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 md:mb-12 lg:mb-16 px-4"
        >
          <span className="inline-block px-3 py-1.5 md:px-4 md:py-2 bg-primary-500/20 dark:bg-primary-900/30 text-primary-800 dark:text-primary-400 rounded-full text-xs md:text-sm font-semibold mb-3 md:mb-4">
            {badgeText || 'Our Bestsellers'}
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold text-dark-900 dark:text-white font-display mb-2 md:mb-4">
            {title || 'Discover Fischer Essentials'}
          </h2>
          <p className="text-sm md:text-lg text-dark-600 dark:text-dark-400 max-w-2xl mx-auto">
            {subtitle || 'Designed Appliances for Modern Living'}
          </p>
        </motion.div>
      </div>

      {/* Products Carousel - full-width edge-to-edge, outside container */}
      <ProductCarousel speed={60} fadeClass="from-dark-50 dark:from-dark-900">
        {products.map((product) => (
          <ProductCard key={product.name} product={product} />
        ))}
      </ProductCarousel>

      {/* CTA Button */}
      <div className="container-xl">
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
