import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  HeartIcon,
  ShareIcon,
  MinusIcon,
  PlusIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import api from '@/lib/api'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ProductCard from '@/components/products/ProductCard'
import { formatPrice, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface ProductImage {
  id: number
  image: string
  alt_text?: string
  is_primary: boolean
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
  comment: string
  created_at: string
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
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description')

  const addItem = useCartStore((state) => state.addItem)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const { data: productData, isLoading, error } = useQuery<{ product: Product; related_products: Product[] }>({
    queryKey: ['product', slug],
    queryFn: async () => {
      const response = await api.get(`/products/${slug}`)
      return response.data.data
    },
  })

  const product = productData?.product
  const relatedProducts = productData?.related_products || []

  const handleAddToCart = async () => {
    if (!product) return

    if (product.stock_status === 'out_of_stock') {
      toast.error('This product is out of stock')
      return
    }

    setIsAddingToCart(true)
    try {
      await addItem(product.id, quantity, selectedVariant?.id)
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist')
      return
    }

    try {
      const response = await api.post('/wishlist/toggle', { product_id: product?.id })
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
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-900">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white mb-2">Product not found</h1>
          <p className="text-dark-500 dark:text-dark-400 mb-4">The product you're looking for doesn't exist.</p>
          <Link to="/shop" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-dark-900 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-dark-50 dark:bg-dark-800 border-b border-dark-200 dark:border-dark-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-dark-500 dark:text-dark-400">
            <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-primary-600 dark:hover:text-primary-400">Shop</Link>
            {product.category && (
              <>
                <span>/</span>
                <Link to={`/category/${product.category.slug}`} className="hover:text-primary-600 dark:hover:text-primary-400">
                  {product.category.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-dark-900 dark:text-white">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Images */}
            <div>
              <div className="aspect-square bg-dark-100 dark:bg-dark-800 rounded-xl overflow-hidden mb-4">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[selectedImage]?.image}
                    alt={product.images[selectedImage]?.alt_text || product.name}
                    width={600}
                    height={600}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-dark-400">
                    No image available
                  </div>
                )}
              </div>
              {product.images && product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-primary-500' : 'border-transparent'
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
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.is_new && <span className="badge badge-primary">New</span>}
                {product.is_bestseller && <span className="badge badge-dark">Bestseller</span>}
                {discountPercentage && <span className="badge badge-danger">-{discountPercentage}%</span>}
              </div>

              {product.brand && (
                <Link to={`/brand/${product.brand.slug}`} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                  {product.brand.name}
                </Link>
              )}

              <h1 className="text-2xl md:text-3xl font-bold text-dark-900 dark:text-white mt-1 mb-2">
                {product.name}
              </h1>

              {/* Rating */}
              {product.review_count !== undefined && product.review_count > 0 && (
                <div className="flex items-center gap-2 mb-4">
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
                </div>
              )}

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-dark-900 dark:text-white">{formatPrice(currentPrice)}</span>
                {comparePrice && comparePrice > currentPrice && (
                  <span className="text-xl text-dark-400 line-through">{formatPrice(comparePrice)}</span>
                )}
              </div>

              {/* Short Description */}
              {product.short_description && (
                <p className="text-dark-600 dark:text-dark-400 mb-6">{product.short_description}</p>
              )}

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-dark-900 dark:text-white mb-2">
                    Select Variant
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => (
                      <button
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
                      >
                        {variant.name}
                        {variant.stock === 0 && ' (Out of Stock)'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Status */}
              <div className="mb-6">
                {product.stock_status === 'in_stock' ? (
                  <span className="text-green-600 dark:text-green-400 font-medium">✓ In Stock ({currentStock} available)</span>
                ) : product.stock_status === 'low_stock' ? (
                  <span className="text-orange-600 dark:text-orange-400 font-medium">⚠ Low Stock - Only {currentStock} left</span>
                ) : (
                  <span className="text-red-600 dark:text-red-400 font-medium">✕ Out of Stock</span>
                )}
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-dark-200 dark:border-dark-600 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors text-dark-600 dark:text-dark-300"
                    disabled={quantity <= 1}
                  >
                    <MinusIcon className="w-5 h-5" />
                  </button>
                  <span className="w-12 text-center font-medium text-dark-900 dark:text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    className="p-3 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors text-dark-600 dark:text-dark-300"
                    disabled={quantity >= currentStock}
                  >
                    <PlusIcon className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || product.stock_status === 'out_of_stock'}
                  className="flex-1 btn btn-primary py-3"
                >
                  {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                </button>

                <button
                  onClick={handleToggleWishlist}
                  className="p-3 border border-dark-200 dark:border-dark-600 rounded-lg hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
                >
                  {isInWishlist ? (
                    <HeartSolidIcon className="w-6 h-6 text-red-500" />
                  ) : (
                    <HeartIcon className="w-6 h-6 text-dark-600 dark:text-dark-400" />
                  )}
                </button>

                <button
                  onClick={handleShare}
                  className="p-3 border border-dark-200 dark:border-dark-600 rounded-lg hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
                >
                  <ShareIcon className="w-6 h-6 text-dark-600 dark:text-dark-400" />
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-dark-200 dark:border-dark-700">
                <div className="text-center">
                  <TruckIcon className="w-8 h-8 mx-auto text-primary-500 mb-2" />
                  <span className="text-sm text-dark-600 dark:text-dark-400">Free Delivery</span>
                </div>
                <div className="text-center">
                  <ShieldCheckIcon className="w-8 h-8 mx-auto text-primary-500 mb-2" />
                  <span className="text-sm text-dark-600 dark:text-dark-400">1 Year Warranty</span>
                </div>
                <div className="text-center">
                  <ArrowPathIcon className="w-8 h-8 mx-auto text-primary-500 mb-2" />
                  <span className="text-sm text-dark-600 dark:text-dark-400">Easy Returns</span>
                </div>
              </div>

              {/* SKU */}
              <p className="text-sm text-dark-500 dark:text-dark-400 mt-4">
                SKU: {selectedVariant?.sku || product.sku}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-8 bg-dark-50 dark:bg-dark-800">
        <div className="container mx-auto px-4">
          <div className="bg-white dark:bg-dark-900 rounded-xl overflow-hidden border border-dark-200 dark:border-dark-700">
            {/* Tab Headers */}
            <div className="flex border-b border-dark-200 dark:border-dark-700">
              <button
                onClick={() => setActiveTab('description')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'description'
                    ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                    : 'text-dark-500 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('specifications')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'specifications'
                    ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                    : 'text-dark-500 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white'
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'reviews'
                    ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                    : 'text-dark-500 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white'
                }`}
              >
                Reviews ({product.review_count || 0})
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'description' && (
                <div className="prose dark:prose-invert max-w-none">
                  <div className="text-dark-700 dark:text-dark-300" dangerouslySetInnerHTML={{ __html: product.description || 'No description available.' }} />
                  {product.warranty_info && (
                    <div className="mt-6 p-4 bg-dark-50 dark:bg-dark-800 rounded-lg">
                      <h4 className="font-semibold text-dark-900 dark:text-white mb-2">Warranty Information</h4>
                      <p className="text-dark-600 dark:text-dark-400">{product.warranty_info}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'specifications' && (
                <div>
                  {product.specifications && Object.keys(product.specifications).length > 0 ? (
                    <table className="w-full">
                      <tbody>
                        {Object.entries(product.specifications).map(([key, value]) => (
                          <tr key={key} className="border-b border-dark-200 dark:border-dark-700 last:border-0">
                            <td className="py-3 font-medium text-dark-900 dark:text-white w-1/3">{key}</td>
                            <td className="py-3 text-dark-600 dark:text-dark-400">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-dark-500 dark:text-dark-400">No specifications available.</p>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  {product.reviews && product.reviews.length > 0 ? (
                    <div className="space-y-6">
                      {product.reviews.map((review) => (
                        <div key={review.id} className="border-b border-dark-200 dark:border-dark-700 pb-6 last:border-0">
                          <div className="flex items-center gap-2 mb-2">
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
                            <span className="text-dark-400">•</span>
                            <span className="text-sm text-dark-500 dark:text-dark-400">{formatDate(review.created_at)}</span>
                          </div>
                          {review.title && (
                            <h4 className="font-medium text-dark-900 dark:text-white mb-1">{review.title}</h4>
                          )}
                          <p className="text-dark-600 dark:text-dark-400">{review.comment}</p>
                          {review.images && review.images.length > 0 && (
                            <div className="flex gap-2 mt-3">
                              {review.images.map((img, i) => (
                                <img
                                  key={i}
                                  src={img.image}
                                  alt={`Review image ${i + 1}`}
                                  width={80}
                                  height={80}
                                  className="w-20 h-20 object-cover rounded"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-dark-500 dark:text-dark-400 mb-4">No reviews yet. Be the first to review this product!</p>
                      {isAuthenticated && (
                        <button className="btn btn-primary">Write a Review</button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {relatedProducts.slice(0, 5).map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
