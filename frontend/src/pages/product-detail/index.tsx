import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import api from '@/lib/api'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import AuthModal from '@/components/ui/AuthModal'
import AddToCartModal from '@/components/cart/AddToCartModal'
import ScrollReveal from '@/components/effects/ScrollReveal'
import toast from 'react-hot-toast'
import type { Product, ProductVariant } from '@/types'

import ImageGallery from './ImageGallery'
import ProductInfo from './ProductInfo'
import ProductTabs from './ProductTabs'
import ReviewsSection from './ReviewsSection'
import RelatedProducts from './RelatedProducts'

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [showCartModal, setShowCartModal] = useState(false)
  const [addedProduct, setAddedProduct] = useState<{id: number, name: string, primary_image?: string, price: number, quantity: number} | null>(null)
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description')
  const [showAuthModal, setShowAuthModal] = useState(false)
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

  // Reset state when navigating between products
  useEffect(() => {
    setQuantity(1)
    setSelectedVariant(null)
  }, [slug])

  // Sync wishlist state with server
  useEffect(() => {
    if (isAuthenticated && product) {
      api.post('/api/wishlist/check', { product_ids: [product.id] })
        .then(res => setIsInWishlist(res.data.data?.in_wishlist?.includes(product.id) || false))
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

  const currentPrice = selectedVariant?.price || product?.price || 0
  const comparePrice = selectedVariant?.compare_price || product?.compare_price
  const currentStock = selectedVariant?.stock ?? product?.stock ?? 0
  const discountPercentage = comparePrice && comparePrice > currentPrice
    ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100)
    : null

  const handleAddToCart = async () => {
    if (!product) return

    if (currentStock === 0 || product.stock_status === 'out_of_stock') {
      toast.error('This product is out of stock')
      return
    }

    setIsAddingToCart(true)
    try {
      await addItem(product.id, quantity, selectedVariant?.id)

      setAddedProduct({
        id: product.id,
        name: product.name,
        primary_image: product.images?.find(img => img.is_primary)?.image || product.images?.[0]?.image || undefined,
        price: selectedVariant?.price || product.price,
        quantity: quantity
      })
      setShowCartModal(true)
      setQuantity(1)
    } catch {
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

  const reviewsContent = (
    <ReviewsSection
      productId={product.id}
      reviews={product.reviews || []}
      isAuthenticated={isAuthenticated}
      canReview={canReview}
      showReviewForm={showReviewForm}
      onShowAuthModal={() => setShowAuthModal(true)}
      onShowReviewForm={setShowReviewForm}
      onReviewSuccess={() => {
        setShowReviewForm(false)
        setCanReview(false)
      }}
    />
  )

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
            {/* Image Gallery */}
            <ImageGallery
              images={product.images || []}
              productName={product.name}
            />

            {/* Product Info */}
            <ProductInfo
              product={product}
              selectedVariant={selectedVariant}
              quantity={quantity}
              isInWishlist={isInWishlist}
              isAddingToCart={isAddingToCart}
              currentPrice={currentPrice}
              comparePrice={comparePrice}
              currentStock={currentStock}
              discountPercentage={discountPercentage}
              onVariantSelect={setSelectedVariant}
              onQuantityChange={setQuantity}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              onShare={handleShare}
            />
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <ScrollReveal animation="fadeUp">
        <section className="py-8 bg-dark-50 dark:bg-dark-800">
          <div className="container mx-auto px-4">
            <ProductTabs
              product={product}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              reviewsContent={reviewsContent}
            />
          </div>
        </section>
      </ScrollReveal>

      {/* Related Products */}
      <RelatedProducts products={relatedProducts} />

      {/* Auth Modal for wishlist */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        message="Sign in to add items to your wishlist"
      />

      {/* Add to Cart Success Modal */}
      <AddToCartModal
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
        product={addedProduct}
      />
    </motion.div>
  )
}
