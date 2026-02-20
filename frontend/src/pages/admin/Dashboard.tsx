import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UsersIcon,
  CubeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ArrowPathIcon,
  ClockIcon,
  CheckCircleIcon,
  NoSymbolIcon,
  Cog6ToothIcon,
  TagIcon,
  ChartBarIcon,
  BoltIcon,
} from '@heroicons/react/24/outline'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import api from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface ChartPoint {
  date: string
  revenue: number
  orders: number
}

interface LowStockProduct {
  id: number
  name: string
  slug: string
  stock: number
  image?: string
}

interface DashboardStats {
  revenue: { today: number; this_month: number; last_month: number; growth: number }
  orders: { total: number; pending: number; processing: number; delivered: number; growth: number }
  customers: { total: number; new_this_month: number; growth: number }
  products: { total: number; low_stock: number; out_of_stock: number }
  recent_orders: { id: number; order_number: string; customer_name: string; total: number; status: string; created_at: string }[]
  top_products: { id: number; name: string; primary_image?: string; total_sold: number; revenue: number }[]
  chart_data: ChartPoint[]
  low_stock_products: LowStockProduct[]
}

// Custom tooltip for charts
function ChartTooltip({ active, payload, label, type }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl shadow-xl p-3 text-sm">
      <p className="font-semibold text-dark-700 dark:text-dark-200 mb-1">{label}</p>
      {type === 'revenue' ? (
        <p className="text-blue-600 dark:text-blue-400 font-bold">{formatPrice(payload[0]?.value || 0)}</p>
      ) : (
        <p className="text-violet-600 dark:text-violet-400 font-bold">{payload[0]?.value || 0} orders</p>
      )}
    </div>
  )
}

