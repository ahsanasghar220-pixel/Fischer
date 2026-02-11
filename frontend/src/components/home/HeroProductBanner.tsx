import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'

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
    images: ['/images/products/hood.png'], // Single image - no carousel
    href: '/category/built-in-hoods',
    description: 'Powerful airflow up to 1500 m³/h',
  },
  {
    name: 'Built-in Hob',
    category: 'Cooking Solutions',
    images: ['/images/products/hob.png'], // Single image - no carousel
    href: '/category/built-in-hobs',
    description: 'Premium brass burners with auto ignition',
  },
  {
    name: 'Oven Toaster',
    category: 'Baking Excellence',
    images: ['/images/products/oven-toasters/fot-2501c.jpg'], // Single image - no carousel
    href: '/category/oven-toasters',
    description: 'Convection technology, 35L-48L capacity',
  },
  {
    name: 'Air Fryer',
    category: 'Healthy Living',
    images: ['/images/products/air-fryer.png'], // Single image - no carousel
    href: '/category/air-fryers',
    description: 'Oil-free frying with digital controls',
  },
  {
    name: 'Water Dispenser',
    category: 'Water Solutions',
    images: ['/images/products/water-dispensers/fwd-1150.jpeg'], // Single image - no carousel
    href: '/category/water-dispensers',
    description: 'Hot & cold, food-grade stainless steel',
  },
]

// Product Card with Image Carousel
function ProductCard({ product, index }: { product: ProductHighlight; index: number }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  // Auto-cycle images on hover
  useEffect(() => {
    if (!isHovered || product.images.length <= 1) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
    }, 1500) // Change image every 1.5 seconds

    return () => clearInterval(interval)
  }, [isHovered, product.images.length])

  // Reset to first image when hover ends
  useEffect(() => {
    if (!isHovered) {
      setCurrentImageIndex(0)
    }
  }, [isHovered])

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
        className="block bg-white dark:bg-dark-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
      >
        {/* Image Container with Carousel */}
        <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-700 dark:to-dark-600 p-6 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={product.images[currentImageIndex]}
              alt={`${product.name} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-contain"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%239ca3af"%3EImage%3C/text%3E%3C/svg%3E'
              }}
            />
          </AnimatePresence>

          {/* Image Indicators (Dots) */}
          {product.images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
        <div className="p-6">
          <div className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2">
            {product.category}
          </div>
          <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-dark-600 dark:text-dark-400 mb-4 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold text-sm">
            Explore
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function HeroProductBanner() {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-dark-50 via-white to-primary-50/30 dark:from-dark-900 dark:via-dark-900 dark:to-dark-800">
      <div className="container-xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 lg:mb-16"
        >
          <span className="inline-block px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm font-semibold mb-4">
            Our Bestsellers
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-dark-900 dark:text-white font-display mb-4">
            Discover Fischer Essentials
          </h2>
          <p className="text-lg text-dark-600 dark:text-dark-400 max-w-2xl mx-auto">
            Designed Appliances for Modern Living
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4">
          {products.map((product, index) => (
            <ProductCard key={product.name} product={product} index={index} />
          ))}
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
