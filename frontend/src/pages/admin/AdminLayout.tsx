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
  SignalIcon,
  StarIcon,
  TicketIcon,
  FireIcon,
  UserGroupIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline'
import { useAuthStore } from '@/stores/authStore'

interface MenuItem {
  path?: string
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  exact?: boolean
  permission?: string
  children?: MenuItem[]
}

const menuItems: MenuItem[] = [
  { path: '/admin', label: 'Dashboard', icon: HomeIcon, exact: true, permission: 'view-dashboard' },
  { path: '/admin/orders', label: 'Orders', icon: ShoppingCartIcon, permission: 'manage-orders' },
  {
    label: 'Catalog',
    icon: CubeIcon,
    permission: 'manage-products',
    children: [
      { path: '/admin/products', label: 'Products', icon: CubeIcon, permission: 'manage-products' },
      { path: '/admin/bundles', label: 'Bundles', icon: GiftIcon, permission: 'manage-bundles' },
      { path: '/admin/categories', label: 'Categories', icon: TagIcon, permission: 'manage-categories' },
    ]
  },
  {
    label: 'Customers',
    icon: UsersIcon,
    permission: 'manage-customers',
    children: [
      { path: '/admin/customers', label: 'All Customers', icon: UsersIcon, permission: 'manage-customers' },
      { path: '/admin/dealers', label: 'Dealers', icon: TruckIcon, permission: 'manage-dealers' },
    ]
  },
  {
    label: 'Marketing',
    icon: FireIcon,
    permission: 'manage-sales',
    children: [
      { path: '/admin/sales', label: 'Sales', icon: FireIcon, permission: 'manage-sales' },
      { path: '/admin/coupons', label: 'Coupons', icon: TicketIcon, permission: 'manage-coupons' },
      { path: '/admin/reviews', label: 'Reviews', icon: StarIcon, permission: 'manage-reviews' },
    ]
  },
  {
    label: 'Content',
    icon: DocumentTextIcon,
    permission: 'manage-pages',
    children: [
      { path: '/admin/pages', label: 'Pages', icon: DocumentTextIcon, permission: 'manage-pages' },
      { path: '/admin/homepage', label: 'Homepage', icon: PaintBrushIcon, permission: 'manage-homepage' },
      { path: '/admin/portfolio', label: 'Portfolio Videos', icon: VideoCameraIcon, permission: 'manage-pages' },
    ]
  },
  { path: '/admin/service-requests', label: 'Service Requests', icon: WrenchScrewdriverIcon, permission: 'manage-service-requests' },
  { path: '/admin/shipping', label: 'Shipping', icon: TruckIcon, permission: 'manage-shipping' },
  {
    label: 'Analytics',
    icon: ChartBarIcon,
    permission: 'view-analytics',
    children: [
      { path: '/admin/analytics', label: 'Overview', icon: ChartBarIcon, permission: 'view-analytics' },
      { path: '/admin/analytics/realtime', label: 'Real-Time', icon: SignalIcon, permission: 'view-analytics' },
    ]
  },
  {
    label: 'System',
    icon: Cog6ToothIcon,
    permission: 'manage-settings',
    children: [
      { path: '/admin/users', label: 'Users', icon: UserGroupIcon, permission: 'manage-users' },
      { path: '/admin/settings', label: 'Settings', icon: Cog6ToothIcon, permission: 'manage-settings' },
    ]
  },
]

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])

  const isSuperAdmin = user?.roles?.includes('super-admin')
  const userPermissions = user?.permissions || []

  const hasPermission = (permission?: string) => {
    if (!permission) return true
    if (isSuperAdmin) return true
    return userPermissions.includes(permission)
  }

  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter(item => hasPermission(item.permission))
      .map(item => {
        if (item.children) {
          const filteredChildren = item.children.filter(child => hasPermission(child.permission))
          return filteredChildren.length > 0 ? { ...item, children: filteredChildren } : null
        }
        return item
      })
      .filter(Boolean) as MenuItem[]
  }

  const visibleMenuItems = filterMenuItems(menuItems)

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

  const isParentActive = (children?: MenuItem[]) => {
    if (!children) return false
    return children.some(child => child.path && location.pathname.startsWith(child.path))
  }

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    )
  }

  return (
    <div className="min-h-screen bg-dark-100 dark:bg-dark-900">
      {/* Mobile sidebar overlay with smooth fade transition */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ease-out ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar with smooth transitions */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-dark-900 transform transition-all duration-300 ease-out z-50 lg:translate-x-0 flex flex-col ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-dark-800 flex-shrink-0">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-dark-900 font-bold text-lg">F</span>
            </div>
            <span className="text-white font-semibold text-lg">Fischer Admin</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-dark-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation with smooth animations - scrollable */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-1 scrollbar-thin scrollbar-thumb-dark-700 scrollbar-track-dark-900 min-h-0">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon
            const hasChildren = item.children && item.children.length > 0
            const isExpanded = expandedMenus.includes(item.label)
            const isItemActive = item.path ? isActive(item.path, item.exact) : isParentActive(item.children)

            if (hasChildren) {
              return (
                <div key={item.label} className="space-y-1">
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={`group flex items-center justify-between w-full gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 hover:translate-x-1 text-sm ${
                      isItemActive
                        ? 'bg-dark-800 text-white font-medium'
                        : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDownIcon className="w-4 h-4 flex-shrink-0 transition-transform duration-200" />
                    ) : (
                      <ChevronRightIcon className="w-4 h-4 flex-shrink-0 transition-transform duration-200" />
                    )}
                  </button>
                  {isExpanded && item.children && (
                    <div className="ml-4 space-y-1 border-l border-dark-800 pl-2">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon
                        return (
                          <Link
                            key={child.path}
                            to={child.path!}
                            onClick={() => setSidebarOpen(false)}
                            className={`group flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 hover:translate-x-1 text-sm ${
                              isActive(child.path!, child.exact)
                                ? 'bg-primary-500 text-dark-900 font-medium'
                                : 'text-dark-400 hover:bg-dark-800 hover:text-white'
                            }`}
                          >
                            <ChildIcon className="w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
                            <span className="truncate">{child.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <Link
                key={item.path}
                to={item.path!}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 hover:translate-x-1 text-sm ${
                  isItemActive
                    ? 'bg-primary-500 text-dark-900 font-medium'
                    : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User - fixed at bottom */}
        <div className="flex-shrink-0 p-4 border-t border-dark-800 bg-dark-900">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-10 h-10 bg-dark-700 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-medium text-base">
                {(user?.full_name || user?.first_name || user?.name || '?').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white font-medium truncate text-sm">{user?.full_name || user?.name}</p>
              <p className="text-dark-400 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="group flex items-center gap-3 w-full px-4 py-2.5 text-dark-300 hover:text-white hover:bg-dark-800 rounded-lg transition-all duration-200 hover:translate-x-1 text-base"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-72 min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white dark:bg-dark-800 border-b border-dark-200 dark:border-dark-700 flex items-center justify-between px-4 lg:px-6">
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
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
