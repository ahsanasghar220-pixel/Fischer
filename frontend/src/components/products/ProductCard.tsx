import { Link } from 'react-router-dom'
import { StarIcon } from '@heroicons/react/24/solid'
import { useState, useCallback, memo, useMemo, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { useIsTouchDevice } from '@/hooks/useIsTouchDevice'
import { useTouchSwipe } from '@/hooks/useTouchSwipe'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { formatPrice } from '@/lib/utils'
import AuthModal from '@/components/ui/AuthModal'
import AddToCartModal from '@/components/cart/AddToCartModal'
import type { Product } from '@/types'
import ProductCardImage from './ProductCardImage'

// CSS for shimmer effect - using CSS animations for GPU acceleration
const shimmerStyle = `
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
@keyframes subtle-glow {
  0%, 100% { box-shadow: 0 8px 32px rgb(var(--color-primary-500) / 0.2); }
  50% { box-shadow: 0 12px 40px rgb(var(--color-primary-500) / 0.3); }
}
`

interface ProductCardProps {
  product: Product
  inWishlist?: boolean
  onWishlistChange?: (inWishlist: boolean) => void
  onQuickView?: (product: Product) => void
  showNew?: boolean
  viewMode?: 'grid' | 'list'
}

// Memoized ProductCard to prevent unnecessary re-renders
const ProductCard = memo(function ProductCard({
  product,
  inWishlist = false,
  onWishlistChange,
  onQuickView,
  showNew = false,
  viewMode = 'grid',
}: ProductCardProps) {
  const [isInWishlist, setIsInWishlist] = useState(inWishlist)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [showCartModal, setShowCartModal] = useState(false)
  const [addedProduct, setAddedProduct] = useState<{id: number, name: string, primary_image?: string, price: number, quantity: number} | null>(null)
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

      // Show success modal with product details
      setAddedProduct({
        id: product.id,
        name: product.name,
        primary_image: product.primary_image || undefined,
        price: product.price,
        quantity: 1
      })
      setShowCartModal(true)
    } catch (error) {
      // Error already handled by cartStore with toast
    } finally {
      setIsAddingToCart(false)
    }
  }, [product.id, product.name, product.primary_image, product.price, product.stock_status, addItem])

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
          className={`product-card relative overflow-visible ${viewMode === 'list' ? 'product-card--list' : ''}`}
          style={isTouchDevice ? undefined : {
            transform: `rotateX(${transform3D.rotateX}deg) rotateY(${transform3D.rotateY}deg)`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.15s ease-out',
          }}
        >
          {/* Image Container */}
          <ProductCardImage
            product={product}
            allImages={allImages}
            currentImageIndex={currentImageIndex}
            imageLoaded={imageLoaded}
            imageError={imageError}
            isHovered={isHovered}
            isInWishlist={isInWishlist}
            isAddingToCart={isAddingToCart}
            isTouchDevice={isTouchDevice}
            discountPercentage={discountPercentage}
            showNew={showNew}
            swipeHandlers={swipeHandlers as Record<string, unknown>}
            onImageLoad={() => setImageLoaded(true)}
            onImageError={() => setImageError(true)}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onQuickView={handleQuickView}
          />

          {/* Product Info */}
          <div className="product-info">
            {/* Category */}
            {product.category && (
              <p className="product-category">{product.category.name}</p>
            )}

            {/* Name */}
            <h3 className={`product-name ${viewMode === 'list' ? 'product-name--list' : ''}`}>{product.name}</h3>

            {/* Description - only in list view */}
            {viewMode === 'list' && product.short_description && (
              <p className="product-description-list">{product.short_description}</p>
            )}

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

            {/* Low Stock Warning */}
            {product.stock_status === 'in_stock' && product.stock && product.stock <= 10 && product.stock > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 flex items-center gap-1.5 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-md"
              >
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-xs font-semibold text-orange-700 dark:text-orange-300"
                >
                  ⚠ Only {product.stock} left!
                </motion.span>
              </motion.div>
            )}
          </div>

          {/* Subtle glow effect on hover - CSS only, skip on touch */}
          {!isTouchDevice && (
            <div
              className={`absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300
                         ${isHovered ? 'opacity-100' : 'opacity-0'}`}
              style={{
                boxShadow: '0 0 40px rgb(var(--color-primary-500) / 0.25)',
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

      {/* Add to Cart Success Modal */}
      <AddToCartModal
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
        product={addedProduct}
      />
    </Link>
  )
})

export default ProductCard
