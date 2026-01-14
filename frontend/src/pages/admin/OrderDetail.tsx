import { useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeftIcon,
  PrinterIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CreditCardIcon,
  MapPinIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import api from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

interface OrderItem {
  id: number
  product_id: number
  product_name: string
  product_sku: string
  product_image?: string
  variant_attributes?: string
  quantity: number
  unit_price: string
  total_price: string
  product?: {
    id: number
    name: string
    slug: string
    sku: string
  }
}

interface Order {
  id: number
  order_number: string
  user_id?: number
  status: string
  payment_status: string
  payment_method: string
  subtotal: string
  shipping_cost: string
  discount: string
  tax: string
  total: string
  currency: string
  shipping_first_name: string
  shipping_last_name: string
  shipping_email: string
  shipping_phone: string
  shipping_address_line_1: string
  shipping_address_line_2?: string
  shipping_city: string
  shipping_state?: string
  shipping_postal_code?: string
  shipping_country: string
  billing_first_name?: string
  billing_last_name?: string
  billing_address_line_1?: string
  billing_city?: string
  customer_notes?: string
  admin_notes?: string
  tracking_number?: string
  tracking_url?: string
  courier?: string
  shipped_at?: string
  delivered_at?: string
  cancelled_at?: string
  created_at: string
  updated_at: string
  items: OrderItem[]
  user?: {
    id: number
    first_name: string
    last_name: string
    email: string
    phone?: string
  }
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: ClockIcon },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: CheckCircleIcon },
  processing: { label: 'Processing', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400', icon: ClockIcon },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', icon: TruckIcon },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircleIcon },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircleIcon },
}

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' },
}

