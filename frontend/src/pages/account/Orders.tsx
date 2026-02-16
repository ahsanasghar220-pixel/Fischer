import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MagnifyingGlassIcon, FunnelIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import api from '@/lib/api'
import { formatPrice, formatDate, getOrderStatusColor } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface OrderItem {
  id: number
  product_name: string
  product_image?: string
  quantity: number
  unit_price: string
  total_price: string
}

interface Order {
  id: number
  order_number: string
  status: string
  payment_status: string
  subtotal: number
  shipping_cost: number
  discount: number
  total: number
  created_at: string
  items_count: number
  items: OrderItem[]
}

interface PaginatedOrders {
  data: Order[]
  meta: {
    current_page: number
    last_page: number
    total: number
  }
}

const statusFilters = [
  { value: '', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function Orders() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const status = searchParams.get('status') || ''
  const page = parseInt(searchParams.get('page') || '1')

  const { data, isLoading } = useQuery<PaginatedOrders>({
    queryKey: ['orders', status, page, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      if (status) params.set('status', status)
      if (searchQuery) params.set('search', searchQuery)
      const response = await api.get(`/api/orders?${params.toString()}`)
      return response.data
    },
  })

  const cancelMutation = useMutation({
    mutationFn: async (orderNumber: string) => {
      const response = await api.post(`/api/orders/${orderNumber}/cancel`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      setCancelModalOpen(false)
      setOrderToCancel(null)
    },
  })

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    newParams.set('page', '1')
    setSearchParams(newParams)
  }

  const handleCancelClick = (orderNumber: string) => {
    setOrderToCancel(orderNumber)
    setCancelModalOpen(true)
  }

  const confirmCancel = () => {
    if (orderToCancel) {
      cancelMutation.mutate(orderToCancel)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm">
        {/* Header */}
        <div className="p-4 border-b border-dark-200 dark:border-dark-700">
          <h2 className="text-xl font-semibold text-dark-900 dark:text-white">My Orders</h2>
          <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">Track and manage your orders</p>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-900/50">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                type="text"
                placeholder="Search by order number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && updateFilter('search', searchQuery)}
                className="w-full pl-10 pr-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-dark-400" />
              <select
                value={status}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {statusFilters.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : data?.data && data.data.length > 0 ? (
          <div className="divide-y divide-dark-200 dark:divide-dark-700">
            {data.data.map((order) => (
              <div key={order.id} className="p-4">
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <Link
                      to={`/account/orders/${order.order_number}`}
                      className="font-semibold text-dark-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      Order #{order.order_number}
                    </Link>
                    <p className="text-sm text-dark-500 dark:text-dark-400 mt-0.5">
                      Placed on {formatDate(order.created_at)} • {order.items_count} item(s)
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                    <span className="font-semibold text-dark-900 dark:text-white">{formatPrice(order.total)}</span>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="flex items-center gap-4 overflow-x-auto pb-2">
                  {order.items.slice(0, 4).map((item) => (
                    <div key={item.id} className="flex items-center gap-3 flex-shrink-0">
                      <div className="w-16 h-16 bg-dark-100 dark:bg-dark-700 rounded-lg overflow-hidden">
                        {item.product_image ? (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-dark-400 dark:text-dark-500 text-xs">
                            No img
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-dark-900 dark:text-white truncate max-w-[150px]">
                          {item.product_name}
                        </p>
                        <p className="text-xs text-dark-500 dark:text-dark-400">
                          {item.quantity} × {formatPrice(parseFloat(item.unit_price))}
                        </p>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <div className="flex-shrink-0 w-16 h-16 bg-dark-100 dark:bg-dark-700 rounded-lg flex items-center justify-center">
                      <span className="text-sm text-dark-500 dark:text-dark-400">+{order.items.length - 4}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-dark-200 dark:border-dark-700">
                  <Link
                    to={`/account/orders/${order.order_number}`}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                  >
                    View Details
                  </Link>
                  {order.status === 'delivered' && (
                    <Link
                      to={`/account/orders/${order.order_number}/review`}
                      className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                    >
                      Write Review
                    </Link>
                  )}
                  {['pending', 'confirmed'].includes(order.status) && (
                    <button
                      onClick={() => handleCancelClick(order.order_number)}
                      className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">No orders found</h3>
            <p className="text-dark-500 dark:text-dark-400 mb-6">
              {status ? 'No orders match your filter' : "You haven't placed any orders yet"}
            </p>
            <Link to="/shop" className="btn btn-primary">
              Start Shopping
            </Link>
          </div>
        )}

        {/* Pagination */}
        {data?.meta && data.meta.last_page > 1 && (
          <div className="p-4 border-t border-dark-200 dark:border-dark-700 flex items-center justify-center gap-2">
            {Array.from({ length: data.meta.last_page }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => updateFilter('page', p.toString())}
                className={`w-10 h-10 rounded-lg font-medium ${
                  p === data.meta.current_page
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-600'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Order Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-dark-900 dark:text-white">Cancel Order</h3>
            </div>
            <p className="text-dark-600 dark:text-dark-400 mb-6">
              Are you sure you want to cancel order <span className="font-semibold text-dark-900 dark:text-white">#{orderToCancel}</span>? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => {
                  setCancelModalOpen(false)
                  setOrderToCancel(null)
                }}
                disabled={cancelMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-dark-600 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white border border-dark-200 dark:border-dark-600 rounded-lg hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
              >
                Keep Order
              </button>
              <button
                onClick={confirmCancel}
                disabled={cancelMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {cancelMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Cancelling...
                  </>
                ) : (
                  'Yes, Cancel Order'
                )}
              </button>
            </div>
            {cancelMutation.isError && (
              <p className="mt-4 text-sm text-red-600 dark:text-red-400">
                {(cancelMutation.error as Error)?.message || 'Failed to cancel order. Please try again.'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
