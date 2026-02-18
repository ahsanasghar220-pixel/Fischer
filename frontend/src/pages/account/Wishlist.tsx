import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { TrashIcon, ShoppingCartIcon, HeartIcon } from '@heroicons/react/24/outline'
import api from '@/lib/api'
import { useCartStore } from '@/stores/cartStore'
import { formatPrice } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

interface WishlistItem {
  id: number
  product: {
    id: number
    name: string
    slug: string
    price: number
    compare_price?: number
    primary_image?: string
    stock_status: string
  }
  created_at: string
}

export default function Wishlist() {
  const queryClient = useQueryClient()
  const addToCart = useCartStore((state) => state.addItem)

  const { data: items, isLoading } = useQuery<WishlistItem[]>({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const response = await api.get('/api/wishlist')
      return response.data.data
    },
  })

  const removeMutation = useMutation({
    mutationFn: async (productId: number) => {
      await api.post('/api/wishlist/toggle', { product_id: productId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      toast.success('Removed from wishlist')
    },
    onError: () => {
      toast.error('Failed to remove item')
    },
  })

  const handleAddToCart = async (item: WishlistItem) => {
    if (item.product.stock_status === 'out_of_stock') {
      toast.error('This product is out of stock')
      return
    }
    await addToCart(item.product.id)
  }

  const handleAddAllToCart = async () => {
    if (!items) return
    const inStockItems = items.filter((item) => item.product.stock_status !== 'out_of_stock')
    if (inStockItems.length === 0) {
      toast.error('No items in stock to add')
      return
    }
    for (const item of inStockItems) {
      await addToCart(item.product.id)
    }
    toast.success(`Added ${inStockItems.length} items to cart`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm">
        {/* Header */}
        <div className="p-4 border-b border-dark-200 dark:border-dark-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-dark-900 dark:text-white">My Wishlist</h2>
            <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
              {items?.length || 0} item(s) in your wishlist
            </p>
          </div>
          {items && items.length > 0 && (
            <button onClick={handleAddAllToCart} className="btn btn-primary">
              Add All to Cart
            </button>
          )}
        </div>

        {/* Items */}
        {items && items.length > 0 ? (
          <div className="divide-y divide-dark-200 dark:divide-dark-700">
            {items.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex gap-4">
                  {/* Image */}
                  <Link
                    to={`/product/${item.product.slug}`}
                    className="w-24 h-24 bg-dark-100 dark:bg-dark-700 rounded-lg overflow-hidden flex-shrink-0"
                  >
                    {item.product.primary_image ? (
                      <img
                        src={item.product.primary_image}
                        alt={item.product.name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-dark-400">
                        No image
                      </div>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.product.slug}`}
                      className="font-medium text-dark-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      {item.product.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-semibold text-dark-900 dark:text-white">
                        {formatPrice(item.product.price)}
                      </span>
                      {item.product.compare_price && item.product.compare_price > item.product.price && (
                        <span className="text-sm text-dark-400 line-through">
                          {formatPrice(item.product.compare_price)}
                        </span>
                      )}
                    </div>
                    <div className="mt-2">
                      {item.product.stock_status === 'in_stock' ? (
                        <span className="text-sm text-green-600 dark:text-green-400">In Stock</span>
                      ) : item.product.stock_status === 'low_stock' ? (
                        <span className="text-sm text-orange-600 dark:text-orange-400">Low Stock</span>
                      ) : (
                        <span className="text-sm text-red-600 dark:text-red-400">Out of Stock</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={item.product.stock_status === 'out_of_stock'}
                      className="btn btn-primary btn-sm flex items-center gap-1"
                    >
                      <ShoppingCartIcon className="w-4 h-4" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => removeMutation.mutate(item.product.id)}
                      className="btn btn-dark-outline btn-sm flex items-center gap-1 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <HeartIcon className="w-16 h-16 mx-auto text-dark-400 dark:text-dark-600 mb-4" />
            <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">Your wishlist is empty</h3>
            <p className="text-dark-500 dark:text-dark-400 mb-6">
              Save items you love by clicking the heart icon on products
            </p>
            <Link to="/shop" className="btn btn-primary">
              Browse Products
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
