import { Link } from 'react-router-dom'
import { HeartIcon, ShoppingCartIcon, EyeIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon, StarIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { formatPrice } from '@/lib/utils'

interface Product {
  id: number
  name: string
  slug: string
  price: number
  compare_price?: number | null
  primary_image?: string | null
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
  showNew?: boolean
}

export default function ProductCard({
  product,
  inWishlist = false,
  onWishlistChange,
  showNew = false,
}: ProductCardProps) {
  const [isInWishlist, setIsInWishlist] = useState(inWishlist)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const addItem = useCartStore((state) => state.addItem)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const discountPercentage =
    product.compare_price && product.compare_price > product.price
      ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
      : null

  const handleAddToCart = async (e: React.MouseEvent) => {
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
  }

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist')
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
  }

  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="product-card">
        {/* Image Container */}
        <div className="product-image">
          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 skeleton" />
          )}

          {product.primary_image ? (
            <img
              src={product.primary_image}
              alt={product.name}
              className={`w-full h-full object-cover transition-all duration-700 ease-out
                        group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-dark-100 to-dark-200
                          dark:from-dark-800 dark:to-dark-900 flex items-center justify-center">
              <span className="text-4xl opacity-30">📦</span>
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
            <span>{formatPrice(product.price)}</span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="product-price-old">{formatPrice(product.compare_price)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
