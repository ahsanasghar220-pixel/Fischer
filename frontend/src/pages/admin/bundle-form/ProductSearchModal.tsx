import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { formatPrice } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { BundleProductLocal } from './types'

interface ProductSearchModalProps {
  productSearch: string
  setProductSearch: (v: string) => void
  searchResults: BundleProductLocal[] | undefined
  loadingProducts: boolean
  onAdd: (product: BundleProductLocal) => void
  onClose: () => void
}

export default function ProductSearchModal({
  productSearch,
  setProductSearch,
  searchResults,
  loadingProducts,
  onAdd,
  onClose,
}: ProductSearchModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-800 rounded-xl w-full max-w-lg p-6 max-h-[80vh] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-dark-900 dark:text-white">Add Product</h3>
          <button onClick={onClose}>
            <XMarkIcon className="w-5 h-5 text-dark-400" />
          </button>
        </div>

        <input
          type="text"
          value={productSearch}
          onChange={(e) => setProductSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white mb-4"
          autoFocus
        />

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {loadingProducts ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : (searchResults || []).length > 0 ? (
            (searchResults || []).map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => onAdd(product)}
                className="w-full flex items-center gap-3 p-3 hover:bg-dark-50 dark:hover:bg-dark-700 rounded-lg text-left"
              >
                <div className="w-10 h-10 bg-dark-100 dark:bg-dark-600 rounded overflow-hidden">
                  {product.primary_image && (
                    <img src={product.primary_image} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-dark-900 dark:text-white">{product.name}</p>
                    {product.stock_status === 'out_of_stock' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded">
                        <ExclamationTriangleIcon className="w-3 h-3" />
                        OOS
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-dark-500">{formatPrice(product.price)}</p>
                </div>
              </button>
            ))
          ) : (
            <p className="text-center text-dark-500 py-4">No products found</p>
          )}
        </div>
      </div>
    </div>
  )
}
