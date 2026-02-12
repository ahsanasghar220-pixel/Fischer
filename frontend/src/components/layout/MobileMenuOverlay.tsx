import { Fragment } from 'react'
import { Dialog, Transition, Disclosure } from '@headlessui/react'
import { Link } from 'react-router-dom'
import {
  XMarkIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { getCategoryProductImage } from '@/lib/categoryImages'

interface Category {
  name: string
  slug: string
  href: string
  image?: string
  gradient?: string
}

interface Page {
  name: string
  href: string
}

interface User {
  name: string
  email: string
}

interface MobileMenuOverlayProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  pages: Page[]
  isAuthenticated: boolean
  user?: User
  onLogout: () => void
}

export default function MobileMenuOverlay({
  isOpen,
  onClose,
  categories,
  pages,
  isAuthenticated,
  user: _user,
  onLogout,
}: MobileMenuOverlayProps) {
  useBodyScrollLock(isOpen)

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-[70] lg:hidden">
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        {/* Full-screen panel */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Dialog.Panel className="fixed inset-0 bg-white dark:bg-dark-900 overflow-y-auto">
            {/* Header with centered logo and close button */}
            <div className="sticky top-0 z-10 bg-white dark:bg-dark-900 border-b border-dark-200 dark:border-dark-700">
              <div className="flex items-center justify-center h-16 px-5 relative">
                {/* Close button - absolute left */}
                <button
                  onClick={onClose}
                  className="absolute left-5 p-2.5 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
                  aria-label="Close menu"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>

                {/* Centered Logo */}
                <Link to="/" onClick={onClose}>
                  <img
                    src="/images/logo-dark.webp"
                    alt="Fischer"
                    className="h-8 w-auto dark:hidden"
                  />
                  <img
                    src="/images/logo-light.webp"
                    alt="Fischer"
                    className="h-8 w-auto hidden dark:block"
                  />
                </Link>
              </div>
            </div>

            {/* Search bar */}
            <div className="sticky top-16 z-10 bg-white dark:bg-dark-900 px-5 py-4 border-b border-dark-200 dark:border-dark-700">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-dark-50 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 text-dark-900 dark:text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Menu content */}
            <div className="px-5 py-6 space-y-6">
              {/* Home link */}
              <Link
                to="/"
                onClick={onClose}
                className="block py-3 text-lg font-semibold text-dark-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Home
              </Link>

              {/* Our Products - Expandable */}
              <Disclosure as="div" className="border-b border-dark-200 dark:border-dark-700 pb-6">
                {({ open }) => (
                  <>
                    <Disclosure.Button className="flex items-center justify-between w-full py-3 text-left">
                      <span className="text-lg font-bold text-dark-900 dark:text-white">
                        Our Products
                      </span>
                      <ChevronDownIcon
                        className={`w-5 h-5 text-dark-600 dark:text-dark-400 transition-transform duration-200 ${
                          open ? 'rotate-180' : ''
                        }`}
                      />
                    </Disclosure.Button>

                    <Transition
                      enter="transition duration-200 ease-out"
                      enterFrom="opacity-0 -translate-y-2"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition duration-150 ease-in"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 -translate-y-2"
                    >
                      <Disclosure.Panel className="mt-4 grid grid-cols-2 gap-3">
                        {categories.map((category) => (
                          <Link
                            key={category.slug}
                            to={category.href}
                            onClick={onClose}
                            className="flex flex-col items-center p-3 rounded-lg bg-dark-50 dark:bg-dark-800 hover:bg-dark-100 dark:hover:bg-dark-700 active:bg-dark-200 dark:active:bg-dark-600 transition-colors group"
                          >
                            {/* Category Image */}
                            <div className="w-full aspect-square mb-2 rounded-lg overflow-hidden bg-white dark:bg-dark-900">
                              {(() => {
                                const imgSrc = getCategoryProductImage(category.slug, category.image)
                                return imgSrc ? (
                                  <img
                                    src={imgSrc}
                                    alt={category.name}
                                    className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-300"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none'
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-xs font-semibold text-dark-400 dark:text-dark-500 text-center px-2">{category.name}</span>
                                  </div>
                                )
                              })()}
                            </div>
                            {/* Category Name */}
                            <span className="text-sm font-semibold text-dark-900 dark:text-white text-center">
                              {category.name}
                            </span>
                          </Link>
                        ))}
                      </Disclosure.Panel>
                    </Transition>
                  </>
                )}
              </Disclosure>

              {/* Other pages */}
              <div className="space-y-2 pb-6 border-b border-dark-200 dark:border-dark-700">
                {pages.map((page) => (
                  <Link
                    key={page.href}
                    to={page.href}
                    onClick={onClose}
                    className="block py-3 text-lg font-semibold text-dark-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {page.name}
                  </Link>
                ))}
              </div>

              {/* Account section */}
              {isAuthenticated ? (
                <div className="space-y-2">
                  <Link
                    to="/account"
                    onClick={onClose}
                    className="block py-3 text-dark-700 dark:text-dark-300"
                  >
                    My Account
                  </Link>
                  <Link
                    to="/account/orders"
                    onClick={onClose}
                    className="block py-3 text-dark-700 dark:text-dark-300"
                  >
                    Orders
                  </Link>
                  <Link
                    to="/account/wishlist"
                    onClick={onClose}
                    className="block py-3 text-dark-700 dark:text-dark-300"
                  >
                    Wishlist
                  </Link>
                  <button
                    onClick={() => {
                      onLogout()
                      onClose()
                    }}
                    className="block w-full text-left py-3 text-red-600 dark:text-red-400"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link
                    to="/login"
                    onClick={onClose}
                    className="block w-full text-center px-6 py-3.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={onClose}
                    className="block w-full text-center px-6 py-3.5 border-2 border-dark-300 dark:border-dark-700 text-dark-900 dark:text-white font-semibold rounded-xl hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  )
}
