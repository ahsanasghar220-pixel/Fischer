import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBagIcon } from '@heroicons/react/24/outline'

export default function EmptyCart() {
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
