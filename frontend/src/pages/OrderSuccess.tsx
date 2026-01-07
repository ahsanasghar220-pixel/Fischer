import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCircleIcon, TruckIcon, PrinterIcon } from '@heroicons/react/24/outline'
import api from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface Order {
  id: number
  order_number: string
  status: string
  payment_method: string
  payment_status: string
  subtotal: number
  shipping_cost: number
  discount: number
  total: number
  created_at: string
  shipping_name: string
  shipping_phone: string
  shipping_address: string
  shipping_city: string
  items: {
    id: number
    product: {
      name: string
      primary_image?: string
    }
    variant?: {
      name: string
    }
    quantity: number
    price: number
  }[]
}

export default function OrderSuccess() {
  const { orderNumber } = useParams<{ orderNumber: string }>()

  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ['order', orderNumber],
    queryFn: async () => {
      const response = await api.get(`/orders/${orderNumber}`)
      return response.data.data
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark-900 mb-2">Order not found</h1>
          <p className="text-dark-500 mb-4">We couldn't find this order.</p>
          <Link to="/" className="btn btn-primary">Go Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="bg-white rounded-xl shadow-sm p-8 text-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-dark-900 mb-2">Thank You for Your Order!</h1>
            <p className="text-dark-500 mb-4">
              Your order has been placed successfully. We'll send you an email confirmation shortly.
            </p>
            <div className="inline-block bg-dark-100 rounded-lg px-6 py-3">
              <p className="text-sm text-dark-500">Order Number</p>
              <p className="text-2xl font-bold text-dark-900">{order.order_number}</p>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="p-4 bg-dark-50 border-b flex items-center justify-between">
              <h2 className="font-semibold text-dark-900">Order Details</h2>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 text-sm text-dark-600 hover:text-dark-900"
              >
                <PrinterIcon className="w-4 h-4" />
                Print
              </button>
            </div>

            {/* Items */}
            <div className="p-4 divide-y">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="w-16 h-16 bg-dark-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product.primary_image ? (
                      <img
                        src={item.product.primary_image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-dark-400 text-xs">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-dark-900">{item.product.name}</p>
                    {item.variant && (
                      <p className="text-sm text-dark-500">{item.variant.name}</p>
                    )}
                    <p className="text-sm text-dark-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-dark-900">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="p-4 bg-dark-50 border-t">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-dark-500">Subtotal</span>
                  <span className="text-dark-900">{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-dark-500">Shipping</span>
                  <span className="text-dark-900">
                    {order.shipping_cost === 0 ? 'FREE' : formatPrice(order.shipping_cost)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold text-dark-900">Total</span>
                  <span className="text-xl font-bold text-dark-900">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping & Payment Info */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-dark-900 mb-3 flex items-center gap-2">
                <TruckIcon className="w-5 h-5" />
                Shipping Address
              </h3>
              <p className="text-dark-900 font-medium">{order.shipping_name}</p>
              <p className="text-dark-600">{order.shipping_phone}</p>
              <p className="text-dark-600 mt-2">{order.shipping_address}</p>
              <p className="text-dark-600">{order.shipping_city}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-dark-900 mb-3">Payment Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-dark-500">Method</span>
                  <span className="text-dark-900 capitalize">{order.payment_method.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-500">Status</span>
                  <span className={`capitalize ${
                    order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {order.payment_status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-500">Order Date</span>
                  <span className="text-dark-900">{formatDate(order.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-primary-50 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-dark-900 mb-3">What's Next?</h3>
            <div className="space-y-2 text-dark-600">
              <p>1. You will receive an order confirmation email shortly.</p>
              <p>2. Once your order is shipped, we'll send you tracking details.</p>
              <p>3. For COD orders, please have exact change ready at delivery.</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/account/orders" className="btn btn-primary px-8">
              Track Order
            </Link>
            <Link to="/shop" className="btn btn-dark-outline px-8">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
