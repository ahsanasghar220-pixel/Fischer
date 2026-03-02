import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import {
  MagnifyingGlassIcon,
  InboxIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'
import { useQuery } from '@tanstack/react-query'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Complaint {
  id: number
  reference_number: string
  complainant_name: string
  complainant_phone: string
  complainant_type: 'online_customer' | 'offline_customer' | 'dealer'
  product_name: string
  category: string
  status: string
  filed_by_name: string
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    open:        'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
    assigned:    'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
    in_progress: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
    resolved:    'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
    closed:      'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
  }
  return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.open}`
}

function complainantTypeLabel(type: string) {
  const map: Record<string, { label: string; cls: string }> = {
    online_customer:  { label: 'Online',  cls: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
    offline_customer: { label: 'Offline', cls: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
    dealer:           { label: 'Dealer',  cls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
  }
  const entry = map[type] ?? { label: type, cls: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${entry.cls}`}>
      {entry.label}
    </span>
  )
}

function formatDate(dt: string) {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })
}

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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ComplaintsList() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading, error } = useQuery<PaginatedComplaints>({
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
      return res.data.data
    },
  })

  const complaints = data?.data ?? []
  const meta = data?.meta

  const hasFilters = search || statusFilter || categoryFilter || typeFilter

  return (
    <div className="min-h-screen space-y-6 pb-10">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Complaints</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {meta?.total != null ? `${meta.total} total complaints` : 'Manage and resolve customer complaints'}
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, phone, or reference…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-9 pr-4 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
            className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Complainant Type */}
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
            className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-300 text-sm">
          Failed to load complaints. Please refresh.
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        {isLoading ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="px-6 py-4 flex gap-4 animate-pulse">
                <div className="h-4 w-28 bg-gray-200 dark:bg-gray-600 rounded" />
                <div className="h-4 w-32 bg-gray-100 dark:bg-gray-700 rounded" />
                <div className="h-4 w-24 bg-gray-100 dark:bg-gray-700 rounded" />
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-600 rounded" />
              </div>
            ))}
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
              <InboxIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-semibold">No complaints found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              {hasFilters ? 'Try adjusting your filters or search terms' : 'Complaints will appear here when filed'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reference #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Complainant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Filed By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {complaints.map((complaint) => (
                    <tr
                      key={complaint.id}
                      className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/complaints/${complaint.id}`)}
                    >
                      {/* Reference */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/admin/complaints/${complaint.id}`) }}
                          className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {complaint.reference_number}
                        </button>
                      </td>

                      {/* Complainant */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {complaint.complainant_name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {complaint.complainant_phone}
                            </p>
                          </div>
                          <div className="ml-1">
                            {complainantTypeLabel(complaint.complainant_type)}
                          </div>
                        </div>
                      </td>

                      {/* Product */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white max-w-[180px] truncate">
                        {complaint.product_name || '—'}
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {complaint.category?.replace(/_/g, ' ') || '—'}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(complaint.status)}>
                          {complaint.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Filed By */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {complaint.filed_by_name || '—'}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(complaint.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/admin/complaints/${complaint.id}`)}
                          className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2 text-sm transition-colors"
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

            {/* Pagination */}
            {meta && meta.last_page > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Page <span className="font-medium text-gray-900 dark:text-white">{meta.current_page}</span> of{' '}
                  <span className="font-medium text-gray-900 dark:text-white">{meta.last_page}</span>
                  {' '}· {meta.total} complaints
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="w-4 h-4" /> Prev
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === meta.last_page}
                    className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next <ChevronRightIcon className="w-4 h-4" />
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
