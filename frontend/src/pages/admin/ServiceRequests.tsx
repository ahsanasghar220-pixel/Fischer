import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MagnifyingGlassIcon, EyeIcon } from '@heroicons/react/24/outline'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

interface ServiceRequest {
  id: number
  name: string
  email: string
  phone: string
  product_name: string
  issue_type: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string
}

interface PaginatedRequests {
  data: ServiceRequest[]
  meta: {
    current_page: number
    last_page: number
    total: number
  }
}

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function AdminServiceRequests() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)

  const { data, isLoading } = useQuery<PaginatedRequests>({
    queryKey: ['admin-service-requests', page, search, status],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      if (search) params.set('search', search)
      if (status) params.set('status', status)
      const response = await api.get(`/api/admin/service-requests?${params.toString()}`)
      return response.data.data
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await api.put(`/api/admin/service-requests/${id}`, { status })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-service-requests'] })
      toast.success('Service request updated')
      setSelectedRequest(null)
    },
    onError: () => {
      toast.error('Failed to update service request')
    },
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      case 'in_progress':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      default:
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Service Requests</h1>
        <p className="text-dark-500 dark:text-dark-400">Manage customer service requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {data?.data.filter(r => r.status === 'pending').length || 0}
          </p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">Pending</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {data?.data.filter(r => r.status === 'in_progress').length || 0}
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-300">In Progress</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {data?.data.filter(r => r.status === 'completed').length || 0}
          </p>
          <p className="text-sm text-green-700 dark:text-green-300">Completed</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {data?.meta?.total || 0}
          </p>
          <p className="text-sm text-purple-700 dark:text-purple-300">Total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="text"
              placeholder="Search by name, email, product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : data?.data && data.data.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-50 dark:bg-dark-700 border-b border-dark-200 dark:border-dark-600">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-600 dark:text-dark-300">Customer</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-600 dark:text-dark-300">Product</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-600 dark:text-dark-300">Issue</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-600 dark:text-dark-300">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-600 dark:text-dark-300">Date</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-dark-600 dark:text-dark-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-200 dark:divide-dark-700">
                  {data.data.map((request) => (
                    <tr key={request.id} className="hover:bg-dark-50 dark:hover:bg-dark-700/50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-dark-900 dark:text-white">{request.name}</p>
                        <p className="text-xs text-dark-500 dark:text-dark-400">{request.email}</p>
                        <p className="text-xs text-dark-500 dark:text-dark-400">{request.phone}</p>
                      </td>
                      <td className="px-4 py-3 text-dark-600 dark:text-dark-400">
                        {request.product_name}
                      </td>
                      <td className="px-4 py-3 text-dark-600 dark:text-dark-400">
                        {request.issue_type}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                          {request.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-dark-600 dark:text-dark-400 text-sm">
                        {formatDate(request.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="p-2 text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data.meta && data.meta.last_page > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-dark-200 dark:border-dark-700">
                <p className="text-sm text-dark-500 dark:text-dark-400">
                  Page {data.meta.current_page} of {data.meta.last_page}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 border border-dark-200 dark:border-dark-600 rounded text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(data.meta.last_page, p + 1))}
                    disabled={page === data.meta.last_page}
                    className="px-3 py-1 border border-dark-200 dark:border-dark-600 rounded text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center text-dark-500 dark:text-dark-400">
            No service requests found.
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-4">Service Request Details</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-dark-500 dark:text-dark-400">Customer Name</label>
                <p className="text-dark-900 dark:text-white">{selectedRequest.name}</p>
              </div>
              <div>
                <label className="text-sm text-dark-500 dark:text-dark-400">Email</label>
                <p className="text-dark-900 dark:text-white">{selectedRequest.email}</p>
              </div>
              <div>
                <label className="text-sm text-dark-500 dark:text-dark-400">Phone</label>
                <p className="text-dark-900 dark:text-white">{selectedRequest.phone}</p>
              </div>
              <div>
                <label className="text-sm text-dark-500 dark:text-dark-400">Product</label>
                <p className="text-dark-900 dark:text-white">{selectedRequest.product_name}</p>
              </div>
              <div>
                <label className="text-sm text-dark-500 dark:text-dark-400">Issue Type</label>
                <p className="text-dark-900 dark:text-white">{selectedRequest.issue_type}</p>
              </div>
              <div>
                <label className="text-sm text-dark-500 dark:text-dark-400">Description</label>
                <p className="text-dark-900 dark:text-white">{selectedRequest.description}</p>
              </div>
              <div>
                <label className="text-sm text-dark-500 dark:text-dark-400">Status</label>
                <select
                  value={selectedRequest.status}
                  onChange={(e) => updateStatusMutation.mutate({ id: selectedRequest.id, status: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
