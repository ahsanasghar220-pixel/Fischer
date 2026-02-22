import { useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DocumentTextIcon } from '@heroicons/react/24/outline'
import api from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import { statusConfig } from './types'
import type { Order } from './types'
import OrderHeader from './OrderHeader'
import OrderItems from './OrderItems'
import CustomerInfo from './CustomerInfo'
import StatusTimeline from './StatusTimeline'

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
        const response = await api.get(`/api/admin/orders/${orderNumber}`)
        return response.data.data.data || response.data.data
      } catch {
        // If that fails, try finding by order number in the list
        const listResponse = await api.get(`/api/admin/orders?search=${orderNumber}`)
        const orders = listResponse.data.data.data
        if (orders && orders.length > 0) {
          const matchingOrder = orders.find((o: Order) => o.order_number === orderNumber)
          if (matchingOrder) {
            const detailResponse = await api.get(`/api/admin/orders/${matchingOrder.id}`)
            return detailResponse.data.data.data || detailResponse.data.data
          }
        }
        throw new Error('Order not found')
      }
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      await api.post(`/api/admin/orders/${order?.id}/status`, { status })
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
      await api.post(`/api/admin/orders/${order?.id}/tracking`, data)
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
      await api.put(`/api/admin/orders/${order?.id}`, { admin_notes: notes })
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
      await api.put(`/api/admin/orders/${order?.id}`, { payment_status })
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
      <OrderHeader
        order={order}
        onPrint={handlePrint}
        onUpdateStatus={() => setShowStatusModal(true)}
      />

      {/* Status Banner + Quick Actions (sidebar-style) */}
      <StatusTimeline
        order={order}
        onPrint={handlePrint}
        onUpdateStatus={() => setShowStatusModal(true)}
        onAddTracking={() => {
          setTrackingData({
            tracking_number: order.tracking_number || '',
            tracking_url: order.tracking_url || '',
            courier: order.courier || '',
          })
          setShowTrackingModal(true)
        }}
        onEditNotes={() => {
          setAdminNotes(order.admin_notes || '')
          setShowNotesModal(true)
        }}
        onUpdatePayment={(status) => updatePaymentMutation.mutate(status)}
        adminNotes={adminNotes}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <OrderItems order={order} />

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
        </div>

        {/* Sidebar */}
        <CustomerInfo
          order={order}
          onUpdatePayment={(status) => updatePaymentMutation.mutate(status)}
          onAddTracking={() => {
            setTrackingData({
              tracking_number: order.tracking_number || '',
              tracking_url: order.tracking_url || '',
              courier: order.courier || '',
            })
            setShowTrackingModal(true)
          }}
        />
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
