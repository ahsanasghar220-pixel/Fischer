import { Link } from 'react-router-dom'
import { HeartIcon, ShoppingCartIcon, EyeIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon, StarIcon } from '@heroicons/react/24/solid'
import { useState, useCallback, memo, useMemo } from 'react'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { formatPrice } from '@/lib/utils'
import AuthModal from '@/components/ui/AuthModal'

interface Product {
  id: number
  name: string
  slug: string
  price: number
  compare_price?: number | null
  primary_image?: string | null
  images?: Array<{ id: number; image: string; is_primary: boolean }>
  stock_status: string
  is_new?: boolean
  is_bestseller?: boolean
  average_rating?: number
  review_count?: number
  category?: {
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
  const addItem = useCartStore((state) => state.addItem)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  // Get secondary image for hover effect
  const secondaryImage = useMemo(() => {
    if (!product.images || product.images.length < 2) return null
    return product.images.find(img => !img.is_primary)?.image || product.images[1]?.image || null
  }, [product.images])

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
      const response = await api.post('/wishlist/toggle', { product_id: product.id })
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
        const response = await api.post('/wishlist/toggle', { product_id: product.id })
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
      <div className="product-card card-shine relative transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary-500/20">
        {/* Image Container */}
        <div className="product-image">
          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 skeleton" />
          )}

          {product.primary_image && !imageError ? (
            <>
              {/* Primary Image */}
              <img
                src={product.primary_image}
                alt={product.name}
                width={300}
                height={300}
                className={`w-full h-full object-cover transition-all duration-500 ease-out
                          ${imageLoaded ? 'opacity-100' : 'opacity-0'}
                          ${secondaryImage ? 'group-hover:opacity-0' : 'group-hover:scale-110'}`}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />

              {/* Secondary Image (shown on hover) */}
              {secondaryImage && (
                <img
                  src={secondaryImage}
                  alt={`${product.name} - alternate view`}
                  width={300}
                  height={300}
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out
                           opacity-0 group-hover:opacity-100"
                  loading="lazy"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-dark-100 to-dark-200
                          dark:from-dark-800 dark:to-dark-900 flex items-center justify-center">
              <div className="text-center">
                <span className="text-5xl block mb-2">📦</span>
                <span className="text-xs text-dark-400 dark:text-dark-500">No Image</span>
              </div>
            </div>
          )}

          {/* Gradient overlay on hover */}
          <div className="product-overlay" />

          {/* Badges */}
          <div className="product-badge flex flex-col gap-2">
            {discountPercentage && (
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg
                             bg-gradient-to-r from-red-500 to-red-400 text-white shadow-lg">
                -{discountPercentage}%
              </span>
            )}
            {(product.is_new || showNew) && (
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg
                             bg-gradient-to-r from-primary-500 to-primary-400 text-dark-900 shadow-lg">
                NEW
              </span>
            )}
            {product.is_bestseller && (
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg
                             bg-dark-900 dark:bg-white text-white dark:text-dark-900 shadow-lg">
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
            className="product-wishlist"
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {isInWishlist ? (
              <HeartSolidIcon className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5" />
            )}
          </button>

          {/* Quick Actions on Hover */}
          <div className="product-actions">
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || product.stock_status === 'out_of_stock'}
              className="flex-1 py-3 bg-primary-500 hover:bg-primary-400
                        text-dark-900 text-sm font-semibold rounded-xl
                        flex items-center justify-center gap-2
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-200 shadow-lg"
            >
              <ShoppingCartIcon className="w-4 h-4" />
              {isAddingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
            <button
              onClick={handleQuickView}
              className="p-3 bg-white dark:bg-dark-800 hover:bg-dark-100 dark:hover:bg-dark-700
                        text-dark-900 dark:text-white rounded-xl
                        transition-all duration-200 shadow-lg"
              aria-label="Quick view"
            >
              <EyeIcon className="w-5 h-5" />
            </button>
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

          {/* Rating */}
          {product.average_rating !== undefined && product.review_count !== undefined && product.review_count > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(product.average_rating!)
                        ? 'text-primary-500'
                        : 'text-dark-200 dark:text-dark-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-dark-500 dark:text-dark-400">
                ({product.review_count})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="product-price">
            <span className="bg-gradient-to-r from-primary-500 to-primary-400 bg-clip-text text-transparent font-black">
              {formatPrice(product.price)}
            </span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="product-price-old">{formatPrice(product.compare_price)}</span>
            )}
          </div>
        </div>

        {/* Subtle glow on hover */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
             style={{
               background: 'radial-gradient(circle at 50% 0%, rgba(244, 180, 44, 0.15) 0%, transparent 50%)',
             }}
        />

        {/* Shine sweep effect on hover */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
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
