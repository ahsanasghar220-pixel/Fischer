import { useState, useEffect, useCallback } from 'react'
import { getMyOrders } from '@/api/b2b'
import type { B2bOrder, B2bOrderStatus } from '@/types/b2b'

const STATUS_BADGE: Record<B2bOrderStatus, string> = {
  pending:
    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
  in_production:
    'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
  ready:
    'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
  delivered:
    'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
  cancelled:
    'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
}

const STATUS_LABEL: Record<B2bOrderStatus, string> = {
  pending: 'Pending',
  in_production: 'In Production',
  ready: 'Ready',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

function StatusBadge({ status }: { status: B2bOrderStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}

function OrderSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 space-y-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
      <div className="h-3 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })
}

function OrderCard({ order }: { order: B2bOrder }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
    >
      {/* Clickable header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left p-4 space-y-2"
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-base font-bold text-gray-900 dark:text-white tracking-wide">
            {order.order_number}
          </span>
          <StatusBadge status={order.status} />
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium text-gray-800 dark:text-gray-200">{order.dealer_name}</span>
          <span>&bull;</span>
          <span>{order.city}</span>
          <span>&bull;</span>
          <span>{order.brand_name}</span>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{formatDate(order.created_at)}</span>
          <span className="flex items-center gap-1">
            <span>{order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}</span>
            <svg
              className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>

        {order.delivery_estimate && (
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
            Est. delivery: {order.delivery_estimate}
          </div>
        )}
      </button>

      {/* Expanded items */}
      {expanded && order.items && order.items.length > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
          {order.items.map((item) => (
            <div key={item.id} className="px-4 py-3 flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.product_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  SKU: {item.sku}
                </p>
                {item.notes && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 italic">
                    {item.notes}
                  </p>
                )}
              </div>
              <div className="flex-shrink-0 text-sm font-semibold text-gray-700 dark:text-gray-300">
                &times;{item.quantity}
              </div>
            </div>
          ))}

          {order.remarks && (
            <div className="px-4 py-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium">Remarks:</span> {order.remarks}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function MyOrders() {
  const [orders, setOrders] = useState<B2bOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)

  const fetchOrders = useCallback(async (page: number) => {
    setLoading(true)
    setError('')
    try {
      const result = await getMyOrders(page)
      setOrders(result.data)
      setCurrentPage(result.current_page)
      setLastPage(result.last_page)
    } catch {
      setError('Failed to load orders. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders(1)
  }, [fetchOrders])

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Orders</h2>
        <button
          onClick={() => fetchOrders(currentPage)}
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
            onClick={() => fetchOrders(currentPage)}
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
            <OrderSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && orders.length === 0 && (
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-gray-600 dark:text-gray-400 font-medium">No orders yet.</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
            Use 'New Order' to place your first order.
          </p>
        </div>
      )}

      {/* Orders list */}
      {!loading && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && lastPage > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => fetchOrders(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Page {currentPage} of {lastPage}
          </span>
          <button
            onClick={() => fetchOrders(currentPage + 1)}
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
