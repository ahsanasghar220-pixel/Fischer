import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FunnelIcon } from '@heroicons/react/24/outline'
import api from '@/lib/api'
import ProductCard from '@/components/products/ProductCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface SaleProduct {
  id: number
  name: string
  slug: string
  price: number
  compare_price: number | null
  sale_price: number | null
  primary_image: string | null
  images: { id: number; url: string; is_primary: boolean }[]
  discount_percentage: number | null
  average_rating: number
  reviews_count: number
  category?: { id: number; name: string; slug: string }
}

interface SaleData {
  id: number
  name: string
  slug: string
  description: string | null
  banner_image: string | null
  start_date: string | null
  end_date: string | null
  products: SaleProduct[]
}

type SortOption = 'default' | 'price_low' | 'price_high' | 'discount'

export default function Sale() {
  const { slug } = useParams<{ slug: string }>()
  const [sort, setSort] = useState<SortOption>('default')

  const { data: sale, isLoading, isError } = useQuery<SaleData>({
    queryKey: ['sale', slug],
    queryFn: async () => {
      const res = await api.get(`/api/sales/${slug}`)
      return res.data.data?.data || res.data.data
    },
  })

  const sortedProducts = useMemo(() => {
    if (!sale?.products) return []
    const products = [...sale.products]
    switch (sort) {
      case 'price_low':
        return products.sort((a, b) => (a.sale_price || a.price) - (b.sale_price || b.price))
      case 'price_high':
        return products.sort((a, b) => (b.sale_price || b.price) - (a.sale_price || a.price))
      case 'discount':
        return products.sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0))
      default:
        return products
    }
  }, [sale?.products, sort])

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (isError || !sale) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-2">Sale Not Found</h2>
          <p className="text-dark-500 dark:text-dark-400 mb-4">This sale may have ended or doesn't exist.</p>
          <Link to="/shop" className="text-primary-600 hover:text-primary-700 font-medium">
            Browse Shop
          </Link>
        </div>
      </div>
    )
  }

  const endDate = sale.end_date ? new Date(sale.end_date) : null
  const isEnding = endDate && (endDate.getTime() - Date.now()) < 3 * 24 * 60 * 60 * 1000 // 3 days

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      {sale.banner_image ? (
        <div className="relative h-64 md:h-80 bg-dark-900 overflow-hidden">
          <img
            src={sale.banner_image}
            alt={sale.name}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{sale.name}</h1>
              {sale.description && (
                <p className="text-lg text-white/80 max-w-2xl mx-auto">{sale.description}</p>
              )}
              {isEnding && (
                <p className="mt-3 text-sm text-yellow-300 font-medium">
                  Ending soon — {endDate?.toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 py-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{sale.name}</h1>
            {sale.description && (
              <p className="text-lg text-white/80 max-w-2xl mx-auto">{sale.description}</p>
            )}
            {isEnding && (
              <p className="mt-3 text-sm text-yellow-200 font-medium">
                Ending soon — {endDate?.toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Sort Bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-dark-600 dark:text-dark-400">
            {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'}
          </p>
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-4 h-4 text-dark-400" />
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortOption)}
              className="px-3 py-1.5 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
            >
              <option value="default">Default</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="discount">Biggest Discount</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {sortedProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-dark-500 dark:text-dark-400">No products in this sale yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {sortedProducts.map(product => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  price: product.sale_price || product.price,
                  compare_price: product.sale_price ? product.price : product.compare_price,
                  stock_status: 'in_stock',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
