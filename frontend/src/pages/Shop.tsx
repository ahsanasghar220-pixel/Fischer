import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FunnelIcon, XMarkIcon, ChevronDownIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline'
import api from '@/lib/api'
import ProductCard from '@/components/products/ProductCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

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

interface Category {
  id: number
  name: string
  slug: string
  products_count: number
  children?: Category[]
}

interface Brand {
  id: number
  name: string
  slug: string
  products_count?: number
}

interface PaginatedProducts {
  data: Product[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

const sortOptions = [
  { value: 'latest', label: 'Latest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A to Z' },
  { value: 'name_desc', label: 'Name: Z to A' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'bestseller', label: 'Bestsellers' },
]

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const page = parseInt(searchParams.get('page') || '1')
  const sort = searchParams.get('sort') || 'latest'
  const category = searchParams.get('category') || ''
  const brand = searchParams.get('brand') || ''
  const minPrice = searchParams.get('min_price') || ''
  const maxPrice = searchParams.get('max_price') || ''
  const search = searchParams.get('search') || ''
  const inStock = searchParams.get('in_stock') === '1'
  const onSale = searchParams.get('on_sale') === '1'
  const isNew = searchParams.get('new') === '1'
  const isBestseller = searchParams.get('bestseller') === '1'
  const isFeatured = searchParams.get('featured') === '1'

  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories')
      return response.data.data
    },
  })

  // Fetch brands
  const { data: brands } = useQuery<Brand[]>({
    queryKey: ['brands'],
    queryFn: async () => {
      const response = await api.get('/brands')
      return response.data.data
    },
  })

  // Fetch products
  const { data: productsData, isLoading } = useQuery<PaginatedProducts>({
    queryKey: ['products', page, sort, category, brand, minPrice, maxPrice, search, inStock, onSale, isNew, isBestseller, isFeatured],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('sort', sort)
      if (category) params.set('category', category)
      if (brand) params.set('brand', brand)
      if (minPrice) params.set('min_price', minPrice)
      if (maxPrice) params.set('max_price', maxPrice)
      if (search) params.set('search', search)
      if (inStock) params.set('in_stock', '1')
      if (onSale) params.set('on_sale', '1')
      if (isNew) params.set('new', '1')
      if (isBestseller) params.set('bestseller', '1')
      if (isFeatured) params.set('featured', '1')

      const response = await api.get(`/products?${params.toString()}`)
      return response.data
    },
  })

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    newParams.set('page', '1')
    setSearchParams(newParams)
  }

  const toggleFilter = (key: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (newParams.get(key) === '1') {
      newParams.delete(key)
    } else {
      newParams.set(key, '1')
    }
    newParams.set('page', '1')
    setSearchParams(newParams)
  }

  const clearFilters = () => {
    setSearchParams({})
  }

  const hasActiveFilters = category || brand || minPrice || maxPrice || inStock || onSale || isNew || isBestseller || isFeatured

  return (
    <div className="bg-dark-50 dark:bg-dark-900 min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 border-b border-dark-200 dark:border-dark-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-dark-500 dark:text-dark-400 mb-4">
            <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400">Home</Link>
            <span>/</span>
            <span className="text-dark-900 dark:text-white">Shop</span>
          </div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white">
            {search ? `Search: "${search}"` : 'All Products'}
          </h1>
          {productsData && (
            <p className="text-dark-500 dark:text-dark-400 mt-2">
              {productsData.meta.total} products found
            </p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-4 space-y-6">
              {/* Categories */}
              <div className="bg-white dark:bg-dark-800 rounded-xl p-4 shadow-sm">
                <h3 className="font-semibold text-dark-900 dark:text-white mb-3">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => updateFilter('category', '')}
                    className={`block w-full text-left px-2 py-1.5 rounded transition-colors ${
                      !category
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                        : 'text-dark-600 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories?.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => updateFilter('category', cat.slug)}
                      className={`block w-full text-left px-2 py-1.5 rounded transition-colors ${
                        category === cat.slug
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                          : 'text-dark-600 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700'
                      }`}
                    >
                      {cat.name} ({cat.products_count || 0})
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands */}
              {brands && brands.length > 0 && (
                <div className="bg-white dark:bg-dark-800 rounded-xl p-4 shadow-sm">
                  <h3 className="font-semibold text-dark-900 dark:text-white mb-3">Brands</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {brands.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => updateFilter('brand', brand === b.slug ? '' : b.slug)}
                        className={`block w-full text-left px-2 py-1.5 rounded transition-colors ${
                          brand === b.slug
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                            : 'text-dark-600 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700'
                        }`}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div className="bg-white dark:bg-dark-800 rounded-xl p-4 shadow-sm">
                <h3 className="font-semibold text-dark-900 dark:text-white mb-3">Price Range</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => updateFilter('min_price', e.target.value)}
                    className="w-full px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg text-sm bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400"
                  />
                  <span className="text-dark-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => updateFilter('max_price', e.target.value)}
                    className="w-full px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg text-sm bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400"
                  />
                </div>
              </div>

              {/* Quick Filters */}
              <div className="bg-white dark:bg-dark-800 rounded-xl p-4 shadow-sm">
                <h3 className="font-semibold text-dark-900 dark:text-white mb-3">Quick Filters</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStock}
                      onChange={() => toggleFilter('in_stock')}
                      className="rounded text-primary-500 focus:ring-primary-500 bg-white dark:bg-dark-700 border-dark-300 dark:border-dark-600"
                    />
                    <span className="text-dark-600 dark:text-dark-300">In Stock Only</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onSale}
                      onChange={() => toggleFilter('on_sale')}
                      className="rounded text-primary-500 focus:ring-primary-500 bg-white dark:bg-dark-700 border-dark-300 dark:border-dark-600"
                    />
                    <span className="text-dark-600 dark:text-dark-300">On Sale</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isNew}
                      onChange={() => toggleFilter('new')}
                      className="rounded text-primary-500 focus:ring-primary-500 bg-white dark:bg-dark-700 border-dark-300 dark:border-dark-600"
                    />
                    <span className="text-dark-600 dark:text-dark-300">New Arrivals</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isBestseller}
                      onChange={() => toggleFilter('bestseller')}
                      className="rounded text-primary-500 focus:ring-primary-500 bg-white dark:bg-dark-700 border-dark-300 dark:border-dark-600"
                    />
                    <span className="text-dark-600 dark:text-dark-300">Bestsellers</span>
                  </label>
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full py-2 text-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white dark:bg-dark-800 rounded-xl p-4 shadow-sm mb-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center gap-2 text-dark-600 dark:text-dark-300 hover:text-dark-900 dark:hover:text-white"
                  >
                    <FunnelIcon className="w-5 h-5" />
                    Filters
                    {hasActiveFilters && (
                      <span className="w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                        !
                      </span>
                    )}
                  </button>

                  <div className="hidden sm:flex items-center gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-dark-100 dark:bg-dark-700 text-dark-900 dark:text-white' : 'text-dark-400 hover:text-dark-600 dark:hover:text-dark-300'}`}
                    >
                      <Squares2X2Icon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-dark-100 dark:bg-dark-700 text-dark-900 dark:text-white' : 'text-dark-400 hover:text-dark-600 dark:hover:text-dark-300'}`}
                    >
                      <ListBulletIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-dark-500 dark:text-dark-400 hidden sm:inline">Sort by:</span>
                  <div className="relative">
                    <select
                      value={sort}
                      onChange={(e) => updateFilter('sort', e.target.value)}
                      className="appearance-none bg-transparent pr-8 py-2 text-sm font-medium text-dark-900 dark:text-white cursor-pointer focus:outline-none"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value} className="bg-white dark:bg-dark-800">
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDownIcon className="w-4 h-4 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-dark-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="lg:hidden fixed inset-0 bg-black/50 z-50">
                <div className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-dark-800 overflow-y-auto">
                  <div className="p-4 border-b border-dark-200 dark:border-dark-700 flex items-center justify-between">
                    <h3 className="font-semibold text-lg text-dark-900 dark:text-white">Filters</h3>
                    <button onClick={() => setShowFilters(false)} className="text-dark-500 dark:text-dark-400">
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="p-4 space-y-6">
                    {/* Categories */}
                    <div>
                      <h4 className="font-medium text-dark-900 dark:text-white mb-2">Categories</h4>
                      <div className="space-y-1">
                        <button
                          onClick={() => { updateFilter('category', ''); setShowFilters(false); }}
                          className={`block w-full text-left px-2 py-1.5 rounded ${!category ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-dark-600 dark:text-dark-300'}`}
                        >
                          All Categories
                        </button>
                        {categories?.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => { updateFilter('category', cat.slug); setShowFilters(false); }}
                            className={`block w-full text-left px-2 py-1.5 rounded ${category === cat.slug ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-dark-600 dark:text-dark-300'}`}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div>
                      <h4 className="font-medium text-dark-900 dark:text-white mb-2">Price Range</h4>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={minPrice}
                          onChange={(e) => updateFilter('min_price', e.target.value)}
                          className="w-full px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg text-sm bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                        />
                        <span className="text-dark-400">-</span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={maxPrice}
                          onChange={(e) => updateFilter('max_price', e.target.value)}
                          className="w-full px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg text-sm bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Quick Filters */}
                    <div>
                      <h4 className="font-medium text-dark-900 dark:text-white mb-2">Quick Filters</h4>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-dark-600 dark:text-dark-300">
                          <input
                            type="checkbox"
                            checked={inStock}
                            onChange={() => toggleFilter('in_stock')}
                            className="rounded text-primary-500 bg-white dark:bg-dark-700"
                          />
                          <span>In Stock Only</span>
                        </label>
                        <label className="flex items-center gap-2 text-dark-600 dark:text-dark-300">
                          <input
                            type="checkbox"
                            checked={onSale}
                            onChange={() => toggleFilter('on_sale')}
                            className="rounded text-primary-500 bg-white dark:bg-dark-700"
                          />
                          <span>On Sale</span>
                        </label>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-dark-200 dark:border-dark-700">
                      <button
                        onClick={() => { clearFilters(); setShowFilters(false); }}
                        className="w-full py-2 text-primary-600 dark:text-primary-400 font-medium"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" />
              </div>
            ) : productsData?.data && productsData.data.length > 0 ? (
              <>
                <div className={`grid gap-4 md:gap-6 ${
                  viewMode === 'grid'
                    ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
                    : 'grid-cols-1'
                }`}>
                  {productsData.data.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {productsData.meta.last_page > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    {Array.from({ length: productsData.meta.last_page }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => updateFilter('page', p.toString())}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          p === productsData.meta.current_page
                            ? 'bg-primary-500 text-white'
                            : 'bg-white dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white dark:bg-dark-800 rounded-xl p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">No products found</h3>
                <p className="text-dark-500 dark:text-dark-400 mb-6">
                  Try adjusting your filters or search terms
                </p>
                <button onClick={clearFilters} className="btn btn-primary">
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
