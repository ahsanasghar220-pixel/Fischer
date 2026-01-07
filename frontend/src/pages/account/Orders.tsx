import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'
import api from '@/lib/api'
import { formatPrice, formatDate, getOrderStatusColor } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

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
  items: {
    id: number
    product: {
      name: string
      primary_image?: string
    }
    quantity: number
    price: number
  }[]
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

  const status = searchParams.get('status') || ''
  const page = parseInt(searchParams.get('page') || '1')

  const { data, isLoading } = useQuery<PaginatedOrders>({
    queryKey: ['orders', status, page, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      if (status) params.set('status', status)
      if (searchQuery) params.set('search', searchQuery)
      const response = await api.get(`/orders?${params.toString()}`)
      return response.data
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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm">
        {/* Header */}
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-dark-900">My Orders</h2>
          <p className="text-sm text-dark-500 mt-1">Track and manage your orders</p>
        </div>

        {/* Filters */}
        <div className="p-4 border-b bg-dark-50">
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
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-dark-400" />
              <select
                value={status}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
          <div className="divide-y">
            {data.data.map((order) => (
              <div key={order.id} className="p-4">
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <Link
                      to={`/account/orders/${order.order_number}`}
                      className="font-semibold text-dark-900 hover:text-primary-600"
                    >
                      Order #{order.order_number}
                    </Link>
                    <p className="text-sm text-dark-500 mt-0.5">
                      Placed on {formatDate(order.created_at)} • {order.items_count} item(s)
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                    <span className="font-semibold text-dark-900">{formatPrice(order.total)}</span>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="flex items-center gap-4 overflow-x-auto pb-2">
                  {order.items.slice(0, 4).map((item) => (
                    <div key={item.id} className="flex items-center gap-3 flex-shrink-0">
                      <div className="w-16 h-16 bg-dark-100 rounded-lg overflow-hidden">
                        {item.product.primary_image ? (
                          <img
                            src={item.product.primary_image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-dark-400 text-xs">
                            No img
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-dark-900 truncate max-w-[150px]">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-dark-500">
                          {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <div className="flex-shrink-0 w-16 h-16 bg-dark-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm text-dark-500">+{order.items.length - 4}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                  <Link
                    to={`/account/orders/${order.order_number}`}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View Details
                  </Link>
                  {order.status === 'delivered' && (
                    <Link
                      to={`/account/orders/${order.order_number}/review`}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Write Review
                    </Link>
                  )}
                  {['pending', 'confirmed'].includes(order.status) && (
                    <button className="text-sm text-red-600 hover:text-red-700 font-medium">
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
            <h3 className="text-xl font-semibold text-dark-900 mb-2">No orders found</h3>
            <p className="text-dark-500 mb-6">
              {status ? 'No orders match your filter' : "You haven't placed any orders yet"}
            </p>
            <Link to="/shop" className="btn btn-primary">
              Start Shopping
            </Link>
          </div>
        )}

        {/* Pagination */}
        {data?.meta && data.meta.last_page > 1 && (
          <div className="p-4 border-t flex items-center justify-center gap-2">
            {Array.from({ length: data.meta.last_page }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => updateFilter('page', p.toString())}
                className={`w-10 h-10 rounded-lg font-medium ${
                  p === data.meta.current_page
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-100 text-dark-600 hover:bg-dark-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
