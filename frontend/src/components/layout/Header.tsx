import { useState, useEffect, Fragment } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Dialog, Popover, Transition } from '@headlessui/react'
import { motion, useScroll, useSpring } from 'framer-motion'
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingCartIcon,
  UserIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline'
import { useQuery } from '@tanstack/react-query'
import { getCategoryProductImage } from '@/lib/categoryImages'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import ThemeToggle from '@/components/ui/ThemeToggle'
import CartDrawer from '@/components/cart/CartDrawer'
import ProductsMegaMenu from '@/components/layout/ProductsMegaMenu'
import AnimatedLogo from '@/components/ui/AnimatedLogo'
import MobileMenuOverlay from '@/components/layout/MobileMenuOverlay'
import api from '@/lib/api'

// Gradient map for categories (can be customized per category)
const categoryGradients: Record<string, string> = {
  'built-in-hoods': 'from-slate-500 to-gray-600',
  'built-in-hobs': 'from-gray-600 to-slate-700',
  'cooking-ranges': 'from-purple-500 to-violet-500',
  'oven-toasters': 'from-amber-500 to-orange-500',
  'air-fryers': 'from-emerald-500 to-teal-500',
  'water-coolers': 'from-cyan-500 to-blue-500',
  'water-dispensers': 'from-blue-500 to-indigo-500',
  'hybrid-geysers': 'from-orange-500 to-red-500',
  'blenders-processors': 'from-green-500 to-emerald-500',
  'room-coolers': 'from-sky-500 to-cyan-500',
}

