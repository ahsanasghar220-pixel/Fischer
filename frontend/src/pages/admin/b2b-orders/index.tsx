import { useState, useCallback, useEffect } from 'react'
import { getAllOrders, getOrderStats, updateOrderStatus } from '@/api/b2b'
import type { OrderStats } from '@/api/b2b'
import type { B2bOrder, B2bOrderStatus } from '@/types/b2b'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline'

// ─── Types ─────────────────────────────────────────────────────────────────────

type FilterState = {
  search: string
  status: string
  salesperson_id: string
  city: string
  brand_name: string
  date_from: string
  date_to: string
}

const EMPTY_FILTERS: FilterState = {
  search: '',
  status: '',
  salesperson_id: '',
  city: '',
  brand_name: '',
  date_from: '',
  date_to: '',
}

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; badge: string; dot: string }> = {
  pending:       { label: 'Pending',       badge: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200', dot: 'bg-yellow-500' },
  in_production: { label: 'In Production', badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',         dot: 'bg-blue-500' },
  ready:         { label: 'Ready',         badge: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',     dot: 'bg-green-500' },
  delivered:     { label: 'Delivered',     badge: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',           dot: 'bg-gray-400' },
  cancelled:     { label: 'Cancelled',     badge: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',            dot: 'bg-red-500' },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} flex-shrink-0`} />
      {cfg.label}
    </span>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Stat KPI card ─────────────────────────────────────────────────────────────

function KpiCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl p-4 flex flex-col gap-1">
      <p className="text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value.toLocaleString()}</p>
    </div>
  )
}

// ─── Salesperson stats table ───────────────────────────────────────────────────

function SalespersonStatsTable({ stats }: { stats: OrderStats['by_salesperson'] }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? stats : stats.slice(0, 5)

  return (
    <div className="bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-dark-200 dark:border-dark-700">
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
                <td className="px-4 py-2.5 text-yellow-600 dark:text-yellow-400">{row.pending}</td>
                <td className="px-4 py-2.5 text-blue-600 dark:text-blue-400">{row.in_production}</td>
                <td className="px-4 py-2.5 text-green-600 dark:text-green-400">{row.ready}</td>
                <td className="px-4 py-2.5 text-dark-500 dark:text-dark-400">{row.delivered}</td>
                <td className="px-4 py-2.5 text-red-500 dark:text-red-400">{row.cancelled}</td>
              </tr>
            ))}
            {stats.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-dark-400 dark:text-dark-500 text-sm">No data yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {stats.length > 5 && (
        <button
          onClick={() => setExpanded(v => !v)}
          className="w-full py-2 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:bg-dark-50 dark:hover:bg-dark-700/30 transition-colors border-t border-dark-100 dark:border-dark-700 flex items-center justify-center gap-1"
        >
          {expanded ? <><ChevronUpIcon className="w-3.5 h-3.5" />Show less</> : <><ChevronDownIcon className="w-3.5 h-3.5" />Show all {stats.length} salespersons</>}
        </button>
      )}
    </div>
  )
}

// ─── Inline status updater ─────────────────────────────────────────────────────

function StatusUpdater({ order, onUpdated }: { order: B2bOrder; onUpdated: (o: B2bOrder) => void }) {
  const [saving, setSaving] = useState(false)

  const handleChange = async (newStatus: string) => {
    if (newStatus === order.status) return
    setSaving(true)
    try {
      const updated = await updateOrderStatus(order.id, { status: newStatus as B2bOrderStatus })
      onUpdated(updated)
    } catch {
      /* ignore */
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="relative">
      <select
        value={order.status}
        onChange={e => handleChange(e.target.value)}
        disabled={saving}
        className="text-xs font-semibold border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white py-1.5 pl-2.5 pr-7 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer disabled:opacity-50"
      >
        {Object.entries(STATUS_CONFIG).map(([v, c]) => (
          <option key={v} value={v}>{c.label}</option>
        ))}
      </select>
      {saving && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 border border-primary-500 border-t-transparent rounded-full animate-spin" />
      )}
    </div>
  )
}

