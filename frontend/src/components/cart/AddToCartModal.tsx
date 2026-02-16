import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Link } from 'react-router-dom'
import { XMarkIcon, CheckCircleIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { formatPrice } from '@/lib/utils'

interface AddToCartModalProps {
  isOpen: boolean
  onClose: () => void
  product: {
    id: number
    name: string
    primary_image?: string
    price: number
    quantity: number
  } | null
}

export default function AddToCartModal({ isOpen, onClose, product }: AddToCartModalProps) {
  if (!product) return null

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-dark-800 shadow-2xl transition-all">
                {/* Header */}
                <div className="relative bg-green-50 dark:bg-green-900/20 px-6 py-4">
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-dark-500 hover:text-dark-700 dark:text-dark-400 dark:hover:text-dark-200"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-3">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    >
                      <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </motion.div>
                    <div>
                      <Dialog.Title className="text-lg font-semibold text-dark-900 dark:text-white">
                        Added to Cart!
                      </Dialog.Title>
                      <p className="text-sm text-dark-600 dark:text-dark-400">
                        Item successfully added
                      </p>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="px-6 py-4 border-b border-dark-200 dark:border-dark-700">
                  <div className="flex gap-4">
                    {product.primary_image && (
                      <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-dark-100 dark:bg-dark-700">
                        <img
                          src={product.primary_image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-dark-900 dark:text-white truncate">
                        {product.name}
                      </h3>
                      <p className="text-sm text-dark-600 dark:text-dark-400 mt-1">
                        Quantity: {product.quantity}
                      </p>
                      <p className="text-lg font-semibold text-primary-600 dark:text-primary-400 mt-1">
                        {formatPrice(product.price * product.quantity)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-6 py-4 space-y-3">
                  <Link
                    to="/checkout"
                    onClick={onClose}
                    className="block w-full"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                    >
                      Checkout Now
                    </motion.button>
                  </Link>

                  <Link
                    to="/cart"
                    onClick={onClose}
                    className="block w-full"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-dark-800 hover:bg-dark-700 dark:bg-dark-700 dark:hover:bg-dark-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <ShoppingCartIcon className="w-5 h-5" />
                      View Cart
                    </motion.button>
                  </Link>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="w-full border-2 border-dark-300 dark:border-dark-600 text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                  >
                    Continue Shopping
                  </motion.button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
