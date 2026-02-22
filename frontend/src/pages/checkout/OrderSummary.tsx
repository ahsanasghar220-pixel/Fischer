import { motion, AnimatePresence } from 'framer-motion'
import { formatPrice } from '@/lib/utils'
import type { ShippingMethod } from '@/types'

interface CartItem {
  id: number
  quantity: number
  unit_price: number
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
  variant: {
    id: number
    sku: string
    name: string
    price: number
    attributes: Array<{ attribute: string; value: string }>
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
}

interface OrderSummaryProps {
  items: CartItem[]
  subtotal: number
  discount: number
  grandTotal: number
  couponCode: string | null
  selectedShippingMethod: ShippingMethod | undefined
}

export default function OrderSummary({
  items,
  subtotal,
  discount,
  grandTotal,
  couponCode,
  selectedShippingMethod,
}: OrderSummaryProps) {
  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6 sticky top-4">
      <motion.h2
        className="text-lg font-semibold text-dark-900 dark:text-white mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        Order Summary
      </motion.h2>

      {/* Items */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="w-16 h-16 bg-dark-100 dark:bg-dark-700 rounded-lg overflow-hidden flex-shrink-0">
              {item.product?.primary_image ? (
                <img
                  src={item.product.primary_image}
                  alt={item.product?.name || 'Product'}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-dark-400 text-xs">
                  No image
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dark-900 dark:text-white break-words">{item.product?.name || 'Product'}</p>
              {item.variant && (
                <p className="text-xs text-dark-500 dark:text-dark-400">{item.variant.name}</p>
              )}
              <p className="text-sm text-dark-500 dark:text-dark-400">Qty: {item.quantity}</p>
            </div>
            <span className="text-sm font-medium text-dark-900 dark:text-white">
              {formatPrice((item.variant?.price || item.product?.price || 0) * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-dark-200 dark:border-dark-700 mt-4 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-dark-600 dark:text-dark-400">Subtotal</span>
          <span className="text-dark-900 dark:text-white">{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
            <span>Discount</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-dark-600 dark:text-dark-400">Shipping</span>
          <span className="text-dark-900 dark:text-white">
            {selectedShippingMethod
              ? selectedShippingMethod.cost === 0
                ? 'FREE'
                : formatPrice(selectedShippingMethod.cost)
              : '—'}
          </span>
        </div>
        <div className="flex justify-between pt-2 border-t border-dark-200 dark:border-dark-700">
          <span className="font-semibold text-dark-900 dark:text-white">Total</span>
          <span className="text-xl font-bold text-dark-900 dark:text-white">{formatPrice(grandTotal)}</span>
        </div>
      </div>

      <AnimatePresence>
        {couponCode && (
          <motion.div
            className="mt-4 p-2 bg-green-50 dark:bg-green-900/20 rounded text-sm text-green-700 dark:text-green-400"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            Coupon applied: {couponCode}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
