import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MagnifyingGlassIcon, EyeIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

interface Dealer {
  id: number
  business_name: string
  contact_person: string
  email: string
  phone: string
  city: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

interface PaginatedDealers {
  data: Dealer[]
  meta: {
    current_page: number
    last_page: number
    total: number
  }
}

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

export default function AdminDealers() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null)

  const { data, isLoading } = useQuery<PaginatedDealers>({
    queryKey: ['admin-dealers', page, search, status],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      if (search) params.set('search', search)
      if (status) params.set('status', status)
      const response = await api.get(`/admin/dealers?${params.toString()}`)
      return response.data.data
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await api.put(`/admin/dealers/${id}`, { status })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-dealers'] })
      toast.success('Dealer status updated')
      setSelectedDealer(null)
    },
    onError: () => {
      toast.error('Failed to update dealer status')
    },
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      default:
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Dealers</h1>
        <p className="text-dark-500 dark:text-dark-400">Manage dealer applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {data?.data.filter(d => d.status === 'pending').length || 0}
          </p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">Pending</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {data?.data.filter(d => d.status === 'approved').length || 0}
          </p>
          <p className="text-sm text-green-700 dark:text-green-300">Approved</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {data?.data.filter(d => d.status === 'rejected').length || 0}
          </p>
          <p className="text-sm text-red-700 dark:text-red-300">Rejected</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {data?.meta?.total || 0}
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-300">Total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="text"
              placeholder="Search by business name, email..."
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
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-600 dark:text-dark-300">Business</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-600 dark:text-dark-300">Contact</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-600 dark:text-dark-300">City</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-600 dark:text-dark-300">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-600 dark:text-dark-300">Date</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-dark-600 dark:text-dark-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-200 dark:divide-dark-700">
                  {data.data.map((dealer) => (
                    <tr key={dealer.id} className="hover:bg-dark-50 dark:hover:bg-dark-700/50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-dark-900 dark:text-white">{dealer.business_name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-dark-900 dark:text-white">{dealer.contact_person}</p>
                        <p className="text-xs text-dark-500 dark:text-dark-400">{dealer.email}</p>
                        <p className="text-xs text-dark-500 dark:text-dark-400">{dealer.phone}</p>
                      </td>
                      <td className="px-4 py-3 text-dark-600 dark:text-dark-400">
                        {dealer.city}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(dealer.status)}`}>
                          {dealer.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-dark-600 dark:text-dark-400 text-sm">
                        {formatDate(dealer.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedDealer(dealer)}
                            className="p-2 text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          {dealer.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateStatusMutation.mutate({ id: dealer.id, status: 'approved' })}
                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                              >
                                <CheckIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => updateStatusMutation.mutate({ id: dealer.id, status: 'rejected' })}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              >
                                <XMarkIcon className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
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
            No dealer applications found.
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedDealer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-4">Dealer Details</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-dark-500 dark:text-dark-400">Business Name</label>
                <p className="text-dark-900 dark:text-white">{selectedDealer.business_name}</p>
              </div>
              <div>
                <label className="text-sm text-dark-500 dark:text-dark-400">Contact Person</label>
                <p className="text-dark-900 dark:text-white">{selectedDealer.contact_person}</p>
              </div>
              <div>
                <label className="text-sm text-dark-500 dark:text-dark-400">Email</label>
                <p className="text-dark-900 dark:text-white">{selectedDealer.email}</p>
              </div>
              <div>
                <label className="text-sm text-dark-500 dark:text-dark-400">Phone</label>
                <p className="text-dark-900 dark:text-white">{selectedDealer.phone}</p>
              </div>
              <div>
                <label className="text-sm text-dark-500 dark:text-dark-400">City</label>
                <p className="text-dark-900 dark:text-white">{selectedDealer.city}</p>
              </div>
              <div>
                <label className="text-sm text-dark-500 dark:text-dark-400">Status</label>
                <p className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(selectedDealer.status)}`}>
                  {selectedDealer.status}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedDealer(null)}
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
