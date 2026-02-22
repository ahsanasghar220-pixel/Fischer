import { motion, AnimatePresence } from 'framer-motion'
import type { Product } from '@/types'

interface ProductTabsProps {
  product: Product
  activeTab: 'description' | 'reviews'
  onTabChange: (tab: 'description' | 'reviews') => void
  reviewsContent: React.ReactNode
}

export default function ProductTabs({ product, activeTab, onTabChange, reviewsContent }: ProductTabsProps) {
  return (
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
            onClick={() => onTabChange(tab)}
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
              {reviewsContent}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
