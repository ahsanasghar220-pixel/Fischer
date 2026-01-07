import { Link } from 'react-router-dom'
import { HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
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
}

export default function ProductCard({
  product,
  inWishlist = false,
  onWishlistChange,
}: ProductCardProps) {
  const [isInWishlist, setIsInWishlist] = useState(inWishlist)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
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
    <Link to={`/product/${product.slug}`} className="product-card group block">
      {/* Image */}
      <div className="product-image relative">
        {product.primary_image ? (
          <img
            src={product.primary_image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-dark-100 flex items-center justify-center">
            <span className="text-dark-400">No image</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discountPercentage && (
            <span className="badge badge-danger">-{discountPercentage}%</span>
          )}
          {product.is_new && <span className="badge badge-primary">New</span>}
          {product.is_bestseller && <span className="badge badge-dark">Bestseller</span>}
          {product.stock_status === 'out_of_stock' && (
            <span className="badge bg-dark-500 text-white">Out of Stock</span>
          )}
        </div>

        {/* Quick actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleToggleWishlist}
            className="p-2 bg-white rounded-full shadow-md hover:bg-dark-50 transition-colors"
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {isInWishlist ? (
              <HeartSolidIcon className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5 text-dark-600" />
            )}
          </button>
        </div>

        {/* Add to cart button */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || product.stock_status === 'out_of_stock'}
            className="w-full py-2.5 bg-dark-900 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-dark-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ShoppingCartIcon className="w-4 h-4" />
            {isAddingToCart ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="product-info">
        {product.category && (
          <p className="text-xs text-dark-500 mb-1">{product.category.name}</p>
        )}
        <h3 className="product-name">{product.name}</h3>

        {/* Rating */}
        {product.average_rating !== undefined && product.review_count !== undefined && product.review_count > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(product.average_rating!) ? 'text-primary-500' : 'text-dark-200'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-dark-500">({product.review_count})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          <span className="product-price">{formatPrice(product.price)}</span>
          {product.compare_price && product.compare_price > product.price && (
            <span className="product-price-old">{formatPrice(product.compare_price)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
