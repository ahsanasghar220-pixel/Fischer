import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'

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

interface FilterSidebarProps {
  // Desktop sidebar
  categories: Category[] | undefined
  brands: Brand[] | undefined
  category: string
  brand: string
  minPrice: string
  maxPrice: string
  inStock: boolean
  onSale: boolean
  isNew: boolean
  isBestseller: boolean
  hasActiveFilters: boolean
  updateFilter: (key: string, value: string) => void
  toggleFilter: (key: string) => void
  clearFilters: () => void
  // Mobile drawer
  showFilters: boolean
  setShowFilters: (show: boolean) => void
  totalCount?: number
}

export default function FilterSidebar({
  categories,
  brands,
  category,
  brand,
  minPrice,
  maxPrice,
  inStock,
  onSale,
  isNew,
  isBestseller,
  hasActiveFilters,
  updateFilter,
  toggleFilter,
  clearFilters,
  showFilters,
  setShowFilters,
  totalCount,
}: FilterSidebarProps) {
  return (
    <>
      {/* Sidebar Filters - Desktop */}
      <motion.aside
        className="hidden lg:block w-64 flex-shrink-0"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="sticky top-4 space-y-6">
          {/* Categories */}
          <div className="bg-white dark:bg-dark-800 rounded-xl p-4 shadow-sm hover:scale-[1.01] transition-transform">
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
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Brands */}
          {brands && brands.length > 0 && (
            <div className="bg-white dark:bg-dark-800 rounded-xl p-4 shadow-sm hover:scale-[1.01] transition-transform">
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
          <div className="bg-white dark:bg-dark-800 rounded-xl p-4 shadow-sm hover:scale-[1.01] transition-transform">
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
          <div className="bg-white dark:bg-dark-800 rounded-xl p-4 shadow-sm hover:scale-[1.01] transition-transform">
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
              className="w-full py-2 text-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </motion.aside>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {showFilters && (
          <div className="lg:hidden fixed inset-0 bg-black/50 z-50">
            <motion.div
              className="absolute right-0 top-0 bottom-0 w-full sm:w-80 bg-white dark:bg-dark-800 overflow-y-auto flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            >
              <div className="p-4 border-b border-dark-200 dark:border-dark-700 flex items-center justify-between">
                <h3 className="font-semibold text-lg text-dark-900 dark:text-white">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="p-2.5 text-dark-500 dark:text-dark-400">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4 space-y-6 flex-1 overflow-y-auto">
                {/* Categories */}
                <div>
                  <h4 className="font-medium text-dark-900 dark:text-white mb-2">Categories</h4>
                  <div className="space-y-1">
                    <button
                      onClick={() => updateFilter('category', '')}
                      className={`block w-full text-left px-3 py-3 min-h-[44px] rounded transition-colors ${!category ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-dark-600 dark:text-dark-300 active:bg-dark-100 dark:active:bg-dark-700'}`}
                    >
                      All Categories
                    </button>
                    {categories?.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => updateFilter('category', cat.slug)}
                        className={`block w-full text-left px-3 py-3 min-h-[44px] rounded transition-colors ${category === cat.slug ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-dark-600 dark:text-dark-300 active:bg-dark-100 dark:active:bg-dark-700'}`}
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
                    <label className="flex items-center gap-2 py-2 text-dark-600 dark:text-dark-300">
                      <input
                        type="checkbox"
                        checked={inStock}
                        onChange={() => toggleFilter('in_stock')}
                        className="rounded text-primary-500 bg-white dark:bg-dark-700"
                      />
                      <span>In Stock Only</span>
                    </label>
                    <label className="flex items-center gap-2 py-2 text-dark-600 dark:text-dark-300">
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

              {/* Sticky "Show Results" footer button */}
              <div className="sticky bottom-0 p-4 border-t border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800">
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full py-3.5 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-colors active:scale-[0.98]"
                >
                  Show Results{totalCount !== undefined ? ` (${totalCount})` : ''}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
