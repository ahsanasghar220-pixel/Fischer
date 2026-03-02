import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import {
  MagnifyingGlassIcon,
  InboxIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  FunnelIcon,
  XMarkIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import { useQuery } from '@tanstack/react-query'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Complaint {
  id: number
  complaint_number: string
  complainant_name: string
  complainant_phone: string
  complainant_type: 'online_customer' | 'offline_customer' | 'dealer'
  complainant_city: string
  complaint_category: string
  product_name: string | null
  sku: string | null
  status: string
  filed_by: { id: number; full_name: string } | null
  assigned_to: { id: number; full_name: string } | null
  created_at: string
}

interface PaginatedComplaints {
  data: Complaint[]
  meta: {
    current_page: number
    last_page: number
    total: number
    per_page: number
  }
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; badge: string; dot: string }> = {
  open:        { label: 'Open',        badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 ring-1 ring-red-200 dark:ring-red-800',       dot: 'bg-red-500' },
  assigned:    { label: 'Assigned',    badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 ring-1 ring-orange-200 dark:ring-orange-800', dot: 'bg-orange-500' },
  in_progress: { label: 'In Progress', badge: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 ring-1 ring-yellow-200 dark:ring-yellow-800', dot: 'bg-yellow-500' },
  resolved:    { label: 'Resolved',    badge: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 ring-1 ring-green-200 dark:ring-green-800', dot: 'bg-green-500' },
  closed:      { label: 'Closed',      badge: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 ring-1 ring-gray-200 dark:ring-gray-600',    dot: 'bg-gray-400' },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.open
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} flex-shrink-0`} />
      {cfg.label}
    </span>
  )
}

// ─── Category helpers ─────────────────────────────────────────────────────────

const CATEGORY_BADGE: Record<string, string> = {
  defect:       'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  delivery:     'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  missing_item: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
  installation: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400',
  warranty:     'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
  other:        'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
}

function CategoryBadge({ category }: { category: string }) {
  const cls = CATEGORY_BADGE[category] ?? CATEGORY_BADGE.other
  const label = category?.replace(/_/g, ' ') || '—'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium capitalize ${cls}`}>
      {label}
    </span>
  )
}

// ─── Complainant type badge ───────────────────────────────────────────────────

function TypeBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    online_customer:  { label: 'Online',  cls: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
    offline_customer: { label: 'Offline', cls: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' },
    dealer:           { label: 'Dealer',  cls: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' },
  }
  const entry = map[type] ?? { label: type, cls: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${entry.cls}`}>
      {entry.label}
    </span>
  )
}

// ─── Date helper ──────────────────────────────────────────────────────────────

function formatDate(dt: string) {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Filter options ───────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'defect', label: 'Defect' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'missing_item', label: 'Missing Item' },
  { value: 'installation', label: 'Installation' },
  { value: 'warranty', label: 'Warranty' },
  { value: 'other', label: 'Other' },
]

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'online_customer', label: 'Online Customer' },
  { value: 'offline_customer', label: 'Offline Customer' },
  { value: 'dealer', label: 'Dealer' },
]

// ─── Table skeleton ───────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
          <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-36 bg-gray-100 dark:bg-gray-700/80 rounded flex-1" />
          <div className="h-4 w-24 bg-gray-100 dark:bg-gray-700/80 rounded" />
          <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ComplaintsList() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)

  const resetFilters = () => {
    setSearch('')
    setStatusFilter('')
    setCategoryFilter('')
    setTypeFilter('')
    setPage(1)
  }

  const hasFilters = !!(search || statusFilter || categoryFilter || typeFilter)

  const { data, isLoading, error, refetch, isFetching } = useQuery<PaginatedComplaints>({
    queryKey: ['complaints', page, search, statusFilter, categoryFilter, typeFilter],
    queryFn: async () => {
      const res = await api.get('/api/complaints', {
        params: {
          page,
          search: search || undefined,
          status: statusFilter || undefined,
          category: categoryFilter || undefined,
          complainant_type: typeFilter || undefined,
        },
      })
      // Backend returns { success, data: array, meta, links }
      return { data: res.data.data, meta: res.data.meta }
    },
  })

  const complaints = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="min-h-screen space-y-5 pb-10">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Complaints</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {meta?.total != null
              ? `${meta.total} total complaint${meta.total !== 1 ? 's' : ''}`
              : 'Manage and resolve customer complaints'}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm transition-colors disabled:opacity-50"
        >
          <ArrowPathIcon className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ── Filter Bar ──────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <FunnelIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters</span>
          {hasFilters && (
            <button
              onClick={resetFilters}
              className="ml-auto inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors"
            >
              <XMarkIcon className="w-3.5 h-3.5" />
              Clear all
            </button>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search name, phone, reference…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-9 pr-9 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
            />
            {search && (
              <button
                onClick={() => { setSearch(''); setPage(1) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className="px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
            className="px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Type */}
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
            className="px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Error ───────────────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
          <XMarkIcon className="w-4 h-4 flex-shrink-0" />
          Failed to load complaints. Please refresh.
        </div>
      )}

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {isLoading ? (
          <TableSkeleton />
        ) : complaints.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
              <InboxIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-800 dark:text-gray-200 font-semibold">No complaints found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 max-w-xs mx-auto">
              {hasFilters ? 'Try adjusting your filters or search terms' : 'Complaints will appear here once filed'}
            </p>
            {hasFilters && (
              <button
                onClick={resetFilters}
                className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Complainant
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Filed By
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {complaints.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => navigate(`/admin/complaints/${c.id}`)}
                      className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors cursor-pointer group"
                    >
                      {/* Reference */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
                          {c.complaint_number}
                        </span>
                      </td>

                      {/* Complainant */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                            {c.complainant_name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{c.complainant_phone}</p>
                          <TypeBadge type={c.complainant_type} />
                        </div>
                      </td>

                      {/* Product */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 dark:text-white max-w-[160px] truncate">
                          {c.product_name || <span className="text-gray-400 dark:text-gray-500">—</span>}
                        </p>
                        {c.sku && (
                          <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-0.5">
                            {c.sku}
                          </p>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <CategoryBadge category={c.complaint_category} />
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={c.status} />
                      </td>

                      {/* Filed by */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {c.filed_by?.full_name || '—'}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(c.created_at)}
                        </p>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/admin/complaints/${c.id}`)}
                          className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 text-gray-600 dark:text-gray-400 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors"
                        >
                          <EyeIcon className="w-3.5 h-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
              {complaints.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/admin/complaints/${c.id}`)}
                  className="w-full text-left px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                          {c.complaint_number}
                        </span>
                        <StatusBadge status={c.status} />
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {c.complainant_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{c.complainant_phone}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <CategoryBadge category={c.complaint_category} />
                        <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(c.created_at)}</span>
                      </div>
                      {c.product_name && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 truncate">
                          Product: {c.product_name}
                        </p>
                      )}
                    </div>
                    <EyeIcon className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-1" />
                  </div>
                </button>
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.last_page > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-4 bg-gray-50 dark:bg-gray-800/50">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Page{' '}
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{meta.current_page}</span>
                  {' '}of{' '}
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{meta.last_page}</span>
                  {' '}&middot; {meta.total} total
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="inline-flex items-center gap-1 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl px-3 py-2 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                    Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                    disabled={page === meta.last_page}
                    className="inline-flex items-center gap-1 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl px-3 py-2 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                  >
                    Next
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
