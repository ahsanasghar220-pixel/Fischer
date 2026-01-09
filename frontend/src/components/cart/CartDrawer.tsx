import { Fragment, memo, useCallback } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Link } from 'react-router-dom'
import {
  XMarkIcon,
  ShoppingBagIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
} from '@heroicons/react/24/outline'
import { useCartStore } from '@/stores/cartStore'
import { formatPrice } from '@/lib/utils'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const CartDrawer = memo(function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, subtotal, discount, total, items_count, updateQuantity, removeItem, isLoading } = useCartStore()

  const handleQuantityChange = useCallback(async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return
    await updateQuantity(itemId, newQuantity)
  }, [updateQuantity])

  const handleRemoveItem = useCallback(async (itemId: number) => {
    await removeItem(itemId)
  }, [removeItem])

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-dark-900/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in duration-200"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-white dark:bg-dark-800 shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-dark-200 dark:border-dark-700">
                      <Dialog.Title className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                          <ShoppingBagIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-dark-900 dark:text-white">Your Cart</h2>
                          <p className="text-sm text-dark-500 dark:text-dark-400">{items_count} items</p>
                        </div>
                      </Dialog.Title>
                      <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-dark-400 hover:text-dark-600 dark:hover:text-dark-200 hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
                      >
                        <XMarkIcon className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto py-4">
                      {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                          <div className="w-24 h-24 rounded-full bg-dark-100 dark:bg-dark-700 flex items-center justify-center mb-6">
                            <ShoppingBagIcon className="w-12 h-12 text-dark-300 dark:text-dark-500" />
                          </div>
                          <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">
                            Your cart is empty
                          </h3>
                          <p className="text-dark-500 dark:text-dark-400 mb-6">
                            Looks like you haven't added anything yet.
                          </p>
                          <Link
                            to="/shop"
                            onClick={onClose}
                            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors"
                          >
                            Start Shopping
                          </Link>
                        </div>
                      ) : (
                        <ul className="divide-y divide-dark-100 dark:divide-dark-700">
                          {items.map((item) => (
                            <li key={item.id} className="px-6 py-4">
                              <div className="flex gap-4">
                                {/* Product Image */}
                                <Link
                                  to={`/product/${item.product.slug}`}
                                  onClick={onClose}
                                  className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-dark-100 dark:bg-dark-700 group"
                                >
                                  {(item.product.primary_image || item.product.image) ? (
                                    <img
                                      src={item.product.primary_image || item.product.image || ''}
                                      alt={item.product.name}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <ShoppingBagIcon className="w-8 h-8 text-dark-300 dark:text-dark-500" />
                                    </div>
                                  )}
                                  {!item.is_available && (
                                    <div className="absolute inset-0 bg-dark-900/70 flex items-center justify-center">
                                      <span className="text-xs font-semibold text-white">Out of Stock</span>
                                    </div>
                                  )}
                                </Link>

                                {/* Product Info */}
                                <div className="flex-1 min-w-0">
                                  <Link
                                    to={`/product/${item.product.slug}`}
                                    onClick={onClose}
                                    className="font-semibold text-dark-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-2"
                                  >
                                    {item.product.name}
                                  </Link>
                                  {item.variant && (
                                    <p className="text-sm text-dark-500 dark:text-dark-400 mt-0.5">
                                      {item.variant.attributes.map(attr => attr.value).join(' / ')}
                                    </p>
                                  )}
                                  <p className="text-primary-600 dark:text-primary-400 font-semibold mt-1">
                                    {formatPrice(item.unit_price)}
                                  </p>

                                  {/* Quantity Controls */}
                                  <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                        disabled={item.quantity <= 1 || isLoading}
                                        className="w-8 h-8 rounded-lg bg-dark-100 dark:bg-dark-700 hover:bg-dark-200 dark:hover:bg-dark-600 flex items-center justify-center text-dark-600 dark:text-dark-300 disabled:opacity-50 transition-colors"
                                      >
                                        <MinusIcon className="w-4 h-4" />
                                      </button>
                                      <span className="w-10 text-center font-semibold text-dark-900 dark:text-white">
                                        {item.quantity}
                                      </span>
                                      <button
                                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                        disabled={isLoading}
                                        className="w-8 h-8 rounded-lg bg-dark-100 dark:bg-dark-700 hover:bg-dark-200 dark:hover:bg-dark-600 flex items-center justify-center text-dark-600 dark:text-dark-300 disabled:opacity-50 transition-colors"
                                      >
                                        <PlusIcon className="w-4 h-4" />
                                      </button>
                                    </div>
                                    <button
                                      onClick={() => handleRemoveItem(item.id)}
                                      disabled={isLoading}
                                      className="p-2 text-dark-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                    >
                                      <TrashIcon className="w-5 h-5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Footer */}
                    {items.length > 0 && (
                      <div className="border-t border-dark-200 dark:border-dark-700 p-6 space-y-4">
                        {/* Summary */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-dark-600 dark:text-dark-400">
                            <span>Subtotal</span>
                            <span>{formatPrice(subtotal)}</span>
                          </div>
                          {discount > 0 && (
                            <div className="flex justify-between text-green-600 dark:text-green-400">
                              <span>Discount</span>
                              <span>-{formatPrice(discount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-lg font-bold text-dark-900 dark:text-white pt-2 border-t border-dark-200 dark:border-dark-700">
                            <span>Total</span>
                            <span>{formatPrice(total)}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                          <Link
                            to="/checkout"
                            onClick={onClose}
                            className="block w-full py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl text-center transition-colors"
                          >
                            Checkout
                          </Link>
                          <Link
                            to="/cart"
                            onClick={onClose}
                            className="block w-full py-4 bg-dark-100 dark:bg-dark-700 hover:bg-dark-200 dark:hover:bg-dark-600 text-dark-900 dark:text-white font-semibold rounded-xl text-center transition-colors"
                          >
                            View Cart
                          </Link>
                        </div>

                        {/* Free shipping notice */}
                        <p className="text-center text-sm text-dark-500 dark:text-dark-400">
                          Free shipping on orders above {formatPrice(10000)}
                        </p>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
})

export default CartDrawer
