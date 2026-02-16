import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface ReviewUser {
  id: number
  name: string
  email: string
}

interface ReviewProduct {
  id: number
  name: string
}

interface Review {
  id: number
  rating: number
  title?: string
  content: string
  status: string
  created_at: string
  user: ReviewUser | null
  product: ReviewProduct | null
}

interface ReviewsResponse {
  data: Review[]
  meta: {
    current_page: number
    last_page: number
    total: number
  }
}

type StatusFilter = '' | 'pending' | 'approved' | 'rejected'

export default function AdminReviews() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<StatusFilter>('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [selectedReviews, setSelectedReviews] = useState<number[]>([])
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<ReviewsResponse>({
    queryKey: ['admin-reviews', page, status, search],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      if (status) params.set('status', status)
      if (search) params.set('search', search)
      const res = await api.get(`/api/admin/reviews?${params}`)
      return res.data.data
    },
  })

  const approveMutation = useMutation({
    mutationFn: (id: number) => api.put(`/api/admin/reviews/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      toast.success('Review approved')
    },
    onError: () => toast.error('Failed to approve review'),
  })

  const rejectMutation = useMutation({
    mutationFn: (id: number) => api.put(`/api/admin/reviews/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      toast.success('Review rejected')
    },
    onError: () => toast.error('Failed to reject review'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/admin/reviews/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      toast.success('Review deleted')
    },
    onError: () => toast.error('Failed to delete review'),
  })

  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selectedReviews.length === 0) return
    const mutation = action === 'approve' ? approveMutation : rejectMutation
    for (const id of selectedReviews) {
      await mutation.mutateAsync(id)
    }
    setSelectedReviews([])
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const toggleSelect = (id: number) => {
    setSelectedReviews(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (!data?.data) return
    if (selectedReviews.length === data.data.length) {
      setSelectedReviews([])
    } else {
      setSelectedReviews(data.data.map(r => r.id))
    }
  }

  const reviews = data?.data || []
  const meta = data?.meta

  const statusTabs: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
  ]

  const statusBadge = (s: string) => {
    switch (s) {
      case 'approved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Reviews</h1>
        <div className="text-sm text-dark-500">
          {meta?.total || 0} total reviews
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 bg-dark-100 dark:bg-dark-800 rounded-lg p-1">
        {statusTabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => { setStatus(tab.value); setPage(1) }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              status === tab.value
                ? 'bg-white dark:bg-dark-700 text-dark-900 dark:text-white shadow-sm'
                : 'text-dark-500 hover:text-dark-700 dark:hover:text-dark-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search + Bulk Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search reviews..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-dark-900 dark:bg-dark-700 text-white rounded-lg hover:bg-dark-800 dark:hover:bg-dark-600 transition-colors">
            Search
          </button>
        </form>
        {selectedReviews.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction('approve')}
              className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Approve ({selectedReviews.length})
            </button>
            <button
              onClick={() => handleBulkAction('reject')}
              className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Reject ({selectedReviews.length})
            </button>
          </div>
        )}
      </div>

      {/* Reviews Table */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-dark-500">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center text-dark-500">No reviews found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-dark-50 dark:bg-dark-900 border-b border-dark-200 dark:border-dark-700">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedReviews.length === reviews.length && reviews.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-dark-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Review</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-dark-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-200 dark:divide-dark-700">
                {reviews.map(review => (
                  <tr
                    key={review.id}
                    className="hover:bg-dark-50 dark:hover:bg-dark-900/50 cursor-pointer transition-colors"
                    onClick={() => setExpandedId(expandedId === review.id ? null : review.id)}
                  >
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedReviews.includes(review.id)}
                        onChange={() => toggleSelect(review.id)}
                        className="rounded border-dark-300"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-dark-900 dark:text-white font-medium max-w-[200px] truncate">
                      {review.product?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-dark-600 dark:text-dark-300">
                      {review.user?.name || 'Unknown'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(star => (
                          star <= review.rating
                            ? <StarSolidIcon key={star} className="w-4 h-4 text-primary-500" />
                            : <StarIcon key={star} className="w-4 h-4 text-dark-200 dark:text-dark-600" />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-dark-600 dark:text-dark-400 max-w-[250px]">
                      <p className="truncate">{review.content}</p>
                      {expandedId === review.id && (
                        <div className="mt-2 p-3 bg-dark-50 dark:bg-dark-900 rounded-lg">
                          {review.title && <p className="font-medium text-dark-900 dark:text-white mb-1">{review.title}</p>}
                          <p className="whitespace-pre-wrap text-dark-600 dark:text-dark-300">{review.content}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge(review.status)}`}>
                        {review.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-dark-500 whitespace-nowrap">
                      {new Date(review.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        {review.status !== 'approved' && (
                          <button
                            onClick={() => approveMutation.mutate(review.id)}
                            className="p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <CheckCircleIcon className="w-5 h-5" />
                          </button>
                        )}
                        {review.status !== 'rejected' && (
                          <button
                            onClick={() => rejectMutation.mutate(review.id)}
                            className="p-1.5 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <XCircleIcon className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm('Delete this review permanently?')) {
                              deleteMutation.mutate(review.id)
                            }
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-dark-200 dark:border-dark-700">
            <p className="text-sm text-dark-500">
              Page {meta.current_page} of {meta.last_page} ({meta.total} reviews)
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg border border-dark-200 dark:border-dark-600 disabled:opacity-50 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                disabled={page >= meta.last_page}
                className="p-2 rounded-lg border border-dark-200 dark:border-dark-600 disabled:opacity-50 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
