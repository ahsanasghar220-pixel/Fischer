import { Link } from 'react-router-dom'
import { ArrowLeftIcon, PrinterIcon } from '@heroicons/react/24/outline'
import { formatDate } from '@/lib/utils'
import { statusConfig } from './types'
import type { Order } from './types'

interface OrderHeaderProps {
  order: Order
  onPrint: () => void
  onUpdateStatus: () => void
}

function getNextStatuses(currentStatus: string): string[] {
  const flow: Record<string, string[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
  }
  return flow[currentStatus] || []
}

export default function OrderHeader({ order, onPrint, onUpdateStatus }: OrderHeaderProps) {
  const nextStatuses = getNextStatuses(order.status)

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-4">
        <Link
          to="/admin/orders"
          className="p-2 text-dark-400 hover:text-dark-600 dark:hover:text-dark-200 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg shrink-0"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-dark-900 dark:text-white">
            Order #{order.order_number}
          </h1>
          <p className="text-dark-500 dark:text-dark-400">
            Placed on {formatDate(order.created_at)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 pl-12 sm:pl-0">
        <button
          onClick={onPrint}
          className="flex items-center gap-2 px-3 py-2 sm:px-4 border border-dark-200 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 text-sm"
        >
          <PrinterIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Print Invoice</span>
          <span className="sm:hidden">Print</span>
        </button>
        {nextStatuses.length > 0 && (
          <button
            onClick={onUpdateStatus}
            className="btn btn-primary text-sm"
          >
            Update Status
          </button>
        )}
      </div>
    </div>
  )
}

export { getNextStatuses, statusConfig }