function formatYAxis(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`
  return String(value)
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300',
    confirmed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    processing: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300',
    shipped: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
    delivered: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    cancelled: 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300',
  }
  return colors[status] || 'bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-dark-300'
}

export default function AdminDashboard() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<DashboardStats>({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const response = await api.get('/api/admin/dashboard')
      return response.data.data
    },
  })

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const kpiCards = [
    {
      label: 'Revenue This Month',
      value: formatPrice(data?.revenue.this_month || 0),
      sub: `Today: ${formatPrice(data?.revenue.today || 0)}`,
      change: data?.revenue.growth || 0,
      icon: CurrencyDollarIcon,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800/50',
    },
    {
      label: 'Orders This Month',
      value: data?.orders.total || 0,
      sub: `Last month growth`,
      change: data?.orders.growth || 0,
      icon: ShoppingCartIcon,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800/50',
    },
    {
      label: 'Total Customers',
      value: data?.customers.total || 0,
      sub: `+${data?.customers.new_this_month || 0} this month`,
      change: data?.customers.growth || 0,
      icon: UsersIcon,
      iconBg: 'bg-violet-100 dark:bg-violet-900/30',
      iconColor: 'text-violet-600 dark:text-violet-400',
      border: 'border-violet-200 dark:border-violet-800/50',
    },
    {
      label: 'Total Products',
      value: data?.products.total || 0,
      sub: data?.products.low_stock
        ? `${data.products.low_stock} low stock`
        : 'All in stock',
      subColor: data?.products.low_stock ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400',
      icon: CubeIcon,
      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-200 dark:border-orange-800/50',
    },
  ]

  const quickActions = [
    { label: 'Add Product', icon: PlusIcon, to: '/admin/products/new', bg: 'bg-primary-500 hover:bg-primary-600', text: 'text-white' },
    { label: `Pending (${data?.orders.pending || 0})`, icon: ClockIcon, to: '/admin/orders?status=pending', bg: 'bg-amber-500 hover:bg-amber-600', text: 'text-white' },
    { label: 'All Orders', icon: ShoppingCartIcon, to: '/admin/orders', bg: 'bg-blue-600 hover:bg-blue-700', text: 'text-white' },
    { label: 'Customers', icon: UsersIcon, to: '/admin/customers', bg: 'bg-violet-600 hover:bg-violet-700', text: 'text-white' },
    { label: 'Categories', icon: TagIcon, to: '/admin/categories', bg: 'bg-emerald-600 hover:bg-emerald-700', text: 'text-white' },
    { label: 'Settings', icon: Cog6ToothIcon, to: '/admin/settings', bg: 'bg-dark-600 dark:bg-dark-700 hover:bg-dark-700 dark:hover:bg-dark-600', text: 'text-white' },
  ]

  const orderStatuses = [
    { label: 'Pending', value: data?.orders.pending || 0, icon: ClockIcon, bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-400' },
    { label: 'Processing', value: data?.orders.processing || 0, icon: BoltIcon, bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-400' },
    { label: 'Delivered', value: data?.orders.delivered || 0, icon: CheckCircleIcon, bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-700 dark:text-emerald-400' },
    { label: 'Out of Stock', value: data?.products.out_of_stock || 0, icon: NoSymbolIcon, bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-800', text: 'text-rose-600 dark:text-rose-400' },
  ]

  // Show only last 15 data points on chart to keep labels readable
  const chartData = data?.chart_data?.slice(-15) || []
  const hasChartData = chartData.some(d => d.revenue > 0 || d.orders > 0)

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-dark-500 dark:text-dark-400 mt-0.5">
            {new Date().toLocaleDateString('en-PK', { dateStyle: 'long' })}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 text-sm font-medium text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors shadow-sm"
        >
          <ArrowPathIcon className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className={`bg-white dark:bg-dark-800 rounded-2xl border ${card.border} shadow-sm p-5 flex flex-col gap-3`}
            >
              <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
                {card.change !== undefined && (
                  <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full
                    ${card.change >= 0
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                      : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {card.change >= 0
                      ? <ArrowUpIcon className="w-3 h-3" />
                      : <ArrowDownIcon className="w-3 h-3" />
                    }
                    {Math.abs(card.change)}%
                  </div>
                )}
              </div>
              <div>
                <p className="text-2xl font-black text-dark-900 dark:text-white">{card.value}</p>
                <p className="text-sm text-dark-500 dark:text-dark-400 mt-0.5">{card.label}</p>
                {card.sub && (
                  <p className={`text-xs font-medium mt-1 ${card.subColor || 'text-dark-400 dark:text-dark-500'}`}>
                    {card.sub}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Quick Actions ── */}
      <div className="bg-white dark:bg-dark-800 rounded-2xl border border-dark-200 dark:border-dark-700 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wide mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.label}
                to={action.to}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl ${action.bg} ${action.text} text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95 text-center shadow-sm`}
              >
                <Icon className="w-5 h-5" />
                {action.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-3 bg-white dark:bg-dark-800 rounded-2xl border border-dark-200 dark:border-dark-700 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-dark-900 dark:text-white">Revenue</h2>
              <p className="text-xs text-dark-400 dark:text-dark-500">Last 30 days</p>
            </div>
            <ChartBarIcon className="w-5 h-5 text-blue-400" />
          </div>
          {hasChartData ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-dark-100 dark:text-dark-700" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: 'currentColor' }}
                  className="text-dark-400 dark:text-dark-500"
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis
                  tickFormatter={formatYAxis}
                  tick={{ fontSize: 10, fill: 'currentColor' }}
                  className="text-dark-400 dark:text-dark-500"
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip content={<ChartTooltip type="revenue" />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#3b82f6' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-dark-400 dark:text-dark-600 text-sm">
              No revenue data yet for the last 30 days
            </div>
          )}
        </div>

        {/* Orders Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-800 rounded-2xl border border-dark-200 dark:border-dark-700 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-dark-900 dark:text-white">Orders</h2>
              <p className="text-xs text-dark-400 dark:text-dark-500">Last 30 days</p>
            </div>
            <ShoppingCartIcon className="w-5 h-5 text-violet-400" />
          </div>
          {hasChartData ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }} barSize={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-dark-100 dark:text-dark-700" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: 'currentColor' }}
                  className="text-dark-400 dark:text-dark-500"
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: 'currentColor' }}
                  className="text-dark-400 dark:text-dark-500"
                  tickLine={false}
                  axisLine={false}
                  width={30}
                />
                <Tooltip content={<ChartTooltip type="orders" />} />
                <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-dark-400 dark:text-dark-600 text-sm">
              No order data yet
            </div>
          )}
        </div>
      </div>

      {/* ── Order Status + Low Stock ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Order Status */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-800 rounded-2xl border border-dark-200 dark:border-dark-700 shadow-sm p-5">
          <h2 className="text-base font-semibold text-dark-900 dark:text-white mb-4">Order Status</h2>
          <div className="grid grid-cols-2 gap-3">
            {orderStatuses.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl p-4 flex flex-col items-center text-center`}>
                  <Icon className={`w-6 h-6 ${s.text} mb-2`} />
                  <p className={`text-2xl font-black ${s.text}`}>{s.value}</p>
                  <p className={`text-xs font-medium ${s.text} opacity-80 mt-0.5`}>{s.label}</p>
                </div>
              )
            })}
          </div>
          <Link
            to="/admin/orders"
            className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-dark-50 dark:bg-dark-700 text-sm font-medium text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-600 transition-colors"
          >
            View All Orders
          </Link>
        </div>

        {/* Low Stock / OOS Alerts */}
        <div className="lg:col-span-3 bg-white dark:bg-dark-800 rounded-2xl border border-dark-200 dark:border-dark-700 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-3">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-semibold text-dark-900 dark:text-white">Stock Alerts</h2>
              {(data?.low_stock_products?.length ?? 0) > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
                  {data!.low_stock_products.length}
                </span>
              )}
            </div>
            <Link to="/admin/products?stock=low" className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium">
              View All
            </Link>
          </div>
          {data?.low_stock_products && data.low_stock_products.length > 0 ? (
            <div className="divide-y divide-dark-100 dark:divide-dark-700 max-h-[260px] overflow-y-auto">
              {data.low_stock_products.map((product) => (
                <div key={product.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-9 h-9 rounded-lg bg-dark-100 dark:bg-dark-700 overflow-hidden flex-shrink-0">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-dark-400 text-xs">?</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-900 dark:text-white truncate">{product.name}</p>
                    <p className={`text-xs font-semibold ${product.stock === 0 ? 'text-rose-500 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {product.stock === 0 ? 'Out of stock' : `${product.stock} left`}
                    </p>
                  </div>
                  <Link
                    to={`/admin/products/${product.slug}/edit`}
                    className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 font-medium transition-colors"
                  >
                    Restock
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-10 text-center">
              <CheckCircleIcon className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-dark-600 dark:text-dark-400">All products are well-stocked</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Orders + Top Products ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-dark-200 dark:border-dark-700 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-3 border-b border-dark-100 dark:border-dark-700">
            <h2 className="text-base font-semibold text-dark-900 dark:text-white">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium">View All</Link>
          </div>
          <div className="divide-y divide-dark-100 dark:divide-dark-700">
            {data?.recent_orders?.slice(0, 8).map((order) => (
              <Link
                key={order.id}
                to={`/admin/orders/${order.order_number}`}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-dark-50 dark:hover:bg-dark-700/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-dark-900 dark:text-white">#{order.order_number}</p>
                  <p className="text-xs text-dark-500 dark:text-dark-400 truncate">{order.customer_name}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-dark-900 dark:text-white">{formatPrice(order.total)}</p>
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-0.5 ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
              </Link>
            ))}
            {(!data?.recent_orders || data.recent_orders.length === 0) && (
              <div className="px-5 py-10 text-center text-sm text-dark-400 dark:text-dark-600">No orders yet</div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-dark-200 dark:border-dark-700 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-3 border-b border-dark-100 dark:border-dark-700">
            <h2 className="text-base font-semibold text-dark-900 dark:text-white">Top Products</h2>
            <Link to="/admin/products" className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium">View All</Link>
          </div>
          <div className="divide-y divide-dark-100 dark:divide-dark-700">
            {data?.top_products?.slice(0, 8).map((product, index) => (
              <div key={product.id} className="flex items-center gap-3 px-5 py-3.5">
                <span className="text-sm font-black text-dark-300 dark:text-dark-600 w-5 text-center flex-shrink-0">
                  {index + 1}
                </span>
                <div className="w-10 h-10 bg-dark-100 dark:bg-dark-700 rounded-lg overflow-hidden flex-shrink-0">
                  {product.primary_image ? (
                    <img src={product.primary_image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-dark-400 text-xs">?</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark-900 dark:text-white truncate">{product.name}</p>
                  <p className="text-xs text-dark-500 dark:text-dark-400">{product.total_sold} sold</p>
                </div>
                <p className="text-sm font-bold text-dark-900 dark:text-white flex-shrink-0">{formatPrice(product.revenue)}</p>
              </div>
            ))}
            {(!data?.top_products || data.top_products.length === 0) && (
              <div className="px-5 py-10 text-center text-sm text-dark-400 dark:text-dark-600">No product data yet</div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
