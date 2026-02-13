import { Link } from 'react-router-dom'
import { HeartIcon, ShoppingCartIcon, EyeIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon, StarIcon } from '@heroicons/react/24/solid'
import { useState, useCallback, memo, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { useIsTouchDevice } from '@/hooks/useIsTouchDevice'
import { useTouchSwipe } from '@/hooks/useTouchSwipe'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { formatPrice } from '@/lib/utils'
import AuthModal from '@/components/ui/AuthModal'

// CSS for shimmer effect - using CSS animations for GPU acceleration
const shimmerStyle = `
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
@keyframes subtle-glow {
  0%, 100% { box-shadow: 0 8px 32px rgba(149, 18, 18, 0.2); }
  50% { box-shadow: 0 12px 40px rgba(139, 64, 73, 0.3); }
}
`

interface Product {
  id: number
  name: string
  slug: string
  price: number
  compare_price?: number | null
  description?: string
  short_description?: string
  primary_image?: string | null
  images?: Array<{ id: number; image?: string; image_path?: string; is_primary: boolean }>
  stock_status: string
  stock?: number
  is_new?: boolean
  is_bestseller?: boolean
  average_rating?: number
  review_count?: number
  category?: {
    name: string
    slug: string
  }
  brand?: {
    name: string
    slug: string
  }
}

interface ProductCardProps {
  product: Product
  inWishlist?: boolean
  onWishlistChange?: (inWishlist: boolean) => void
  onQuickView?: (product: Product) => void
  showNew?: boolean
}

// Memoized ProductCard to prevent unnecessary re-renders
const ProductCard = memo(function ProductCard({
  product,
  inWishlist = false,
  onWishlistChange,
  onQuickView,
  showNew = false,
}: ProductCardProps) {
  const [isInWishlist, setIsInWishlist] = useState(inWishlist)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [pendingWishlistAction, setPendingWishlistAction] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const cycleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const addItem = useCartStore((state) => state.addItem)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isTouchDevice = useIsTouchDevice()

  // Subtle 3D transform values - calculated once on mouse move
  const [transform3D, setTransform3D] = useState({ rotateX: 0, rotateY: 0 })

  // Handle mouse move for subtle 3D effect - disabled on touch
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const mouseXPos = (e.clientX - centerX) / (rect.width / 2)
    const mouseYPos = (e.clientY - centerY) / (rect.height / 2)
    // Subtle rotation - max 4 degrees
    setTransform3D({
      rotateX: mouseYPos * -4,
      rotateY: mouseXPos * 4,
    })
  }, [isTouchDevice])

  const handleMouseLeave = useCallback(() => {
    setTransform3D({ rotateX: 0, rotateY: 0 })
    setIsHovered(false)
  }, [])

  // Get all images for hover cycling effect
  const allImages = useMemo(() => {
    if (!product.images || product.images.length === 0) {
      return product.primary_image ? [product.primary_image] : []
    }
    const sorted = [...product.images].sort((a, b) => (a.is_primary ? -1 : b.is_primary ? 1 : 0))
    return sorted.map(img => img.image || img.image_path).filter(Boolean) as string[]
  }, [product.images, product.primary_image])

  const hasMultipleImages = allImages.length > 1

  // Cycle through images on hover (desktop only)
  useEffect(() => {
    if (isHovered && hasMultipleImages && !isTouchDevice) {
      cycleIntervalRef.current = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % allImages.length)
      }, 1500)
    } else if (!isTouchDevice) {
      if (cycleIntervalRef.current) {
        clearInterval(cycleIntervalRef.current)
        cycleIntervalRef.current = null
      }
      setCurrentImageIndex(0)
    }
    return () => {
      if (cycleIntervalRef.current) clearInterval(cycleIntervalRef.current)
    }
  }, [isHovered, hasMultipleImages, allImages.length, isTouchDevice])

  // Swipe support for touch devices
  const swipeHandlers = useTouchSwipe({
    onSwipeLeft: useCallback(() => {
      if (hasMultipleImages) {
        setCurrentImageIndex(prev => (prev + 1) % allImages.length)
      }
    }, [hasMultipleImages, allImages.length]),
    onSwipeRight: useCallback(() => {
      if (hasMultipleImages) {
        setCurrentImageIndex(prev => (prev - 1 + allImages.length) % allImages.length)
      }
    }, [hasMultipleImages, allImages.length]),
  })

  // Memoize discount calculation
  const discountPercentage = useMemo(() => {
    if (product.compare_price && product.compare_price > product.price) {
      return Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    }
    return null
  }, [product.compare_price, product.price])

  // Memoize event handlers to prevent child re-renders
  const handleAddToCart = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (product.stock_status === 'out_of_stock') {
      toast.error('This product is out of stock')
      return
    }

    setIsAddingToCart(true)
    try {
      await addItem(product.id)
    } finally {
      setIsAddingToCart(false)
    }
  }, [product.id, product.stock_status, addItem])

  const handleToggleWishlist = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      setPendingWishlistAction(true)
      setShowAuthModal(true)
      return
    }

    try {
      const response = await api.post('/api/wishlist/toggle', { product_id: product.id })
      const newState = response.data.data.in_wishlist
      setIsInWishlist(newState)
      onWishlistChange?.(newState)
      toast.success(newState ? 'Added to wishlist' : 'Removed from wishlist')
    } catch {
      toast.error('Failed to update wishlist')
    }
  }, [product.id, isAuthenticated, onWishlistChange])

  // Handle successful auth - add to wishlist if that was the pending action
  const handleAuthSuccess = useCallback(async () => {
    if (pendingWishlistAction) {
      setPendingWishlistAction(false)
      try {
        const response = await api.post('/api/wishlist/toggle', { product_id: product.id })
        const newState = response.data.data.in_wishlist
        setIsInWishlist(newState)
        onWishlistChange?.(newState)
        toast.success(newState ? 'Added to wishlist' : 'Removed from wishlist')
      } catch {
        toast.error('Failed to update wishlist')
      }
    }
  }, [pendingWishlistAction, product.id, onWishlistChange])

  const handleQuickView = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onQuickView?.(product)
  }, [product, onQuickView])

  return (
    <Link to={`/product/${product.slug}`} className="group block">
      {/* Inject CSS keyframes */}
      <style>{shimmerStyle}</style>

      {/* Perspective container for subtle 3D effect - disabled on touch */}
      <div
        style={isTouchDevice ? undefined : { perspective: '800px' }}
        onMouseMove={isTouchDevice ? undefined : handleMouseMove}
        onMouseEnter={isTouchDevice ? undefined : () => setIsHovered(true)}
        onMouseLeave={isTouchDevice ? undefined : handleMouseLeave}
      >
        <div
          ref={cardRef}
          className="product-card relative overflow-visible"
          style={isTouchDevice ? undefined : {
            transform: `rotateX(${transform3D.rotateX}deg) rotateY(${transform3D.rotateY}deg)`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.15s ease-out',
          }}
        >
        {/* Image Container */}
        <div className="product-image" {...(isTouchDevice ? swipeHandlers : {})}>
          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 skeleton" />
          )}

          {allImages.length > 0 && !imageError ? (
            <>
              {/* Enhanced image animation with fade + slide */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={allImages[currentImageIndex]}
                  src={allImages[currentImageIndex]}
                  alt={currentImageIndex === 0 ? product.name : `${product.name} - view ${currentImageIndex + 1}`}
                  width={300}
                  height={300}
                  className="absolute inset-0 w-full h-full object-contain p-2"
                  loading={currentImageIndex === 0 ? 'eager' : 'lazy'}
                  onLoad={currentImageIndex === 0 ? () => setImageLoaded(true) : undefined}
                  onError={currentImageIndex === 0 ? () => setImageError(true) : undefined}
                  initial={{
                    opacity: 0,
                    x: 20,
                    scale: 1
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    scale: isHovered ? 1.05 : 1
                  }}
                  exit={{
                    opacity: 0,
                    x: -20,
                    scale: 1
                  }}
                  transition={{
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                />
              </AnimatePresence>

              {/* Enhanced dot indicators with animation - always visible on touch */}
              {hasMultipleImages && (isHovered || isTouchDevice) && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                  {allImages.map((_, index) => (
                    <motion.span
                      key={index}
                      className={`rounded-full transition-all duration-300
                                ${currentImageIndex === index
                                  ? 'bg-white'
                                  : 'bg-white/50 hover:bg-white/70'}`}
                      animate={{
                        width: currentImageIndex === index ? 12 : 6,
                        height: currentImageIndex === index ? 6 : 6,
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-dark-50 dark:bg-dark-800 flex items-center justify-center">
              <span className="text-sm font-medium text-dark-400 dark:text-dark-500 text-center px-4">{product.name}</span>
            </div>
          )}

          {/* Gradient overlay on hover */}
          <div className="product-overlay" />

          {/* Badges - CSS transitions */}
          <div className="product-badge flex flex-col gap-2">
            {discountPercentage && (
              <span
                className={`px-2.5 py-1 text-xs font-bold rounded-lg
                           bg-gradient-to-r from-primary-500 to-primary-400 text-white shadow-lg
                           transition-transform duration-300 ease-out
                           ${isHovered ? 'scale-110' : 'scale-100'}`}
              >
                -{discountPercentage}%
              </span>
            )}
            {(product.is_new || showNew) && (
              <span
                className={`px-2.5 py-1 text-xs font-bold rounded-lg
                           bg-gradient-to-r from-primary-500 to-primary-400 text-dark-900 shadow-lg
                           transition-transform duration-300 ease-out
                           ${isHovered ? 'scale-110 -translate-y-0.5' : 'scale-100'}`}
              >
                NEW
              </span>
            )}
            {product.is_bestseller && (
              <span
                className={`px-2.5 py-1 text-xs font-bold rounded-lg
                           bg-dark-900 dark:bg-white text-white dark:text-dark-900 shadow-lg
                           transition-transform duration-300 ease-out
                           ${isHovered ? 'scale-105' : 'scale-100'}`}
              >
                BEST
              </span>
            )}
          </div>

          {/* Out of Stock Overlay */}
          {product.stock_status === 'out_of_stock' && (
            <div className="absolute inset-0 bg-dark-900/60 flex items-center justify-center">
              <span className="px-4 py-2 bg-white/90 dark:bg-dark-800/90 rounded-lg text-sm font-semibold
                             text-dark-900 dark:text-white backdrop-blur-sm">
                Out of Stock
              </span>
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            className="product-wishlist transition-transform duration-200 hover:scale-110"
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {isInWishlist ? (
              <HeartSolidIcon className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5" />
            )}
          </button>

          {/* Quick Actions on Hover (always visible on touch via CSS) */}
          <div className="product-actions">
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || product.stock_status === 'out_of_stock'}
              className="flex-1 py-2 bg-primary-500 hover:bg-primary-400
                        text-dark-900 text-xs font-semibold rounded-lg
                        flex items-center justify-center gap-1.5
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-200 shadow-lg
                        hover:scale-[1.02] active:scale-[0.98]"
            >
              <ShoppingCartIcon className="w-3.5 h-3.5" />
              {isAddingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
            {/* Hide Quick View on touch - users can tap the card itself */}
            {!isTouchDevice && (
              <button
                onClick={handleQuickView}
                className="p-2 bg-white dark:bg-dark-800 hover:bg-dark-100 dark:hover:bg-dark-700
                          text-dark-900 dark:text-white rounded-lg
                          transition-all duration-200 shadow-lg
                          hover:scale-105 active:scale-95"
                aria-label="Quick view"
              >
                <EyeIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info">
          {/* Category */}
          {product.category && (
            <p className="product-category">{product.category.name}</p>
          )}

          {/* Name */}
          <h3 className="product-name">{product.name}</h3>

          {/* Rating - simple static display */}
          {product.average_rating !== undefined && product.review_count !== undefined && product.review_count > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isActive = star <= Math.round(Number(product.average_rating) || 0)
                  return (
                    <StarIcon
                      key={star}
                      className={`w-4 h-4 transition-transform duration-200
                        ${isActive ? 'text-primary-500' : 'text-dark-200 dark:text-dark-700'}
                        ${isHovered && isActive ? 'scale-110' : 'scale-100'}`}
                    />
                  )
                })}
              </div>
              <span className="text-xs text-dark-500 dark:text-dark-400">
                ({product.review_count})
              </span>
            </div>
          )}

          {/* Price with clean scale-up on hover */}
          <div className="product-price">
            <span
              className={`inline-block bg-gradient-to-r from-primary-500 to-primary-400 bg-clip-text text-transparent font-black
                         transition-transform duration-300 origin-left
                         ${isHovered && !isTouchDevice ? 'scale-105' : 'scale-100'}`}
              style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            >
              {formatPrice(product.price)}
            </span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="product-price-old">{formatPrice(product.compare_price)}</span>
            )}
          </div>
        </div>

        {/* Subtle glow effect on hover - CSS only, skip on touch */}
        {!isTouchDevice && (
          <div
            className={`absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300
                       ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            style={{
              boxShadow: '0 0 40px rgba(149, 18, 18, 0.25)',
              animation: isHovered ? 'subtle-glow 2s ease-in-out infinite' : 'none',
            }}
          />
        )}

        {/* Shine sweep effect on hover - CSS animation, skip on touch */}
        {!isTouchDevice && (
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-10">
            <div
              className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                         transition-transform duration-700 ease-out
                         ${isHovered ? 'translate-x-full' : '-translate-x-full'}`}
            />
          </div>
        )}
      </div>
      </div>

      {/* Auth Modal for wishlist */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false)
          setPendingWishlistAction(false)
        }}
        onSuccess={handleAuthSuccess}
        message="Sign in to add items to your wishlist"
      />
    </Link>
  )
})

export default ProductCard