// Static pages (these rarely change)
const staticPages = [
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
  { name: 'Service Request', href: '/service-request' },
  { name: 'Find Dealer', href: '/find-dealer' },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const { isAuthenticated, user, logout } = useAuthStore()
  const cartItemsCount = useCartStore((state) => state.items_count)

  // Fetch categories from API
  const { data: categoriesData } = useQuery({
    queryKey: ['header-categories'],
    queryFn: async () => {
      const response = await api.get('/categories')
      return response.data.data
    },
  })

  // Transform categories for navigation
  const navigation = {
    categories: categoriesData
      ? categoriesData
          .filter((cat: any) => !cat.parent_id)
          .map((cat: any) => ({
            name: cat.name,
            href: `/category/${cat.slug}`,
            slug: cat.slug,
            desc: cat.short_description || cat.description || '',
            gradient: categoryGradients[cat.slug] || 'from-gray-500 to-slate-600',
            image: getCategoryProductImage(cat.slug, cat.image),
          }))
      : [],
    pages: staticPages,
  }

  // Lock body scroll when mobile menu or cart drawer is open
  useBodyScrollLock(mobileMenuOpen || cartDrawerOpen)

  // Handle scroll effect - header always visible, just changes background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Check initial state
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setSearchOpen(false)
      setMobileMenuOpen(false)
    }
  }

  const isHomePage = location.pathname === '/'

  // Scroll progress indicator
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
          isScrolled || !isHomePage
            ? 'bg-white/95 dark:bg-dark-900/95 backdrop-blur-xl shadow-lg border-b border-dark-100/50 dark:border-dark-800/50'
            : 'bg-transparent'
        }`}
      >
        {/* Scroll progress indicator */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary-500 via-primary-400 to-primary-500 origin-left z-10"
          style={{ scaleX }}
        />

        {/* Top bar - Only show when not scrolled on homepage, hidden on mobile */}
        <div className={`hidden sm:block transition-all duration-300 overflow-hidden ${
          isScrolled || !isHomePage ? 'h-0' : 'h-10'
        }`}>
          <div className={`h-10 bg-dark-100 dark:bg-dark-900 ${isHomePage ? 'dark:bg-dark-900/50 backdrop-blur-sm' : ''}`}>
            <div className="container-xl h-full flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <a
                  href="tel:+923211146642"
                  className="flex items-center gap-1.5 text-dark-600 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <PhoneIcon className="w-4 h-4" />
                  <span>+92 321 1146642</span>
                </a>
                <span className="hidden md:inline text-dark-400 dark:text-dark-500">|</span>
                <span className="hidden md:inline text-dark-500 dark:text-dark-400">Free shipping on orders over PKR 10,000</span>
              </div>
              <div className="flex items-center gap-4">
                <Link to="/track-order" className="text-dark-600 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Track Order
                </Link>
                <Link to="/become-dealer" className="text-dark-600 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Become a Dealer
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main header */}
        <nav className="container-xl px-4 sm:px-6" aria-label="Top">
          {/* Mobile Layout - Hamburger | Logo (centered) | Cart */}
          <div className="flex lg:hidden items-center justify-between h-14">
            {/* Left: Hamburger */}
            <button
              type="button"
              className={`p-2.5 rounded-xl w-11 h-11 flex items-center justify-center transition-colors ${
                isHomePage && !isScrolled
                  ? 'text-white hover:bg-white/10'
                  : 'text-primary-500 hover:bg-dark-100 dark:hover:bg-dark-800'
              }`}
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            {/* Center: Logo */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex items-center flex-shrink-0">
              <AnimatedLogo
                src="/images/logo-dark.png"
                alt="Fischer"
                width={100}
                height={40}
                loading="eager"
                decoding="async"
                className={`h-9 w-auto ${
                  isHomePage && !isScrolled
                    ? 'hidden'
                    : 'dark:hidden'
                }`}
              />
              <AnimatedLogo
                src="/images/logo-light.png"
                alt="Fischer"
                width={100}
                height={40}
                loading="eager"
                decoding="async"
                className={`h-9 w-auto ${
                  isHomePage && !isScrolled
                    ? 'block'
                    : 'hidden dark:block'
                }`}
              />
            </Link>

            {/* Right: Cart */}
            <button
              onClick={() => setCartDrawerOpen(true)}
              className={`relative p-2.5 rounded-xl w-11 h-11 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${
                isHomePage && !isScrolled
                  ? 'text-white hover:bg-white/10'
                  : 'text-primary-500 hover:bg-dark-100 dark:hover:bg-dark-800'
              }`}
              aria-label={`Shopping cart${cartItemsCount > 0 ? ` with ${cartItemsCount} items` : ''}`}
            >
              <ShoppingCartIcon className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs font-bold text-white bg-primary-500 rounded-full">
                  {cartItemsCount > 99 ? '99+' : cartItemsCount}
                </span>
              )}
            </button>
          </div>

          {/* Desktop Layout - Original */}
          <div className="hidden lg:flex items-center justify-between h-20">
            {/* Left section: Logo and navigation */}
            <div className="flex items-center gap-4 lg:gap-6 flex-1">
              {/* Logo - LEFT side on desktop */}
              <Link to="/" className="flex-shrink-0 group">
                {/* Dark logo - hidden on homepage hero and in dark mode */}
                <AnimatedLogo
                  src="/images/logo-dark.png"
                  alt="Fischer"
                  width={120}
                  height={48}
                  loading="eager"
                  decoding="async"
                  className={`h-8 sm:h-9 md:h-10 lg:h-12 w-auto ${
                    isHomePage && !isScrolled
                      ? 'hidden'
                      : 'dark:hidden'
                  }`}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    const span = document.createElement('span')
                    span.className = 'text-2xl font-bold text-dark-900'
                    span.textContent = 'FISCHER'
                    e.currentTarget.parentElement?.appendChild(span)
                  }}
                />
                {/* White logo - show on homepage hero OR in dark mode */}
                <AnimatedLogo
                  src="/images/logo-light.png"
                  alt="Fischer"
                  width={120}
                  height={48}
                  loading="eager"
                  decoding="async"
                  className={`h-8 sm:h-9 md:h-10 lg:h-12 w-auto ${
                    isHomePage && !isScrolled
                      ? 'block'
                      : 'hidden dark:block'
                  }`}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    const span = document.createElement('span')
                    span.className = 'text-2xl font-bold text-white'
                    span.textContent = 'FISCHER'
                    e.currentTarget.parentElement?.appendChild(span)
                  }}
                />
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 group-hover:w-full transition-all duration-300" />
              </Link>

              {/* Desktop navigation */}
              <Popover.Group className="hidden lg:flex lg:gap-x-1">
              {/* Products Mega Menu */}
              <ProductsMegaMenu isHomePage={isHomePage} isScrolled={isScrolled} />

              {navigation.pages.map((page) => (
                <Link
                  key={page.name}
                  to={page.href}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    location.pathname === page.href
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                      : isHomePage && !isScrolled
                      ? 'text-white hover:text-white/80 hover:bg-white/10'
                      : 'text-dark-700 dark:text-dark-300 hover:text-dark-900 dark:hover:text-white hover:bg-dark-100 dark:hover:bg-dark-800'
                  }`}
                >
                  {page.name}
                </Link>
              ))}
            </Popover.Group>
          </div>

          {/* Right section - icons with consistent sizing */}
          <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className={`p-2 sm:p-2.5 rounded-xl w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${
                  isHomePage && !isScrolled
                    ? 'text-white hover:bg-white/10'
                    : 'text-primary-500 hover:bg-dark-100 dark:hover:bg-dark-800'
                }`}
                aria-label="Search products"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>

              {/* Theme Toggle - Hidden on mobile */}
              <div className="hidden sm:block">
                <ThemeToggle variant="dropdown" />
              </div>

              {/* Wishlist - Desktop only */}
              {isAuthenticated && (
                <Link
                  to="/account/wishlist"
                  aria-label="Wishlist"
                  className={`p-2.5 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 hidden sm:flex ${
                    isHomePage && !isScrolled
                      ? 'text-white hover:bg-white/10'
                      : 'text-primary-500 hover:bg-dark-100 dark:hover:bg-dark-800'
                  }`}
                >
                  <HeartIcon className="h-5 w-5" />
                </Link>
              )}

              {/* Cart */}
              <button
                onClick={() => setCartDrawerOpen(true)}
                className={`relative p-2 sm:p-2.5 rounded-xl w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${
                  isHomePage && !isScrolled
                    ? 'text-white hover:bg-white/10'
                    : 'text-primary-500 hover:bg-dark-100 dark:hover:bg-dark-800'
                }`}
                aria-label={`Shopping cart${cartItemsCount > 0 ? ` with ${cartItemsCount} items` : ''}`}
              >
                <ShoppingCartIcon className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs font-bold text-dark-900 bg-primary-500 rounded-full">
                    {cartItemsCount > 99 ? '99+' : cartItemsCount}
                  </span>
                )}
              </button>

              {/* User menu - Desktop */}
              {isAuthenticated ? (
                <Popover className="relative hidden lg:block">
                  <Popover.Button
                    className={`p-2.5 rounded-xl transition-all duration-200 ${
                      isHomePage && !isScrolled
                        ? 'text-white hover:bg-white/10'
                        : 'text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center">
                      <span className="text-sm font-bold text-dark-900">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  </Popover.Button>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-2"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-2"
                  >
                    <Popover.Panel className="absolute right-0 top-full mt-3 w-64 bg-white dark:bg-dark-800 rounded-2xl shadow-xl ring-1 ring-dark-100 dark:ring-dark-700 overflow-hidden z-50">
                      {/* User info */}
                      <div className="px-5 py-4 bg-dark-50 dark:bg-dark-900/50">
                        <p className="font-semibold text-dark-900 dark:text-white">{user?.full_name || user?.name}</p>
                        <p className="text-sm text-dark-500 dark:text-dark-400 truncate">{user?.email}</p>
                        {user?.loyalty_points !== undefined && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                              {user.loyalty_points} Points
                            </span>
                          </div>
                        )}
                      </div>
                      {/* Menu items */}
                      <div className="py-2">
                        <Link
                          to="/account"
                          className="block px-5 py-2.5 text-dark-700 dark:text-dark-200 hover:bg-dark-50 dark:hover:bg-dark-700/50 transition-colors"
                        >
                          My Account
                        </Link>
                        <Link
                          to="/account/orders"
                          className="block px-5 py-2.5 text-dark-700 dark:text-dark-200 hover:bg-dark-50 dark:hover:bg-dark-700/50 transition-colors"
                        >
                          My Orders
                        </Link>
                        <Link
                          to="/account/wishlist"
                          className="block px-5 py-2.5 text-dark-700 dark:text-dark-200 hover:bg-dark-50 dark:hover:bg-dark-700/50 transition-colors"
                        >
                          Wishlist
                        </Link>
                        {user?.is_admin && (
                          <>
                            <div className="my-2 border-t border-dark-100 dark:border-dark-700" />
                            <Link
                              to="/admin"
                              className="block px-5 py-2.5 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors font-medium"
                            >
                              Admin Panel
                            </Link>
                          </>
                        )}
                        <div className="my-2 border-t border-dark-100 dark:border-dark-700" />
                        <button
                          onClick={() => logout()}
                          className="block w-full text-left px-5 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
                  className={`hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isHomePage && !isScrolled
                      ? 'text-white hover:bg-white/10'
                      : 'text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800'
                  }`}
                >
                  <UserIcon className="h-5 w-5" />
                  Sign In
                </Link>
              )}

              {/* Mobile Account/Login Icon */}
              <Link
                to={isAuthenticated ? '/account' : '/login'}
                className={`lg:hidden p-2 sm:p-2.5 rounded-xl w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center transition-colors ${
                  isHomePage && !isScrolled
                    ? 'text-white hover:bg-white/10'
                    : 'text-primary-500 hover:bg-dark-100 dark:hover:bg-dark-800'
                }`}
                aria-label={isAuthenticated ? 'My Account' : 'Sign In'}
              >
                <UserIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Search Modal */}
      <Transition show={searchOpen} as={Fragment}>
        <Dialog onClose={() => setSearchOpen(false)} className="relative z-[60]">
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

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-start justify-center p-4 pt-20">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95 -translate-y-10"
                enterTo="opacity-100 scale-100 translate-y-0"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100 translate-y-0"
                leaveTo="opacity-0 scale-95 -translate-y-10"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-dark-800 shadow-2xl transition-all">
                  <form onSubmit={handleSearch} className="relative">
                    <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-dark-400 dark:text-dark-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-full pl-14 pr-12 py-5 text-lg bg-transparent text-dark-900 dark:text-white placeholder:text-dark-400 dark:placeholder:text-dark-500 focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setSearchOpen(false)}
                      aria-label="Close search"
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg text-dark-400 dark:text-dark-500 hover:text-dark-600 dark:hover:text-dark-300 transition-colors"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </form>
                  <div className="border-t border-dark-100 dark:border-dark-700 px-5 py-4">
                    <p className="text-sm text-dark-500 dark:text-dark-400">
                      Press <kbd className="px-2 py-0.5 rounded bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-300 font-mono text-xs">Enter</kbd> to search or <kbd className="px-2 py-0.5 rounded bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-300 font-mono text-xs">Esc</kbd> to close
                    </p>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Mobile Menu Overlay - Full-screen */}
      <MobileMenuOverlay
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        categories={navigation.categories}
        pages={navigation.pages}
        isAuthenticated={isAuthenticated}
        user={user ?? undefined}
        onLogout={logout}
      />

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />
    </>
  )
}
