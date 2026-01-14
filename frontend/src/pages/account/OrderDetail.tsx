import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeftIcon, TruckIcon, PrinterIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import api from '@/lib/api'
import { formatPrice, formatDate, getOrderStatusColor } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface OrderItem {
  id: number
  product_name: string
  product_image?: string
  product_sku: string
  variant_attributes?: string
  quantity: number
  unit_price: string
  total_price: string
}

interface Order {
  id: number
  order_number: string
  status: string
  payment_method: string
  payment_status: string
  subtotal: string
  discount_amount: string
  shipping_amount: string
  total: string
  created_at: string
  shipping_first_name: string
  shipping_last_name: string
  shipping_phone: string
  shipping_email?: string
  shipping_address_line_1: string
  shipping_address_line_2?: string
  shipping_city: string
  shipping_state?: string
  shipping_postal_code?: string
  shipping_method?: string
  tracking_number?: string
  courier_name?: string
  customer_notes?: string
  items: OrderItem[]
  items_count: number
}

export default function OrderDetail() {
  const { orderNumber } = useParams<{ orderNumber: string }>()
  const queryClient = useQueryClient()
  const [cancelModalOpen, setCancelModalOpen] = useState(false)

  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ['order', orderNumber],
    queryFn: async () => {
      const response = await api.get(`/orders/${orderNumber}`)
      return response.data.data.order
    },
  })

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/orders/${orderNumber}/cancel`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderNumber] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      setCancelModalOpen(false)
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="p-12 text-center">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">Order not found</h3>
        <p className="text-dark-500 dark:text-dark-400 mb-6">
          We couldn't find this order.
        </p>
        <Link to="/account/orders" className="btn btn-primary">
          Back to Orders
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/account/orders"
            className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-dark-600 dark:text-dark-400" />
          </Link>
          <div>
            <h2 className="text-xl font-semibold text-dark-900 dark:text-white">
              Order #{order.order_number}
            </h2>
            <p className="text-sm text-dark-500 dark:text-dark-400">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getOrderStatusColor(order.status)}`}>
            {order.status.replace('_', ' ')}
          </span>
          <button
            onClick={() => window.print()}
            className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
          >
            <PrinterIcon className="w-5 h-5 text-dark-600 dark:text-dark-400" />
          </button>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-dark-200 dark:border-dark-700">
          <h3 className="font-semibold text-dark-900 dark:text-white">Order Items</h3>
        </div>
        <div className="divide-y divide-dark-200 dark:divide-dark-700">
          {order.items.map((item) => (
            <div key={item.id} className="p-4 flex gap-4">
              <div className="w-20 h-20 bg-dark-100 dark:bg-dark-700 rounded-lg overflow-hidden flex-shrink-0">
                {item.product_image ? (
                  <img
                    src={item.product_image}
                    alt={item.product_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-dark-400 dark:text-dark-500">
                    📦
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-dark-900 dark:text-white">{item.product_name}</p>
                {item.variant_attributes && (
                  <p className="text-sm text-dark-500 dark:text-dark-400">{item.variant_attributes}</p>
                )}
                <p className="text-sm text-dark-500 dark:text-dark-400">SKU: {item.product_sku}</p>
                <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
                  Qty: {item.quantity} × {formatPrice(parseFloat(item.unit_price))}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-dark-900 dark:text-white">
                  {formatPrice(parseFloat(item.total_price))}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="p-4 bg-dark-50 dark:bg-dark-900/50 border-t border-dark-200 dark:border-dark-700">
          <div className="space-y-2 max-w-xs ml-auto">
            <div className="flex justify-between text-sm">
              <span className="text-dark-500 dark:text-dark-400">Subtotal</span>
              <span className="text-dark-900 dark:text-white">{formatPrice(parseFloat(order.subtotal))}</span>
            </div>
            {parseFloat(order.discount_amount) > 0 && (
              <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                <span>Discount</span>
                <span>-{formatPrice(parseFloat(order.discount_amount))}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-dark-500 dark:text-dark-400">Shipping</span>
              <span className="text-dark-900 dark:text-white">
                {parseFloat(order.shipping_amount) === 0 ? (
                  <span className="text-green-600 dark:text-green-400">FREE</span>
                ) : (
                  formatPrice(parseFloat(order.shipping_amount))
                )}
              </span>
            </div>
            <div className="flex justify-between text-base font-semibold pt-2 border-t border-dark-200 dark:border-dark-700">
              <span className="text-dark-900 dark:text-white">Total</span>
              <span className="text-primary-600 dark:text-primary-400">{formatPrice(parseFloat(order.total))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping & Payment Info */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Shipping Address */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <TruckIcon className="w-5 h-5 text-primary-500" />
            <h3 className="font-semibold text-dark-900 dark:text-white">Shipping Address</h3>
          </div>
          <div className="text-sm space-y-1">
            <p className="font-medium text-dark-900 dark:text-white">
              {order.shipping_first_name} {order.shipping_last_name}
            </p>
            <p className="text-dark-600 dark:text-dark-400">{order.shipping_phone}</p>
            {order.shipping_email && (
              <p className="text-dark-600 dark:text-dark-400">{order.shipping_email}</p>
            )}
            <p className="text-dark-600 dark:text-dark-400 mt-2">
              {order.shipping_address_line_1}
              {order.shipping_address_line_2 && <>, {order.shipping_address_line_2}</>}
            </p>
            <p className="text-dark-600 dark:text-dark-400">
              {order.shipping_city}
              {order.shipping_state && `, ${order.shipping_state}`}
              {order.shipping_postal_code && ` ${order.shipping_postal_code}`}
            </p>
          </div>
          {order.shipping_method && (
            <div className="mt-4 pt-4 border-t border-dark-200 dark:border-dark-700">
              <p className="text-sm text-dark-500 dark:text-dark-400">
                Shipping Method: <span className="text-dark-900 dark:text-white">{order.shipping_method}</span>
              </p>
            </div>
          )}
          {order.tracking_number && (
            <div className="mt-2">
              <p className="text-sm text-dark-500 dark:text-dark-400">
                Tracking: <span className="text-primary-600 dark:text-primary-400">{order.tracking_number}</span>
                {order.courier_name && ` (${order.courier_name})`}
              </p>
            </div>
          )}
        </div>

        {/* Payment Info */}
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-4">
          <h3 className="font-semibold text-dark-900 dark:text-white mb-4">Payment Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-dark-500 dark:text-dark-400">Method</span>
              <span className="text-dark-900 dark:text-white capitalize">{order.payment_method.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dark-500 dark:text-dark-400">Status</span>
              <span className={`font-medium capitalize px-2 py-0.5 rounded ${
                order.payment_status === 'paid'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
              }`}>
                {order.payment_status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Notes */}
      {order.customer_notes && (
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-4">
          <h3 className="font-semibold text-dark-900 dark:text-white mb-2">Order Notes</h3>
          <p className="text-sm text-dark-600 dark:text-dark-400">{order.customer_notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4">
        {['pending', 'confirmed'].includes(order.status) && (
          <button
            onClick={() => setCancelModalOpen(true)}
            className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Cancel Order
          </button>
        )}
        <Link
          to="/account/orders"
          className="px-4 py-2 text-sm text-dark-600 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white font-medium border border-dark-200 dark:border-dark-600 rounded-lg hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
        >
          Back to Orders
        </Link>
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
              Are you sure you want to cancel order <span className="font-semibold text-dark-900 dark:text-white">#{order.order_number}</span>? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setCancelModalOpen(false)}
                disabled={cancelMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-dark-600 dark:text-dark-400 hover:text-dark-900 dark:hover:text-white border border-dark-200 dark:border-dark-600 rounded-lg hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
              >
                Keep Order
              </button>
              <button
                onClick={() => cancelMutation.mutate()}
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
