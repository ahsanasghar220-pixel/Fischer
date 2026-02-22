import { motion } from 'framer-motion'
import ProductCard from '@/components/products/ProductCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { StaggerContainer, StaggerItem } from '@/components/effects/ScrollReveal'
import type { Product } from '@/types'

interface PaginatedProducts {
  data: Product[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

interface ProductGridProps {
  productsData: PaginatedProducts | undefined
  isLoading: boolean
  error: Error | null
  viewMode: 'grid' | 'list'
  onQuickView: (product: Product) => void
  onRefetch: () => void
  onClearFilters: () => void
  onPageChange: (page: number) => void
  onMouseEnterPagination: () => void
}

export default function ProductGrid({
  productsData,
  isLoading,
  error,
  viewMode,
  onQuickView,
  onRefetch,
  onClearFilters,
  onPageChange,
  onMouseEnterPagination,
}: ProductGridProps) {
  if (error) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">Failed to Load Products</h3>
          <p className="text-dark-600 dark:text-dark-400 mb-4">We couldn't load the products. Please try again.</p>
          <button
            onClick={onRefetch}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    )
  }

  if (isLoading) {
    return (
      <motion.div
        className="flex items-center justify-center py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <LoadingSpinner size="lg" />
      </motion.div>
    )
  }

  if (productsData?.data && productsData.data.length > 0) {
    return (
      <>
        <StaggerContainer
          className={`grid gap-2 sm:gap-4 md:gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}
          staggerDelay={0.05}
        >
          {productsData.data.map((product) => (
            <StaggerItem key={product.id}>
              <div className={`transition-transform duration-300 ${viewMode === 'grid' ? 'hover:-translate-y-2' : ''}`}>
                <ProductCard
                  product={product}
                  onQuickView={onQuickView}
                  viewMode={viewMode}
                />
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Pagination */}
        {productsData.meta.last_page > 1 && (
          <motion.div
            className="mt-8 flex items-center justify-center gap-2"
            onMouseEnter={onMouseEnterPagination}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {(() => {
              const currentPage = productsData.meta.current_page
              const lastPage = productsData.meta.last_page
              const pages: (number | string)[] = []

              if (lastPage <= 7) {
                for (let i = 1; i <= lastPage; i++) pages.push(i)
              } else {
                pages.push(1)
                if (currentPage > 3) pages.push('...')
                for (let i = Math.max(2, currentPage - 1); i <= Math.min(lastPage - 1, currentPage + 1); i++) {
                  pages.push(i)
                }
                if (currentPage < lastPage - 2) pages.push('...')
                pages.push(lastPage)
              }

              return pages.map((page, idx) =>
                typeof page === 'string' ? (
                  <span key={`ellipsis-${idx}`} className="px-3 py-2 text-dark-400">...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      currentPage === page
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700'
                    }`}
                  >
                    {page}
                  </button>
                )
              )
            })()}
          </motion.div>
        )}
      </>
    )
  }

  // Empty state
  return (
    <motion.div
      className="bg-white dark:bg-dark-800 rounded-xl p-12 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="text-6xl mb-4"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🔍
      </motion.div>
      <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">No products found</h3>
      <p className="text-dark-500 dark:text-dark-400 mb-6">
        Try adjusting your filters or search terms
      </p>
      <motion.button
        onClick={onClearFilters}
        className="btn btn-primary"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Clear Filters
      </motion.button>
    </motion.div>
  )
}
