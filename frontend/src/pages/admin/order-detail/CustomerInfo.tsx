import { Link } from 'react-router-dom'
import {
  UserIcon,
  MapPinIcon,
  CreditCardIcon,
  TruckIcon,
  EnvelopeIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline'
import { paymentStatusConfig } from './types'
import type { Order } from './types'

interface CustomerInfoProps {
  order: Order
  onUpdatePayment: (status: string) => void
  onAddTracking?: () => void
}

export default function CustomerInfo({ order, onUpdatePayment }: CustomerInfoProps) {
  return (
    <div className="space-y-6">
      {/* Customer */}
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
              onChange={(e) => onUpdatePayment(e.target.value)}
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
  )
}

export { paymentStatusConfig }
