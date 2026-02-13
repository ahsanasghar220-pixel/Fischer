import { Fragment, memo, useState, useCallback } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Link } from 'react-router-dom'
import {
  XMarkIcon,
  ShoppingCartIcon,
  HeartIcon,
  MinusIcon,
  PlusIcon,
  StarIcon,
  CheckIcon,
  TruckIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon, HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { useCartStore } from '@/stores/cartStore'
import { formatPrice, formatDescription } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Product {
  id: number
  name: string
  slug: string
  price: number
  compare_price?: number | null
  description?: string
  short_description?: string
  primary_image?: string | null
  images?: { id: number; image_path?: string; image?: string; is_primary: boolean }[]
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

interface QuickViewModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  inWishlist?: boolean
  onWishlistToggle?: () => void
}

const QuickViewModal = memo(function QuickViewModal({
  isOpen,
  onClose,
  product,
  inWishlist = false,
  onWishlistToggle,
}: QuickViewModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const { addItem } = useCartStore()

  const handleQuantityChange = useCallback((delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(prev + delta, product?.stock || 99)))
  }, [product?.stock])

  const handleAddToCart = useCallback(async () => {
    if (!product || product.stock_status === 'out_of_stock') return

    setIsAddingToCart(true)
    try {
      await addItem(product.id, quantity)
      onClose()
    } catch {
      // Error handled in store
    } finally {
      setIsAddingToCart(false)
    }
  }, [product, quantity, addItem, onClose])

  const handleWishlistClick = useCallback(() => {
    if (onWishlistToggle) {
      onWishlistToggle()
    } else {
      toast.error('Please login to add items to wishlist')
    }
  }, [onWishlistToggle])

  if (!product) return null

  const images = product.images?.length
    ? product.images.map(img => ({ ...img, image_path: img.image_path || img.image }))
    : product.primary_image
    ? [{ id: 0, image_path: product.primary_image, image: product.primary_image, is_primary: true }]
    : []

  const discountPercentage = product.compare_price && product.compare_price > product.price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : null

  const isOutOfStock = product.stock_status === 'out_of_stock'

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-dark-900/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end sm:items-center justify-center sm:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-4xl transform overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white dark:bg-dark-800 shadow-2xl transition-all max-h-[90vh] overflow-y-auto">
                {/* Drag handle indicator on mobile */}
                <div className="sm:hidden flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-dark-300 dark:bg-dark-600" />
                </div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 p-2.5 rounded-xl bg-white/80 dark:bg-dark-700/80 backdrop-blur-sm text-dark-500 hover:text-dark-700 dark:hover:text-dark-200 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>

                <div className="grid md:grid-cols-2 gap-6 p-6 md:p-8">
                  {/* Image Gallery */}
                  <div className="space-y-4">
                    {/* Main Image */}
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-dark-100 dark:bg-dark-700">
                      {images.length > 0 ? (
                        <img
                          src={images[selectedImage]?.image_path || product.primary_image || ''}
                          alt={product.name}
                          width={400}
                          height={400}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCartIcon className="w-20 h-20 text-dark-300 dark:text-dark-500" />
                        </div>
                      )}

                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {discountPercentage && (
                          <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                            -{discountPercentage}%
                          </span>
                        )}
                        {product.is_new && (
                          <span className="px-3 py-1 bg-emerald-500 text-white text-sm font-bold rounded-full">
                            NEW
                          </span>
                        )}
                        {product.is_bestseller && (
                          <span className="px-3 py-1 bg-primary-500 text-white text-sm font-bold rounded-full">
                            BEST SELLER
                          </span>
                        )}
                      </div>

                      {/* Out of stock overlay */}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-dark-900/60 flex items-center justify-center">
                          <span className="px-6 py-3 bg-dark-900 text-white font-bold rounded-xl">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Thumbnails */}
                    {images.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {images.map((image, index) => (
                          <button
                            key={image.id}
                            onClick={() => setSelectedImage(index)}
                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all active:scale-95 ${
                              selectedImage === index
                                ? 'border-primary-500'
                                : 'border-transparent hover:border-dark-300 dark:hover:border-dark-600'
                            }`}
                          >
                            <img
                              src={image.image_path}
                              alt={`${product.name} - ${index + 1}`}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-col">
                    {/* Category & Brand */}
                    <div className="flex items-center gap-2 text-sm text-dark-500 dark:text-dark-400 mb-2">
                      {product.category && (
                        <Link
                          to={`/category/${product.category.slug}`}
                          onClick={onClose}
                          className="hover:text-primary-600 dark:hover:text-primary-400"
                        >
                          {product.category.name}
                        </Link>
                      )}
                      {product.category && product.brand && <span>/</span>}
                      {product.brand && (
                        <span>{product.brand.name}</span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl md:text-3xl font-bold text-dark-900 dark:text-white mb-3">
                      {product.name}
                    </h2>

                    {/* Rating */}
                    {(product.average_rating !== undefined || product.review_count) && (
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex">
                          {[...Array(5)].map((_, i) =>
                            i < Math.round(product.average_rating || 0) ? (
                              <StarSolidIcon key={i} className="w-5 h-5 text-primary-500" />
                            ) : (
                              <StarIcon key={i} className="w-5 h-5 text-dark-300 dark:text-dark-600" />
                            )
                          )}
                        </div>
                        {product.review_count !== undefined && (
                          <span className="text-sm text-dark-500 dark:text-dark-400">
                            ({product.review_count} reviews)
                          </span>
                        )}
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl font-black text-primary-600 dark:text-primary-400">
                        {formatPrice(product.price)}
                      </span>
                      {product.compare_price && product.compare_price > product.price && (
                        <span className="text-lg text-dark-400 line-through">
                          {formatPrice(product.compare_price)}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {(product.short_description || product.description) && (
                      <div className="text-dark-600 dark:text-dark-300 mb-6 space-y-1">
                        {formatDescription(product.short_description || product.description || '').slice(0, 4).map((line, index) => (
                          <p key={index} className="text-sm">{line}</p>
                        ))}
                      </div>
                    )}

                    {/* Stock Status */}
                    <div className="flex items-center gap-2 mb-6">
                      {isOutOfStock ? (
                        <span className="text-red-500 font-medium">Out of Stock</span>
                      ) : (
                        <>
                          <CheckIcon className="w-5 h-5 text-green-500" />
                          <span className="text-green-600 dark:text-green-400 font-medium">In Stock</span>
                          {product.stock && product.stock <= 10 && (
                            <span className="text-orange-600 dark:text-orange-400 text-sm">
                              (Only {product.stock} left)
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {/* Quantity & Add to Cart */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-dark-200 dark:border-dark-600 rounded-xl overflow-hidden">
                        <button
                          onClick={() => handleQuantityChange(-1)}
                          disabled={quantity <= 1 || isOutOfStock}
                          className="w-12 h-12 flex items-center justify-center text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700 disabled:opacity-50 transition-colors"
                        >
                          <MinusIcon className="w-5 h-5" />
                        </button>
                        <span className="w-16 text-center font-semibold text-dark-900 dark:text-white">
                          {quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(1)}
                          disabled={isOutOfStock}
                          className="w-12 h-12 flex items-center justify-center text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700 disabled:opacity-50 transition-colors"
                        >
                          <PlusIcon className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        onClick={handleAddToCart}
                        disabled={isOutOfStock || isAddingToCart}
                        className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-dark-300 dark:disabled:bg-dark-600 text-white font-semibold text-sm rounded-lg transition-colors"
                      >
                        <ShoppingCartIcon className="w-4 h-4" />
                        {isAddingToCart ? 'Adding...' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                      </button>

                      {/* Wishlist Button */}
                      <button
                        onClick={handleWishlistClick}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-colors ${
                          inWishlist
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-500'
                            : 'border-dark-200 dark:border-dark-600 text-dark-600 dark:text-dark-300 hover:border-red-500 hover:text-red-500'
                        }`}
                      >
                        {inWishlist ? (
                          <HeartSolidIcon className="w-5 h-5" />
                        ) : (
                          <HeartIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-dark-100 dark:border-dark-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <TruckIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-dark-900 dark:text-white">Free Delivery</p>
                          <p className="text-xs text-dark-500 dark:text-dark-400">Orders over PKR 10k</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <ShieldCheckIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-dark-900 dark:text-white">1 Year Warranty</p>
                          <p className="text-xs text-dark-500 dark:text-dark-400">Official warranty</p>
                        </div>
                      </div>
                    </div>

                    {/* View Full Details */}
                    <Link
                      to={`/product/${product.slug}`}
                      onClick={onClose}
                      className="mt-6 text-center py-3 text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                    >
                      View Full Details
                    </Link>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
})

export default QuickViewModal
