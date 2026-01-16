import { memo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCartIcon, ArrowRightIcon, PlayIcon } from '@heroicons/react/24/solid'
import { ClockIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { formatPrice } from '@/lib/utils'
import type { Bundle } from '@/api/bundles'

interface BundleBannerProps {
  bundle: Bundle
  onAddToCart?: (bundle: Bundle) => void
  variant?: 'hero' | 'compact'
  showVideo?: boolean
}

interface CountdownTime {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const BundleBanner = memo(function BundleBanner({
  bundle,
  onAddToCart,
  variant = 'hero',
  showVideo = true,
}: BundleBannerProps) {
  const [countdown, setCountdown] = useState<CountdownTime | null>(null)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  // Calculate countdown
  useEffect(() => {
    if (!bundle.ends_at) return

    const calculateCountdown = () => {
      const endDate = new Date(bundle.ends_at!).getTime()
      const now = Date.now()
      const diff = endDate - now

      if (diff <= 0) {
        setCountdown(null)
        return
      }

      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }

    calculateCountdown()
    const timer = setInterval(calculateCountdown, 1000)
    return () => clearInterval(timer)
  }, [bundle.ends_at])

  const getBadgeColor = (color: string) => {
    const colors: Record<string, string> = {
      gold: 'from-amber-500 to-yellow-400',
      red: 'from-red-500 to-rose-400',
      blue: 'from-blue-500 to-cyan-400',
      green: 'from-green-500 to-emerald-400',
    }
    return colors[color] || colors.gold
  }

  const getThemeGradient = (color: string) => {
    const gradients: Record<string, string> = {
      gold: 'from-amber-900/90 via-amber-800/70 to-transparent',
      red: 'from-red-900/90 via-red-800/70 to-transparent',
      blue: 'from-blue-900/90 via-blue-800/70 to-transparent',
      green: 'from-green-900/90 via-green-800/70 to-transparent',
      purple: 'from-purple-900/90 via-purple-800/70 to-transparent',
    }
    return gradients[color] || 'from-dark-900/90 via-dark-800/70 to-transparent'
  }

  if (variant === 'compact') {
    return (
      <motion.div
        className="relative overflow-hidden rounded-2xl bg-dark-800"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="relative w-full md:w-1/2 aspect-video md:aspect-auto">
            <img
              src={bundle.featured_image || '/placeholder-bundle.jpg'}
              alt={bundle.name}
              className="w-full h-full object-cover"
            />
            {bundle.badge_label && (
              <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide text-white bg-gradient-to-r ${getBadgeColor(bundle.badge_color)}`}>
                {bundle.badge_label}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              {bundle.name}
            </h3>
            <p className="text-dark-300 mb-4 line-clamp-2">
              {bundle.short_description}
            </p>

            {/* Pricing */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl font-bold text-white">
                {formatPrice(bundle.discounted_price)}
              </span>
              {bundle.savings > 0 && (
                <>
                  <span className="text-lg text-dark-400 line-through">
                    {formatPrice(bundle.original_price)}
                  </span>
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-sm font-semibold rounded">
                    Save {bundle.savings_percentage.toFixed(0)}%
                  </span>
                </>
              )}
            </div>

            {/* CTA */}
            <div className="flex gap-3">
              <Link
                to={`/bundle/${bundle.slug}`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors"
              >
                View Bundle
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
              {bundle.bundle_type === 'fixed' && onAddToCart && (
                <button
                  onClick={() => onAddToCart(bundle)}
                  className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                >
                  <ShoppingCartIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // Hero variant (full-width)
  return (
    <motion.section
      className="relative min-h-[500px] lg:min-h-[600px] overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        {/* Video Background */}
        {showVideo && bundle.video_url && isVideoPlaying ? (
          <video
            src={bundle.video_url}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={bundle.featured_image || '/placeholder-bundle.jpg'}
            alt={bundle.name}
            className="w-full h-full object-cover"
          />
        )}

        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-r ${getThemeGradient(bundle.theme_color)}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative container mx-auto px-4 h-full min-h-[500px] lg:min-h-[600px] flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 py-12 lg:py-20">
          {/* Left - Text Content */}
          <motion.div
            className="flex flex-col justify-center"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {/* Badge */}
            {bundle.badge_label && (
              <motion.div
                className={`inline-flex items-center gap-2 w-fit mb-4 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide text-white bg-gradient-to-r ${getBadgeColor(bundle.badge_color)} shadow-lg`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <SparklesIcon className="w-4 h-4" />
                {bundle.badge_label}
              </motion.div>
            )}

            {/* Title */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              {bundle.name}
            </h2>

            {/* Description */}
            {bundle.short_description && (
              <p className="text-lg md:text-xl text-white/80 mb-6 max-w-lg">
                {bundle.short_description}
              </p>
            )}

            {/* Countdown Timer */}
            {bundle.show_countdown && countdown && (
              <motion.div
                className="flex items-center gap-4 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-1.5 text-white/80">
                  <ClockIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">Offer ends in:</span>
                </div>
                <div className="flex gap-2">
                  {[
                    { value: countdown.days, label: 'd' },
                    { value: countdown.hours, label: 'h' },
                    { value: countdown.minutes, label: 'm' },
                    { value: countdown.seconds, label: 's' },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-0.5 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg"
                    >
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={item.value}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="text-xl font-bold text-white min-w-[24px] text-center"
                        >
                          {item.value.toString().padStart(2, '0')}
                        </motion.span>
                      </AnimatePresence>
                      <span className="text-xs text-white/60">{item.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Pricing */}
            <div className="flex items-end gap-4 mb-8">
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl md:text-5xl font-bold text-white">
                    {formatPrice(bundle.discounted_price)}
                  </span>
                  {bundle.savings > 0 && (
                    <span className="text-xl text-white/50 line-through">
                      {formatPrice(bundle.original_price)}
                    </span>
                  )}
                </div>
                {bundle.show_savings && bundle.savings > 0 && (
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/20 backdrop-blur-sm rounded-full">
                    <span className="text-sm font-semibold text-green-400">
                      You save {formatPrice(bundle.savings)} ({bundle.savings_percentage.toFixed(0)}% off)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link
                to={`/bundle/${bundle.slug}`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-primary-500/25 transition-all hover:scale-105"
              >
                {bundle.cta_text || 'View Bundle'}
                <ArrowRightIcon className="w-5 h-5" />
              </Link>

              {bundle.bundle_type === 'fixed' && onAddToCart && (
                <motion.button
                  onClick={() => onAddToCart(bundle)}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold text-lg rounded-xl border border-white/20 transition-all hover:scale-105"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ShoppingCartIcon className="w-5 h-5" />
                  Add to Cart
                </motion.button>
              )}

              {showVideo && bundle.video_url && !isVideoPlaying && (
                <motion.button
                  onClick={() => setIsVideoPlaying(true)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <PlayIcon className="w-5 h-5" />
                  Watch Video
                </motion.button>
              )}
            </div>

            {/* Stock Warning */}
            {bundle.stock_remaining !== null && bundle.stock_remaining < 20 && (
              <motion.p
                className="mt-4 text-sm text-orange-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {bundle.stock_remaining < 5
                  ? `Only ${bundle.stock_remaining} bundles left!`
                  : `Limited stock: ${bundle.stock_remaining} remaining`}
              </motion.p>
            )}
          </motion.div>

          {/* Right - Products Preview */}
          <motion.div
            className="hidden lg:flex items-center justify-center"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <div className="relative">
              {/* Product Cards Stack */}
              <div className="relative w-[400px] h-[400px]">
                {bundle.products_preview?.slice(0, 5).map((product, index) => {
                  const angle = (index - 2) * 15
                  const offsetX = (index - 2) * 30
                  const offsetY = Math.abs(index - 2) * 10
                  const scale = 1 - Math.abs(index - 2) * 0.05
                  const zIndex = 5 - Math.abs(index - 2)

                  return (
                    <motion.div
                      key={product.id}
                      className="absolute top-1/2 left-1/2 w-40 h-48 bg-white dark:bg-dark-700 rounded-2xl shadow-2xl overflow-hidden"
                      style={{
                        transform: `translate(-50%, -50%) translateX(${offsetX}px) translateY(${offsetY}px) rotate(${angle}deg) scale(${scale})`,
                        zIndex,
                      }}
                      initial={{ opacity: 0, y: 50, rotate: angle }}
                      whileInView={{ opacity: 1, y: 0, rotate: angle }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ scale: scale * 1.1, zIndex: 10 }}
                    >
                      <div className="aspect-square overflow-hidden">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 dark:bg-dark-600 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No image</span>
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-medium text-dark-800 dark:text-white truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-dark-500 dark:text-dark-400">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* "Includes X products" badge */}
              {bundle.products_preview && bundle.products_preview.length > 0 && (
                <motion.div
                  className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-white dark:bg-dark-700 rounded-full shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 }}
                >
                  <span className="text-sm font-semibold text-dark-800 dark:text-white">
                    Includes {bundle.products_preview.length} product{bundle.products_preview.length !== 1 ? 's' : ''}
                  </span>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
})

export default BundleBanner