export default function AdminOrderDetail() {
  const { orderNumber } = useParams<{ orderNumber: string }>()
  const queryClient = useQueryClient()
  const printRef = useRef<HTMLDivElement>(null)

  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showTrackingModal, setShowTrackingModal] = useState(false)
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [trackingData, setTrackingData] = useState({ tracking_number: '', tracking_url: '', courier: '' })
  const [adminNotes, setAdminNotes] = useState('')

  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ['admin-order', orderNumber],
    queryFn: async () => {
      // First try by order_number, then by id
      try {
        const response = await api.get(`/admin/orders/${orderNumber}`)
        return response.data.data.data || response.data.data
      } catch {
        // If that fails, try finding by order number in the list
        const listResponse = await api.get(`/admin/orders?search=${orderNumber}`)
        const orders = listResponse.data.data.data
        if (orders && orders.length > 0) {
          const matchingOrder = orders.find((o: Order) => o.order_number === orderNumber)
          if (matchingOrder) {
            const detailResponse = await api.get(`/admin/orders/${matchingOrder.id}`)
            return detailResponse.data.data.data || detailResponse.data.data
          }
        }
        throw new Error('Order not found')
      }
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      await api.post(`/admin/orders/${order?.id}/status`, { status })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-order', orderNumber] })
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      toast.success('Order status updated')
      setShowStatusModal(false)
    },
    onError: () => {
      toast.error('Failed to update status')
    },
  })

  const updateTrackingMutation = useMutation({
    mutationFn: async (data: typeof trackingData) => {
      await api.post(`/admin/orders/${order?.id}/tracking`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-order', orderNumber] })
      toast.success('Tracking information updated')
      setShowTrackingModal(false)
    },
    onError: () => {
      toast.error('Failed to update tracking')
    },
  })

  const updateNotesMutation = useMutation({
    mutationFn: async (notes: string) => {
      await api.put(`/admin/orders/${order?.id}`, { admin_notes: notes })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-order', orderNumber] })
      toast.success('Notes saved')
      setShowNotesModal(false)
    },
    onError: () => {
      toast.error('Failed to save notes')
    },
  })

  const updatePaymentMutation = useMutation({
    mutationFn: async (payment_status: string) => {
      await api.put(`/admin/orders/${order?.id}`, { payment_status })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-order', orderNumber] })
      toast.success('Payment status updated')
    },
    onError: () => {
      toast.error('Failed to update payment status')
    },
  })

  const handlePrint = () => {
    const printContent = printRef.current
    if (!printContent) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${order?.order_number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
          .header h1 { font-size: 24px; margin-bottom: 5px; }
          .header p { color: #666; }
          .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .invoice-info div { flex: 1; }
          .invoice-info h3 { font-size: 14px; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          .invoice-info p { margin: 3px 0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background: #f5f5f5; font-weight: bold; }
          .text-right { text-align: right; }
          .totals { width: 300px; margin-left: auto; }
          .totals td { border: none; padding: 5px 10px; }
          .totals .total-row { font-weight: bold; font-size: 14px; border-top: 2px solid #000; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Fischer Pakistan</h1>
          <p>Quality Home Appliances</p>
          <p>Invoice #${order?.order_number}</p>
        </div>

        <div class="invoice-info">
          <div>
            <h3>Bill To</h3>
            <p><strong>${order?.shipping_first_name} ${order?.shipping_last_name}</strong></p>
            <p>${order?.shipping_address_line_1}</p>
            ${order?.shipping_address_line_2 ? `<p>${order.shipping_address_line_2}</p>` : ''}
            <p>${order?.shipping_city}${order?.shipping_state ? `, ${order.shipping_state}` : ''} ${order?.shipping_postal_code || ''}</p>
            <p>Phone: ${order?.shipping_phone}</p>
            <p>Email: ${order?.shipping_email}</p>
          </div>
          <div style="text-align: right;">
            <h3>Invoice Details</h3>
            <p><strong>Invoice #:</strong> ${order?.order_number}</p>
            <p><strong>Date:</strong> ${order?.created_at ? new Date(order.created_at).toLocaleDateString() : ''}</p>
            <p><strong>Payment:</strong> ${order?.payment_method?.toUpperCase()}</p>
            <p><strong>Status:</strong> ${order?.status?.toUpperCase()}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>SKU</th>
              <th class="text-right">Qty</th>
              <th class="text-right">Unit Price</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order?.items?.map(item => `
              <tr>
                <td>${item.product_name || item.product?.name || 'Product'}</td>
                <td>${item.product_sku || item.product?.sku || '-'}</td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">Rs. ${parseFloat(item.unit_price).toLocaleString()}</td>
                <td class="text-right">Rs. ${parseFloat(item.total_price).toLocaleString()}</td>
              </tr>
            `).join('') || ''}
          </tbody>
        </table>

        <table class="totals">
          <tr>
            <td>Subtotal:</td>
            <td class="text-right">Rs. ${parseFloat(order?.subtotal || '0').toLocaleString()}</td>
          </tr>
          <tr>
            <td>Shipping:</td>
            <td class="text-right">Rs. ${parseFloat(order?.shipping_cost || '0').toLocaleString()}</td>
          </tr>
          ${parseFloat(order?.discount || '0') > 0 ? `
          <tr>
            <td>Discount:</td>
            <td class="text-right">-Rs. ${parseFloat(order?.discount || '0').toLocaleString()}</td>
          </tr>
          ` : ''}
          <tr class="total-row">
            <td>Total:</td>
            <td class="text-right">Rs. ${parseFloat(order?.total || '0').toLocaleString()}</td>
          </tr>
        </table>

        <div class="footer">
          <p>Thank you for shopping with Fischer Pakistan!</p>
          <p>For support, contact us at support@fischer.com.pk</p>
        </div>
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="text-center py-12">
        <p className="text-dark-500 dark:text-dark-400">Order not found</p>
        <Link to="/admin/orders" className="text-primary-600 hover:underline mt-2 inline-block">
          Back to Orders
        </Link>
      </div>
    )
  }

  const status = statusConfig[order.status] || statusConfig.pending
  const paymentStatus = paymentStatusConfig[order.payment_status] || paymentStatusConfig.pending
  const StatusIcon = status.icon

  const getNextStatuses = () => {
    const flow: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: [],
    }
    return flow[order.status] || []
  }

  return (
    <div className="space-y-6" ref={printRef}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/orders"
            className="p-2 text-dark-400 hover:text-dark-600 dark:hover:text-dark-200 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-dark-900 dark:text-white">
              Order #{order.order_number}
            </h1>
            <p className="text-dark-500 dark:text-dark-400">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700"
          >
            <PrinterIcon className="w-5 h-5" />
            Print Invoice
          </button>
          {getNextStatuses().length > 0 && (
            <button
              onClick={() => setShowStatusModal(true)}
              className="btn btn-primary"
            >
              Update Status
            </button>
          )}
        </div>
      </div>

      {/* Status Banner */}
      <div className={`rounded-xl p-4 flex items-center justify-between ${status.color}`}>
        <div className="flex items-center gap-3">
          <StatusIcon className="w-6 h-6" />
          <div>
            <p className="font-semibold">Order Status: {status.label}</p>
            {order.tracking_number && (
              <p className="text-sm opacity-80">Tracking: {order.tracking_number}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${paymentStatus.color}`}>
            Payment: {paymentStatus.label}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm">
            <div className="p-4 border-b border-dark-200 dark:border-dark-700">
              <h2 className="font-semibold text-dark-900 dark:text-white">Order Items</h2>
            </div>
            <div className="divide-y divide-dark-200 dark:divide-dark-700">
              {order.items?.map((item) => (
                <div key={item.id} className="p-4 flex gap-4">
                  <div className="w-16 h-16 bg-dark-100 dark:bg-dark-700 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product_image ? (
                      <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-dark-400 text-xs">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-dark-900 dark:text-white">
                      {item.product_name || item.product?.name}
                    </p>
                    <p className="text-sm text-dark-500 dark:text-dark-400">
                      SKU: {item.product_sku || item.product?.sku || '-'}
                    </p>
                    {item.variant_attributes && (
                      <p className="text-sm text-dark-500 dark:text-dark-400">{item.variant_attributes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-dark-900 dark:text-white">
                      {formatPrice(parseFloat(item.unit_price))} x {item.quantity}
                    </p>
                    <p className="font-semibold text-dark-900 dark:text-white">
                      {formatPrice(parseFloat(item.total_price))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {/* Totals */}
            <div className="p-4 border-t border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-900/50">
              <div className="max-w-xs ml-auto space-y-2">
                <div className="flex justify-between text-dark-600 dark:text-dark-400">
                  <span>Subtotal</span>
                  <span>{formatPrice(parseFloat(order.subtotal))}</span>
                </div>
                <div className="flex justify-between text-dark-600 dark:text-dark-400">
                  <span>Shipping</span>
                  <span>{formatPrice(parseFloat(order.shipping_cost))}</span>
                </div>
                {parseFloat(order.discount) > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount</span>
                    <span>-{formatPrice(parseFloat(order.discount))}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg text-dark-900 dark:text-white pt-2 border-t border-dark-200 dark:border-dark-700">
                  <span>Total</span>
                  <span>{formatPrice(parseFloat(order.total))}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Notes */}
          {order.customer_notes && (
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-dark-900 dark:text-white mb-2 flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5" />
                Customer Notes
              </h3>
              <p className="text-dark-600 dark:text-dark-400">{order.customer_notes}</p>
            </div>
          )}

          {/* Admin Notes */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-dark-900 dark:text-white flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5" />
                Admin Notes
              </h3>
              <button
                onClick={() => {
                  setAdminNotes(order.admin_notes || '')
                  setShowNotesModal(true)
                }}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                {order.admin_notes ? 'Edit' : 'Add Notes'}
              </button>
            </div>
            {order.admin_notes ? (
              <p className="text-dark-600 dark:text-dark-400">{order.admin_notes}</p>
            ) : (
              <p className="text-dark-400 dark:text-dark-500 italic">No admin notes</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-dark-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {order.status === 'processing' && (
                <button
                  onClick={() => {
                    setTrackingData({
                      tracking_number: order.tracking_number || '',
                      tracking_url: order.tracking_url || '',
                      courier: order.courier || '',
                    })
                    setShowTrackingModal(true)
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30"
                >
                  <TruckIcon className="w-5 h-5" />
                  Add Tracking & Ship
                </button>
              )}
              {order.payment_status === 'pending' && order.payment_method === 'cod' && order.status === 'delivered' && (
                <button
                  onClick={() => updatePaymentMutation.mutate('paid')}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30"
                >
                  <CreditCardIcon className="w-5 h-5" />
                  Mark as Paid (COD Collected)
                </button>
              )}
              <button
                onClick={handlePrint}
                className="w-full flex items-center gap-2 px-4 py-2 bg-dark-50 dark:bg-dark-700 text-dark-700 dark:text-dark-300 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-600"
              >
                <PrinterIcon className="w-5 h-5" />
                Print Invoice
              </button>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-dark-900 dark:text-white mb-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Customer
            </h3>
            <div className="space-y-3">
              <p className="font-medium text-dark-900 dark:text-white">
                {order.user?.first_name} {order.user?.last_name || `${order.shipping_first_name} ${order.shipping_last_name}`}
              </p>
              <div className="flex items-center gap-2 text-dark-600 dark:text-dark-400">
                <EnvelopeIcon className="w-4 h-4" />
                <span className="text-sm">{order.user?.email || order.shipping_email}</span>
              </div>
              <div className="flex items-center gap-2 text-dark-600 dark:text-dark-400">
                <PhoneIcon className="w-4 h-4" />
                <span className="text-sm">{order.user?.phone || order.shipping_phone}</span>
              </div>
              {order.user_id && (
                <Link
                  to={`/admin/customers/${order.user_id}`}
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  View Customer Profile →
                </Link>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-dark-900 dark:text-white mb-4 flex items-center gap-2">
              <MapPinIcon className="w-5 h-5" />
              Shipping Address
            </h3>
            <div className="text-dark-600 dark:text-dark-400 space-y-1">
              <p className="font-medium text-dark-900 dark:text-white">
                {order.shipping_first_name} {order.shipping_last_name}
              </p>
              <p>{order.shipping_address_line_1}</p>
              {order.shipping_address_line_2 && <p>{order.shipping_address_line_2}</p>}
              <p>
                {order.shipping_city}
                {order.shipping_state && `, ${order.shipping_state}`}
                {order.shipping_postal_code && ` ${order.shipping_postal_code}`}
              </p>
              <p>{order.shipping_country}</p>
              <p className="pt-2">{order.shipping_phone}</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-dark-900 dark:text-white mb-4 flex items-center gap-2">
              <CreditCardIcon className="w-5 h-5" />
              Payment
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-dark-600 dark:text-dark-400">Method</span>
                <span className="font-medium text-dark-900 dark:text-white capitalize">
                  {order.payment_method?.replace('_', ' ') || 'COD'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-dark-600 dark:text-dark-400">Status</span>
                <select
                  value={order.payment_status}
                  onChange={(e) => updatePaymentMutation.mutate(e.target.value)}
                  className="px-2 py-1 text-sm border border-dark-200 dark:border-dark-600 rounded bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tracking Info */}
          {order.tracking_number && (
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-dark-900 dark:text-white mb-4 flex items-center gap-2">
                <TruckIcon className="w-5 h-5" />
                Tracking
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-dark-600 dark:text-dark-400">Courier</span>
                  <span className="text-dark-900 dark:text-white">{order.courier || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-600 dark:text-dark-400">Tracking #</span>
                  <span className="text-dark-900 dark:text-white">{order.tracking_number}</span>
                </div>
                {order.tracking_url && (
                  <a
                    href={order.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline block"
                  >
                    Track Package →
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Update Order Status</h3>
            <div className="space-y-3">
              {getNextStatuses().map((statusOption) => (
                <button
                  key={statusOption}
                  onClick={() => setNewStatus(statusOption)}
                  className={`w-full p-3 rounded-lg border text-left ${
                    newStatus === statusOption
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-dark-200 dark:border-dark-600 hover:bg-dark-50 dark:hover:bg-dark-700'
                  }`}
                >
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusConfig[statusOption]?.color}`}>
                    {statusConfig[statusOption]?.label}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700"
              >
                Cancel
              </button>
              <button
                onClick={() => newStatus && updateStatusMutation.mutate(newStatus)}
                disabled={!newStatus || updateStatusMutation.isPending}
                className="flex-1 btn btn-primary disabled:opacity-50"
              >
                {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {showTrackingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Add Tracking Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Courier</label>
                <input
                  type="text"
                  value={trackingData.courier}
                  onChange={(e) => setTrackingData({ ...trackingData, courier: e.target.value })}
                  placeholder="e.g., TCS, Leopards, M&P"
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Tracking Number *</label>
                <input
                  type="text"
                  value={trackingData.tracking_number}
                  onChange={(e) => setTrackingData({ ...trackingData, tracking_number: e.target.value })}
                  placeholder="Enter tracking number"
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Tracking URL</label>
                <input
                  type="url"
                  value={trackingData.tracking_url}
                  onChange={(e) => setTrackingData({ ...trackingData, tracking_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setShowTrackingModal(false)}
                className="flex-1 px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateTrackingMutation.mutate(trackingData)
                  // Also update status to shipped
                  updateStatusMutation.mutate('shipped')
                }}
                disabled={!trackingData.tracking_number || updateTrackingMutation.isPending}
                className="flex-1 btn btn-primary disabled:opacity-50"
              >
                {updateTrackingMutation.isPending ? 'Saving...' : 'Save & Mark Shipped'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Admin Notes</h3>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={4}
              placeholder="Add internal notes about this order..."
              className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white resize-none"
            />
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => setShowNotesModal(false)}
                className="flex-1 px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700"
              >
                Cancel
              </button>
              <button
                onClick={() => updateNotesMutation.mutate(adminNotes)}
                disabled={updateNotesMutation.isPending}
                className="flex-1 btn btn-primary disabled:opacity-50"
              >
                {updateNotesMutation.isPending ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
