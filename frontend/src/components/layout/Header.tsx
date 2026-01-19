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
  ChevronDownIcon,
} from '@heroicons/react/24/outline'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import ThemeToggle from '@/components/ui/ThemeToggle'
import CartDrawer from '@/components/cart/CartDrawer'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

const navigation = {
  categories: [
    {
      name: 'Water Coolers',
      href: '/category/water-coolers',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      desc: 'Industrial & commercial coolers',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Geysers & Heaters',
      href: '/category/geysers-heaters',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
        </svg>
      ),
      desc: 'Electric, gas & hybrid',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      name: 'Cooking Ranges',
      href: '/category/cooking-ranges',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      desc: 'Ranges & oven toasters',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Built-in Hobs & Hoods',
      href: '/category/hobs-hoods',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      desc: 'Kitchen ventilation',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      name: 'Water Dispensers',
      href: '/category/water-dispensers',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      desc: 'Hot & cold dispensers',
      gradient: 'from-amber-500 to-yellow-500'
    },
    {
      name: 'Kitchen Appliances',
      href: '/category/kitchen-appliances',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
      desc: 'Home essentials',
      gradient: 'from-indigo-500 to-purple-500'
    },
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
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const { isAuthenticated, user, logout } = useAuthStore()
  const cartItemsCount = useCartStore((state) => state.items_count)

  // Fetch featured products for mega menu
  const { data: featuredProducts = [] } = useQuery({
    queryKey: ['header-featured-products'],
    queryFn: async () => {
      const { data } = await api.get('/products/bestsellers?per_page=6')
      return data.data || []
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

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
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary-500 via-amber-400 to-primary-500 origin-left z-10"
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
        <nav className="container-xl" aria-label="Top">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden -ml-2 p-2 rounded-xl text-primary-500 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 relative group">
              <img
                src="/images/logo.png"
                alt="Fischer"
                width={120}
                height={48}
                loading="eager"
                decoding="async"
                {...{ fetchpriority: "high" } as any}
                className="h-10 lg:h-12 w-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  const span = document.createElement('span')
                  span.className = 'text-2xl font-bold text-primary-500'
                  span.textContent = 'FISCHER'
                  e.currentTarget.parentElement?.appendChild(span)
                }}
              />
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 group-hover:w-full transition-all duration-300" />
            </Link>

            {/* Desktop navigation */}
            <Popover.Group className="hidden lg:flex lg:gap-x-1 lg:ml-8">
              {/* Products Dropdown */}
              <Popover className="relative">
                {({ open, close }: { open: boolean; close: () => void }) => (
                  <>
                    <Popover.Button
                      className={`flex items-center gap-x-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        open
                          ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                          : isHomePage && !isScrolled
                          ? 'text-dark-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-300'
                          : 'text-dark-700 dark:text-dark-300 hover:text-dark-900 dark:hover:text-white hover:bg-dark-100 dark:hover:bg-dark-800'
                      }`}
                    >
                      Products
                      <ChevronDownIcon
                        className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                      />
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
                      <Popover.Panel className="absolute left-0 top-full mt-3 w-[900px] bg-white dark:bg-dark-800 rounded-2xl shadow-2xl ring-1 ring-dark-100 dark:ring-dark-700 overflow-hidden z-50">
                        <div className="grid grid-cols-3 divide-x divide-dark-100 dark:divide-dark-700">
                          {/* Categories Column */}
                          <div className="col-span-1 p-6">
                            <p className="text-xs font-semibold text-dark-400 dark:text-dark-500 uppercase tracking-wider mb-4">
                              Categories
                            </p>
                            <div className="space-y-1">
                              {navigation.categories.map((item) => (
                                <Link
                                  key={item.name}
                                  to={item.href}
                                  onClick={() => close()}
                                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-dark-700 dark:text-dark-200 hover:bg-dark-50 dark:hover:bg-dark-700/50 transition-colors group"
                                >
                                  <div className={`p-2 rounded-lg bg-gradient-to-br ${item.gradient} bg-opacity-10 text-white group-hover:scale-110 transition-transform`}>
                                    {item.icon}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                                      {item.name}
                                    </p>
                                    <p className="text-xs text-dark-500 dark:text-dark-400 truncate">{item.desc}</p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                            <Link
                              to="/shop"
                              onClick={() => close()}
                              className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-primary-500 text-dark-900 font-semibold hover:bg-primary-400 transition-colors text-sm"
                            >
                              View All
                            </Link>
                          </div>

                          {/* Featured Products Column */}
                          <div className="col-span-2 p-6 bg-dark-50/50 dark:bg-dark-900/30">
                            <p className="text-xs font-semibold text-dark-400 dark:text-dark-500 uppercase tracking-wider mb-4">
                              Featured Products
                            </p>
                            <div className="grid grid-cols-3 gap-4">
                              {featuredProducts.length > 0 ? (
                                featuredProducts.map((product: any, index: number) => {
                                  // Get secondary image for hover effect
                                  const secondaryImage = product.images && product.images.length > 1
                                    ? (product.images.find((img: any) => !img.is_primary)?.image || product.images[1]?.image)
                                    : null

                                  return (
                                    <motion.div
                                      key={product.id}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: index * 0.05, duration: 0.3 }}
                                    >
                                      <Link
                                        to={`/product/${product.slug}`}
                                        onClick={() => close()}
                                        className="group block"
                                      >
                                        <div className="aspect-square bg-white dark:bg-dark-800 rounded-xl overflow-hidden mb-2 ring-2 ring-dark-100 dark:ring-dark-700 group-hover:ring-primary-500 transition-all relative shadow-md group-hover:shadow-xl group-hover:shadow-primary-500/20 duration-500">
                                          {product.primary_image ? (
                                            <>
                                              {/* Primary Image */}
                                              <img
                                                src={product.primary_image}
                                                alt={product.name}
                                                className={`w-full h-full object-cover transition-all duration-500 ease-out ${
                                                  secondaryImage
                                                    ? 'group-hover:opacity-0'
                                                    : 'group-hover:scale-110'
                                                }`}
                                              />

                                              {/* Secondary Image (shown on hover) */}
                                              {secondaryImage && (
                                                <img
                                                  src={secondaryImage}
                                                  alt={`${product.name} - alternate view`}
                                                  className="absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out opacity-0 group-hover:opacity-100 group-hover:scale-105"
                                                />
                                              )}

                                              {/* Enhanced Overlay with Badge */}
                                              <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-dark-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                                  <div className="flex items-center justify-center gap-1 text-white">
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    <span className="text-xs font-bold tracking-wide">QUICK VIEW</span>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Shine Sweep Effect */}
                                              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out skew-x-12" />
                                              </div>
                                            </>
                                          ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-primary-500/10 to-primary-600/10 flex items-center justify-center">
                                              <span className="text-4xl">📦</span>
                                            </div>
                                          )}
                                        </div>
                                        <h3 className="font-medium text-sm text-dark-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                                          {product.name}
                                        </h3>
                                        <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold mt-1">
                                          Rs {product.price?.toLocaleString()}
                                        </p>
                                      </Link>
                                    </motion.div>
                                  )
                                })
                              ) : (
                                // Skeleton loader while fetching
                                Array.from({ length: 6 }).map((_, i) => (
                                  <div key={i} className="animate-pulse">
                                    <div className="aspect-square bg-dark-200 dark:bg-dark-700 rounded-xl mb-2" />
                                    <div className="h-4 bg-dark-200 dark:bg-dark-700 rounded w-3/4" />
                                  </div>
                                ))
                              )}
                            </div>
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
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    location.pathname === page.href
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                      : isHomePage && !isScrolled
                      ? 'text-dark-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-300'
                      : 'text-dark-700 dark:text-dark-300 hover:text-dark-900 dark:hover:text-white hover:bg-dark-100 dark:hover:bg-dark-800'
                  }`}
                >
                  {page.name}
                </Link>
              ))}
            </Popover.Group>

            {/* Right section */}
            <div className="flex items-center gap-1 lg:gap-2">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2.5 rounded-xl transition-colors text-primary-500 hover:bg-dark-100 dark:hover:bg-dark-800"
                aria-label="Search products"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>

              {/* Theme Toggle - Always visible */}
              <ThemeToggle variant="dropdown" />

              {/* Wishlist - Desktop only */}
              {isAuthenticated && (
                <Link
                  to="/account/wishlist"
                  aria-label="Wishlist"
                  className="p-2.5 rounded-xl transition-colors hidden sm:flex text-primary-500 hover:bg-dark-100 dark:hover:bg-dark-800"
                >
                  <HeartIcon className="h-5 w-5" />
                </Link>
              )}

              {/* Cart */}
              <button
                onClick={() => setCartDrawerOpen(true)}
                className="relative p-2.5 rounded-xl transition-colors text-primary-500 hover:bg-dark-100 dark:hover:bg-dark-800"
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
                        ? 'text-dark-900 dark:text-white hover:bg-dark-100/50 dark:hover:bg-white/10'
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
                      ? 'text-dark-900 dark:text-white hover:bg-dark-100/50 dark:hover:bg-white/10'
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
                className="lg:hidden p-2.5 rounded-xl transition-colors text-primary-500 hover:bg-dark-100 dark:hover:bg-dark-800"
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

      {/* Mobile menu - using simple fixed positioning */}
      <Dialog
        as="div"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        className="lg:hidden"
      >
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-dark-900/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Sidebar Panel */}
        <Dialog.Panel
          className={`fixed inset-y-0 left-0 w-full max-w-sm bg-white dark:bg-dark-900 shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-dark-100 dark:border-dark-800">
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                <img src="/images/logo.png" alt="Fischer" width={100} height={32} className="h-8 w-auto" />
              </Link>
              <button
                type="button"
                className="p-2 rounded-xl text-primary-500 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Mobile search */}
            <form onSubmit={handleSearch} className="px-5 py-4 border-b border-dark-100 dark:border-dark-800">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400 dark:text-dark-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-dark-100 dark:bg-dark-800 text-dark-900 dark:text-white placeholder:text-dark-400 dark:placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </form>

            {/* Navigation - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-5 py-4">
                {/* Categories */}
                <div className="mb-6">
                  <p className="px-3 text-xs font-semibold text-dark-400 dark:text-dark-500 uppercase tracking-wider mb-3">
                    Categories
                  </p>
                  <div className="space-y-1">
                    {navigation.categories.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="flex items-center gap-4 px-3 py-3 rounded-xl text-dark-700 dark:text-dark-200 hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${item.gradient} text-white`}>
                          {item.icon}
                        </div>
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Pages */}
                <div className="mb-6">
                  <p className="px-3 text-xs font-semibold text-dark-400 dark:text-dark-500 uppercase tracking-wider mb-3">
                    Pages
                  </p>
                  <div className="space-y-1">
                    {navigation.pages.map((page) => (
                      <Link
                        key={page.name}
                        to={page.href}
                        className="block px-3 py-3 rounded-xl text-dark-700 dark:text-dark-200 hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {page.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Quick Links */}
                <div className="mb-6">
                  <p className="px-3 text-xs font-semibold text-dark-400 dark:text-dark-500 uppercase tracking-wider mb-3">
                    Quick Links
                  </p>
                  <div className="space-y-1">
                    <Link
                      to="/track-order"
                      className="block px-3 py-3 rounded-xl text-dark-700 dark:text-dark-200 hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Track Order
                    </Link>
                    <Link
                      to="/become-dealer"
                      className="block px-3 py-3 rounded-xl text-dark-700 dark:text-dark-200 hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Become a Dealer
                    </Link>
                  </div>
                </div>

                {/* Account Section */}
                <div className="pt-6 border-t border-dark-100 dark:border-dark-800">
                  {isAuthenticated ? (
                    <div className="space-y-1">
                      <Link
                        to="/account"
                        className="block px-3 py-3 rounded-xl text-dark-700 dark:text-dark-200 hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Account
                      </Link>
                      <Link
                        to="/account/orders"
                        className="block px-3 py-3 rounded-xl text-dark-700 dark:text-dark-200 hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Orders
                      </Link>
                      <Link
                        to="/account/wishlist"
                        className="block px-3 py-3 rounded-xl text-dark-700 dark:text-dark-200 hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Wishlist
                      </Link>
                      {user?.is_admin && (
                        <Link
                          to="/admin"
                          className="block px-3 py-3 rounded-xl text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 font-medium transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          logout()
                          setMobileMenuOpen(false)
                        }}
                        className="block w-full text-left px-3 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Link
                        to="/login"
                        className="block w-full text-center px-4 py-3 bg-primary-500 text-dark-900 font-semibold rounded-xl hover:bg-primary-400 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        className="block w-full text-center px-4 py-3 border-2 border-dark-200 dark:border-dark-700 text-dark-700 dark:text-dark-200 font-semibold rounded-xl hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Create Account
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer - Fixed at bottom */}
            <div className="px-5 py-4 border-t border-dark-100 dark:border-dark-800 bg-dark-50 dark:bg-dark-800/50">
              <a
                href="tel:+923211146642"
                className="flex items-center gap-3 text-dark-600 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <PhoneIcon className="w-5 h-5" />
                <span className="font-medium">+92 321 1146642</span>
              </a>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />
    </>
  )
}
