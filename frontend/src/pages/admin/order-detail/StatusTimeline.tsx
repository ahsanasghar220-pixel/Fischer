import {
  TruckIcon,
  CreditCardIcon,
  PrinterIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import { statusConfig, paymentStatusConfig } from './types'
import type { Order } from './types'

interface StatusTimelineProps {
  order: Order
  onPrint: () => void
  onUpdateStatus: () => void
  onAddTracking: () => void
  onEditNotes: () => void
  onUpdatePayment: (status: string) => void
  adminNotes: string
}

export default function StatusTimeline({
  order,
  onPrint,
  onAddTracking,
  onEditNotes,
  onUpdatePayment,
}: StatusTimelineProps) {
  const status = statusConfig[order.status] || statusConfig.pending
  const paymentStatus = paymentStatusConfig[order.payment_status] || paymentStatusConfig.pending
  const StatusIcon = status.icon

  return (
    <>
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

      {/* Quick Actions Sidebar Card */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-4">
        <h3 className="font-semibold text-dark-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="space-y-2">
          {order.status === 'processing' && (
            <button
              onClick={onAddTracking}
              className="w-full flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30"
            >
              <TruckIcon className="w-5 h-5" />
              Add Tracking & Ship
            </button>
          )}
          {order.payment_status === 'pending' && order.payment_method === 'cod' && order.status === 'delivered' && (
            <button
              onClick={() => onUpdatePayment('paid')}
              className="w-full flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30"
            >
              <CreditCardIcon className="w-5 h-5" />
              Mark as Paid (COD Collected)
            </button>
          )}
          <button
            onClick={onPrint}
            className="w-full flex items-center gap-2 px-4 py-2 bg-dark-50 dark:bg-dark-700 text-dark-700 dark:text-dark-300 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-600"
          >
            <PrinterIcon className="w-5 h-5" />
            Print Invoice
          </button>
        </div>
      </div>

      {/* Admin Notes Card */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-dark-900 dark:text-white flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5" />
            Admin Notes
          </h3>
          <button
            onClick={onEditNotes}
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
    </>
  )
}
