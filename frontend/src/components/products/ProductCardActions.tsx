import { ShoppingCartIcon, EyeIcon } from '@heroicons/react/24/outline'
import type { Product } from '@/types'

interface ProductCardActionsProps {
  product: Product
  isAddingToCart: boolean
  isTouchDevice: boolean
  onAddToCart: (e: React.MouseEvent) => void
  onQuickView: (e: React.MouseEvent) => void
}

export default function ProductCardActions({
  product,
  isAddingToCart,
  isTouchDevice,
  onAddToCart,
  onQuickView,
}: ProductCardActionsProps) {
  return (
    <div className="product-actions">
      <button
        onClick={onAddToCart}
        disabled={isAddingToCart || product.stock_status === 'out_of_stock'}
        className={`flex-1 py-2.5 px-5 rounded-lg
                  text-white text-sm font-semibold
                  flex items-center justify-center gap-2
                  max-w-[200px]
                  transition-all duration-200 shadow-lg
                  ${product.stock_status === 'out_of_stock'
                    ? 'bg-dark-600 dark:bg-dark-600 cursor-not-allowed opacity-80'
                    : 'bg-primary-500 hover:bg-primary-400 hover:scale-[1.02] active:scale-[0.98]'
                  }
                  ${isAddingToCart ? 'opacity-70' : ''}`}
      >
        <ShoppingCartIcon className="w-4 h-4" />
        {product.stock_status === 'out_of_stock'
          ? 'Out of Stock'
          : isAddingToCart
            ? 'Adding...'
            : 'Add to Cart'
        }
      </button>
      {/* Hide Quick View on touch - users can tap the card itself */}
      {!isTouchDevice && (
        <button
          onClick={onQuickView}
          className="p-2 bg-white dark:bg-dark-800 hover:bg-dark-100 dark:hover:bg-dark-700
                    text-dark-900 dark:text-white rounded-lg
                    transition-all duration-200 shadow-lg
                    hover:scale-105 active:scale-95"
          aria-label="Quick view"
        >
          <EyeIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
