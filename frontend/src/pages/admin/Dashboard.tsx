import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UsersIcon,
  CubeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline'
import api from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface DashboardStats {
  revenue: {
    today: number
    this_month: number
    last_month: number
    growth: number
  }
  orders: {
    total: number
    pending: number
    processing: number
    delivered: number
    growth: number
  }
  customers: {
    total: number
    new_this_month: number
    growth: number
  }
  products: {
    total: number
    low_stock: number
    out_of_stock: number
  }
  recent_orders: {
    id: number
    order_number: string
    customer_name: string
    total: number
    status: string
    created_at: string
  }[]
  top_products: {
    id: number
    name: string
    primary_image?: string
    total_sold: number
    revenue: number
  }[]
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery<DashboardStats>({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const response = await api.get('/api/admin/dashboard')
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
      label: 'Revenue (This Month)',
      value: formatPrice(data?.revenue.this_month || 0),
      change: data?.revenue.growth || 0,
      icon: CurrencyDollarIcon,
      color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    },
    {
      label: 'Total Orders',
      value: data?.orders.total || 0,
      change: data?.orders.growth || 0,
      icon: ShoppingCartIcon,
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Total Customers',
      value: data?.customers.total || 0,
      change: data?.customers.growth || 0,
      icon: UsersIcon,
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    },
    {
      label: 'Total Products',
      value: data?.products.total || 0,
      subtext: `${data?.products.low_stock || 0} low stock`,
      icon: CubeIcon,
      color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-dark-900 dark:text-white">Dashboard</h1>
        <div className="text-xs sm:text-sm text-dark-500 dark:text-dark-400">
          Today: {new Date().toLocaleDateString('en-PK', { dateStyle: 'long' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                {stat.change !== undefined && (
                  <div className={`flex items-center text-xs sm:text-sm ${stat.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {stat.change >= 0 ? (
                      <ArrowUpIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    ) : (
                      <ArrowDownIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    )}
                    {Math.abs(stat.change)}%
                  </div>
                )}
              </div>
              <p className="text-xl sm:text-2xl font-bold text-dark-900 dark:text-white">{stat.value}</p>
              <p className="text-xs sm:text-sm text-dark-500 dark:text-dark-400 mt-1">{stat.label}</p>
              {stat.subtext && (
                <p className="text-xs font-medium text-orange-700 dark:text-orange-300 mt-1">{stat.subtext}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Order Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 sm:p-4 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-yellow-600 dark:text-yellow-400">{data?.orders.pending || 0}</p>
          <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300 mt-1">Pending</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 sm:p-4 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">{data?.orders.processing || 0}</p>
          <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 mt-1">Processing</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 sm:p-4 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">{data?.orders.delivered || 0}</p>
          <p className="text-xs sm:text-sm text-green-700 dark:text-green-300 mt-1">Delivered</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 sm:p-4 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400">{data?.products.out_of_stock || 0}</p>
          <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 mt-1">Out of Stock</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-dark-200 dark:border-dark-700 flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-semibold text-dark-900 dark:text-white">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs sm:text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
              View All
            </Link>
          </div>
          <div className="divide-y divide-dark-200 dark:divide-dark-700">
            {data?.recent_orders?.slice(0, 5).map((order) => (
              <div key={order.id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/admin/orders/${order.order_number}`}
                    className="text-sm sm:text-base font-medium text-dark-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    #{order.order_number}
                  </Link>
                  <p className="text-xs sm:text-sm text-dark-500 dark:text-dark-400 truncate">{order.customer_name}</p>
                </div>
                <div className="text-left sm:text-right flex-shrink-0">
                  <p className="text-sm sm:text-base font-semibold text-dark-900 dark:text-white">{formatPrice(order.total)}</p>
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-dark-200 dark:border-dark-700 flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-semibold text-dark-900 dark:text-white">Top Products</h2>
            <Link to="/admin/products" className="text-xs sm:text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
              View All
            </Link>
          </div>
          <div className="divide-y divide-dark-200 dark:divide-dark-700">
            {data?.top_products?.slice(0, 5).map((product, index) => (
              <div key={product.id} className="p-3 sm:p-4 flex items-center gap-2 sm:gap-4">
                <span className="text-base sm:text-lg font-bold text-dark-300 dark:text-dark-600 w-5 sm:w-6 flex-shrink-0">{index + 1}</span>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-dark-100 dark:bg-dark-700 rounded-lg overflow-hidden flex-shrink-0">
                  {product.primary_image ? (
                    <img
                      src={product.primary_image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-dark-400 text-xs">
                      No img
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-medium text-dark-900 dark:text-white truncate">{product.name}</p>
                  <p className="text-xs sm:text-sm text-dark-500 dark:text-dark-400">{product.total_sold} sold</p>
                </div>
                <p className="text-sm sm:text-base font-semibold text-dark-900 dark:text-white flex-shrink-0">{formatPrice(product.revenue)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    confirmed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    processing: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300',
    shipped: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
    delivered: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
  }
  return colors[status] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300'
}
