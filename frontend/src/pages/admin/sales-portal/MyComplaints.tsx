import { useState, useEffect, useCallback } from 'react'
import { getMyComplaints } from '@/api/complaints'
import type { ComplaintListItem, ComplaintStatus, ComplaintCategory } from '@/types/complaints'

const STATUS_BADGE: Record<ComplaintStatus, string> = {
  open: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
  assigned: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
  in_progress: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
  resolved: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
  closed: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
}

const STATUS_LABEL: Record<ComplaintStatus, string> = {
  open: 'Open',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

const CATEGORY_LABEL: Record<ComplaintCategory, string> = {
  defect: 'Defect',
  delivery: 'Delivery Issue',
  missing_item: 'Missing Item',
  installation: 'Installation',
  warranty: 'Warranty Claim',
  other: 'Other',
}

const CATEGORY_BADGE_CLS: Record<ComplaintCategory, string> = {
  defect: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
  delivery: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
  missing_item: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
  installation: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-200',
  warranty: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
  other: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
}

function StatusBadge({ status }: { status: ComplaintStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}

function CategoryBadge({ category }: { category: ComplaintCategory }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORY_BADGE_CLS[category]}`}
    >
      {CATEGORY_LABEL[category]}
    </span>
  )
}

function ComplaintSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 space-y-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
      <div className="h-3 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="flex gap-2">
        <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
      <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })
}

function ComplaintCard({ complaint }: { complaint: ComplaintListItem }) {
  const productLabel =
    complaint.product_name ||
    (complaint.sku ? `SKU: ${complaint.sku}` : null)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 space-y-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-sm font-bold text-gray-900 dark:text-white tracking-wider">
          {complaint.complaint_number}
        </span>
        <StatusBadge status={complaint.status} />
      </div>

      {/* Complainant info */}
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
          {complaint.complainant_name}
        </p>
        {complaint.complainant_city && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {complaint.complainant_city}
          </p>
        )}
      </div>

      {/* Product */}
      {productLabel && (
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
          <span className="font-medium text-gray-700 dark:text-gray-300">Product: </span>
          {productLabel}
        </p>
      )}

      {/* Category + date */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <CategoryBadge category={complaint.complaint_category} />
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Filed {formatDate(complaint.created_at)}
        </span>
      </div>
    </div>
  )
}

export default function MyComplaints() {
  const [complaints, setComplaints] = useState<ComplaintListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)

  const fetchComplaints = useCallback(async (page: number) => {
    setLoading(true)
    setError('')
    try {
      const result = await getMyComplaints(page)
      setComplaints(result.data)
      setCurrentPage(result.current_page)
      setLastPage(result.last_page)
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
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Complaints</h2>
        <button
          onClick={() => fetchComplaints(currentPage)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl p-4">
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
          {[0, 1, 2].map((i) => (
            <ComplaintSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && complaints.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-10 text-center">
          <svg
            className="mx-auto w-12 h-12 text-gray-300 dark:text-gray-600 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-600 dark:text-gray-400 font-medium">No complaints filed yet.</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
            Use 'New Complaint' to file a complaint.
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
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => fetchComplaints(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Page {currentPage} of {lastPage}
          </span>
          <button
            onClick={() => fetchComplaints(currentPage + 1)}
            disabled={currentPage >= lastPage}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
