import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { TrashIcon, MinusIcon, PlusIcon, GiftIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { formatPrice } from '@/lib/utils'

interface CartItemData {
  id: number
  product_id: number | null
  variant_id: number | null
  bundle_id: number | null
  is_bundle_item: boolean
  parent_cart_item_id: number | null
  product: {
    id: number
    name: string
    slug: string
    sku: string
    image: string | null
    primary_image: string | null
    price: number
    stock_quantity: number
    track_inventory: boolean
  } | null
  bundle: {
    id: number
    name: string
    slug: string
    featured_image: string | null
    cart_display: 'single_item' | 'grouped' | 'individual'
    discount_type: 'fixed_price' | 'percentage'
    discount_value: number
    original_price: number
    discounted_price: number
    savings: number
    items_count: number
  } | null
  bundle_slot_selections: Array<{
    slot_id: number
    slot_name: string
    product_id: number
    product_name: string
    product_image: string | null
  }> | null
  variant: {
    id: number
    sku: string
    name: string
    price: number
    attributes: Array<{ attribute: string; value: string }>
  } | null
  quantity: number
  unit_price: number
  total_price: number
  bundle_discount: number
  is_available: boolean
}

interface CartItemRowProps {
  item: CartItemData
  index: number
  onQuantityChange: (itemId: number, quantity: number) => void
  onRemove: (itemId: number) => void
}

export default function CartItemRow({ item, index, onQuantityChange, onRemove }: CartItemRowProps) {
  const isBundle = item.bundle_id && item.bundle

  if (isBundle) {
    return (
      <BundleCartItem
        item={item}
        index={index}
        onQuantityChange={onQuantityChange}
        onRemove={onRemove}
      />
    )
  }

  // Regular product item
  return (
    <motion.div
      className="p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100, height: 0, padding: 0 }}
      transition={{ delay: index * 0.05 }}
      layout
    >
      <div className="md:grid md:grid-cols-12 md:gap-4 md:items-center">
        {/* Product */}
        <div className="md:col-span-6 flex gap-3 sm:gap-4">
          <Link
            to={`/product/${item.product?.slug || ''}`}
            className="w-16 h-16 sm:w-20 sm:h-20 bg-dark-100 dark:bg-dark-700 rounded-lg overflow-hidden flex-shrink-0"
          >
            <motion.div whileHover={{ scale: 1.05 }}>
              {(item.product?.primary_image || item.product?.image) ? (
                <img
                  src={item.product?.primary_image || item.product?.image || '/placeholder.png'}
                  alt={item.product?.name || 'Product'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-dark-400 dark:text-dark-500 text-xs">
                  No image
                </div>
              )}
            </motion.div>
          </Link>
          <div className="flex-1 min-w-0">
            <Link
              to={`/product/${item.product?.slug || ''}`}
              className="text-sm sm:text-base font-medium text-dark-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors break-words block line-clamp-2"
            >
              {item.product?.name || 'Product'}
            </Link>
            {item.variant && (
              <p className="text-xs sm:text-sm text-dark-500 dark:text-dark-400 mt-0.5">{item.variant.name}</p>
            )}
            {/* Mobile: Show price below product name */}
            <div className="mt-1 md:hidden">
              <span className="text-xs text-dark-500 dark:text-dark-400">
                {formatPrice(item.unit_price || item.variant?.price || item.product?.price || 0)} each
              </span>
            </div>
          </div>
        </div>

        {/* Price - Desktop Only */}
        <div className="md:col-span-2 text-center hidden md:block">
          <span className="text-dark-900 dark:text-white font-medium">
            {formatPrice(item.unit_price || item.variant?.price || item.product?.price || 0)}
          </span>
        </div>

        {/* Quantity & Actions - Mobile & Desktop */}
        <div className="md:col-span-2 flex items-center justify-between md:justify-center mt-3 md:mt-0">
          <div className="flex items-center border border-dark-200 dark:border-dark-600 rounded-lg">
            <motion.button
              onClick={() => onQuantityChange(item.id, item.quantity - 1)}
              className="p-1.5 sm:p-2 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors text-dark-600 dark:text-dark-300"
              disabled={item.quantity <= 1}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MinusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </motion.button>
            <motion.span
              key={item.quantity}
              className="w-8 sm:w-10 text-center text-sm sm:text-base font-medium text-dark-900 dark:text-white"
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              {item.quantity}
            </motion.span>
            <motion.button
              onClick={() => onQuantityChange(item.id, item.quantity + 1)}
              disabled={item.quantity >= (item.product?.stock_quantity || 99)}
              className="p-1.5 sm:p-2 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors text-dark-600 dark:text-dark-300 disabled:opacity-40 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <PlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </motion.button>
          </div>
          {/* Mobile: Remove button next to quantity */}
          <motion.button
            onClick={() => onRemove(item.id)}
            className="md:hidden p-2 text-dark-400 hover:text-red-500 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <TrashIcon className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Total - Desktop */}
        <div className="md:col-span-2 text-right hidden md:flex md:items-center md:justify-end md:gap-4">
          <motion.span
            key={item.total_price}
            className="font-semibold text-dark-900 dark:text-white"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
          >
            {formatPrice(item.total_price || (item.unit_price || item.variant?.price || item.product?.price || 0) * item.quantity)}
          </motion.span>
          <motion.button
            onClick={() => onRemove(item.id)}
            className="p-2 text-dark-400 hover:text-red-500 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <TrashIcon className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Total - Mobile Only */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-dark-100 dark:border-dark-700 md:hidden">
          <span className="text-sm font-medium text-dark-600 dark:text-dark-400">
            Subtotal:
          </span>
          <motion.span
            key={item.total_price}
            className="text-base font-bold text-dark-900 dark:text-white"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
          >
            {formatPrice(item.total_price || (item.unit_price || item.variant?.price || item.product?.price || 0) * item.quantity)}
          </motion.span>
        </div>
      </div>
    </motion.div>
  )
}

// Bundle Cart Item Component
function BundleCartItem({ item, index, onQuantityChange, onRemove }: CartItemRowProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const bundle = item.bundle
  if (!bundle) return null

  return (
    <motion.div
      className="p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100, height: 0, padding: 0 }}
      transition={{ delay: index * 0.05 }}
      layout
    >
      {/* Bundle Header with different background */}
      <div className="bg-gradient-to-r from-primary-50 to-red-50 dark:from-primary-900/20 dark:to-red-900/20 -mx-4 -mt-4 px-4 py-3 mb-4 border-b border-primary-200 dark:border-primary-800/30">
        <div className="flex items-center gap-2">
          <GiftIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">Bundle Offer</span>
          {bundle.savings > 0 && (
            <span className="ml-auto text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
              Save {formatPrice(bundle.savings)}
            </span>
          )}
        </div>
      </div>

      <div className="md:grid md:grid-cols-12 md:gap-4 md:items-start">
        {/* Bundle Image & Info */}
        <div className="col-span-6 flex gap-4">
          <Link
            to={`/bundle/${bundle.slug}`}
            className="w-20 h-20 bg-dark-100 dark:bg-dark-700 rounded-lg overflow-hidden flex-shrink-0 relative"
          >
            <motion.div whileHover={{ scale: 1.05 }}>
              {bundle.featured_image ? (
                <img
                  src={bundle.featured_image}
                  alt={bundle.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-red-100 dark:from-primary-900/30 dark:to-red-900/30">
                  <GiftIcon className="w-8 h-8 text-primary-500" />
                </div>
              )}
            </motion.div>
            {/* Bundle badge */}
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">{bundle.items_count}</span>
            </div>
          </Link>
          <div className="flex-1">
            <Link
              to={`/bundle/${bundle.slug}`}
              className="font-medium text-dark-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {bundle.name}
            </Link>
            <p className="text-sm text-dark-500 dark:text-dark-400 mt-0.5">
              {bundle.items_count} items included
            </p>

            {/* Show bundle contents for grouped display */}
            {bundle.cart_display === 'grouped' && item.bundle_slot_selections && item.bundle_slot_selections.length > 0 && (
              <div className="mt-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  <ChevronDownIcon className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  {isExpanded ? 'Hide items' : 'View items'}
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-primary-200 dark:border-primary-800/50">
                        {item.bundle_slot_selections.map((selection) => (
                          <div key={`${selection.slot_id}-${selection.product_id}`} className="flex items-center gap-2 text-xs">
                            {selection.product_image && (
                              <img src={selection.product_image} alt="" className="w-6 h-6 rounded object-cover" />
                            )}
                            <span className="text-dark-600 dark:text-dark-400">
                              <span className="text-dark-400 dark:text-dark-500">{selection.slot_name}:</span> {selection.product_name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <motion.button
              onClick={() => onRemove(item.id)}
              className="text-sm text-red-500 hover:text-red-600 mt-2 flex items-center gap-1 md:hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <TrashIcon className="w-4 h-4" />
              Remove
            </motion.button>
          </div>
        </div>

        {/* Price */}
        <div className="col-span-2 text-center hidden md:block">
          <div className="flex flex-col items-center">
            <span className="text-dark-900 dark:text-white font-medium">
              {formatPrice(bundle.discounted_price)}
            </span>
            {bundle.original_price > bundle.discounted_price && (
              <span className="text-xs text-dark-400 line-through">
                {formatPrice(bundle.original_price)}
              </span>
            )}
          </div>
        </div>

        {/* Quantity */}
        <div className="col-span-2 flex items-center justify-center mt-4 md:mt-0">
          <div className="flex items-center border border-dark-200 dark:border-dark-600 rounded-lg">
            <motion.button
              onClick={() => onQuantityChange(item.id, item.quantity - 1)}
              className="p-2 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors text-dark-600 dark:text-dark-300"
              disabled={item.quantity <= 1}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MinusIcon className="w-4 h-4" />
            </motion.button>
            <motion.span
              key={item.quantity}
              className="w-10 text-center font-medium text-dark-900 dark:text-white"
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              {item.quantity}
            </motion.span>
            <motion.button
              onClick={() => onQuantityChange(item.id, item.quantity + 1)}
              className="p-2 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors text-dark-600 dark:text-dark-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <PlusIcon className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Total */}
        <div className="col-span-2 text-right hidden md:flex md:items-center md:justify-end md:gap-4">
          <motion.span
            key={item.total_price}
            className="font-semibold text-dark-900 dark:text-white"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
          >
            {formatPrice(item.total_price)}
          </motion.span>
          <motion.button
            onClick={() => onRemove(item.id)}
            className="p-2 text-dark-400 hover:text-red-500 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <TrashIcon className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Mobile Price & Total */}
        <div className="flex items-center justify-between mt-4 md:hidden">
          <div className="flex flex-col">
            <span className="text-dark-500 dark:text-dark-400">
              {formatPrice(bundle.discounted_price)} × {item.quantity}
            </span>
            {bundle.original_price > bundle.discounted_price && (
              <span className="text-xs text-dark-400 line-through">
                was {formatPrice(bundle.original_price)}
              </span>
            )}
          </div>
          <span className="font-semibold text-dark-900 dark:text-white">
            {formatPrice(item.total_price)}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
