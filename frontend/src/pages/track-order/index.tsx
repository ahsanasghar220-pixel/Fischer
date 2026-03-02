import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MagnifyingGlassIcon, TruckIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { formatPrice, formatDate } from '@/lib/utils'
import api from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface TrackingData {
  order_number: string
  status: string
  payment_status: string
  tracking_number: string | null
  courier_name: string | null
  shipping_city: string
  created_at: string
  shipped_at: string | null
  delivered_at: string | null
  items_count: number
  total: number
  history: {
    status: string
    status_label: string
    notes: string | null
    created_at: string
  }[]
}

const STATUS_CONFIG: Record<string, { color: string; icon: typeof CheckCircleIcon; label: string }> = {
  pending: { color: 'text-yellow-500', icon: ClockIcon, label: 'Pending' },
  confirmed: { color: 'text-blue-500', icon: CheckCircleIcon, label: 'Confirmed' },
  processing: { color: 'text-blue-600', icon: ClockIcon, label: 'Processing' },
  shipped: { color: 'text-purple-500', icon: TruckIcon, label: 'Shipped' },
  out_for_delivery: { color: 'text-indigo-500', icon: TruckIcon, label: 'Out for Delivery' },
  delivered: { color: 'text-green-500', icon: CheckCircleIcon, label: 'Delivered' },
  cancelled: { color: 'text-red-500', icon: XCircleIcon, label: 'Cancelled' },
  returned: { color: 'text-orange-500', icon: XCircleIcon, label: 'Returned' },
  refunded: { color: 'text-gray-500', icon: XCircleIcon, label: 'Refunded' },
  pending_payment: { color: 'text-yellow-500', icon: ClockIcon, label: 'Pending Payment' },
}

const TIMELINE_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']

