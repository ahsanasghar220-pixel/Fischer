import { useState, Fragment } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Dialog, Popover, Transition } from '@headlessui/react'
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingCartIcon,
  UserIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'

const navigation = {
  categories: [
    { name: 'Water Coolers', href: '/category/water-coolers' },
    { name: 'Geysers & Heaters', href: '/category/geysers-heaters' },
    { name: 'Cooking Ranges', href: '/category/cooking-ranges' },
    { name: 'Built-in Hobs & Hoods', href: '/category/hobs-hoods' },
    { name: 'Water Dispensers', href: '/category/water-dispensers' },
    { name: 'Kitchen Appliances', href: '/category/kitchen-appliances' },
  ],
  pages: [
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Service Request', href: '/service-request' },
    { name: 'Find Dealer', href: '/find-dealer' },
  ],
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const { isAuthenticated, user, logout } = useAuthStore()
  const cartItemsCount = useCartStore((state) => state.items_count)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <header className="bg-white sticky top-0 z-40 shadow-sm">
      {/* Top bar */}
      <div className="bg-dark-900 text-white py-2">
        <div className="container-xl flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <a
              href="tel:+923211146642"
              className="flex items-center gap-1.5 hover:text-primary-500 transition-colors"
            >
              <PhoneIcon className="w-4 h-4" />
              <span>+92 321 1146642</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/track-order" className="hover:text-primary-500 transition-colors">
              Track Order
            </Link>
            <Link to="/become-dealer" className="hover:text-primary-500 transition-colors">
              Become a Dealer
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <nav className="container-xl" aria-label="Top">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden -ml-2 p-2 text-dark-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img
              src="/logo.png"
              alt="Fischer"
              className="h-10 lg:h-12 w-auto"
            />
          </Link>

          {/* Desktop navigation */}
          <Popover.Group className="hidden lg:flex lg:gap-x-8 lg:ml-8">
            <Popover className="relative">
              {({ open }) => (
                <>
                  <Popover.Button
                    className={`flex items-center gap-x-1 text-sm font-medium ${
                      open ? 'text-primary-600' : 'text-dark-700 hover:text-dark-900'
                    }`}
                  >
                    Products
                    <svg
                      className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Popover.Button>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    <Popover.Panel className="absolute left-0 top-full mt-3 w-56 bg-white rounded-xl shadow-lg ring-1 ring-dark-100 overflow-hidden z-50">
                      <div className="py-2">
                        {navigation.categories.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            className="block px-4 py-2.5 text-sm text-dark-700 hover:bg-dark-50 hover:text-dark-900"
                          >
                            {item.name}
                          </Link>
                        ))}
                        <div className="border-t border-dark-100 mt-2 pt-2">
                          <Link
                            to="/shop"
                            className="block px-4 py-2.5 text-sm font-medium text-primary-600 hover:bg-primary-50"
                          >
                            View All Products
                          </Link>
                        </div>
                      </div>
                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Popover>

            {navigation.pages.map((page) => (
              <Link
                key={page.name}
                to={page.href}
                className="text-sm font-medium text-dark-700 hover:text-dark-900"
              >
                {page.name}
              </Link>
            ))}
          </Popover.Group>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-4 pr-10 py-2.5 border border-dark-200 rounded-lg bg-dark-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Right section */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Wishlist */}
            {isAuthenticated && (
              <Link
                to="/account/wishlist"
                className="p-2 text-dark-700 hover:text-dark-900 transition-colors"
              >
                <HeartIcon className="h-6 w-6" />
              </Link>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-dark-700 hover:text-dark-900 transition-colors"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs font-bold text-dark-900 bg-primary-500 rounded-full">
                  {cartItemsCount > 99 ? '99+' : cartItemsCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            {isAuthenticated ? (
              <Popover className="relative">
                <Popover.Button className="p-2 text-dark-700 hover:text-dark-900 transition-colors">
                  <UserIcon className="h-6 w-6" />
                </Popover.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1"
                >
                  <Popover.Panel className="absolute right-0 top-full mt-3 w-56 bg-white rounded-xl shadow-lg ring-1 ring-dark-100 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-dark-100">
                      <p className="text-sm font-medium text-dark-900">{user?.full_name}</p>
                      <p className="text-xs text-dark-500 truncate">{user?.email}</p>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/account"
                        className="block px-4 py-2.5 text-sm text-dark-700 hover:bg-dark-50"
                      >
                        My Account
                      </Link>
                      <Link
                        to="/account/orders"
                        className="block px-4 py-2.5 text-sm text-dark-700 hover:bg-dark-50"
                      >
                        My Orders
                      </Link>
                      <Link
                        to="/account/wishlist"
                        className="block px-4 py-2.5 text-sm text-dark-700 hover:bg-dark-50"
                      >
                        Wishlist
                      </Link>
                      {user?.is_admin && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2.5 text-sm text-primary-600 hover:bg-primary-50"
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={() => logout()}
                        className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  </Popover.Panel>
                </Transition>
              </Popover>
            ) : (
              <Link
                to="/login"
                className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-medium text-dark-700 hover:text-dark-900 transition-colors"
              >
                <UserIcon className="h-5 w-5" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <Dialog
        as="div"
        className="lg:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 z-50" />
        <Dialog.Panel className="fixed inset-y-0 left-0 z-50 w-full max-w-sm bg-white shadow-xl">
          <div className="flex items-center justify-between px-4 h-16 border-b border-dark-100">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              <img src="/logo.png" alt="Fischer" className="h-8 w-auto" />
            </Link>
            <button
              type="button"
              className="-mr-2 p-2 text-dark-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile search */}
          <form onSubmit={handleSearch} className="px-4 py-3 border-b border-dark-100">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-4 pr-10 py-2.5 border border-dark-200 rounded-lg bg-dark-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400">
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
            </div>
          </form>

          <div className="px-4 py-4 overflow-y-auto h-[calc(100vh-8rem)]">
            <div className="space-y-1">
              <p className="px-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">
                Categories
              </p>
              {navigation.categories.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-3 py-2 text-dark-700 hover:bg-dark-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="mt-6 space-y-1">
              <p className="px-3 text-xs font-semibold text-dark-500 uppercase tracking-wider">
                Pages
              </p>
              {navigation.pages.map((page) => (
                <Link
                  key={page.name}
                  to={page.href}
                  className="block px-3 py-2 text-dark-700 hover:bg-dark-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {page.name}
                </Link>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-dark-100">
              {isAuthenticated ? (
                <div className="space-y-1">
                  <Link
                    to="/account"
                    className="block px-3 py-2 text-dark-700 hover:bg-dark-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Account
                  </Link>
                  <button
                    onClick={() => {
                      logout()
                      setMobileMenuOpen(false)
                    }}
                    className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    className="block w-full text-center px-4 py-2.5 bg-dark-900 text-white font-medium rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full text-center px-4 py-2.5 border border-dark-300 text-dark-700 font-medium rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  )
}
