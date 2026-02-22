import { motion, AnimatePresence } from 'framer-motion'
import {
  HeartIcon,
  ShareIcon,
  MinusIcon,
  PlusIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  StarIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { Link } from 'react-router-dom'
import { formatPrice, formatDescription } from '@/lib/utils'
import type { Product, ProductVariant } from '@/types'

interface ProductInfoProps {
  product: Product
  selectedVariant: ProductVariant | null
  quantity: number
  isInWishlist: boolean
  isAddingToCart: boolean
  currentPrice: number
  comparePrice: number | null | undefined
  currentStock: number
  discountPercentage: number | null
  onVariantSelect: (variant: ProductVariant) => void
  onQuantityChange: (qty: number) => void
  onAddToCart: () => void
  onToggleWishlist: () => void
  onShare: () => void
}

export default function ProductInfo({
  product,
  selectedVariant,
  quantity,
  isInWishlist,
  isAddingToCart,
  currentPrice,
  comparePrice,
  currentStock,
  discountPercentage,
  onVariantSelect,
  onQuantityChange,
  onAddToCart,
  onToggleWishlist,
  onShare,
}: ProductInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      {/* Badges */}
      <motion.div
        className="flex items-center gap-2 mb-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        {product.is_new && <motion.span className="badge badge-primary" whileHover={{ scale: 1.1 }}>New</motion.span>}
        {product.is_bestseller && <motion.span className="px-2 py-0.5 bg-primary-700 dark:bg-primary-600 text-white text-xs font-bold rounded-md" whileHover={{ scale: 1.1 }}>Bestseller</motion.span>}
        {discountPercentage && <motion.span className="px-2 py-0.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-xs font-bold rounded-md" whileHover={{ scale: 1.1 }}>-{discountPercentage}%</motion.span>}
      </motion.div>

      {/* Brand */}
      {product.brand && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Link to={`/shop?brand=${product.brand.slug}`} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
            {product.brand.name}
          </Link>
        </motion.div>
      )}

      {/* Title */}
      <motion.h1
        className="text-xl sm:text-2xl md:text-3xl font-bold text-dark-900 dark:text-white mt-1 mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        {product.name}
      </motion.h1>

      {/* Rating */}
      {product.review_count !== undefined && product.review_count > 0 && (
        <motion.div
          className="flex items-center gap-2 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
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
        </motion.div>
      )}

      {/* Price */}
      <motion.div
        className="flex items-center gap-3 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <span className="text-2xl sm:text-3xl font-bold text-dark-900 dark:text-white">{formatPrice(currentPrice)}</span>
        {comparePrice && comparePrice > currentPrice && (
          <span className="text-base sm:text-lg md:text-xl text-dark-400 line-through">{formatPrice(comparePrice)}</span>
        )}
      </motion.div>

      {/* Short Description */}
      {product.short_description && (
        <motion.div
          className="text-dark-600 dark:text-dark-400 mb-6 space-y-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {formatDescription(product.short_description).map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </motion.div>
      )}

      {/* Variants */}
      {product.variants && product.variants.length > 0 && (
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <label className="block text-sm font-medium text-dark-900 dark:text-white mb-2">
            Select Variant
          </label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant, index) => (
              <motion.button
                key={variant.id}
                onClick={() => onVariantSelect(variant)}
                disabled={variant.stock === 0}
                className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  selectedVariant?.id === variant.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                    : variant.stock === 0
                    ? 'border-dark-200 dark:border-dark-600 text-dark-400 cursor-not-allowed'
                    : 'border-dark-200 dark:border-dark-600 text-dark-600 dark:text-dark-300 hover:border-dark-400 dark:hover:border-dark-500'
                }`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.55 + index * 0.05 }}
                whileHover={{ scale: variant.stock === 0 ? 1 : 1.05 }}
                whileTap={{ scale: variant.stock === 0 ? 1 : 0.95 }}
              >
                {variant.name}
                {variant.stock === 0 && ' (Out of Stock)'}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Stock Status */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {currentStock === 0 || product.stock_status === 'out_of_stock' ? (
          <span className="text-red-600 dark:text-red-400 font-bold text-lg">✕ Out of Stock</span>
        ) : currentStock <= 10 ? (
          <motion.span
            className="text-orange-600 dark:text-orange-400 font-medium"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ⚠ Low Stock - Only {currentStock} left
          </motion.span>
        ) : (
          <span className="text-green-600 dark:text-green-400 font-medium">✓ In Stock ({currentStock} available)</span>
        )}
      </motion.div>

      {/* Quantity & Add to Cart */}
      <motion.div
        className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
      >
        <div className="flex items-center border border-dark-200 dark:border-dark-600 rounded-lg">
          <motion.button
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            className={`p-3 transition-colors ${
              quantity <= 1
                ? 'opacity-40 cursor-not-allowed text-dark-400 dark:text-dark-600'
                : 'hover:bg-dark-50 dark:hover:bg-dark-700 text-dark-600 dark:text-dark-300'
            }`}
            disabled={quantity <= 1 || currentStock === 0}
            whileHover={quantity > 1 && currentStock > 0 ? { scale: 1.1 } : {}}
            whileTap={quantity > 1 && currentStock > 0 ? { scale: 0.9 } : {}}
          >
            <MinusIcon className="w-5 h-5" />
          </motion.button>
          <motion.span
            key={quantity}
            className="w-12 text-center font-medium text-dark-900 dark:text-white"
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            {quantity}
          </motion.span>
          <motion.button
            onClick={() => onQuantityChange(Math.min(currentStock, quantity + 1))}
            className={`p-3 transition-colors ${
              quantity >= currentStock || currentStock === 0
                ? 'opacity-40 cursor-not-allowed text-dark-400 dark:text-dark-600'
                : 'hover:bg-dark-50 dark:hover:bg-dark-700 text-dark-600 dark:text-dark-300'
            }`}
            disabled={quantity >= currentStock || currentStock === 0}
            whileHover={quantity < currentStock && currentStock > 0 ? { scale: 1.1 } : {}}
            whileTap={quantity < currentStock && currentStock > 0 ? { scale: 0.9 } : {}}
          >
            <PlusIcon className="w-5 h-5" />
          </motion.button>
        </div>

        <motion.button
          onClick={onAddToCart}
          disabled={isAddingToCart || currentStock === 0 || product.stock_status === 'out_of_stock'}
          className={`flex-1 py-2.5 px-6 rounded-lg font-semibold text-white transition-colors duration-200 ${
            currentStock === 0 || product.stock_status === 'out_of_stock'
              ? 'bg-dark-400 dark:bg-dark-600 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700'
          } ${isAddingToCart ? 'opacity-70' : ''}`}
          whileHover={currentStock > 0 && product.stock_status !== 'out_of_stock' ? { scale: 1.02 } : {}}
          whileTap={currentStock > 0 && product.stock_status !== 'out_of_stock' ? { scale: 0.98 } : {}}
        >
          {currentStock === 0 || product.stock_status === 'out_of_stock'
            ? '✕ Out of Stock'
            : isAddingToCart
              ? 'Adding...'
              : 'Add to Cart'
          }
        </motion.button>

        <motion.button
          onClick={onToggleWishlist}
          className="p-2.5 border border-dark-200 dark:border-dark-600 rounded-lg hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <AnimatePresence mode="wait">
            {isInWishlist ? (
              <motion.div
                key="filled"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <HeartSolidIcon className="w-6 h-6 text-primary-500" />
              </motion.div>
            ) : (
              <motion.div
                key="outline"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <HeartIcon className="w-6 h-6 text-dark-600 dark:text-dark-400" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        <motion.button
          onClick={onShare}
          className="p-3 border border-dark-200 dark:border-dark-600 rounded-lg hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ShareIcon className="w-6 h-6 text-dark-600 dark:text-dark-400" />
        </motion.button>
      </motion.div>

      {/* Features */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-t border-b border-dark-200 dark:border-dark-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        {[
          { icon: TruckIcon, label: 'Free Delivery in Lahore' },
          { icon: ShieldCheckIcon, label: '1 Year Warranty' },
          { icon: ArrowPathIcon, label: 'Easy Returns' },
        ].map((feature, index) => (
          <motion.div
            key={feature.label}
            className="text-center hover:scale-105 hover:-translate-y-0.5 transition-transform"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + index * 0.1 }}
          >
            <feature.icon className="w-8 h-8 mx-auto text-primary-500 mb-2" />
            <span className="text-sm text-dark-600 dark:text-dark-400">{feature.label}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* SKU */}
      <motion.p
        className="text-sm text-dark-500 dark:text-dark-400 mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        SKU: {selectedVariant?.sku || product.sku}
      </motion.p>
    </motion.div>
  )
}