export default function TrackOrder() {
  const [searchParams] = useSearchParams()
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '')
  const [searchTrigger, setSearchTrigger] = useState(searchParams.get('order') || '')

  const { data, isLoading, isError, error } = useQuery<TrackingData>({
    queryKey: ['track-order', searchTrigger],
    queryFn: async () => {
      const response = await api.get(`/api/orders/${searchTrigger}/track`)
      return response.data.data
    },
    enabled: !!searchTrigger,
    retry: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (orderNumber.trim()) {
      setSearchTrigger(orderNumber.trim())
    }
  }

  const statusConfig = data ? (STATUS_CONFIG[data.status] || STATUS_CONFIG.pending) : null
  const currentStepIndex = data ? TIMELINE_STEPS.indexOf(data.status) : -1
  const isCancelled = data?.status === 'cancelled' || data?.status === 'returned' || data?.status === 'refunded'

  return (
    <div className="min-h-[70vh] py-10 md:py-16">
      <div className="container-xl max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary-500/10 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TruckIcon className="w-8 h-8 text-primary-500" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-dark-900 dark:text-white mb-2">
            Track Your Order
          </h1>
          <p className="text-dark-500 dark:text-dark-400">
            Enter your order number to see the latest status
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="mb-10">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. ORD-20260302-XXXX"
                className="w-full pl-12 pr-4 py-4 border-2 border-dark-200 dark:border-dark-600 rounded-xl bg-white dark:bg-dark-800 text-dark-900 dark:text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base"
              />
            </div>
            <button
              type="submit"
              disabled={!orderNumber.trim() || isLoading}
              className="px-6 md:px-8 py-4 bg-primary-500 hover:bg-primary-600 text-dark-900 font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Track'}
            </button>
          </div>
        </form>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" />
            <p className="text-dark-500 dark:text-dark-400 mt-4">Looking up your order...</p>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="text-center py-12 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-800">
            <XCircleIcon className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-1">Order Not Found</h3>
            <p className="text-dark-500 dark:text-dark-400 text-sm">
              {(error as Error & { response?: { status?: number } })?.response?.status === 404
                ? 'No order found with that number. Please check and try again.'
                : 'Something went wrong. Please try again.'}
            </p>
          </div>
        )}

        {/* Results */}
        {data && statusConfig && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-dark-200/50 dark:border-dark-700/50 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm text-dark-500 dark:text-dark-400 mb-1">Order Number</p>
                  <p className="text-xl font-bold text-dark-900 dark:text-white">{data.order_number}</p>
                </div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${
                  data.status === 'delivered' ? 'bg-green-100 dark:bg-green-900/30' :
                  isCancelled ? 'bg-red-100 dark:bg-red-900/30' :
                  'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                  <statusConfig.icon className={`w-5 h-5 ${statusConfig.color}`} />
                  <span className={`font-semibold ${statusConfig.color}`}>{statusConfig.label}</span>
                </div>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-dark-500 dark:text-dark-400">Items</p>
                  <p className="font-semibold text-dark-900 dark:text-white">{data.items_count}</p>
                </div>
                <div>
                  <p className="text-dark-500 dark:text-dark-400">Total</p>
                  <p className="font-semibold text-dark-900 dark:text-white">{formatPrice(data.total)}</p>
                </div>
                <div>
                  <p className="text-dark-500 dark:text-dark-400">City</p>
                  <p className="font-semibold text-dark-900 dark:text-white">{data.shipping_city}</p>
                </div>
                <div>
                  <p className="text-dark-500 dark:text-dark-400">Placed</p>
                  <p className="font-semibold text-dark-900 dark:text-white">{formatDate(data.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Progress Timeline */}
            {!isCancelled && (
              <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-dark-200/50 dark:border-dark-700/50 p-6">
                <h3 className="font-bold text-dark-900 dark:text-white mb-6">Order Progress</h3>
                <div className="flex items-center justify-between relative">
                  {/* Progress Line */}
                  <div className="absolute top-4 left-0 right-0 h-0.5 bg-dark-200 dark:bg-dark-600" />
                  <div
                    className="absolute top-4 left-0 h-0.5 bg-primary-500 transition-all duration-500"
                    style={{ width: `${Math.max(0, currentStepIndex) / (TIMELINE_STEPS.length - 1) * 100}%` }}
                  />

                  {TIMELINE_STEPS.map((step, index) => {
                    const isCompleted = index <= currentStepIndex
                    const isCurrent = index === currentStepIndex
                    const config = STATUS_CONFIG[step]

                    return (
                      <div key={step} className="relative flex flex-col items-center z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                          isCompleted
                            ? 'bg-primary-500 border-primary-500'
                            : 'bg-white dark:bg-dark-800 border-dark-300 dark:border-dark-600'
                        } ${isCurrent ? 'ring-4 ring-primary-500/30' : ''}`}>
                          {isCompleted ? (
                            <CheckCircleIcon className="w-5 h-5 text-dark-900" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-dark-300 dark:bg-dark-500" />
                          )}
                        </div>
                        <span className={`mt-2 text-xs font-medium text-center ${
                          isCompleted ? 'text-primary-600 dark:text-primary-400' : 'text-dark-400 dark:text-dark-500'
                        }`}>
                          {config?.label || step}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Tracking Details */}
            {data.tracking_number && (
              <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-200 dark:border-blue-800 p-6">
                <h3 className="font-bold text-dark-900 dark:text-white mb-3 flex items-center gap-2">
                  <TruckIcon className="w-5 h-5 text-blue-500" />
                  Shipment Tracking
                </h3>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  {data.courier_name && (
                    <div>
                      <p className="text-dark-500 dark:text-dark-400">Courier</p>
                      <p className="font-semibold text-dark-900 dark:text-white">{data.courier_name}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-dark-500 dark:text-dark-400">Tracking Number</p>
                    <p className="font-semibold text-dark-900 dark:text-white font-mono">{data.tracking_number}</p>
                  </div>
                  {data.shipped_at && (
                    <div>
                      <p className="text-dark-500 dark:text-dark-400">Shipped On</p>
                      <p className="font-semibold text-dark-900 dark:text-white">{formatDate(data.shipped_at)}</p>
                    </div>
                  )}
                  {data.delivered_at && (
                    <div>
                      <p className="text-dark-500 dark:text-dark-400">Delivered On</p>
                      <p className="font-semibold text-dark-900 dark:text-white">{formatDate(data.delivered_at)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status History */}
            {data.history.length > 0 && (
              <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-dark-200/50 dark:border-dark-700/50 p-6">
                <h3 className="font-bold text-dark-900 dark:text-white mb-4">Status History</h3>
                <div className="space-y-4">
                  {data.history.map((entry, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-primary-500' : 'bg-dark-300 dark:bg-dark-600'}`} />
                        {index < data.history.length - 1 && (
                          <div className="w-px flex-1 bg-dark-200 dark:bg-dark-600 mt-1" />
                        )}
                      </div>
                      <div className="pb-4">
                        <p className="font-medium text-dark-900 dark:text-white">{entry.status_label}</p>
                        {entry.notes && (
                          <p className="text-sm text-dark-500 dark:text-dark-400 mt-0.5">{entry.notes}</p>
                        )}
                        <p className="text-xs text-dark-400 dark:text-dark-500 mt-1">
                          {formatDate(entry.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Info */}
            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-dark-200/50 dark:border-dark-700/50 p-6">
              <div className="flex items-center justify-between">
                <span className="text-dark-500 dark:text-dark-400">Payment Status</span>
                <span className={`px-3 py-1 rounded-lg text-sm font-semibold capitalize ${
                  data.payment_status === 'paid'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                }`}>
                  {data.payment_status}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
