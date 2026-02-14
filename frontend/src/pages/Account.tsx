import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  UserIcon,
  ShoppingBagIcon,
  HeartIcon,
  MapPinIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  GiftIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline'
import { useAuthStore } from '@/stores/authStore'

const menuItems = [
  { path: '/account', label: 'Dashboard', icon: UserIcon, exact: true },
  { path: '/account/orders', label: 'My Orders', icon: ShoppingBagIcon },
  { path: '/account/wishlist', label: 'Wishlist', icon: HeartIcon },
  { path: '/account/addresses', label: 'Addresses', icon: MapPinIcon },
  { path: '/account/loyalty', label: 'Loyalty Points', icon: GiftIcon },
  { path: '/account/service-requests', label: 'Service Requests', icon: WrenchScrewdriverIcon },
  { path: '/account/settings', label: 'Settings', icon: CogIcon },
]

export default function Account() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-900 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 border-b border-dark-200 dark:border-dark-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-dark-500 dark:text-dark-400 mb-4">
            <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400">Home</Link>
            <span>/</span>
            <span className="text-dark-900 dark:text-white">My Account</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-dark-900 dark:text-white">My Account</h1>
          {user && (
            <p className="text-sm sm:text-base text-dark-500 dark:text-dark-400 mt-1">Welcome back, {user.name}</p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm overflow-hidden sticky top-4">
              {/* User Info */}
              <div className="p-6 border-b border-dark-200 dark:border-dark-700">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-900 dark:text-white">{user?.name}</h3>
                    <p className="text-sm text-dark-500 dark:text-dark-400">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Menu */}
              <nav className="p-4">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                        isActive(item.path, item.exact)
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                          : 'text-dark-600 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  )
                })}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-4"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  Logout
                </button>
              </nav>
            </div>
          </aside>

          {/* Mobile Menu Button */}
          <div className="lg:hidden mb-4 w-full">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="w-full bg-white dark:bg-dark-800 rounded-xl shadow-sm p-4 flex items-center justify-between"
            >
              <span className="font-medium text-dark-900 dark:text-white">Account Menu</span>
              <svg
                className={`w-5 h-5 text-dark-600 dark:text-dark-400 transition-transform ${showMobileMenu ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showMobileMenu && (
              <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm mt-2 overflow-hidden">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setShowMobileMenu(false)}
                      className={`flex items-center gap-3 px-4 py-3 border-b border-dark-200 dark:border-dark-700 last:border-0 ${
                        isActive(item.path, item.exact)
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                          : 'text-dark-600 dark:text-dark-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  )
                })}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 dark:text-red-400"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