// ─── Order row ─────────────────────────────────────────────────────────────────

function OrderRow({ order, onUpdated }: { order: B2bOrder; onUpdated: (o: B2bOrder) => void }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <tr className="hover:bg-dark-50 dark:hover:bg-dark-700/30 transition-colors border-b border-dark-100 dark:border-dark-700">
        <td className="px-4 py-3">
          <button onClick={() => setExpanded(v => !v)} className="flex items-center gap-1.5 text-primary-600 dark:text-primary-400 font-mono text-sm font-semibold hover:underline">
            {expanded ? <ChevronUpIcon className="w-3.5 h-3.5" /> : <ChevronDownIcon className="w-3.5 h-3.5" />}
            {order.order_number}
          </button>
        </td>
        <td className="px-4 py-3 text-sm text-dark-700 dark:text-dark-300 whitespace-nowrap">
          {order.salesperson?.full_name ?? '—'}
        </td>
        <td className="px-4 py-3">
          <p className="text-sm font-medium text-dark-900 dark:text-white">{order.dealer_name}</p>
          <p className="text-xs text-dark-500 dark:text-dark-400">{order.city}</p>
        </td>
        <td className="px-4 py-3 text-xs text-dark-500 dark:text-dark-400 whitespace-nowrap">{order.brand_name}</td>
        <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
        <td className="px-4 py-3">
          <StatusUpdater order={order} onUpdated={onUpdated} />
        </td>
        <td className="px-4 py-3 text-xs text-dark-500 dark:text-dark-400 whitespace-nowrap text-center">
          {order.items?.length ?? 0}
        </td>
        <td className="px-4 py-3 text-xs text-dark-500 dark:text-dark-400 whitespace-nowrap">
          {formatDate(order.created_at)}
        </td>
      </tr>
      {expanded && order.items && order.items.length > 0 && (
        <tr className="bg-dark-50 dark:bg-dark-900/40">
          <td colSpan={8} className="px-8 py-3">
            <div className="rounded-xl border border-dark-200 dark:border-dark-700 overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-white dark:bg-dark-800">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-dark-600 dark:text-dark-300 uppercase tracking-wide">Product</th>
                    <th className="px-3 py-2 text-left font-semibold text-dark-600 dark:text-dark-300 uppercase tracking-wide">SKU</th>
                    <th className="px-3 py-2 text-left font-semibold text-dark-600 dark:text-dark-300 uppercase tracking-wide">Qty</th>
                    <th className="px-3 py-2 text-left font-semibold text-dark-600 dark:text-dark-300 uppercase tracking-wide">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-100 dark:divide-dark-700">
                  {order.items.map(item => (
                    <tr key={item.id}>
                      <td className="px-3 py-2 font-medium text-dark-900 dark:text-white">{item.product_name}</td>
                      <td className="px-3 py-2 font-mono text-dark-500 dark:text-dark-400">{item.sku}</td>
                      <td className="px-3 py-2 font-bold text-dark-900 dark:text-white">×{item.quantity}</td>
                      <td className="px-3 py-2 text-dark-500 dark:text-dark-400 italic">{item.notes ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {order.remarks && (
              <p className="mt-2 text-xs text-dark-500 dark:text-dark-400 italic">
                <span className="font-semibold not-italic text-dark-700 dark:text-dark-300">Remarks:</span> {order.remarks}
              </p>
            )}
          </td>
        </tr>
      )}
    </>
  )
}

// ─── Filter bar ────────────────────────────────────────────────────────────────

interface FilterBarProps {
  filters: FilterState
  salespersons: Array<{ id: number; name: string }>
  onChange: (f: FilterState) => void
  onClear: () => void
  loading: boolean
  onRefresh: () => void
}

function FilterBar({ filters, salespersons, onChange, onClear, loading, onRefresh }: FilterBarProps) {
  const set = (key: keyof FilterState, val: string) => onChange({ ...filters, [key]: val })
  const hasFilters = Object.values(filters).some(v => v !== '')

  return (
    <div className="bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl p-4 space-y-3">
      {/* Row 1: search + refresh */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={e => set('search', e.target.value)}
            placeholder="Search order # or dealer name…"
            className="w-full pl-9 pr-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-dark-50 dark:bg-dark-700 text-dark-900 dark:text-white text-sm placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg text-sm text-dark-600 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors disabled:opacity-50"
        >
          <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
        {hasFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg text-sm text-dark-500 dark:text-dark-400 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Row 2: dropdowns + date range */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <select
          value={filters.status}
          onChange={e => set('status', e.target.value)}
          className="col-span-1 px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-dark-50 dark:bg-dark-700 text-dark-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([v, c]) => (
            <option key={v} value={v}>{c.label}</option>
          ))}
        </select>

        <select
          value={filters.salesperson_id}
          onChange={e => set('salesperson_id', e.target.value)}
          className="col-span-1 px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-dark-50 dark:bg-dark-700 text-dark-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Salespersons</option>
          {salespersons.map(s => (
            <option key={s.id} value={String(s.id)}>{s.name}</option>
          ))}
        </select>

        <select
          value={filters.brand_name}
          onChange={e => set('brand_name', e.target.value)}
          className="col-span-1 px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-dark-50 dark:bg-dark-700 text-dark-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Brands</option>
          <option value="Fischer">Fischer</option>
          <option value="OEM">OEM</option>
          <option value="ODM">ODM</option>
        </select>

        <input
          type="text"
          value={filters.city}
          onChange={e => set('city', e.target.value)}
          placeholder="City…"
          className="col-span-1 px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-dark-50 dark:bg-dark-700 text-dark-900 dark:text-white text-sm placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />

        <input
          type="date"
          value={filters.date_from}
          onChange={e => set('date_from', e.target.value)}
          className="col-span-1 px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-dark-50 dark:bg-dark-700 text-dark-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />

        <input
          type="date"
          value={filters.date_to}
          onChange={e => set('date_to', e.target.value)}
          className="col-span-1 px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-dark-50 dark:bg-dark-700 text-dark-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(filters).filter(([, v]) => v).map(([k, v]) => (
            <span
              key={k}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs font-medium border border-primary-200 dark:border-primary-800"
            >
              <FunnelIcon className="w-3 h-3" />
              {k.replace(/_/g, ' ')}: {v}
              <button onClick={() => set(k as keyof FilterState, '')} className="ml-0.5 hover:text-primary-900 dark:hover:text-primary-100">
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function AdminB2BOrders() {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [debouncedFilters, setDebouncedFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [page, setPage] = useState(1)
  const [orders, setOrders] = useState<B2bOrder[]>([])
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  // Debounce search/city text inputs
  useEffect(() => {
    const t = setTimeout(() => setDebouncedFilters(filters), 400)
    return () => clearTimeout(t)
  }, [filters])

  const fetchOrders = useCallback(async (f: FilterState, p: number) => {
    setLoading(true)
    try {
      const params: Parameters<typeof getAllOrders>[0] = { page: p }
      if (f.search) params.search = f.search
      if (f.status) params.status = f.status
      if (f.salesperson_id) params.salesperson_id = Number(f.salesperson_id)
      if (f.brand_name) params.brand_name = f.brand_name
      if (f.city) params.city = f.city
      if (f.date_from) params.date_from = f.date_from
      if (f.date_to) params.date_to = f.date_to

      const result = await getAllOrders(params)
      setOrders(result.data)
      setPagination({ current_page: result.current_page, last_page: result.last_page, total: result.total })
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const s = await getOrderStats()
      setStats(s)
    } catch {
      setStats(null)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  useEffect(() => {
    setPage(1)
  }, [debouncedFilters])

  useEffect(() => {
    fetchOrders(debouncedFilters, page)
  }, [debouncedFilters, page, fetchOrders])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const handleOrderUpdated = useCallback((updated: B2bOrder) => {
    setOrders(prev => prev.map(o => o.id === updated.id ? updated : o))
    fetchStats()
  }, [fetchStats])

  const handleRefresh = useCallback(() => {
    fetchOrders(debouncedFilters, page)
    fetchStats()
  }, [debouncedFilters, page, fetchOrders, fetchStats])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardDocumentListIcon className="w-6 h-6 text-primary-500" />
          <div>
            <h1 className="text-xl font-bold text-dark-900 dark:text-white">B2B Orders</h1>
            <p className="text-sm text-dark-500 dark:text-dark-400">All sales team orders — full history and status management</p>
          </div>
        </div>
        {!statsLoading && stats && (
          <span className="text-sm font-semibold text-dark-500 dark:text-dark-400">
            {stats.totals.total.toLocaleString()} total orders
          </span>
        )}
      </div>

      {/* KPI strip */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard label="Total"         value={stats.totals.total}         color="text-dark-900 dark:text-white" />
          <KpiCard label="Pending"       value={stats.totals.pending}       color="text-yellow-600 dark:text-yellow-400" />
          <KpiCard label="In Production" value={stats.totals.in_production} color="text-blue-600 dark:text-blue-400" />
          <KpiCard label="Ready"         value={stats.totals.ready}         color="text-green-600 dark:text-green-400" />
          <KpiCard label="Delivered"     value={stats.totals.delivered}     color="text-dark-500 dark:text-dark-400" />
          <KpiCard label="Cancelled"     value={stats.totals.cancelled}     color="text-red-500 dark:text-red-400" />
        </div>
      )}
      {statsLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl p-4 h-16 animate-pulse">
              <div className="h-2.5 w-16 bg-dark-200 dark:bg-dark-700 rounded mb-2" />
              <div className="h-6 w-12 bg-dark-200 dark:bg-dark-700 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Salesperson breakdown */}
      {stats && stats.by_salesperson.length > 0 && (
        <SalespersonStatsTable stats={stats.by_salesperson} />
      )}

      {/* Filters */}
      <FilterBar
        filters={filters}
        salespersons={stats?.salespersons ?? []}
        onChange={f => setFilters(f)}
        onClear={() => setFilters(EMPTY_FILTERS)}
        loading={loading}
        onRefresh={handleRefresh}
      />

      {/* Orders table */}
      <div className="bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-dark-200 dark:border-dark-700">
          <p className="text-sm font-semibold text-dark-900 dark:text-white">
            {loading ? 'Loading…' : `${pagination.total.toLocaleString()} order${pagination.total !== 1 ? 's' : ''}`}
          </p>
          <p className="text-xs text-dark-400 dark:text-dark-500">Page {pagination.current_page} of {pagination.last_page}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-dark-50 dark:bg-dark-900/50">
              <tr>
                {['Order #', 'Salesperson', 'Dealer / City', 'Brand', 'Status', 'Change Status', 'Items', 'Date'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-dark-100 dark:border-dark-700">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-3.5 bg-dark-100 dark:bg-dark-700 rounded animate-pulse" style={{ width: `${60 + (j * 15) % 40}%` }} />
                    </td>
                  ))}
                </tr>
              ))}
              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <ClipboardDocumentListIcon className="mx-auto w-10 h-10 text-dark-300 dark:text-dark-600 mb-2" />
                    <p className="text-dark-500 dark:text-dark-400 font-medium">No orders found</p>
                    <p className="text-dark-400 dark:text-dark-500 text-xs mt-1">Try adjusting your filters</p>
                  </td>
                </tr>
              )}
              {!loading && orders.map(order => (
                <OrderRow key={order.id} order={order} onUpdated={handleOrderUpdated} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-dark-200 dark:border-dark-700">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={pagination.current_page <= 1 || loading}
              className="flex items-center gap-1 px-3 py-1.5 border border-dark-200 dark:border-dark-600 rounded-lg text-sm text-dark-600 dark:text-dark-300 disabled:opacity-40 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4" />Previous
            </button>
            <span className="text-sm text-dark-500 dark:text-dark-400">
              Page {pagination.current_page} of {pagination.last_page}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={pagination.current_page >= pagination.last_page || loading}
              className="flex items-center gap-1 px-3 py-1.5 border border-dark-200 dark:border-dark-600 rounded-lg text-sm text-dark-600 dark:text-dark-300 disabled:opacity-40 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
            >
              Next<ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
