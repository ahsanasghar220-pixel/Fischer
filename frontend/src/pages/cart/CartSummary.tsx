import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { TrashIcon } from '@heroicons/react/24/outline'
import { formatPrice } from '@/lib/utils'

interface CartSummaryProps {
  subtotal: number
  discount: number
  total: number
  couponCode: string | null
  applyCoupon: (code: string) => void
  removeCoupon: () => void
}

export default function CartSummary({
  subtotal,
  discount,
  total,
  couponCode,
  applyCoupon,
  removeCoupon,
}: CartSummaryProps) {
  return (
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
                className="flex-1 px-3 py-2 text-sm border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow"
              />
              <motion.button
                type="submit"
                className="btn btn-dark dark:bg-dark-600 dark:hover:bg-dark-500 px-3 sm:px-4 text-sm"
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
          <span className="text-sm sm:text-base text-dark-600 dark:text-dark-400">Subtotal</span>
          <motion.span
            key={subtotal}
            className="text-sm sm:text-base font-medium text-dark-900 dark:text-white"
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
          <span className="text-sm sm:text-base text-dark-600 dark:text-dark-400">Shipping</span>
          <span className="text-xs sm:text-sm text-dark-500 dark:text-dark-400">Calculated at checkout</span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-dark-200 dark:border-dark-700">
          <span className="text-base sm:text-lg font-semibold text-dark-900 dark:text-white">Total</span>
          <motion.span
            key={total}
            className="text-lg sm:text-xl font-bold text-dark-900 dark:text-white"
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
  )
}
