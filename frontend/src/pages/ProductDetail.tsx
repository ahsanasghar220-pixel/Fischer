import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HeartIcon,
  ShareIcon,
  MinusIcon,
  PlusIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  MagnifyingGlassPlusIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { Helmet } from 'react-helmet-async'
import api from '@/lib/api'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ProductCard from '@/components/products/ProductCard'
import QuickViewModal from '@/components/products/QuickViewModal'
import AuthModal from '@/components/ui/AuthModal'
import AddToCartModal from '@/components/cart/AddToCartModal'
import ScrollReveal, { StaggerContainer, StaggerItem, HoverCard } from '@/components/effects/ScrollReveal'
import ReviewForm from '@/components/products/ReviewForm'
import { formatPrice, formatDate, formatDescription } from '@/lib/utils'
import toast from 'react-hot-toast'
import { CheckBadgeIcon, HandThumbUpIcon } from '@heroicons/react/24/solid'

interface ProductImage {
  id: number
  image: string
  alt_text?: string
  is_primary: boolean
}

// Simplified product type for QuickView modal
interface QuickViewProduct {
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
  category?: { name: string; slug: string }
  brand?: { name: string; slug: string }
}

interface ProductVariant {
  id: number
  sku: string
  name: string
  price: number
  compare_price?: number
  stock: number
  attributes: Record<string, string>
}

interface Review {
  id: number
  rating: number
  title?: string
  content: string
  created_at: string
  is_verified_purchase?: boolean
  user: {
    name: string
  }
  images?: { image: string }[]
  helpful_count: number
}

