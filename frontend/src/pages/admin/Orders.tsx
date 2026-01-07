import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { MagnifyingGlassIcon, EyeIcon, PrinterIcon } from '@heroicons/react/24/outline'
import api from '@/lib/api'
import { formatPrice, formatDate, getOrderStatusColor, getPaymentStatusColor } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface Order {
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

interface PaginatedOrders {
  data: Order[]
  meta: {
    current_page: number
    last_page: number
    total: number
  }
}

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function AdminOrders() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')

  const { data, isLoading } = useQuery<PaginatedOrders>({
    queryKey: ['admin-orders', page, search, status, paymentStatus],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      if (search) params.set('search', search)
      if (status) params.set('status', status)
      if (paymentStatus) params.set('payment_status', paymentStatus)
      const response = await api.get(`/admin/orders?${params.toString()}`)
      return response.data
    },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark-900">Orders</h1>
        <p className="text-dark-500">Manage customer orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-yellow-600">24</p>
          <p className="text-sm text-yellow-700">Pending</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-blue-600">18</p>
          <p className="text-sm text-blue-700">Processing</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-purple-600">12</p>
          <p className="text-sm text-purple-700">Shipped</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-green-600">156</p>
          <p className="text-sm text-green-700">Delivered</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              placeholder="Search by order # or customer..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            value={paymentStatus}
            onChange={(e) => { setPaymentStatus(e.target.value); setPage(1); }}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-600">Order</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-600">Customer</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-600">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-600">Payment</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-600">Total</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-600">Date</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-dark-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data?.data.map((order) => (
                    <tr key={order.id} className="hover:bg-dark-50">
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/orders/${order.order_number}`}
                          className="font-medium text-dark-900 hover:text-primary-600"
                        >
                          #{order.order_number}
                        </Link>
                        <p className="text-xs text-dark-500">{order.items_count} items</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-dark-900">{order.customer_name}</p>
                        <p className="text-xs text-dark-500">{order.customer_email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getOrderStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                          {order.payment_status}
                        </span>
                        <p className="text-xs text-dark-500 capitalize mt-0.5">{order.payment_method.replace('_', ' ')}</p>
                      </td>
                      <td className="px-4 py-3 font-medium text-dark-900">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-4 py-3 text-dark-600 text-sm">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/orders/${order.order_number}`}
                            className="p-2 text-dark-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Link>
                          <button className="p-2 text-dark-400 hover:text-dark-600 hover:bg-dark-100 rounded">
                            <PrinterIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data?.meta && data.meta.last_page > 1 && (
              <div className="p-4 border-t flex items-center justify-between">
                <p className="text-sm text-dark-500">
                  Showing {((page - 1) * 15) + 1} to {Math.min(page * 15, data.meta.total)} of {data.meta.total} orders
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === data.meta.last_page}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50"
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
