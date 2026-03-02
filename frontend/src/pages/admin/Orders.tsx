import { useState, useCallback, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import { getAllOrders, getOrderStats, updateOrderStatus } from '@/api/b2b'
import type { B2bOrder, B2bOrderStatus } from '@/types/b2b'
import type { OrderStats } from '@/api/b2b'
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
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowDownTrayIcon,
  BriefcaseIcon,
  XMarkIcon,
  UserGroupIcon,
  ArrowPathIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline'

// ─── Types ─────────────────────────────────────────────────────────────────────

type OrderView = 'b2c' | 'b2b'

interface B2cOrder {
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

interface PaginatedB2cOrders {
  data: B2cOrder[]
  meta: { current_page: number; last_page: number; total: number; per_page: number }
}

// ─── CSV export util ───────────────────────────────────────────────────────────

function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const content = [
    headers.map(esc).join(','),
    ...rows.map(row => row.map(esc).join(',')),
  ].join('\n')
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── Status configs ────────────────────────────────────────────────────────────

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

const B2B_STATUS: Record<string, { label: string; badge: string; dot: string }> = {
  pending:       { label: 'Pending',       badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200',    dot: 'bg-amber-500' },
  in_production: { label: 'In Production', badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',        dot: 'bg-blue-500' },
  ready:         { label: 'Ready',         badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200', dot: 'bg-emerald-500' },
  delivered:     { label: 'Delivered',     badge: 'bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-300',           dot: 'bg-dark-400' },
  cancelled:     { label: 'Cancelled',     badge: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',            dot: 'bg-red-500' },
}

// ─── Shared components ─────────────────────────────────────────────────────────

function StatusBadge({ status, config }: { status: string; config: Record<string, { dot: string; text: string; bg: string }> }) {
  const s = config[status] || { dot: 'bg-dark-400', text: 'text-dark-600 dark:text-dark-400', bg: 'bg-dark-100 dark:bg-dark-700 border border-dark-200/60 dark:border-dark-600/30' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
      {status.replace(/_/g, ' ')}
    </span>
  )
}

function B2bStatusBadge({ status }: { status: string }) {
  const cfg = B2B_STATUS[status] ?? B2B_STATUS.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} flex-shrink-0`} />
      {cfg.label}
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
      {initials || '?'}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="divide-y divide-dark-100 dark:divide-dark-700/60">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
          <div className="space-y-1.5 w-24"><div className="h-3.5 bg-dark-200 dark:bg-dark-600 rounded w-full" /><div className="h-3 bg-dark-100 dark:bg-dark-700 rounded w-2/3" /></div>
          <div className="flex items-center gap-2.5 flex-1"><div className="w-8 h-8 bg-dark-200 dark:bg-dark-600 rounded-full flex-shrink-0" /><div className="space-y-1.5"><div className="h-3.5 bg-dark-200 dark:bg-dark-600 rounded w-28" /><div className="h-3 bg-dark-100 dark:bg-dark-700 rounded w-36" /></div></div>
          <div className="h-6 w-20 bg-dark-200 dark:bg-dark-600 rounded-full" />
          <div className="h-6 w-16 bg-dark-200 dark:bg-dark-600 rounded-full hidden md:block" />
          <div className="h-3.5 w-20 bg-dark-200 dark:bg-dark-600 rounded" />
          <div className="h-3 w-24 bg-dark-100 dark:bg-dark-700 rounded hidden lg:block" />
        </div>
      ))}
    </div>
  )
}

// ─── B2B helpers ───────────────────────────────────────────────────────────────

function SalespersonStatsTable({ stats }: { stats: OrderStats['by_salesperson'] }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? stats : stats.slice(0, 5)
  return (
    <div className="bg-white dark:bg-dark-800 border border-dark-100 dark:border-dark-700 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-dark-100 dark:border-dark-700">
        <UserGroupIcon className="w-4 h-4 text-primary-500" />
        <h3 className="text-sm font-semibold text-dark-900 dark:text-white">Orders by Salesperson</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-dark-50 dark:bg-dark-900/50">
            <tr>
              {['Salesperson', 'Total', 'Pending', 'In Prod.', 'Ready', 'Delivered', 'Cancelled'].map(h => (
                <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-100 dark:divide-dark-700">
            {visible.map(row => (
              <tr key={row.id} className="hover:bg-dark-50 dark:hover:bg-dark-700/50 transition-colors">
                <td className="px-4 py-2.5 font-medium text-dark-900 dark:text-white whitespace-nowrap">{row.name}</td>
                <td className="px-4 py-2.5 font-bold text-dark-900 dark:text-white">{row.total}</td>
                <td className="px-4 py-2.5 text-amber-600 dark:text-amber-400">{row.pending}</td>
                <td className="px-4 py-2.5 text-blue-600 dark:text-blue-400">{row.in_production}</td>
                <td className="px-4 py-2.5 text-emerald-600 dark:text-emerald-400">{row.ready}</td>
                <td className="px-4 py-2.5 text-dark-500 dark:text-dark-400">{row.delivered}</td>
                <td className="px-4 py-2.5 text-red-500 dark:text-red-400">{row.cancelled}</td>
              </tr>
            ))}
            {stats.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-dark-400 dark:text-dark-500 text-sm">No data yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {stats.length > 5 && (
        <button
          onClick={() => setExpanded(v => !v)}
          className="w-full py-2 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:bg-dark-50 dark:hover:bg-dark-700/30 transition-colors border-t border-dark-100 dark:border-dark-700 flex items-center justify-center gap-1"
        >
          {expanded
            ? <><ChevronUpIcon className="w-3.5 h-3.5" />Show less</>
            : <><ChevronDownIcon className="w-3.5 h-3.5" />Show all {stats.length} salespersons</>}
        </button>
      )}
    </div>
  )
}

function B2bStatusUpdater({ order, onUpdated }: { order: B2bOrder; onUpdated: (o: B2bOrder) => void }) {
  const [saving, setSaving] = useState(false)
  const handleChange = async (newStatus: string) => {
    if (newStatus === order.status) return
    setSaving(true)
    try {
      const updated = await updateOrderStatus(order.id, { status: newStatus as B2bOrderStatus })
      onUpdated(updated)
    } catch { /* ignore */ } finally { setSaving(false) }
  }
  return (
    <div className="relative">
      <select
        value={order.status}
        onChange={e => handleChange(e.target.value)}
        disabled={saving}
        className="text-xs font-semibold border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white py-1.5 pl-2.5 pr-7 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer disabled:opacity-50"
      >
        {Object.entries(B2B_STATUS).map(([v, c]) => (
          <option key={v} value={v}>{c.label}</option>
        ))}
      </select>
      {saving && <span className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 border border-primary-500 border-t-transparent rounded-full animate-spin" />}
    </div>
  )
}

// ─── B2C Orders view ───────────────────────────────────────────────────────────

const B2C_STATUS_OPTS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'returned', label: 'Returned' },
  { value: 'refunded', label: 'Refunded' },
]

function B2cOrdersView() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [exporting, setExporting] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 350)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search])

  const params = {
    search: debouncedSearch || undefined,
    status: status || undefined,
    payment_status: paymentStatus || undefined,
    from: dateFrom || undefined,
    to: dateTo || undefined,
  }

  const { data: dashData } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => (await api.get('/api/admin/dashboard')).data.data,
    staleTime: 60_000,
  })

  const { data, isLoading } = useQuery<PaginatedB2cOrders>({
    queryKey: ['admin-orders', page, debouncedSearch, status, paymentStatus, dateFrom, dateTo],
    queryFn: async () => {
      const p = new URLSearchParams({ page: page.toString() })
      if (debouncedSearch) p.set('search', debouncedSearch)
      if (status) p.set('status', status)
      if (paymentStatus) p.set('payment_status', paymentStatus)
      if (dateFrom) p.set('from', dateFrom)
      if (dateTo) p.set('to', dateTo)
      return (await api.get(`/api/admin/orders?${p.toString()}`)).data.data
    },
  })

  const orders = data?.data || []
  const meta = data?.meta
  const perPage = meta?.per_page || 15
  const from = orders.length ? (page - 1) * perPage + 1 : 0
  const to = orders.length ? from + orders.length - 1 : 0

  const stats = {
    pending:    dashData?.orders?.pending    || 0,
    processing: dashData?.orders?.processing || 0,
    shipped:    dashData?.orders?.shipped    || 0,
    delivered:  dashData?.orders?.delivered  || 0,
  }

  const activeFilterCount = [status, paymentStatus, dateFrom, dateTo].filter(Boolean).length

  const handleExport = async () => {
    setExporting(true)
    try {
      const p = new URLSearchParams({ per_page: '5000', page: '1' })
      Object.entries(params).forEach(([k, v]) => v && p.set(k, v))
      const res = await api.get(`/api/admin/orders?${p.toString()}`)
      const allOrders: B2cOrder[] = res.data.data.data || []
      downloadCSV(`b2c-orders-${new Date().toISOString().slice(0, 10)}.csv`,
        ['Order #', 'Customer', 'Email', 'Status', 'Payment Status', 'Payment Method', 'Total (Rs)', 'Items', 'Date'],
        allOrders.map(o => [o.order_number, o.customer_name, o.customer_email, o.status, o.payment_status, o.payment_method, o.total, o.items_count, formatDate(o.created_at)])
      )
    } finally { setExporting(false) }
  }

  const clearFilters = () => { setStatus(''); setPaymentStatus(''); setDateFrom(''); setDateTo(''); setPage(1) }

  // Page numbers
  const pageNumbers: number[] = []
  if (meta && meta.last_page > 1) {
    const total = meta.last_page, cur = page
    if (total <= 7) for (let i = 1; i <= total; i++) pageNumbers.push(i)
    else if (cur <= 4) for (let i = 1; i <= 7; i++) pageNumbers.push(i)
    else if (cur >= total - 3) for (let i = total - 6; i <= total; i++) pageNumbers.push(i)
    else for (let i = cur - 3; i <= cur + 3; i++) pageNumbers.push(i)
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {([
          { label: 'Pending',    value: stats.pending,    Icon: ClockIcon,       color: 'text-amber-600 dark:text-amber-400',   iconBg: 'bg-amber-50 dark:bg-amber-900/20',    border: 'border-l-amber-400' },
          { label: 'Processing', value: stats.processing, Icon: Cog6ToothIcon,   color: 'text-blue-600 dark:text-blue-400',     iconBg: 'bg-blue-50 dark:bg-blue-900/20',      border: 'border-l-blue-400' },
          { label: 'Shipped',    value: stats.shipped,    Icon: TruckIcon,       color: 'text-purple-600 dark:text-purple-400', iconBg: 'bg-purple-50 dark:bg-purple-900/20',  border: 'border-l-purple-400' },
          { label: 'Delivered',  value: stats.delivered,  Icon: CheckCircleIcon, color: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-l-emerald-400' },
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

      {/* Table card */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-100 dark:border-dark-700 overflow-hidden">
        {/* Filter bar */}
        <div className="px-5 py-4 border-b border-dark-100 dark:border-dark-700 bg-dark-50/40 dark:bg-dark-700/20 space-y-3">
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-52">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by order # or customer…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
              />
            </div>
            {/* Status */}
            <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
              className="px-3 py-2 text-sm border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-colors">
              {B2C_STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {/* Payment */}
            <select value={paymentStatus} onChange={e => { setPaymentStatus(e.target.value); setPage(1) }}
              className="px-3 py-2 text-sm border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-colors">
              <option value="">All Payments</option>
              <option value="pending">Unpaid</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            {/* Date range */}
            <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }}
              className="px-3 py-2 text-sm border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-colors"
              title="From date" />
            <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1) }}
              className="px-3 py-2 text-sm border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-colors"
              title="To date" />
            {/* Actions */}
            <div className="flex items-center gap-2 ml-auto">
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-2 text-sm text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-white border border-dark-200 dark:border-dark-600 rounded-lg hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors">
                  <XMarkIcon className="w-4 h-4" /> Clear ({activeFilterCount})
                </button>
              )}
              <button onClick={handleExport} disabled={exporting}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 border border-primary-200 dark:border-primary-700/50 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors disabled:opacity-50">
                {exporting ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <ArrowDownTrayIcon className="w-4 h-4" />}
                Export CSV
              </button>
            </div>
          </div>
          {/* Summary line */}
          {meta && (
            <p className="text-xs text-dark-400 dark:text-dark-500">
              {meta.total.toLocaleString()} order{meta.total !== 1 ? 's' : ''}
              {activeFilterCount > 0 ? ' matching filters' : ' total'}
            </p>
          )}
        </div>

        {/* Body */}
        {isLoading ? <TableSkeleton /> : orders.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-dark-100 dark:bg-dark-700 flex items-center justify-center mx-auto mb-4">
              <ShoppingBagIcon className="w-8 h-8 text-dark-400 dark:text-dark-500" />
            </div>
            <p className="text-dark-700 dark:text-dark-300 font-semibold">No orders found</p>
            <p className="text-sm text-dark-400 dark:text-dark-500 mt-1">
              {activeFilterCount > 0 || debouncedSearch ? 'Try adjusting your search or filters' : 'Orders will appear here when customers place them'}
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
                  {orders.map(order => (
                    <tr key={order.id} className="group hover:bg-dark-50/60 dark:hover:bg-dark-700/25 transition-colors">
                      <td className="px-5 py-4">
                        <Link to={`/admin/orders/${order.order_number}`}
                          className="text-sm font-semibold text-dark-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-mono tracking-tight">
                          #{order.order_number}
                        </Link>
                        <p className="text-xs text-dark-400 dark:text-dark-500 mt-0.5">{order.items_count} {order.items_count === 1 ? 'item' : 'items'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <CustomerAvatar name={order.customer_name} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-dark-900 dark:text-white truncate leading-tight">{order.customer_name}</p>
                            <p className="text-xs text-dark-400 dark:text-dark-500 truncate leading-tight mt-0.5 hidden sm:block">{order.customer_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4"><StatusBadge status={order.status} config={ORDER_STATUS} /></td>
                      <td className="hidden md:table-cell px-5 py-4">
                        <StatusBadge status={order.payment_status} config={PAYMENT_STATUS} />
                        {order.payment_method && <p className="text-xs text-dark-400 dark:text-dark-500 capitalize mt-1 leading-tight">{order.payment_method.replace(/_/g, ' ')}</p>}
                      </td>
                      <td className="px-5 py-4"><span className="text-sm font-semibold text-dark-900 dark:text-white tabular-nums">{formatPrice(order.total)}</span></td>
                      <td className="hidden lg:table-cell px-5 py-4 text-sm text-dark-400 dark:text-dark-500 tabular-nums whitespace-nowrap">{formatDate(order.created_at)}</td>
                      <td className="px-5 py-4">
                        <Link to={`/admin/orders/${order.order_number}`}
                          className="flex items-center justify-center w-8 h-8 rounded-lg text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all opacity-0 group-hover:opacity-100"
                          title="View order">
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
                  <span className="text-dark-700 dark:text-dark-300 font-medium">{from}–{to}</span> of <span className="text-dark-700 dark:text-dark-300 font-medium">{meta.total}</span> orders
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(page - 1)} disabled={page === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-dark-200 dark:border-dark-600 text-dark-500 dark:text-dark-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors">
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>
                  {pageNumbers.map(n => (
                    <button key={n} onClick={() => setPage(n)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${page === n ? 'bg-primary-500 text-white shadow-sm' : 'border border-dark-200 dark:border-dark-600 text-dark-600 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700'}`}>
                      {n}
                    </button>
                  ))}
                  <button onClick={() => setPage(page + 1)} disabled={page === meta.last_page}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-dark-200 dark:border-dark-600 text-dark-500 dark:text-dark-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors">
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

// ─── B2B Orders view ───────────────────────────────────────────────────────────

type B2bFilterState = {
  search: string
  status: string
  salesperson_id: string
  city: string
  brand_name: string
  date_from: string
  date_to: string
}

const EMPTY_B2B_FILTERS: B2bFilterState = {
  search: '', status: '', salesperson_id: '', city: '', brand_name: '', date_from: '', date_to: '',
}

function B2bOrdersView() {
  const [filters, setFilters] = useState<B2bFilterState>(EMPTY_B2B_FILTERS)
  const [page, setPage] = useState(1)
  const [exporting, setExporting] = useState(false)
  const [orders, setOrders] = useState<B2bOrder[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [expandedRows, setExpandedRows] = useState<number[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const { data: statsData, refetch: refetchStats } = useQuery<OrderStats>({
    queryKey: ['admin-b2b-stats'],
    queryFn: getOrderStats,
    staleTime: 30_000,
  })

  const loadOrders = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const result = await getAllOrders({
        search: debouncedSearch || undefined,
        status: filters.status || undefined,
        salesperson_id: filters.salesperson_id ? Number(filters.salesperson_id) : undefined,
        city: filters.city || undefined,
        brand_name: filters.brand_name || undefined,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined,
        page: p,
      })
      setOrders(result.data)
      setCurrentPage(result.current_page)
      setLastPage(result.last_page)
      setTotal(result.total)
    } catch { /* ignore */ } finally { setLoading(false) }
  }, [debouncedSearch, filters.status, filters.salesperson_id, filters.city, filters.brand_name, filters.date_from, filters.date_to])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (filters.search !== debouncedSearch) {
      debounceRef.current = setTimeout(() => { setDebouncedSearch(filters.search); setPage(1) }, 350)
    } else {
      loadOrders(page)
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [filters, page, debouncedSearch, loadOrders])

  const setFilter = (key: keyof B2bFilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    if (key !== 'search') setPage(1)
  }

  const clearFilters = () => { setFilters(EMPTY_B2B_FILTERS); setDebouncedSearch(''); setPage(1) }

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  const handleStatusUpdate = (updated: B2bOrder) => {
    setOrders(prev => prev.map(o => o.id === updated.id ? updated : o))
    refetchStats()
  }

  const toggleRow = (id: number) => setExpandedRows(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const handleExport = async () => {
    setExporting(true)
    try {
      const result = await getAllOrders({
        search: debouncedSearch || undefined,
        status: filters.status || undefined,
        salesperson_id: filters.salesperson_id ? Number(filters.salesperson_id) : undefined,
        city: filters.city || undefined,
        brand_name: filters.brand_name || undefined,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined,
        per_page: 5000,
        page: 1,
      })
      downloadCSV(`b2b-orders-${new Date().toISOString().slice(0, 10)}.csv`,
        ['Order #', 'Salesperson', 'Dealer', 'City', 'Brand', 'Status', 'Items', 'Date', 'Remarks'],
        result.data.map(o => [
          o.order_number,
          o.salesperson?.full_name ?? '',
          o.dealer_name,
          o.city,
          o.brand_name,
          o.status,
          o.items?.length ?? 0,
          formatDate(o.created_at),
          o.remarks || '',
        ])
      )
    } finally { setExporting(false) }
  }

  const stats = statsData?.totals
  const byPerson = statsData?.by_salesperson || []
  const salespersons = statsData?.salespersons || []

  // Page numbers
  const pageNumbers: number[] = []
  if (lastPage > 1) {
    if (lastPage <= 7) for (let i = 1; i <= lastPage; i++) pageNumbers.push(i)
    else if (currentPage <= 4) for (let i = 1; i <= 7; i++) pageNumbers.push(i)
    else if (currentPage >= lastPage - 3) for (let i = lastPage - 6; i <= lastPage; i++) pageNumbers.push(i)
    else for (let i = currentPage - 3; i <= currentPage + 3; i++) pageNumbers.push(i)
  }

  return (
    <div className="space-y-5">
      {/* KPI strip */}
      {stats && (
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total',         value: stats.total,         color: 'text-dark-900 dark:text-white',            border: 'border-l-dark-400' },
            { label: 'Pending',       value: stats.pending,       color: 'text-amber-600 dark:text-amber-400',       border: 'border-l-amber-400' },
            { label: 'In Production', value: stats.in_production, color: 'text-blue-600 dark:text-blue-400',         border: 'border-l-blue-400' },
            { label: 'Ready',         value: stats.ready,         color: 'text-emerald-600 dark:text-emerald-400',   border: 'border-l-emerald-400' },
            { label: 'Delivered',     value: stats.delivered,     color: 'text-dark-500 dark:text-dark-400',         border: 'border-l-dark-300' },
            { label: 'Cancelled',     value: stats.cancelled,     color: 'text-red-600 dark:text-red-400',           border: 'border-l-red-400' },
          ].map(({ label, value, color, border }) => (
            <div key={label} className={`bg-white dark:bg-dark-800 rounded-xl border border-dark-100 dark:border-dark-700 border-l-4 ${border} px-4 py-3`}>
              <p className="text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wide truncate">{label}</p>
              <p className={`text-2xl font-bold mt-0.5 ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Salesperson breakdown */}
      {byPerson.length > 0 && <SalespersonStatsTable stats={byPerson} />}

      {/* Orders table */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-100 dark:border-dark-700 overflow-hidden">
        {/* Filter bar */}
        <div className="px-5 py-4 border-b border-dark-100 dark:border-dark-700 bg-dark-50/40 dark:bg-dark-700/20 space-y-3">
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-52">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
              <input type="text" placeholder="Search order # or dealer…" value={filters.search}
                onChange={e => setFilter('search', e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors" />
            </div>
            {/* Status */}
            <select value={filters.status} onChange={e => setFilter('status', e.target.value)}
              className="px-3 py-2 text-sm border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-colors">
              <option value="">All Statuses</option>
              {Object.entries(B2B_STATUS).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
            </select>
            {/* Salesperson */}
            <select value={filters.salesperson_id} onChange={e => setFilter('salesperson_id', e.target.value)}
              className="px-3 py-2 text-sm border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-colors">
              <option value="">All Salespersons</option>
              {salespersons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {/* Brand */}
            <select value={filters.brand_name} onChange={e => setFilter('brand_name', e.target.value)}
              className="px-3 py-2 text-sm border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-colors">
              <option value="">All Brands</option>
              <option value="Fischer">Fischer</option>
              <option value="OEM">OEM</option>
              <option value="ODM">ODM</option>
            </select>
            {/* City */}
            <input type="text" placeholder="Filter by city…" value={filters.city}
              onChange={e => setFilter('city', e.target.value)}
              className="px-3 py-2 text-sm border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-colors w-36" />
            {/* Date range */}
            <input type="date" value={filters.date_from} onChange={e => setFilter('date_from', e.target.value)}
              title="From date"
              className="px-3 py-2 text-sm border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-colors" />
            <input type="date" value={filters.date_to} onChange={e => setFilter('date_to', e.target.value)}
              title="To date"
              className="px-3 py-2 text-sm border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-colors" />
            {/* Actions */}
            <div className="flex items-center gap-2 ml-auto">
              {activeFilterCount > 0 && (
                <button onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-white border border-dark-200 dark:border-dark-600 rounded-lg hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors">
                  <XMarkIcon className="w-4 h-4" /> Clear ({activeFilterCount})
                </button>
              )}
              <button onClick={handleExport} disabled={exporting}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 border border-primary-200 dark:border-primary-700/50 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors disabled:opacity-50">
                {exporting ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <ArrowDownTrayIcon className="w-4 h-4" />}
                Export CSV
              </button>
            </div>
          </div>
          {total > 0 && (
            <p className="text-xs text-dark-400 dark:text-dark-500">
              {total.toLocaleString()} order{total !== 1 ? 's' : ''}{activeFilterCount > 0 ? ' matching filters' : ' total'}
            </p>
          )}
        </div>

        {/* Table */}
        {loading ? <TableSkeleton /> : orders.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-dark-100 dark:bg-dark-700 flex items-center justify-center mx-auto mb-4">
              <ClipboardDocumentListIcon className="w-8 h-8 text-dark-400 dark:text-dark-500" />
            </div>
            <p className="text-dark-700 dark:text-dark-300 font-semibold">No B2B orders found</p>
            <p className="text-sm text-dark-400 dark:text-dark-500 mt-1">
              {activeFilterCount > 0 ? 'Try adjusting your filters' : 'B2B orders will appear here when salespersons place them'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-100 dark:border-dark-700">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-dark-400 dark:text-dark-500 uppercase tracking-wider w-8" />
                    <th className="text-left px-5 py-3 text-xs font-semibold text-dark-400 dark:text-dark-500 uppercase tracking-wider">Order</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-dark-400 dark:text-dark-500 uppercase tracking-wider">Salesperson</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-dark-400 dark:text-dark-500 uppercase tracking-wider">Dealer / City</th>
                    <th className="hidden md:table-cell text-left px-5 py-3 text-xs font-semibold text-dark-400 dark:text-dark-500 uppercase tracking-wider">Brand</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-dark-400 dark:text-dark-500 uppercase tracking-wider">Status</th>
                    <th className="hidden lg:table-cell text-left px-5 py-3 text-xs font-semibold text-dark-400 dark:text-dark-500 uppercase tracking-wider">Date</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-dark-400 dark:text-dark-500 uppercase tracking-wider">Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-100 dark:divide-dark-700/60">
                  {orders.map(order => {
                    const isExpanded = expandedRows.includes(order.id)
                    return (
                      <>
                        <tr key={order.id} className="group hover:bg-dark-50/60 dark:hover:bg-dark-700/25 transition-colors">
                          <td className="px-3 py-4">
                            <button onClick={() => toggleRow(order.id)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-dark-400 hover:text-dark-700 dark:hover:text-white hover:bg-dark-100 dark:hover:bg-dark-600 transition-all">
                              {isExpanded ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                            </button>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-sm font-semibold text-dark-900 dark:text-white font-mono tracking-tight">#{order.order_number}</span>
                            <p className="text-xs text-dark-400 dark:text-dark-500 mt-0.5">{order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}</p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-sm font-medium text-dark-900 dark:text-white">{order.salesperson?.full_name ?? '—'}</p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-sm font-medium text-dark-900 dark:text-white truncate max-w-[140px]">{order.dealer_name}</p>
                            <p className="text-xs text-dark-400 dark:text-dark-500 mt-0.5">{order.city}</p>
                          </td>
                          <td className="hidden md:table-cell px-5 py-4">
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-300">{order.brand_name}</span>
                          </td>
                          <td className="px-5 py-4"><B2bStatusBadge status={order.status} /></td>
                          <td className="hidden lg:table-cell px-5 py-4 text-sm text-dark-400 dark:text-dark-500 whitespace-nowrap">{formatDate(order.created_at)}</td>
                          <td className="px-5 py-4"><B2bStatusUpdater order={order} onUpdated={handleStatusUpdate} /></td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${order.id}-expanded`} className="bg-dark-50/50 dark:bg-dark-900/30">
                            <td colSpan={8} className="px-8 py-4">
                              <div className="space-y-2">
                                {order.remarks && <p className="text-xs text-dark-500 dark:text-dark-400 italic mb-2">"{order.remarks}"</p>}
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr>
                                      {['SKU', 'Product', 'Qty', 'Notes'].map(h => (
                                        <th key={h} className="text-left text-xs font-semibold text-dark-400 dark:text-dark-500 pb-1.5 pr-4 uppercase tracking-wide">{h}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-dark-100 dark:divide-dark-700">
                                    {(order.items ?? []).map(item => (
                                      <tr key={item.id}>
                                        <td className="py-1.5 pr-4 font-mono text-xs text-dark-500 dark:text-dark-400 whitespace-nowrap">{item.sku || '—'}</td>
                                        <td className="py-1.5 pr-4 font-medium text-dark-900 dark:text-white">{item.product_name}</td>
                                        <td className="py-1.5 pr-4 font-bold text-dark-900 dark:text-white w-12">{item.quantity}</td>
                                        <td className="py-1.5 text-dark-400 dark:text-dark-500 text-xs">{item.notes || '—'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
              <div className="px-5 py-4 border-t border-dark-100 dark:border-dark-700 flex items-center justify-between gap-4">
                <p className="text-sm text-dark-400 dark:text-dark-500 whitespace-nowrap">
                  Page <span className="text-dark-700 dark:text-dark-300 font-medium">{currentPage}</span> of <span className="text-dark-700 dark:text-dark-300 font-medium">{lastPage}</span>
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-dark-200 dark:border-dark-600 text-dark-500 dark:text-dark-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors">
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>
                  {pageNumbers.map(n => (
                    <button key={n} onClick={() => setPage(n)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === n ? 'bg-primary-500 text-white shadow-sm' : 'border border-dark-200 dark:border-dark-600 text-dark-600 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700'}`}>
                      {n}
                    </button>
                  ))}
                  <button onClick={() => setPage(currentPage + 1)} disabled={currentPage === lastPage}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-dark-200 dark:border-dark-600 text-dark-500 dark:text-dark-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors">
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

// ─── Main component ────────────────────────────────────────────────────────────

export default function AdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams()
  const view = (searchParams.get('view') || 'b2c') as OrderView

  const setView = (v: OrderView) => setSearchParams({ view: v }, { replace: true })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Orders</h1>
          <p className="mt-0.5 text-sm text-dark-500 dark:text-dark-400">
            {view === 'b2c' ? 'Customer (B2C) orders — website & checkout' : 'B2B sales orders — field team placements'}
          </p>
        </div>

        {/* View switcher */}
        <div className="flex items-center gap-1 p-1 bg-dark-100 dark:bg-dark-700 rounded-xl border border-dark-200 dark:border-dark-600">
          <button
            onClick={() => setView('b2c')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              view === 'b2c'
                ? 'bg-white dark:bg-dark-800 text-dark-900 dark:text-white shadow-sm'
                : 'text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200'
            }`}
          >
            <ShoppingBagIcon className="w-4 h-4" />
            B2C Orders
          </button>
          <button
            onClick={() => setView('b2b')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              view === 'b2b'
                ? 'bg-white dark:bg-dark-800 text-dark-900 dark:text-white shadow-sm'
                : 'text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200'
            }`}
          >
            <BriefcaseIcon className="w-4 h-4" />
            B2B Sales
          </button>
        </div>
      </div>

      {view === 'b2c' ? <B2cOrdersView /> : <B2bOrdersView />}
    </div>
  )
}
