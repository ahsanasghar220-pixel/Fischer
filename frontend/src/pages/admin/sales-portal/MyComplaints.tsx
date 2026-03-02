import { useState, useEffect, useCallback } from 'react'
import { getMyComplaints } from '@/api/complaints'
import type { ComplaintListItem, ComplaintStatus, ComplaintCategory } from '@/types/complaints'
import {
  InboxIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  PhoneIcon,
  MapPinIcon,
  CubeIcon,
  CalendarDaysIcon,
  TagIcon,
  UserIcon,
} from '@heroicons/react/24/outline'

// ─── Label maps ───────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<ComplaintStatus, string> = {
  open:        'Open',
  assigned:    'Assigned',
  in_progress: 'In Progress',
  resolved:    'Resolved',
  closed:      'Closed',
}

const STATUS_BADGE: Record<ComplaintStatus, string> = {
  open:        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 ring-1 ring-red-200 dark:ring-red-800',
  assigned:    'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 ring-1 ring-orange-200 dark:ring-orange-800',
  in_progress: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 ring-1 ring-yellow-200 dark:ring-yellow-800',
  resolved:    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 ring-1 ring-green-200 dark:ring-green-800',
  closed:      'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 ring-1 ring-gray-200 dark:ring-gray-600',
}

const STATUS_DOT: Record<ComplaintStatus, string> = {
  open:        'bg-red-500',
  assigned:    'bg-orange-500',
  in_progress: 'bg-yellow-500',
  resolved:    'bg-green-500',
  closed:      'bg-gray-400',
}

const CATEGORY_LABEL: Record<ComplaintCategory, string> = {
  defect:       'Defect',
  delivery:     'Delivery Issue',
  missing_item: 'Missing Item',
  installation: 'Installation',
  warranty:     'Warranty Claim',
  other:        'Other',
}

const CATEGORY_BADGE: Record<ComplaintCategory, string> = {
  defect:       'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  delivery:     'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  missing_item: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
  installation: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400',
  warranty:     'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
  other:        'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-PK', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ComplaintSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
      <div className="h-3 w-48 bg-gray-100 dark:bg-gray-700/80 rounded" />
      <div className="flex gap-2">
        <div className="h-5 w-24 bg-gray-100 dark:bg-gray-700/80 rounded-full" />
        <div className="h-5 w-20 bg-gray-100 dark:bg-gray-700/80 rounded-full" />
      </div>
    </div>
  )
}

// ─── Complaint Card ───────────────────────────────────────────────────────────

function ComplaintCard({ complaint }: { complaint: ComplaintListItem }) {
  const [expanded, setExpanded] = useState(false)

  const productLabel =
    complaint.product_name || (complaint.sku ? `SKU: ${complaint.sku}` : null)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all">

      {/* Card Header — always visible */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Status dot */}
          <div className="flex-shrink-0 pt-1">
            <div className={`w-2.5 h-2.5 rounded-full mt-0.5 ${STATUS_DOT[complaint.status]}`} />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              {/* Reference number */}
              <span className="font-mono text-sm font-bold text-gray-900 dark:text-white tracking-wider">
                {complaint.complaint_number}
              </span>
              {/* Status badge */}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[complaint.status]}`}>
                {STATUS_LABEL[complaint.status]}
              </span>
            </div>

            {/* Complainant name */}
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-1">
              {complaint.complainant_name}
            </p>

            {/* Category + date row */}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${CATEGORY_BADGE[complaint.complaint_category]}`}>
                <TagIcon className="w-3 h-3" />
                {CATEGORY_LABEL[complaint.complaint_category]}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                <CalendarDaysIcon className="w-3 h-3" />
                {formatDate(complaint.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable detail area */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-700/40 space-y-2">
          {/* Contact info */}
          <div className="flex flex-wrap gap-x-6 gap-y-1.5">
            <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <PhoneIcon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
              {complaint.complainant_phone}
            </span>
            {complaint.complainant_city && (
              <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                <MapPinIcon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                {complaint.complainant_city}
              </span>
            )}
          </div>

          {/* Product */}
          {productLabel && (
            <div className="flex items-start gap-1.5">
              <CubeIcon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-700 dark:text-gray-300">Product: </span>
                {productLabel}
              </span>
            </div>
          )}

          {/* Filed by / assigned to */}
          <div className="flex flex-wrap gap-x-6 gap-y-1.5 pt-1">
            {complaint.filed_by && (
              <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <UserIcon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                Filed by: {complaint.filed_by.full_name}
              </span>
            )}
            {complaint.assigned_to_user && (
              <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <UserIcon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                Assigned: {complaint.assigned_to_user.full_name}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Expand toggle footer */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-center gap-1 py-2 text-xs font-medium text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors border-t border-gray-100 dark:border-gray-700"
      >
        {expanded ? (
          <>
            <ChevronUpIcon className="w-3.5 h-3.5" />
            Hide details
          </>
        ) : (
          <>
            <ChevronDownIcon className="w-3.5 h-3.5" />
            Show details
          </>
        )}
      </button>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MyComplaints() {
  const [complaints, setComplaints] = useState<ComplaintListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchComplaints = useCallback(async (page: number) => {
    setLoading(true)
    setError('')
    try {
      const result = await getMyComplaints(page)
      setComplaints(result.data)
      setCurrentPage(result.current_page)
      setLastPage(result.last_page)
      setTotal(result.total)
    } catch {
      setError('Failed to load complaints. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchComplaints(1)
  }, [fetchComplaints])

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Complaints</h2>
          {total > 0 && !loading && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{total} complaint{total !== 1 ? 's' : ''} filed</p>
          )}
        </div>
        <button
          onClick={() => fetchComplaints(currentPage)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium disabled:opacity-50 transition-colors"
        >
          <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          <button
            onClick={() => fetchComplaints(currentPage)}
            className="mt-2 text-sm font-medium text-red-700 dark:text-red-300 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <ComplaintSkeleton key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && complaints.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
            <InboxIcon className="w-7 h-7 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-800 dark:text-gray-200 font-semibold">No complaints filed yet</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-xs mx-auto">
            Use the "New Complaint" tab to file a complaint on behalf of a customer.
          </p>
        </div>
      )}

      {/* Complaints list */}
      {!loading && complaints.length > 0 && (
        <div className="space-y-3">
          {complaints.map((complaint) => (
            <ComplaintCard key={complaint.id} complaint={complaint} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && lastPage > 1 && (
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => fetchComplaints(currentPage - 1)}
            disabled={currentPage <= 1}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Previous
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Page <span className="font-semibold text-gray-700 dark:text-gray-200">{currentPage}</span> of{' '}
            <span className="font-semibold text-gray-700 dark:text-gray-200">{lastPage}</span>
          </span>
          <button
            onClick={() => fetchComplaints(currentPage + 1)}
            disabled={currentPage >= lastPage}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            Next
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
