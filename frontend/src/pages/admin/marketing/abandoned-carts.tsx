import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ShoppingCartIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  EnvelopeIcon,
  InboxIcon,
} from '@heroicons/react/24/outline'
import api from '@/lib/api'
import { formatPrice } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CartItem {
  name: string
  quantity: number
  price: number
}

interface AbandonedCart {
  id: number
  email: string
  cart_data: CartItem[]
  cart_total: number
  last_activity_at: string
  reminder_sent: boolean
  reminder_sent_at: string | null
  is_recovered: boolean
  created_at: string
}

interface Summary {
  total: number
  recovered: number
  reminders_sent: number
  total_value: number
  recovered_value: number
  lost_value: number
  avg_cart_value: number
  recovery_rate: number
}

interface AbandonedCartsResponse {
  summary: Summary
  data: AbandonedCart[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString()
}

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-dark-200 dark:bg-dark-700 rounded w-3/4" />
        </td>
      ))}
    </tr>
  )
}

function SkeletonKPI() {
  return (
    <div className="bg-white dark:bg-dark-800 rounded-2xl border border-dark-200 dark:border-dark-700 shadow-sm p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-dark-200 dark:bg-dark-700" />
        <div className="h-3 w-20 bg-dark-200 dark:bg-dark-700 rounded" />
      </div>
      <div className="h-7 w-24 bg-dark-200 dark:bg-dark-700 rounded" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tooltip
// ---------------------------------------------------------------------------

function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <span className="relative group/tip">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 text-xs text-white bg-dark-900 dark:bg-dark-600 rounded-lg whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity z-50 shadow-lg">
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-dark-900 dark:border-t-dark-600" />
      </span>
    </span>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function AbandonedCarts() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [recoveryFilter, setRecoveryFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [minCartValue, setMinCartValue] = useState('')

  const { data, isLoading } = useQuery<AbandonedCartsResponse>({
    queryKey: ['abandoned-carts', page, recoveryFilter, dateFrom, dateTo, minCartValue],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      if (recoveryFilter !== 'all') params.set('recovered', recoveryFilter === 'recovered' ? '1' : '0')
      if (dateFrom) params.set('from', dateFrom)
      if (dateTo) params.set('to', dateTo)
      if (minCartValue) params.set('min_cart_value', minCartValue)
      const res = await api.get(`/api/admin/marketing/abandoned-carts?${params.toString()}`)
      return res.data
    },
  })

  const resendMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.post(`/api/admin/marketing/abandoned-carts/${id}/resend`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['abandoned-carts'] })
    },
  })

  const summary = data?.summary
  const carts = data?.data || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Abandoned Carts</h1>
        <p className="text-dark-500 dark:text-dark-400 text-sm mt-1">
          Track abandoned shopping carts and send recovery reminders.
        </p>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonKPI key={i} />)}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Abandoned */}
          <div className="bg-white dark:bg-dark-800 rounded-2xl border border-dark-200 dark:border-dark-700 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                <ShoppingCartIcon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <span className="text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wide">Total Abandoned</span>
            </div>
            <p className="text-2xl font-bold text-dark-900 dark:text-white">{summary.total.toLocaleString()}</p>
            <p className="text-xs text-dark-400 dark:text-dark-500 mt-1">
              {formatPrice(summary.total_value)} total value
            </p>
          </div>

          {/* Recovered */}
          <div className="bg-white dark:bg-dark-800 rounded-2xl border border-dark-200 dark:border-dark-700 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <ArrowPathIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wide">Recovered</span>
            </div>
            <p className="text-2xl font-bold text-dark-900 dark:text-white">{summary.recovered.toLocaleString()}</p>
            <p className="text-xs text-dark-400 dark:text-dark-500 mt-1">
              {formatPrice(summary.recovered_value)} recovered
            </p>
          </div>

          {/* Recovery Rate */}
          <div className="bg-white dark:bg-dark-800 rounded-2xl border border-dark-200 dark:border-dark-700 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <ChartBarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wide">Recovery Rate</span>
            </div>
            <p className="text-2xl font-bold text-dark-900 dark:text-white">{summary.recovery_rate}%</p>
            <div className="mt-2">
              <div className="w-full h-2 bg-dark-100 dark:bg-dark-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(summary.recovery_rate, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Lost Revenue */}
          <div className="bg-white dark:bg-dark-800 rounded-2xl border border-dark-200 dark:border-dark-700 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <CurrencyDollarIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wide">Lost Revenue</span>
            </div>
            <p className="text-2xl font-bold text-dark-900 dark:text-white">{formatPrice(summary.lost_value)}</p>
            <p className="text-xs text-dark-400 dark:text-dark-500 mt-1">
              Avg cart: {formatPrice(summary.avg_cart_value)}
            </p>
          </div>
        </div>
      ) : null}

      {/* Filter bar */}
      <div className="bg-white dark:bg-dark-800 rounded-2xl border border-dark-200 dark:border-dark-700 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={recoveryFilter}
            onChange={(e) => { setRecoveryFilter(e.target.value); setPage(1) }}
            className="px-3 py-2 text-sm border border-dark-200 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-900 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Carts</option>
            <option value="recovered">Recovered</option>
            <option value="not_recovered">Not Recovered</option>
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
            placeholder="From"
            className="px-3 py-2 text-sm border border-dark-200 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-900 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
            placeholder="To"
            className="px-3 py-2 text-sm border border-dark-200 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-900 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="number"
            value={minCartValue}
            onChange={(e) => { setMinCartValue(e.target.value); setPage(1) }}
            placeholder="Min cart value"
            className="px-3 py-2 text-sm border border-dark-200 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-900 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 w-40"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-dark-800 rounded-2xl border border-dark-200 dark:border-dark-700 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-50 dark:bg-dark-900">
                <tr>
                  {['Email', 'Cart Total', 'Items', 'Last Activity', 'Reminder', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-200 dark:divide-dark-700">
                {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
              </tbody>
            </table>
          </div>
        ) : carts.length === 0 ? (
          <div className="p-12 text-center">
            <InboxIcon className="w-12 h-12 text-dark-300 dark:text-dark-600 mx-auto mb-3" />
            <p className="text-dark-500 dark:text-dark-400 font-medium">No abandoned carts found</p>
            <p className="text-sm text-dark-400 dark:text-dark-500 mt-1">
              Abandoned carts will appear here when customers leave without completing checkout.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-50 dark:bg-dark-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wide">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wide">Cart Total</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wide">Items</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wide">Last Activity</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wide">Reminder</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-200 dark:divide-dark-700">
                  {carts.map((cart) => {
                    const itemNames = cart.cart_data?.map(item => `${item.name} x${item.quantity}`).join(', ') || 'No items'
                    const itemCount = cart.cart_data?.reduce((sum, item) => sum + item.quantity, 0) || 0
                    const isSending = resendMutation.isPending && resendMutation.variables === cart.id

                    return (
                      <tr key={cart.id} className="hover:bg-dark-50 dark:hover:bg-dark-900/50 transition-colors">
                        {/* Email */}
                        <td className="px-4 py-3 text-sm text-dark-700 dark:text-dark-300">
                          <Tooltip text={cart.email}>
                            <span className="block max-w-[180px] truncate">{cart.email}</span>
                          </Tooltip>
                        </td>

                        {/* Cart Total */}
                        <td className="px-4 py-3 text-sm font-medium text-dark-900 dark:text-white">
                          {formatPrice(cart.cart_total)}
                        </td>

                        {/* Items */}
                        <td className="px-4 py-3 text-sm text-dark-700 dark:text-dark-300">
                          <Tooltip text={itemNames}>
                            <span className="cursor-default">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                          </Tooltip>
                        </td>

                        {/* Last Activity */}
                        <td className="px-4 py-3 text-sm text-dark-500 dark:text-dark-400">
                          {timeAgo(cart.last_activity_at)}
                        </td>

                        {/* Reminder Status */}
                        <td className="px-4 py-3">
                          {cart.reminder_sent ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                              <EnvelopeIcon className="w-3 h-3" />
                              Sent
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-dark-100 dark:bg-dark-700 text-dark-500 dark:text-dark-400">
                              Not sent
                            </span>
                          )}
                        </td>

                        {/* Recovery Status */}
                        <td className="px-4 py-3">
                          {cart.is_recovered ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                              Recovered
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
                              Abandoned
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => resendMutation.mutate(cart.id)}
                            disabled={cart.reminder_sent || isSending}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
                              bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400
                              hover:bg-primary-100 dark:hover:bg-primary-900/40
                              disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSending ? (
                              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                            ) : (
                              <EnvelopeIcon className="w-3.5 h-3.5" />
                            )}
                            {isSending ? 'Sending...' : 'Send Reminder'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data && data.last_page > 1 && (
              <div className="p-4 border-t border-dark-200 dark:border-dark-700 flex items-center justify-between">
                <p className="text-sm text-dark-500 dark:text-dark-400">
                  Showing {((page - 1) * data.per_page) + 1} to {Math.min(page * data.per_page, data.total)} of {data.total} carts
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1.5 border border-dark-200 dark:border-dark-600 rounded-lg text-sm text-dark-700 dark:text-dark-300 disabled:opacity-50 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-dark-500 dark:text-dark-400">
                    {page} / {data.last_page}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === data.last_page}
                    className="px-3 py-1.5 border border-dark-200 dark:border-dark-600 rounded-lg text-sm text-dark-700 dark:text-dark-300 disabled:opacity-50 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
                  >
                    Next
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
