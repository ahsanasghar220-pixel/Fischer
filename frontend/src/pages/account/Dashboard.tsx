import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ShoppingBagIcon,
  HeartIcon,
  GiftIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { formatPrice, formatDate } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface DashboardData {
  stats: {
    total_orders: number
    pending_orders: number
    wishlist_count: number
    loyalty_points: number
  }
  recent_orders: {
    id: number
    order_number: string
    status: string
    total: number
    created_at: string
  }[]
}

export default function Dashboard() {
  const { user } = useAuthStore()

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['account-dashboard'],
    queryFn: async () => {
      const response = await api.get('/account/dashboard')
      return response.data.data
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const stats = [
    {
      label: 'Total Orders',
      value: data?.stats.total_orders || 0,
      icon: ShoppingBagIcon,
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      link: '/account/orders',
    },
    {
      label: 'Pending Orders',
      value: data?.stats.pending_orders || 0,
      icon: ClockIcon,
      color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
      link: '/account/orders?status=pending',
    },
    {
      label: 'Wishlist Items',
      value: data?.stats.wishlist_count || 0,
      icon: HeartIcon,
      color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      link: '/account/wishlist',
    },
    {
      label: 'Loyalty Points',
      value: data?.stats.loyalty_points || 0,
      icon: GiftIcon,
      color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      link: '/account/loyalty',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Hello, {user?.name}!</h2>
        <p className="opacity-90">
          From your account dashboard, you can view your recent orders, manage your shipping addresses, and edit your account details.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.label}
              to={stat.link}
              className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-dark-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-dark-500 dark:text-dark-400">{stat.label}</p>
            </Link>
          )
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm">
        <div className="p-4 border-b border-dark-200 dark:border-dark-700 flex items-center justify-between">
          <h3 className="font-semibold text-dark-900 dark:text-white">Recent Orders</h3>
          <Link to="/account/orders" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
            View All
          </Link>
        </div>
        {data?.recent_orders && data.recent_orders.length > 0 ? (
          <div className="divide-y divide-dark-200 dark:divide-dark-700">
            {data.recent_orders.map((order) => (
              <Link
                key={order.id}
                to={`/account/orders/${order.order_number}`}
                className="flex items-center justify-between p-4 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
              >
                <div>
                  <p className="font-medium text-dark-900 dark:text-white">#{order.order_number}</p>
                  <p className="text-sm text-dark-500 dark:text-dark-400">{formatDate(order.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-dark-900 dark:text-white">{formatPrice(order.total)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-dark-500 dark:text-dark-400">
            <ShoppingBagIcon className="w-12 h-12 mx-auto text-dark-300 dark:text-dark-600 mb-3" />
            <p>No orders yet</p>
            <Link to="/shop" className="text-primary-600 dark:text-primary-400 hover:underline text-sm mt-2 inline-block">
              Start shopping
            </Link>
          </div>
        )}
      </div>

      {/* Account Info */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile Info */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-dark-900 dark:text-white">Profile Information</h3>
            <Link to="/account/settings" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
              Edit
            </Link>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-dark-500 dark:text-dark-400">Name</p>
              <p className="text-dark-900 dark:text-white">{user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-dark-500 dark:text-dark-400">Email</p>
              <p className="text-dark-900 dark:text-white">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-dark-500 dark:text-dark-400">Phone</p>
              <p className="text-dark-900 dark:text-white">{user?.phone || 'Not set'}</p>
            </div>
          </div>
        </div>

        {/* Default Address */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-dark-900 dark:text-white">Default Address</h3>
            <Link to="/account/addresses" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
              Manage
            </Link>
          </div>
          {user?.default_address ? (
            <div className="text-dark-600 dark:text-dark-400">
              <p className="font-medium text-dark-900 dark:text-white">{user.default_address.name}</p>
              <p>{user.default_address.address_line_1}</p>
              {user.default_address.address_line_2 && <p>{user.default_address.address_line_2}</p>}
              <p>{user.default_address.city}, {user.default_address.state}</p>
              <p>{user.default_address.postal_code}</p>
              <p className="mt-2">{user.default_address.phone}</p>
            </div>
          ) : (
            <div className="text-dark-500 dark:text-dark-400">
              <p>No default address set</p>
              <Link to="/account/addresses" className="text-primary-600 dark:text-primary-400 hover:underline text-sm mt-2 inline-block">
                Add an address
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
    confirmed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
    processing: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400',
    shipped: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400',
    delivered: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
  }
  return colors[status] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400'
}
