import { Fragment } from 'react'
import { Dialog, Transition, Disclosure } from '@headlessui/react'
import { Link } from 'react-router-dom'
import {
  XMarkIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { getCategoryProductImage } from '@/lib/categoryImages'
import { getImageSrc } from '@/lib/imageUtils'
import { useTheme } from '@/contexts/ThemeContext'

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
  const { resolvedTheme, toggleTheme } = useTheme()

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
          <div className="fixed inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-md" />
        </Transition.Child>

        {/* Full-screen scrollable panel */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300 transform"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200 transform"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className="fixed inset-0 flex">
            <Dialog.Panel className="w-full bg-gradient-to-br from-white via-gray-50 to-white dark:from-dark-900 dark:via-dark-800 dark:to-dark-900">
              <div className="h-full flex flex-col">
                {/* Fixed Header */}
                <div className="flex-none bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border-b border-dark-200/50 dark:border-dark-700/50 shadow-sm">
                  <div className="flex items-center justify-center h-16 px-5 relative">
                    {/* Close button */}
                    <button
                      onClick={onClose}
                      className="absolute left-5 p-2.5 rounded-xl bg-dark-100/50 dark:bg-dark-800/50 hover:bg-dark-200 dark:hover:bg-dark-700 transition-all duration-200 active:scale-95 backdrop-blur-sm"
                      aria-label="Close menu"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>

                    {/* Centered Logo */}
                    <Link to="/" onClick={onClose} className="transition-transform hover:scale-105 active:scale-95">
                      <img
                        src={getImageSrc('/images/logo/Fischer-electronics-logo-black.svg')}
                        alt="Fischer"
                        className="h-8 w-auto dark:hidden"
                      />
                      <img
                        src={getImageSrc('/images/logo/Fischer-electronics-logo-white.svg')}
                        alt="Fischer"
                        className="h-8 w-auto hidden dark:block"
                      />
                    </Link>

                    {/* Theme toggle */}
                    <button
                      onClick={toggleTheme}
                      className="absolute right-5 p-2.5 rounded-xl bg-dark-100/50 dark:bg-dark-800/50 hover:bg-dark-200 dark:hover:bg-dark-700 transition-all duration-200 active:scale-95 backdrop-blur-sm"
                      aria-label="Toggle theme"
                    >
                      <div className="relative w-5 h-5">
                        <SunIcon
                          className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${
                            resolvedTheme === 'dark' ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
                          } text-amber-500`}
                        />
                        <MoonIcon
                          className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${
                            resolvedTheme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
                          } text-blue-400`}
                        />
                      </div>
                    </button>
                  </div>
                </div>

                {/* Fixed Search Bar */}
                <div className="flex-none bg-white/60 dark:bg-dark-900/60 backdrop-blur-xl px-5 py-4 border-b border-dark-200/30 dark:border-dark-700/30">
                  <div className="relative group">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400 dark:text-dark-500 group-focus-within:text-primary-500 dark:group-focus-within:text-primary-400 transition-colors" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-dark-50/50 dark:bg-dark-800/50 backdrop-blur-sm border border-dark-200/50 dark:border-dark-700/50 text-dark-900 dark:text-white placeholder:text-dark-400 dark:placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6">
                  <div className="space-y-6 pb-6">
                    {/* Home Link */}
                    <Link
                      to="/"
                      onClick={onClose}
                      className="block py-3 px-4 text-lg font-semibold text-dark-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/20 rounded-xl transition-all duration-200 active:scale-98"
                    >
                      Home
                    </Link>

                    {/* Our Products - Expandable with Amazing Design */}
                    <Disclosure as="div" className="border-b border-dark-200/50 dark:border-dark-700/50 pb-6">
                      {({ open }) => (
                        <>
                          <Disclosure.Button className="flex items-center justify-between w-full py-3 px-4 text-left rounded-xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100/50 dark:hover:from-primary-900/20 dark:hover:to-primary-800/20 transition-all duration-200 group">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg bg-gradient-to-br ${open ? 'from-primary-500 to-primary-600' : 'from-primary-500/20 to-primary-600/20'} transition-all duration-200`}>
                                <SparklesIcon className={`w-5 h-5 ${open ? 'text-white' : 'text-primary-600 dark:text-primary-400'} transition-colors`} />
                              </div>
                              <span className="text-lg font-bold bg-gradient-to-r from-dark-900 to-dark-700 dark:from-white dark:to-dark-200 bg-clip-text text-transparent">
                                Our Products
                              </span>
                            </div>
                            <ChevronDownIcon
                              className={`w-5 h-5 text-dark-600 dark:text-dark-400 transition-all duration-300 ${
                                open ? 'rotate-180 text-primary-600 dark:text-primary-400' : ''
                              }`}
                            />
                          </Disclosure.Button>

                          <Transition
                            enter="transition duration-300 ease-out"
                            enterFrom="opacity-0 -translate-y-4"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition duration-200 ease-in"
                            leaveFrom="opacity-100 translate-y-0"
                            leaveTo="opacity-0 -translate-y-4"
                          >
                            <Disclosure.Panel className="mt-5 grid grid-cols-2 gap-4">
                              {categories.map((category, index) => (
                                <Link
                                  key={category.slug}
                                  to={category.href}
                                  onClick={onClose}
                                  style={{
                                    animationDelay: `${index * 50}ms`,
                                  }}
                                  className="group animate-fadeInUp"
                                >
                                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-dark-800 dark:to-dark-700 p-4 shadow-lg hover:shadow-2xl hover:-translate-y-2 active:shadow-lg transition-all duration-300 border border-dark-100/50 dark:border-dark-600/50 active:scale-[0.98] hover:border-primary-200 dark:hover:border-primary-700">
                                    {/* Gradient Overlay on Hover */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 via-primary-400/0 to-primary-600/0 group-hover:from-primary-500/5 group-hover:via-primary-400/5 group-hover:to-primary-600/10 transition-all duration-500 rounded-2xl" />

                                    {/* Shimmer Effect */}
                                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />

                                    {/* Content */}
                                    <div className="relative">
                                      {/* Image Container with Modern Design */}
                                      <div className="aspect-square mb-3 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-700 dark:to-dark-600 shadow-inner relative">
                                        {(() => {
                                          const imgSrc = getCategoryProductImage(category.slug, category.image)
                                          return imgSrc ? (
                                            <img
                                              src={getImageSrc(imgSrc)}
                                              alt={category.name}
                                              className="w-full h-full object-contain p-4 group-hover:scale-110 group-active:scale-105 transition-transform duration-500"
                                              loading="lazy"
                                              onError={(e) => {
                                                e.currentTarget.style.display = 'none'
                                              }}
                                            />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center p-3">
                                              <span className="text-xs font-bold text-dark-400 dark:text-dark-500 text-center leading-tight">{category.name}</span>
                                            </div>
                                          )
                                        })()}

                                        {/* Corner Accent */}
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary-400/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                      </div>

                                      {/* Category Name with Gradient */}
                                      <h3 className="text-sm font-bold text-center bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent group-hover:from-primary-600 group-hover:via-primary-500 group-hover:to-primary-600 dark:group-hover:from-primary-400 dark:group-hover:via-primary-300 dark:group-hover:to-primary-400 transition-all duration-300 leading-tight line-clamp-2">
                                        {category.name}
                                      </h3>

                                      {/* Subtle Arrow Indicator */}
                                      <div className="mt-2 flex justify-center">
                                        <div className="w-6 h-1 rounded-full bg-gradient-to-r from-primary-400/30 to-primary-600/30 group-hover:from-primary-400 group-hover:to-primary-600 transition-all duration-300 group-hover:w-10" />
                                      </div>
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </Disclosure.Panel>
                          </Transition>
                        </>
                      )}
                    </Disclosure>

                    {/* Other Pages */}
                    <div className="space-y-2 pb-6 border-b border-dark-200/50 dark:border-dark-700/50">
                      {pages.map((page) => (
                        <Link
                          key={page.href}
                          to={page.href}
                          onClick={onClose}
                          className="block py-3 px-4 text-lg font-semibold text-dark-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/20 rounded-xl transition-all duration-200 active:scale-98"
                        >
                          {page.name}
                        </Link>
                      ))}
                    </div>

                    {/* Account Section */}
                    {isAuthenticated ? (
                      <div className="space-y-2">
                        <Link
                          to="/account"
                          onClick={onClose}
                          className="block py-3 px-4 text-dark-700 dark:text-dark-300 hover:text-dark-900 dark:hover:text-white hover:bg-dark-100/50 dark:hover:bg-dark-800/50 rounded-xl transition-all duration-200"
                        >
                          My Account
                        </Link>
                        <Link
                          to="/account/orders"
                          onClick={onClose}
                          className="block py-3 px-4 text-dark-700 dark:text-dark-300 hover:text-dark-900 dark:hover:text-white hover:bg-dark-100/50 dark:hover:bg-dark-800/50 rounded-xl transition-all duration-200"
                        >
                          Orders
                        </Link>
                        <Link
                          to="/account/wishlist"
                          onClick={onClose}
                          className="block py-3 px-4 text-dark-700 dark:text-dark-300 hover:text-dark-900 dark:hover:text-white hover:bg-dark-100/50 dark:hover:bg-dark-800/50 rounded-xl transition-all duration-200"
                        >
                          Wishlist
                        </Link>
                        <button
                          onClick={() => {
                            onLogout()
                            onClose()
                          }}
                          className="block w-full text-left py-3 px-4 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all duration-200"
                        >
                          Sign Out
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Link
                          to="/login"
                          onClick={onClose}
                          className="block w-full text-center px-6 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 active:scale-98 relative overflow-hidden group"
                        >
                          <span className="relative z-10">Sign In</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                        </Link>
                        <Link
                          to="/register"
                          onClick={onClose}
                          className="block w-full text-center px-6 py-4 border-2 border-primary-500 dark:border-primary-600 text-primary-600 dark:text-primary-400 font-bold rounded-2xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-300 active:scale-98"
                        >
                          Create Account
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  )
}