interface Product {
  id: number
  name: string
  slug: string
  sku: string
  description: string
  short_description?: string
  price: number
  compare_price?: number | null
  stock: number
  stock_status: string
  specifications?: Record<string, string>
  warranty_info?: string
  is_new?: boolean
  is_bestseller?: boolean
  average_rating?: number
  review_count?: number
  images: ProductImage[]
  variants: ProductVariant[]
  category?: {
    id: number
    name: string
    slug: string
  }
  brand?: {
    id: number
    name: string
    slug: string
  }
  related_products: Product[]
  reviews: Review[]
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [selectedImage, setSelectedImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [showCartModal, setShowCartModal] = useState(false)
  const [addedProduct, setAddedProduct] = useState<{id: number, name: string, primary_image?: string, price: number, quantity: number} | null>(null)
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState<QuickViewProduct | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [canReview, setCanReview] = useState<boolean | null>(null)

  const addItem = useCartStore((state) => state.addItem)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const { data: productData, isLoading, error } = useQuery<{ product: Product; related_products: Product[] }>({
    queryKey: ['product', slug],
    queryFn: async () => {
      const response = await api.get(`/api/products/${slug}`)
      return response.data.data
    },
  })

  const product = productData?.product
  const relatedProducts = productData?.related_products || []

  // Reset selected image when navigating between products
  useEffect(() => { setSelectedImage(0); setLightboxOpen(false) }, [slug])

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen || !product?.images?.length) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowRight') setSelectedImage((prev) => (prev >= product.images!.length - 1 ? 0 : prev + 1))
      if (e.key === 'ArrowLeft') setSelectedImage((prev) => (prev <= 0 ? product.images!.length - 1 : prev - 1))
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxOpen, product?.images?.length])

  // Sync wishlist state with server
  useEffect(() => {
    if (isAuthenticated && product) {
      api.post('/api/wishlist/check', { product_id: product.id })
        .then(res => setIsInWishlist(res.data.data?.in_wishlist || false))
        .catch(() => {})
    }
  }, [product?.id, isAuthenticated])

  // Check if user can review this product
  useEffect(() => {
    if (isAuthenticated && product) {
      api.get(`/api/reviews/can-review/${product.id}`)
        .then(res => setCanReview(res.data.data?.can_review || false))
        .catch(() => setCanReview(false))
    } else {
      setCanReview(null)
    }
  }, [product?.id, isAuthenticated])

  const handleAddToCart = async () => {
    if (!product) return

    if (currentStock === 0 || product.stock_status === 'out_of_stock') {
      toast.error('This product is out of stock')
      return
    }

    setIsAddingToCart(true)
    try {
      await addItem(product.id, quantity, selectedVariant?.id)

      // Show success modal with product details
      setAddedProduct({
        id: product.id,
        name: product.name,
        primary_image: product.primary_image || undefined,
        price: selectedVariant?.price || product.price,
        quantity: quantity
      })
      setShowCartModal(true)

      // Reset quantity to 1 after adding
      setQuantity(1)
    } catch (error) {
      // Error already handled by cartStore with toast
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }

    try {
      const response = await api.post('/api/wishlist/toggle', { product_id: product?.id })
      setIsInWishlist(response.data.data.in_wishlist)
      toast.success(response.data.data.in_wishlist ? 'Added to wishlist' : 'Removed from wishlist')
    } catch {
      toast.error('Failed to update wishlist')
    }
  }

  const handleAuthSuccess = async () => {
    // After successful auth, add to wishlist
    try {
      const response = await api.post('/api/wishlist/toggle', { product_id: product?.id })
      setIsInWishlist(response.data.data.in_wishlist)
      toast.success(response.data.data.in_wishlist ? 'Added to wishlist' : 'Removed from wishlist')
    } catch {
      toast.error('Failed to update wishlist')
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          url: window.location.href,
        })
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    }
  }

  const currentPrice = selectedVariant?.price || product?.price || 0
  const comparePrice = selectedVariant?.compare_price || product?.compare_price
  const currentStock = selectedVariant?.stock ?? product?.stock ?? 0
  const discountPercentage = comparePrice && comparePrice > currentPrice
    ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100)
    : null

  if (isLoading) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <LoadingSpinner size="lg" />
      </motion.div>
    )
  }

  if (error || !product) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-900"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center">
          <motion.h1
            className="text-2xl font-bold text-dark-900 dark:text-white mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Product not found
          </motion.h1>
          <motion.p
            className="text-dark-500 dark:text-dark-400 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            The product you're looking for doesn't exist.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link to="/shop" className="btn btn-primary">
              Browse Products
            </Link>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="bg-white dark:bg-dark-900 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Helmet>
        <title>{product.name} - Fischer Pakistan</title>
        <meta name="description" content={product.short_description || product.description?.substring(0, 160) || ''} />
      </Helmet>
      {/* Breadcrumb */}
      <div className="bg-dark-50 dark:bg-dark-800 border-b border-dark-200 dark:border-dark-700">
        <div className="container mx-auto px-4 py-4">
          <motion.div
            className="flex items-center gap-2 text-sm text-dark-500 dark:text-dark-400"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Shop</Link>
            {product.category && (
              <>
                <span>/</span>
                <Link to={`/category/${product.category.slug}`} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  {product.category.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-dark-900 dark:text-white">{product.name}</span>
          </motion.div>
        </div>
      </div>

      {/* Product Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Images */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              {/* Main Image with Arrows */}
              <div className="relative aspect-square bg-dark-100 dark:bg-dark-800 rounded-xl overflow-hidden mb-4 group">
                <AnimatePresence mode="wait">
                  {product.images && product.images.length > 0 ? (
                    <motion.img
                      key={selectedImage}
                      src={product.images[selectedImage]?.image}
                      alt={product.images[selectedImage]?.alt_text || product.name}
                      width={600}
                      height={600}
                      className="w-full h-full object-cover cursor-zoom-in"
                      onClick={() => setLightboxOpen(true)}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-dark-400">
                      No image available
                    </div>
                  )}
                </AnimatePresence>

                {/* Arrow Navigation */}
                {product.images && product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage((prev) => (prev <= 0 ? product.images!.length - 1 : prev - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm text-dark-700 dark:text-dark-200 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-dark-700 shadow-lg"
                      aria-label="Previous image"
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setSelectedImage((prev) => (prev >= product.images!.length - 1 ? 0 : prev + 1))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm text-dark-700 dark:text-dark-200 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-dark-700 shadow-lg"
                      aria-label="Next image"
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Zoom Button */}
                {product.images && product.images.length > 0 && (
                  <button
                    onClick={() => setLightboxOpen(true)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm text-dark-600 dark:text-dark-300 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-dark-700 shadow-lg"
                    aria-label="View full size"
                  >
                    <MagnifyingGlassPlusIcon className="w-5 h-5" />
                  </button>
                )}

                {/* Image Counter */}
                {product.images && product.images.length > 1 && (
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/50 text-white text-xs font-medium backdrop-blur-sm">
                    {selectedImage + 1} / {product.images.length}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <motion.div
                  className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  {product.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all hover:scale-110 active:scale-95 ${
                        selectedImage === index ? 'border-primary-500 shadow-md' : 'border-transparent hover:border-dark-300 dark:hover:border-dark-500'
                      }`}
                    >
                      <img
                        src={image.image}
                        alt={image.alt_text || `${product.name} ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </motion.div>
              )}

              {/* Fullscreen Lightbox */}
              <AnimatePresence>
                {lightboxOpen && product.images && product.images.length > 0 && (
                  <motion.div
                    className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setLightboxOpen(false)}
                  >
                    {/* Close Button */}
                    <button
                      onClick={() => setLightboxOpen(false)}
                      className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                      aria-label="Close"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>

                    {/* Counter */}
                    {product.images.length > 1 && (
                      <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium backdrop-blur-sm">
                        {selectedImage + 1} / {product.images.length}
                      </div>
                    )}

                    {/* Image */}
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={selectedImage}
                        src={product.images[selectedImage]?.image}
                        alt={product.images[selectedImage]?.alt_text || product.name}
                        className="max-w-[90vw] max-h-[85vh] object-contain select-none"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        onClick={(e) => e.stopPropagation()}
                        draggable={false}
                      />
                    </AnimatePresence>

                    {/* Lightbox Arrows */}
                    {product.images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedImage((prev) => (prev <= 0 ? product.images!.length - 1 : prev - 1)) }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                          aria-label="Previous image"
                        >
                          <ChevronLeftIcon className="w-6 h-6" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedImage((prev) => (prev >= product.images!.length - 1 ? 0 : prev + 1)) }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                          aria-label="Next image"
                        >
                          <ChevronRightIcon className="w-6 h-6" />
                        </button>
                      </>
                    )}

                    {/* Lightbox Thumbnails */}
                    {product.images.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-4 py-2">
                        {product.images.map((image, index) => (
                          <button
                            key={image.id}
                            onClick={(e) => { e.stopPropagation(); setSelectedImage(index) }}
                            className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                              selectedImage === index ? 'border-white opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
                            }`}
                          >
                            <img src={image.image} alt="" className="w-full h-full object-cover" draggable={false} />
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <motion.div
                className="flex items-center gap-2 mb-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                {product.is_new && <motion.span className="badge badge-primary" whileHover={{ scale: 1.1 }}>New</motion.span>}
                {product.is_bestseller && <motion.span className="badge badge-dark" whileHover={{ scale: 1.1 }}>Bestseller</motion.span>}
                {discountPercentage && <motion.span className="badge badge-danger" whileHover={{ scale: 1.1 }}>-{discountPercentage}%</motion.span>}
              </motion.div>

              {product.brand && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link to={`/shop?brand=${product.brand.slug}`} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                    {product.brand.name}
                  </Link>
                </motion.div>
              )}

              <motion.h1
                className="text-xl sm:text-2xl md:text-3xl font-bold text-dark-900 dark:text-white mt-1 mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                {product.name}
              </motion.h1>

              {/* Rating */}
              {product.review_count !== undefined && product.review_count > 0 && (
                <motion.div
                  className="flex items-center gap-2 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      star <= Math.round(product.average_rating || 0) ? (
                        <StarSolidIcon key={star} className="w-5 h-5 text-primary-500" />
                      ) : (
                        <StarIcon key={star} className="w-5 h-5 text-dark-200 dark:text-dark-600" />
                      )
                    ))}
                  </div>
                  <span className="text-dark-600 dark:text-dark-400">
                    {product.average_rating?.toFixed(1)} ({product.review_count} reviews)
                  </span>
                </motion.div>
              )}

              {/* Price */}
              <motion.div
                className="flex items-center gap-3 mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <span className="text-2xl sm:text-3xl font-bold text-dark-900 dark:text-white">{formatPrice(currentPrice)}</span>
                {comparePrice && comparePrice > currentPrice && (
                  <span className="text-base sm:text-lg md:text-xl text-dark-400 line-through">{formatPrice(comparePrice)}</span>
                )}
              </motion.div>

              {/* Short Description */}
              {product.short_description && (
                <motion.div
                  className="text-dark-600 dark:text-dark-400 mb-6 space-y-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {formatDescription(product.short_description).map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </motion.div>
              )}

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <motion.div
                  className="mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                >
                  <label className="block text-sm font-medium text-dark-900 dark:text-white mb-2">
                    Select Variant
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant, index) => (
                      <motion.button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        disabled={variant.stock === 0}
                        className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                          selectedVariant?.id === variant.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                            : variant.stock === 0
                            ? 'border-dark-200 dark:border-dark-600 text-dark-400 cursor-not-allowed'
                            : 'border-dark-200 dark:border-dark-600 text-dark-600 dark:text-dark-300 hover:border-dark-400 dark:hover:border-dark-500'
                        }`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.55 + index * 0.05 }}
                        whileHover={{ scale: variant.stock === 0 ? 1 : 1.05 }}
                        whileTap={{ scale: variant.stock === 0 ? 1 : 0.95 }}
                      >
                        {variant.name}
                        {variant.stock === 0 && ' (Out of Stock)'}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Stock Status */}
              <motion.div
                className="mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {currentStock === 0 || product.stock_status === 'out_of_stock' ? (
                  <span className="text-red-600 dark:text-red-400 font-bold text-lg">✕ Out of Stock</span>
                ) : currentStock <= 10 ? (
                  <motion.span
                    className="text-orange-600 dark:text-orange-400 font-medium"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ⚠ Low Stock - Only {currentStock} left
                  </motion.span>
                ) : (
                  <span className="text-green-600 dark:text-green-400 font-medium">✓ In Stock ({currentStock} available)</span>
                )}
              </motion.div>

              {/* Quantity & Add to Cart */}
              <motion.div
                className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
              >
                <div className="flex items-center border border-dark-200 dark:border-dark-600 rounded-lg">
                  <motion.button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className={`p-3 transition-colors ${
                      quantity <= 1
                        ? 'opacity-40 cursor-not-allowed text-dark-400 dark:text-dark-600'
                        : 'hover:bg-dark-50 dark:hover:bg-dark-700 text-dark-600 dark:text-dark-300'
                    }`}
                    disabled={quantity <= 1 || currentStock === 0}
                    whileHover={quantity > 1 && currentStock > 0 ? { scale: 1.1 } : {}}
                    whileTap={quantity > 1 && currentStock > 0 ? { scale: 0.9 } : {}}
                  >
                    <MinusIcon className="w-5 h-5" />
                  </motion.button>
                  <motion.span
                    key={quantity}
                    className="w-12 text-center font-medium text-dark-900 dark:text-white"
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    {quantity}
                  </motion.span>
                  <motion.button
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    className={`p-3 transition-colors ${
                      quantity >= currentStock || currentStock === 0
                        ? 'opacity-40 cursor-not-allowed text-dark-400 dark:text-dark-600'
                        : 'hover:bg-dark-50 dark:hover:bg-dark-700 text-dark-600 dark:text-dark-300'
                    }`}
                    disabled={quantity >= currentStock || currentStock === 0}
                    whileHover={quantity < currentStock && currentStock > 0 ? { scale: 1.1 } : {}}
                    whileTap={quantity < currentStock && currentStock > 0 ? { scale: 0.9 } : {}}
                  >
                    <PlusIcon className="w-5 h-5" />
                  </motion.button>
                </div>

                <motion.button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || currentStock === 0 || product.stock_status === 'out_of_stock'}
                  className={`flex-1 py-2.5 px-6 rounded-lg font-semibold text-white transition-colors duration-200 ${
                    currentStock === 0 || product.stock_status === 'out_of_stock'
                      ? 'bg-dark-400 dark:bg-dark-600 cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-700'
                  } ${isAddingToCart ? 'opacity-70' : ''}`}
                  whileHover={currentStock > 0 && product.stock_status !== 'out_of_stock' ? { scale: 1.02 } : {}}
                  whileTap={currentStock > 0 && product.stock_status !== 'out_of_stock' ? { scale: 0.98 } : {}}
                >
                  {currentStock === 0 || product.stock_status === 'out_of_stock'
                    ? '✕ Out of Stock'
                    : isAddingToCart
                      ? 'Adding...'
                      : 'Add to Cart'
                  }
                </motion.button>

                <motion.button
                  onClick={handleToggleWishlist}
                  className="p-2.5 border border-dark-200 dark:border-dark-600 rounded-lg hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <AnimatePresence mode="wait">
                    {isInWishlist ? (
                      <motion.div
                        key="filled"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <HeartSolidIcon className="w-6 h-6 text-red-500" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="outline"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <HeartIcon className="w-6 h-6 text-dark-600 dark:text-dark-400" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>

                <motion.button
                  onClick={handleShare}
                  className="p-3 border border-dark-200 dark:border-dark-600 rounded-lg hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ShareIcon className="w-6 h-6 text-dark-600 dark:text-dark-400" />
                </motion.button>
              </motion.div>

              {/* Features */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-t border-b border-dark-200 dark:border-dark-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                {[
                  { icon: TruckIcon, label: 'Free Delivery in Lahore' },
                  { icon: ShieldCheckIcon, label: '1 Year Warranty' },
                  { icon: ArrowPathIcon, label: 'Easy Returns' },
                ].map((feature, index) => (
                  <motion.div
                    key={feature.label}
                    className="text-center hover:scale-105 hover:-translate-y-0.5 transition-transform"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                  >
                    <feature.icon className="w-8 h-8 mx-auto text-primary-500 mb-2" />
                    <span className="text-sm text-dark-600 dark:text-dark-400">{feature.label}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* SKU */}
              <motion.p
                className="text-sm text-dark-500 dark:text-dark-400 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                SKU: {selectedVariant?.sku || product.sku}
              </motion.p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <ScrollReveal animation="fadeUp">
        <section className="py-8 bg-dark-50 dark:bg-dark-800">
          <div className="container mx-auto px-4">
            <motion.div
              className="bg-white dark:bg-dark-900 rounded-xl overflow-hidden border border-dark-200 dark:border-dark-700"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {/* Tab Headers */}
              <div className="flex border-b border-dark-200 dark:border-dark-700">
                {(['description', 'reviews'] as const).map((tab) => (
                  <motion.button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 px-2 sm:px-6 text-center font-medium transition-colors relative text-xs sm:text-sm md:text-base whitespace-nowrap ${
                      activeTab === tab
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-dark-500 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white'
                    }`}
                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                  >
                    {tab === 'description' && 'Description'}
                    {tab === 'reviews' && `Reviews (${product.review_count || 0})`}
                    {activeTab === tab && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                        layoutId="activeTab"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'description' && (
                    <motion.div
                      key="description"
                      className="prose dark:prose-invert max-w-none"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div
                        className="text-dark-700 dark:text-dark-300 leading-relaxed space-y-4"
                        dangerouslySetInnerHTML={{
                          __html: (product.description || 'No description available.')
                            .replace(/\n\n/g, '</p><p class="mt-4">')
                            .replace(/\n/g, '<br>')
                            .replace(/^/, '<p>')
                            .replace(/$/, '</p>')
                            .replace(/\. /g, '. ')
                        }}
                      />
                      {product.warranty_info && (
                        <motion.div
                          className="mt-6 p-4 bg-dark-50 dark:bg-dark-800 rounded-lg"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <h4 className="font-semibold text-dark-900 dark:text-white mb-2">Warranty Information</h4>
                          <p className="text-dark-600 dark:text-dark-400">{product.warranty_info}</p>
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'reviews' && (
                    <motion.div
                      key="reviews"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Write a Review Button / Form */}
                      <div className="mb-8">
                        {showReviewForm ? (
                          <div className="p-6 bg-dark-50 dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700">
                            <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-6">Write a Review</h3>
                            <ReviewForm
                              productId={product.id}
                              onSuccess={() => {
                                setShowReviewForm(false)
                                setCanReview(false)
                              }}
                              onCancel={() => setShowReviewForm(false)}
                            />
                          </div>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full sm:w-auto px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-lg transition-colors duration-200"
                            onClick={() => {
                              if (!isAuthenticated) {
                                setShowAuthModal(true)
                                return
                              }
                              if (canReview === false) {
                                toast.error('Purchase this product to leave a review')
                                return
                              }
                              setShowReviewForm(true)
                            }}
                          >
                            ✍ Write a Review
                          </motion.button>
                        )}
                      </div>

                      {product.reviews && product.reviews.length > 0 ? (
                        <div className="space-y-6">
                          {product.reviews.map((review, index) => (
                            <motion.div
                              key={review.id}
                              className="border-b border-dark-200 dark:border-dark-700 pb-6 last:border-0"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <div className="flex items-center flex-wrap gap-2 mb-2">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    star <= review.rating ? (
                                      <StarSolidIcon key={star} className="w-4 h-4 text-primary-500" />
                                    ) : (
                                      <StarIcon key={star} className="w-4 h-4 text-dark-200 dark:text-dark-600" />
                                    )
                                  ))}
                                </div>
                                <span className="font-medium text-dark-900 dark:text-white">{review.user.name}</span>
                                {review.is_verified_purchase && (
                                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                                    <CheckBadgeIcon className="w-4 h-4" />
                                    Verified Purchase
                                  </span>
                                )}
                                <span className="text-dark-400">•</span>
                                <span className="text-sm text-dark-500 dark:text-dark-400">{formatDate(review.created_at)}</span>
                              </div>
                              {review.title && (
                                <h4 className="font-medium text-dark-900 dark:text-white mb-1">{review.title}</h4>
                              )}
                              <p className="text-dark-600 dark:text-dark-400">{review.content}</p>
                              {review.images && review.images.length > 0 && (
                                <div className="flex gap-2 mt-3">
                                  {review.images.map((img, i) => (
                                    <motion.img
                                      key={i}
                                      src={img.image}
                                      alt={`Review image ${i + 1}`}
                                      width={80}
                                      height={80}
                                      className="w-20 h-20 object-cover rounded cursor-pointer"
                                      whileHover={{ scale: 1.1 }}
                                    />
                                  ))}
                                </div>
                              )}
                              {review.helpful_count > 0 && (
                                <div className="flex items-center gap-1 mt-3 text-xs text-dark-400">
                                  <HandThumbUpIcon className="w-3.5 h-3.5" />
                                  {review.helpful_count} found this helpful
                                </div>
                              )}
                              <button
                                className="mt-2 text-xs text-dark-400 hover:text-primary-500 transition-colors inline-flex items-center gap-1"
                                onClick={async () => {
                                  if (!isAuthenticated) { setShowAuthModal(true); return }
                                  try {
                                    await api.post(`/api/reviews/${review.id}/helpful`)
                                    toast.success('Thanks for your feedback!')
                                  } catch {
                                    toast.error('Could not mark as helpful')
                                  }
                                }}
                              >
                                <HandThumbUpIcon className="w-3.5 h-3.5" />
                                Helpful
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      ) : !showReviewForm ? (
                        <p className="text-dark-500 dark:text-dark-400 text-center py-4">
                          No reviews yet. Be the first to review this product!
                        </p>
                      ) : null}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </section>
      </ScrollReveal>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <ScrollReveal animation="fadeUp">
          <section className="py-12">
            <div className="container mx-auto px-4">
              <motion.h2
                className="text-2xl font-bold text-dark-900 dark:text-white mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Related Products
              </motion.h2>
              <StaggerContainer
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 md:gap-6"
                staggerDelay={0.08}
              >
                {relatedProducts.slice(0, 5).map((relatedProduct) => (
                  <StaggerItem key={relatedProduct.id}>
                    <HoverCard intensity={8}>
                      <ProductCard product={relatedProduct} onQuickView={setQuickViewProduct} />
                    </HoverCard>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* Auth Modal for wishlist */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        message="Sign in to add items to your wishlist"
      />

      {/* Quick View Modal for related products */}
      <AnimatePresence>
        {quickViewProduct && (
          <QuickViewModal
            isOpen={!!quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
            product={quickViewProduct}
          />
        )}
      </AnimatePresence>

      {/* Add to Cart Success Modal */}
      <AddToCartModal
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
        product={addedProduct}
      />
    </motion.div>
  )
}
