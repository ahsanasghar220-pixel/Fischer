import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/stores/cartStore'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import CartItemRow from './CartItemRow'
import CartSummary from './CartSummary'
import EmptyCart from './EmptyCart'

export default function Cart() {
  const {
    items,
    subtotal,
    discount,
    total,
    couponCode,
    isLoading,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
  } = useCartStore()

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return
    await updateQuantity(itemId, newQuantity)
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
    return <EmptyCart />
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
                  {items.map((item, index) => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      index={index}
                      onQuantityChange={handleQuantityChange}
                      onRemove={removeItem}
                    />
                  ))}
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
            <CartSummary
              subtotal={subtotal}
              discount={discount}
              total={total}
              couponCode={couponCode}
              applyCoupon={applyCoupon}
              removeCoupon={removeCoupon}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
