import { memo, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { EyeIcon, ShoppingCartIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { formatPrice, formatDescription } from '@/lib/utils'
import { HoverCard } from '@/components/effects/ScrollReveal'
import type { Bundle } from '@/api/bundles.types'

interface BundleCardProps {
  bundle: Bundle
  onQuickView?: (bundle: Bundle) => void
  onAddToCart?: (bundle: Bundle) => void
  showQuickActions?: boolean
}

const BundleCard = memo(function BundleCard({
  bundle,
  onQuickView,
  onAddToCart,
  showQuickActions = true,
}: BundleCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Check if any products in the bundle are out of stock
  const hasOutOfStockItems = useMemo(() => {
    // Check products_preview for OOS items
    if (bundle.products_preview?.some((p) => p.is_in_stock === false)) return true
    // Check bundle items (fixed bundles)
    if (bundle.items?.some((item) => item.product?.is_in_stock === false)) return true
    // Check slot products (configurable bundles)
    if (bundle.slots?.some((slot) =>
      slot.products?.some((sp) => sp.product?.is_in_stock === false)
    )) return true
    return false
  }, [bundle])

  // Helper to get proper image URL with fallback chain
  const getImageUrl = () => {
    let imageUrl = bundle.featured_image

    // Fallback 1: First bundle image
    if (!imageUrl && bundle.images && bundle.images.length > 0) {
      imageUrl = bundle.images[0].image
    }

    // Fallback 2: First product preview image
    if (!imageUrl && bundle.products_preview && bundle.products_preview.length > 0) {
      imageUrl = bundle.products_preview[0].image
    }

    // Fallback 3: Default placeholder
    if (!imageUrl) {
      return '/images/all-products.webp'
    }

    // For /storage/ paths, prepend the API base URL so they resolve correctly
    if (imageUrl.startsWith('/storage/')) {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      return `${apiBase}${imageUrl}`
    }

    return imageUrl
  }

  // Helper to resolve product preview image URLs
  const getProductImageUrl = (image: string | null): string | null => {
    if (!image) return null
    if (image.startsWith('/storage/')) {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      return `${apiBase}${image}`
    }
    return image
  }

  const getBadgeColor = (color: string) => {
    const colors: Record<string, string> = {
      gold: 'bg-gradient-to-r from-primary-500 to-primary-400 text-white',
      red: 'bg-gradient-to-r from-primary-500 to-primary-400 text-white',
      blue: 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white',
      green: 'bg-gradient-to-r from-green-500 to-emerald-400 text-white',
    }
    return colors[color] || colors.gold
  }

  // Format countdown
  const getCountdownText = () => {
    if (!bundle.time_remaining) return null
    const { days, hours, minutes } = bundle.time_remaining
    if (days > 0) return `${days}d ${hours}h left`
    if (hours > 0) return `${hours}h ${minutes}m left`
    return `${minutes}m left`
  }

  return (
    <HoverCard intensity={8}>
      <motion.div
        className="group relative bg-white dark:bg-dark-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-dark-100 to-dark-50 dark:from-dark-800 dark:to-dark-900">
          {/* Main Image */}
          <img
            src={getImageUrl()}
            alt={bundle.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              const target = e.currentTarget
              const fallbackUrl = '/images/all-products.webp'
              // Prevent infinite loop - only set fallback once
              if (!target.src.includes('all-products.webp')) {
                target.src = fallbackUrl
              }
            }}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

          {/* Badge */}
          {bundle.badge_label && (
            <motion.div
              className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg ${getBadgeColor(bundle.badge_color)}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {bundle.badge_label}
            </motion.div>
          )}

          {/* Countdown Timer */}
          {bundle.show_countdown && bundle.time_remaining && (
            <motion.div
              className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-primary-500/90 backdrop-blur-sm rounded-full text-white text-xs font-medium"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ClockIcon className="w-3.5 h-3.5" />
              {getCountdownText()}
            </motion.div>
          )}

          {/* Out of Stock Badge */}
          {hasOutOfStockItems && (
            <motion.div
              className={`absolute ${bundle.show_countdown && bundle.time_remaining ? 'top-12' : 'top-4'} right-4 flex items-center gap-1 px-2.5 py-1 bg-red-500/90 backdrop-blur-sm rounded-full text-white text-[10px] font-semibold`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <ExclamationTriangleIcon className="w-3 h-3" />
              Contains out-of-stock items
            </motion.div>
          )}

          {/* Products Preview */}
          <motion.div
            className="absolute bottom-4 left-4 right-4 flex items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0.8, y: isHovered ? 0 : 10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center -space-x-2">
              {bundle.products_preview?.slice(0, 4).map((product, index) => (
                <div
                  key={product.id}
                  className="w-12 h-12 flex-shrink-0 rounded-lg bg-white dark:bg-dark-700 shadow-lg overflow-hidden ring-2 ring-white dark:ring-dark-600"
                  style={{ zIndex: 4 - index }}
                >
                  {product.image ? (
                    <img
                      src={getProductImageUrl(product.image) || ''}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget
                        target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-dark-100 dark:bg-dark-600" />
                  )}
                </div>
              ))}
            </div>
            {bundle.products_preview && bundle.products_preview.length > 4 && (
              <span className="text-white text-xs font-medium ml-2">
                +{bundle.products_preview.length - 4} more
              </span>
            )}
          </motion.div>

          {/* Quick Actions */}
          {showQuickActions && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {onQuickView && (
                <motion.button
                  onClick={(e) => {
                    e.preventDefault()
                    onQuickView(bundle)
                  }}
                  aria-label="Quick view"
                  className="p-3 bg-white/90 backdrop-blur-sm rounded-full text-dark-800 hover:bg-white hover:scale-110 transition-all shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <EyeIcon className="w-5 h-5" />
                </motion.button>
              )}
              {bundle.bundle_type === 'fixed' && onAddToCart && (
                <motion.button
                  onClick={(e) => {
                    e.preventDefault()
                    if (!hasOutOfStockItems) onAddToCart(bundle)
                  }}
                  aria-label={hasOutOfStockItems ? 'Cannot add to cart - contains out-of-stock items' : 'Add to cart'}
                  title={hasOutOfStockItems ? 'Cannot add to cart - contains out-of-stock items' : 'Add to cart'}
                  className={`p-2.5 rounded-full text-white transition-all shadow-lg ${
                    hasOutOfStockItems
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-primary-500 hover:bg-primary-600 hover:scale-110'
                  }`}
                  whileHover={hasOutOfStockItems ? {} : { scale: 1.1 }}
                  whileTap={hasOutOfStockItems ? {} : { scale: 0.95 }}
                >
                  <ShoppingCartIcon className="w-4 h-4" />
                </motion.button>
              )}
            </motion.div>
          )}
        </div>

        {/* Content */}
        <Link to={`/bundle/${bundle.slug}`} className="block p-5">
          {/* Bundle Type Badge */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
              bundle.bundle_type === 'fixed'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
            }`}>
              {bundle.bundle_type === 'fixed' ? 'Fixed Bundle' : 'Build Your Own'}
            </span>
            {bundle.stock_remaining !== null && bundle.stock_remaining < 10 && (
              <span className="text-[10px] font-bold text-primary-700 dark:text-primary-400">
                Only {bundle.stock_remaining} left!
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-bold text-lg text-dark-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {bundle.name}
          </h3>

          {/* Short Description */}
          {bundle.short_description && (
            <div className="text-sm text-dark-500 dark:text-dark-400 mb-3 space-y-0.5">
              {formatDescription(bundle.short_description).slice(0, 2).map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          )}

          {/* Pricing */}
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-dark-900 dark:text-white">
                  {formatPrice(bundle.discounted_price)}
                </span>
                {bundle.savings > 0 && (
                  <span className="text-sm text-dark-400 line-through">
                    {formatPrice(bundle.original_price)}
                  </span>
                )}
              </div>
              {bundle.show_savings && bundle.savings > 0 && (
                <motion.div
                  className="flex items-center gap-1 mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                    Save {formatPrice(bundle.savings)}
                  </span>
                  <span className="text-xs text-green-600/70 dark:text-green-400/70">
                    ({bundle.savings_percentage.toFixed(0)}% off)
                  </span>
                </motion.div>
              )}
            </div>

            {/* CTA Arrow */}
            <motion.div
              className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: isHovered ? 1 : 0.9, opacity: isHovered ? 1 : 0.7 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.div>
          </div>
        </Link>
      </motion.div>
    </HoverCard>
  )
})

export default BundleCard
