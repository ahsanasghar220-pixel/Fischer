import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { TrashIcon, MinusIcon, PlusIcon, ShoppingBagIcon, GiftIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { useCartStore } from '@/stores/cartStore'
import { formatPrice } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useState } from 'react'

export default function Cart() {
  const {
    items,
    subtotal,
    discount,
    total,
    couponCode,
    isLoading,
    updateItemQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
  } = useCartStore()

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return
    await updateItemQuantity(itemId, newQuantity)
  }

  if (isLoading) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center bg-dark-50 dark:bg-dark-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <LoadingSpinner size="lg" />
      </motion.div>
    )
  }

  if (!items || items.length === 0) {
    return (
      <motion.div
        className="min-h-screen bg-dark-50 dark:bg-dark-900 transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="container mx-auto px-4 py-16">
          <motion.div
            className="max-w-md mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ShoppingBagIcon className="w-16 h-16 sm:w-24 sm:h-24 mx-auto text-dark-300 dark:text-dark-600 mb-4 sm:mb-6" />
            </motion.div>
            <motion.h1
              className="text-xl sm:text-2xl font-bold text-dark-900 dark:text-white mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Your cart is empty
            </motion.h1>
            <motion.p
              className="text-sm sm:text-base text-dark-500 dark:text-dark-400 mb-4 sm:mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Looks like you haven't added anything to your cart yet.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link to="/shop" className="btn btn-primary">
                Continue Shopping
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="min-h-screen bg-dark-50 dark:bg-dark-900 transition-colors"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Helmet><title>Shopping Cart - Fischer Pakistan</title></Helmet>
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 border-b border-dark-200 dark:border-dark-700">
        <div className="container mx-auto px-4 py-6">
          <motion.div
            className="flex items-center gap-2 text-sm text-dark-500 dark:text-dark-400 mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-dark-900 dark:text-white">Shopping Cart</span>
          </motion.div>
          <motion.h1
            className="text-xl sm:text-2xl md:text-3xl font-bold text-dark-900 dark:text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            Shopping Cart
          </motion.h1>
          <motion.p
            className="text-sm sm:text-base text-dark-500 dark:text-dark-400 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {items.length} item(s) in your cart
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Cart Items */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm overflow-hidden">
              {/* Table Header */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 p-4 bg-dark-50 dark:bg-dark-700 text-sm font-medium text-dark-600 dark:text-dark-300">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {/* Items */}
              <AnimatePresence mode="popLayout">
                <div className="divide-y divide-dark-200 dark:divide-dark-700">
                  {items.map((item, index) => {
                    // Check if this is a bundle item
                    const isBundle = item.bundle_id && item.bundle

                    if (isBundle) {
                      return (
                        <BundleCartItem
                          key={item.id}
                          item={item}
                          index={index}
                          onQuantityChange={handleQuantityChange}
                          onRemove={removeItem}
                        />
                      )
                    }

                    // Regular product item
                    return (
                      <motion.div
                        key={item.id}
                        className="p-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100, height: 0, padding: 0 }}
                        transition={{ delay: index * 0.05 }}
                        layout
                      >
                        <div className="md:grid md:grid-cols-12 md:gap-4 md:items-center">
                          {/* Product */}
                          <div className="col-span-6 flex gap-4">
                            <Link
                              to={`/product/${item.product?.slug || ''}`}
                              className="w-20 h-20 bg-dark-100 dark:bg-dark-700 rounded-lg overflow-hidden flex-shrink-0"
                            >
                              <motion.div whileHover={{ scale: 1.05 }}>
                                {(item.product?.image || item.product?.primary_image) ? (
                                  <img
                                    src={item.product?.image ?? item.product?.primary_image ?? ''}
                                    alt={item.product?.name || 'Product'}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-dark-400 dark:text-dark-500 text-sm">
                                    No image
                                  </div>
                                )}
                              </motion.div>
                            </Link>
                            <div className="flex-1 min-w-0">
                              <Link
                                to={`/product/${item.product?.slug || ''}`}
                                className="font-medium text-dark-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors break-words block"
                              >
                                {item.product?.name || 'Product'}
                              </Link>
                              {item.variant && (
                                <p className="text-sm text-dark-500 dark:text-dark-400 mt-0.5">{item.variant.name}</p>
                              )}
                              <motion.button
                                onClick={() => removeItem(item.id)}
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
                            <span className="text-dark-900 dark:text-white font-medium">
                              {formatPrice(item.unit_price || item.variant?.price || item.product?.price || 0)}
                            </span>
                          </div>

                          {/* Quantity */}
                          <div className="col-span-2 flex items-center justify-center mt-4 md:mt-0">
                            <div className="flex items-center border border-dark-200 dark:border-dark-600 rounded-lg">
                              <motion.button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
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
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                disabled={item.quantity >= (item.product?.stock_quantity || 99)}
                                className="p-2 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors text-dark-600 dark:text-dark-300 disabled:opacity-40 disabled:cursor-not-allowed"
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
                              {formatPrice(item.total_price || (item.unit_price || item.variant?.price || item.product?.price || 0) * item.quantity)}
                            </motion.span>
                            <motion.button
                              onClick={() => removeItem(item.id)}
                              className="p-2 text-dark-400 hover:text-red-500 transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <TrashIcon className="w-5 h-5" />
                            </motion.button>
                          </div>

                          {/* Mobile Price & Total */}
                          <div className="flex items-center justify-between mt-4 md:hidden">
                            <span className="text-dark-500 dark:text-dark-400">
                              {formatPrice(item.unit_price || item.variant?.price || item.product?.price || 0)} × {item.quantity}
                            </span>
                            <span className="font-semibold text-dark-900 dark:text-white">
                              {formatPrice(item.total_price || (item.unit_price || item.variant?.price || item.product?.price || 0) * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </AnimatePresence>
            </div>

            {/* Continue Shopping */}
            <motion.div
              className="mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Link
                to="/shop"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
              >
                ← Continue Shopping
              </Link>
            </motion.div>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-4 sm:p-6 lg:sticky lg:top-4">
              <motion.h2
                className="text-base sm:text-lg font-semibold text-dark-900 dark:text-white mb-3 sm:mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
              >
                Order Summary
              </motion.h2>

              {/* Coupon */}
              <motion.div
                className="mb-4 sm:mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <AnimatePresence mode="wait">
                  {couponCode ? (
                    <motion.div
                      key="applied"
                      className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <div>
                        <span className="text-sm text-green-700 dark:text-green-400 font-medium">{couponCode}</span>
                        <span className="text-sm text-green-600 dark:text-green-500 block">Coupon applied</span>
                      </div>
                      <motion.button
                        onClick={removeCoupon}
                        className="text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={(e) => {
                        e.preventDefault()
                        const formData = new FormData(e.currentTarget)
                        const code = formData.get('coupon') as string
                        if (code) applyCoupon(code)
                      }}
                      className="flex gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <input
                        type="text"
                        name="coupon"
                        placeholder="Coupon code"
                        className="flex-1 px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
                      />
                      <motion.button
                        type="submit"
                        className="btn btn-dark dark:bg-dark-600 dark:hover:bg-dark-500 px-4"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Apply
                      </motion.button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Totals */}
              <motion.div
                className="space-y-3 border-t border-dark-200 dark:border-dark-700 pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-dark-600 dark:text-dark-400">Subtotal</span>
                  <motion.span
                    key={subtotal}
                    className="font-medium text-dark-900 dark:text-white"
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                  >
                    {formatPrice(subtotal)}
                  </motion.span>
                </div>
                <AnimatePresence>
                  {discount > 0 && (
                    <motion.div
                      className="flex items-center justify-between text-green-600 dark:text-green-400"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <span>Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex items-center justify-between">
                  <span className="text-dark-600 dark:text-dark-400">Shipping</span>
                  <span className="text-dark-500 dark:text-dark-400">Calculated at checkout</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-dark-200 dark:border-dark-700">
                  <span className="text-lg font-semibold text-dark-900 dark:text-white">Total</span>
                  <motion.span
                    key={total}
                    className="text-xl font-bold text-dark-900 dark:text-white"
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    {formatPrice(total)}
                  </motion.span>
                </div>
              </motion.div>

              {/* Checkout Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to="/checkout"
                    className="btn btn-primary w-full mt-6 py-3 text-center block"
                  >
                    Proceed to Checkout
                  </Link>
                </motion.div>
              </motion.div>

              {/* Payment Methods */}
              <motion.div
                className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-dark-200 dark:border-dark-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
              >
                <p className="text-xs sm:text-sm text-dark-500 dark:text-dark-400 text-center mb-2 sm:mb-3">Secure payment options</p>
                <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap text-dark-400">
                  {['COD', 'JazzCash', 'EasyPaisa', 'Cards'].map((method, index) => (
                    <motion.span
                      key={method}
                      className="text-[10px] sm:text-xs font-medium"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.05 }}
                    >
                      {method}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

// Bundle Cart Item Component
interface BundleCartItemProps {
  item: {
    id: number
    bundle_id: number | null
    bundle: {
      id: number
      name: string
      slug: string
      featured_image: string | null
      cart_display: 'single_item' | 'grouped' | 'individual'
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
    quantity: number
    unit_price: number
    total_price: number
    bundle_discount: number
  }
  index: number
  onQuantityChange: (itemId: number, quantity: number) => void
  onRemove: (itemId: number) => void
}

function BundleCartItem({ item, index, onQuantityChange, onRemove }: BundleCartItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const bundle = item.bundle
  if (!bundle) return null

  return (
    <motion.div
      key={item.id}
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
