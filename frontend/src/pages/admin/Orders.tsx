import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  MagnifyingGlassIcon,
  EyeIcon,
  ClockIcon,
  Cog6ToothIcon,
  TruckIcon,
  CheckCircleIcon,
  ShoppingBagIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import api from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'

interface Order {
  id: number
  order_number: string
  customer_name: string
  customer_email: string
  status: string
  payment_status: string
  payment_method: string
  total: number
  items_count: number
  created_at: string
}

interface PaginatedOrders {
  data: Order[]
  meta: {
    current_page: number
    last_page: number
    total: number
    per_page: number
  }
}

interface OrderStats {
  pending: number
  processing: number
  shipped: number
  delivered: number
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

const ORDER_STATUS: Record<string, { dot: string; text: string; bg: string }> = {
  pending:          { dot: 'bg-amber-400',   text: 'text-amber-700 dark:text-amber-300',    bg: 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-700/30' },
  confirmed:        { dot: 'bg-blue-500',    text: 'text-blue-700 dark:text-blue-300',      bg: 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200/60 dark:border-blue-700/30' },
  processing:       { dot: 'bg-indigo-500',  text: 'text-indigo-700 dark:text-indigo-300',  bg: 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200/60 dark:border-indigo-700/30' },
  shipped:          { dot: 'bg-purple-500',  text: 'text-purple-700 dark:text-purple-300',  bg: 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200/60 dark:border-purple-700/30' },
  out_for_delivery: { dot: 'bg-cyan-500',    text: 'text-cyan-700 dark:text-cyan-300',      bg: 'bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200/60 dark:border-cyan-700/30' },
  delivered:        { dot: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/60 dark:border-emerald-700/30' },
  cancelled:        { dot: 'bg-red-500',     text: 'text-red-700 dark:text-red-300',        bg: 'bg-red-50 dark:bg-red-900/20 border border-red-200/60 dark:border-red-700/30' },
  returned:         { dot: 'bg-orange-500',  text: 'text-orange-700 dark:text-orange-300',  bg: 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200/60 dark:border-orange-700/30' },
  refunded:         { dot: 'bg-dark-400',    text: 'text-dark-600 dark:text-dark-400',      bg: 'bg-dark-100 dark:bg-dark-700 border border-dark-200/60 dark:border-dark-600/30' },
}

const PAYMENT_STATUS: Record<string, { dot: string; text: string; bg: string }> = {
  pending:            { dot: 'bg-amber-400',   text: 'text-amber-700 dark:text-amber-300',    bg: 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-700/30' },
  paid:               { dot: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/60 dark:border-emerald-700/30' },
  failed:             { dot: 'bg-red-500',     text: 'text-red-700 dark:text-red-300',        bg: 'bg-red-50 dark:bg-red-900/20 border border-red-200/60 dark:border-red-700/30' },
  refunded:           { dot: 'bg-dark-400',    text: 'text-dark-600 dark:text-dark-400',      bg: 'bg-dark-100 dark:bg-dark-700 border border-dark-200/60 dark:border-dark-600/30' },
  partially_refunded: { dot: 'bg-orange-400',  text: 'text-orange-700 dark:text-orange-300',  bg: 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200/60 dark:border-orange-700/30' },
}

function StatusBadge({ status, config }: { status: string; config: Record<string, { dot: string; text: string; bg: string }> }) {
  const s = config[status] || { dot: 'bg-dark-400', text: 'text-dark-600 dark:text-dark-400', bg: 'bg-dark-100 dark:bg-dark-700 border border-dark-200/60 dark:border-dark-600/30' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
      {status.replace(/_/g, ' ')}
    </span>
  )
}

function CustomerAvatar({ name }: { name: string }) {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
  const palettes = [
    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  ]
  const color = palettes[name.charCodeAt(0) % palettes.length]
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${color}`}>
      {initials}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="divide-y divide-dark-100 dark:divide-dark-700/60">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
          <div className="space-y-1.5 w-24">
            <div className="h-3.5 bg-dark-200 dark:bg-dark-600 rounded w-full" />
            <div className="h-3 bg-dark-100 dark:bg-dark-700 rounded w-2/3" />
          </div>
          <div className="flex items-center gap-2.5 flex-1">
            <div className="w-8 h-8 bg-dark-200 dark:bg-dark-600 rounded-full flex-shrink-0" />
            <div className="space-y-1.5">
              <div className="h-3.5 bg-dark-200 dark:bg-dark-600 rounded w-28" />
              <div className="h-3 bg-dark-100 dark:bg-dark-700 rounded w-36" />
            </div>
          </div>
          <div className="h-6 w-20 bg-dark-200 dark:bg-dark-600 rounded-full" />
          <div className="h-6 w-16 bg-dark-200 dark:bg-dark-600 rounded-full hidden md:block" />
          <div className="h-3.5 w-20 bg-dark-200 dark:bg-dark-600 rounded" />
          <div className="h-3 w-24 bg-dark-100 dark:bg-dark-700 rounded hidden lg:block" />
          <div className="w-8 h-8 bg-dark-100 dark:bg-dark-700 rounded-lg flex-shrink-0" />
        </div>
      ))}
    </div>
  )
}

export default function AdminOrders() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')

  const { data: dashboardData } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/api/admin/dashboard')
      return response.data.data
    },
  })

  const stats: OrderStats = {
    pending:    dashboardData?.orders?.pending    || 0,
    processing: dashboardData?.orders?.processing || 0,
    shipped:    0,
    delivered:  dashboardData?.orders?.delivered  || 0,
  }

  const { data, isLoading } = useQuery<PaginatedOrders>({
    queryKey: ['admin-orders', page, search, status, paymentStatus],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      if (search) params.set('search', search)
      if (status) params.set('status', status)
      if (paymentStatus) params.set('payment_status', paymentStatus)
      const response = await api.get(`/api/admin/orders?${params.toString()}`)
      return response.data.data
    },
  })

  const orders = data?.data || []
  const meta = data?.meta
  const perPage = meta?.per_page || 15
  const from = orders.length ? (page - 1) * perPage + 1 : 0
  const to   = orders.length ? from + orders.length - 1 : 0

  // Build compact page-number list (max 7 visible)
  const pageNumbers: number[] = []
  if (meta && meta.last_page > 1) {
    const total = meta.last_page
    const cur = page
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pageNumbers.push(i)
    } else if (cur <= 4) {
      for (let i = 1; i <= 7; i++) pageNumbers.push(i)
    } else if (cur >= total - 3) {
      for (let i = total - 6; i <= total; i++) pageNumbers.push(i)
    } else {
      for (let i = cur - 3; i <= cur + 3; i++) pageNumbers.push(i)
    }
  }

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Orders</h1>
        <p className="mt-0.5 text-sm text-dark-500 dark:text-dark-400">
          {meta?.total != null ? `${meta.total} total orders` : 'Manage and track customer orders'}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {([
          { label: 'Pending',    value: stats.pending,    Icon: ClockIcon,         color: 'text-amber-600 dark:text-amber-400',   iconBg: 'bg-amber-50 dark:bg-amber-900/20',   border: 'border-l-amber-400' },
          { label: 'Processing', value: stats.processing, Icon: Cog6ToothIcon,     color: 'text-blue-600 dark:text-blue-400',     iconBg: 'bg-blue-50 dark:bg-blue-900/20',     border: 'border-l-blue-400' },
          { label: 'Shipped',    value: stats.shipped,    Icon: TruckIcon,         color: 'text-purple-600 dark:text-purple-400', iconBg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-l-purple-400' },
          { label: 'Delivered',  value: stats.delivered,  Icon: CheckCircleIcon,   color: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-l-emerald-400' },
        ] as const).map(({ label, value, Icon, color, iconBg, border }) => (
          <div key={label} className={`bg-white dark:bg-dark-800 rounded-xl border border-dark-100 dark:border-dark-700 border-l-4 ${border} px-5 py-4 flex items-center gap-4`}>
            <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold leading-none ${color}`}>{value}</p>
              <p className="text-xs text-dark-500 dark:text-dark-400 font-medium mt-1">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main table card */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-100 dark:border-dark-700 overflow-hidden">

        {/* Filter bar */}
        <div className="px-5 py-4 border-b border-dark-100 dark:border-dark-700 bg-dark-50/40 dark:bg-dark-700/20">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by order # or customer name…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="w-full pl-9 pr-4 py-2 text-sm border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
              />
            </div>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1) }}
              className="px-3 py-2 text-sm border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={paymentStatus}
              onChange={(e) => { setPaymentStatus(e.target.value); setPage(1) }}
              className="px-3 py-2 text-sm border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
            >
              <option value="">All Payments</option>
              <option value="pending">Unpaid</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Body */}
        {isLoading ? (
          <TableSkeleton />
        ) : orders.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-dark-100 dark:bg-dark-700 flex items-center justify-center mx-auto mb-4">
              <ShoppingBagIcon className="w-8 h-8 text-dark-400 dark:text-dark-500" />
            </div>
            <p className="text-dark-700 dark:text-dark-300 font-semibold">No orders found</p>
            <p className="text-sm text-dark-400 dark:text-dark-500 mt-1">
              {search || status || paymentStatus
                ? 'Try adjusting your search or filters'
                : 'Orders will appear here when customers place them'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-100 dark:border-dark-700">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-dark-400 dark:text-dark-500 uppercase tracking-wider">Order</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-dark-400 dark:text-dark-500 uppercase tracking-wider">Customer</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-dark-400 dark:text-dark-500 uppercase tracking-wider">Status</th>
                    <th className="hidden md:table-cell text-left px-5 py-3 text-xs font-semibold text-dark-400 dark:text-dark-500 uppercase tracking-wider">Payment</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-dark-400 dark:text-dark-500 uppercase tracking-wider">Total</th>
                    <th className="hidden lg:table-cell text-left px-5 py-3 text-xs font-semibold text-dark-400 dark:text-dark-500 uppercase tracking-wider">Date</th>
                    <th className="w-12 px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-100 dark:divide-dark-700/60">
                  {orders.map((order) => (
                    <tr key={order.id} className="group hover:bg-dark-50/60 dark:hover:bg-dark-700/25 transition-colors">

                      {/* Order # */}
                      <td className="px-5 py-4">
                        <Link
                          to={`/admin/orders/${order.order_number}`}
                          className="text-sm font-semibold text-dark-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-mono tracking-tight"
                        >
                          #{order.order_number}
                        </Link>
                        <p className="text-xs text-dark-400 dark:text-dark-500 mt-0.5">
                          {order.items_count} {order.items_count === 1 ? 'item' : 'items'}
                        </p>
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <CustomerAvatar name={order.customer_name} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-dark-900 dark:text-white truncate leading-tight">
                              {order.customer_name}
                            </p>
                            <p className="text-xs text-dark-400 dark:text-dark-500 truncate leading-tight mt-0.5 hidden sm:block">
                              {order.customer_email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Order status */}
                      <td className="px-5 py-4">
                        <StatusBadge status={order.status} config={ORDER_STATUS} />
                      </td>

                      {/* Payment */}
                      <td className="hidden md:table-cell px-5 py-4">
                        <StatusBadge status={order.payment_status} config={PAYMENT_STATUS} />
                        {order.payment_method && (
                          <p className="text-xs text-dark-400 dark:text-dark-500 capitalize mt-1 leading-tight">
                            {order.payment_method.replace(/_/g, ' ')}
                          </p>
                        )}
                      </td>

                      {/* Total */}
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-dark-900 dark:text-white tabular-nums">
                          {formatPrice(order.total)}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="hidden lg:table-cell px-5 py-4 text-sm text-dark-400 dark:text-dark-500 tabular-nums whitespace-nowrap">
                        {formatDate(order.created_at)}
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4">
                        <Link
                          to={`/admin/orders/${order.order_number}`}
                          className="flex items-center justify-center w-8 h-8 rounded-lg text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all opacity-0 group-hover:opacity-100"
                          title="View order"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta && meta.last_page > 1 && (
              <div className="px-5 py-4 border-t border-dark-100 dark:border-dark-700 flex items-center justify-between gap-4">
                <p className="text-sm text-dark-400 dark:text-dark-500 whitespace-nowrap">
                  <span className="text-dark-700 dark:text-dark-300 font-medium">{from}–{to}</span>
                  {' '}of{' '}
                  <span className="text-dark-700 dark:text-dark-300 font-medium">{meta.total}</span>
                  {' '}orders
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-dark-200 dark:border-dark-600 text-dark-500 dark:text-dark-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>

                  {pageNumbers.map((n) => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        page === n
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'border border-dark-200 dark:border-dark-600 text-dark-600 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700'
                      }`}
                    >
                      {n}
                    </button>
                  ))}

                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === meta.last_page}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-dark-200 dark:border-dark-600 text-dark-500 dark:text-dark-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
