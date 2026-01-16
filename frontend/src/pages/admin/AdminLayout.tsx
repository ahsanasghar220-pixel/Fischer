import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  HomeIcon,
  CubeIcon,
  ShoppingCartIcon,
  UsersIcon,
  TagIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ChartBarIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  PaintBrushIcon,
  GiftIcon,
} from '@heroicons/react/24/outline'
import { useAuthStore } from '@/stores/authStore'

const menuItems = [
  { path: '/admin', label: 'Dashboard', icon: HomeIcon, exact: true },
  { path: '/admin/orders', label: 'Orders', icon: ShoppingCartIcon },
  { path: '/admin/products', label: 'Products', icon: CubeIcon },
  { path: '/admin/bundles', label: 'Bundles', icon: GiftIcon },
  { path: '/admin/categories', label: 'Categories', icon: TagIcon },
  { path: '/admin/customers', label: 'Customers', icon: UsersIcon },
  { path: '/admin/dealers', label: 'Dealers', icon: TruckIcon },
  { path: '/admin/service-requests', label: 'Service Requests', icon: WrenchScrewdriverIcon },
  { path: '/admin/pages', label: 'Pages', icon: DocumentTextIcon },
  { path: '/admin/homepage', label: 'Homepage', icon: PaintBrushIcon },
  { path: '/admin/analytics', label: 'Analytics', icon: ChartBarIcon },
  { path: '/admin/settings', label: 'Settings', icon: Cog6ToothIcon },
]

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-dark-100 dark:bg-dark-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-dark-900 transform transition-transform z-50 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-dark-800">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-dark-900 font-bold">F</span>
            </div>
            <span className="text-white font-semibold">Fischer Admin</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-dark-400 hover:text-white"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  isActive(item.path, item.exact)
                    ? 'bg-primary-500 text-dark-900'
                    : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-dark-700 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-white font-medium truncate">{user?.name}</p>
              <p className="text-dark-400 text-sm truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 text-dark-300 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="h-16 bg-white dark:bg-dark-800 border-b border-dark-200 dark:border-dark-700 flex items-center justify-between px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-dark-600 dark:text-dark-300 hover:text-dark-900 dark:hover:text-white"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          <div className="flex-1 lg:ml-0" />

          <div className="flex items-center gap-4">
            <Link
              to="/"
              target="_blank"
              className="text-sm text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200"
            >
              View Store →
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
