import { Fragment } from 'react'
import { Dialog, Transition, Disclosure } from '@headlessui/react'
import { Link } from 'react-router-dom'
import {
  XMarkIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'

interface Category {
  name: string
  slug: string
  href: string
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
  onSearch?: (query: string) => void
}

export default function MobileMenuOverlay({
  isOpen,
  onClose,
  categories,
  pages,
  isAuthenticated,
  user,
  onLogout,
  onSearch,
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
            {/* Header with close button */}
            <div className="sticky top-0 z-10 bg-white dark:bg-dark-900 border-b border-dark-200 dark:border-dark-700">
              <div className="flex items-center justify-between h-16 px-5">
                <Link to="/" onClick={onClose}>
                  <img
                    src="/images/logo-dark.png"
                    alt="Fischer"
                    className="h-8 w-auto dark:hidden"
                  />
                  <img
                    src="/images/logo-light.png"
                    alt="Fischer"
                    className="h-8 w-auto hidden dark:block"
                  />
                </Link>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
                  aria-label="Close menu"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Search bar */}
            <div className="sticky top-16 z-10 bg-white dark:bg-dark-900 px-5 py-4 border-b border-dark-200 dark:border-dark-700">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-dark-50 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 text-dark-900 dark:text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-accent-red-500"
                />
              </div>
            </div>

            {/* Menu content */}
            <div className="px-5 py-6 space-y-6">
              {/* Home link */}
              <Link
                to="/"
                onClick={onClose}
                className="block py-3 text-lg font-semibold text-dark-900 dark:text-white hover:text-accent-red-600 dark:hover:text-accent-red-500 transition-colors"
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
                      <Disclosure.Panel className="mt-4 space-y-1">
                        {categories.map((category) => (
                          <Link
                            key={category.slug}
                            to={category.href}
                            onClick={onClose}
                            className="block py-3 px-4 text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-800 rounded-lg transition-colors"
                          >
                            {category.name}
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
                    className="block py-3 text-lg font-semibold text-dark-900 dark:text-white hover:text-accent-red-600 dark:hover:text-accent-red-500 transition-colors"
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
                    className="block w-full text-center px-6 py-3.5 bg-accent-red-600 hover:bg-accent-red-700 text-white font-semibold rounded-xl transition-colors"
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
