import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { WrenchScrewdriverIcon, PlusIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface ServiceRequest {
  id: number
  ticket_number: string
  product_name: string
  product_model?: string
  serial_number?: string
  issue_type: string
  issue_description: string
  status: 'pending' | 'in_progress' | 'resolved' | 'closed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  created_at: string
  updated_at: string
  resolved_at?: string
}

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    icon: ClockIcon,
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    icon: WrenchScrewdriverIcon,
  },
  resolved: {
    label: 'Resolved',
    color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    icon: CheckCircleIcon,
  },
  closed: {
    label: 'Closed',
    color: 'bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-400',
    icon: CheckCircleIcon,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    icon: XCircleIcon,
  },
}

const priorityColors = {
  low: 'text-dark-500 dark:text-dark-400',
  medium: 'text-blue-600 dark:text-blue-400',
  high: 'text-orange-600 dark:text-orange-400',
  urgent: 'text-red-600 dark:text-red-400',
}

export default function MyServiceRequests() {
  const { data: requests, isLoading, error } = useQuery<ServiceRequest[]>({
    queryKey: ['my-service-requests'],
    queryFn: async () => {
      const response = await api.get('/api/account/service-requests')
      return response.data.data
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-12 text-center">
        <WrenchScrewdriverIcon className="w-16 h-16 mx-auto text-dark-300 dark:text-dark-600 mb-4" />
        <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">Unable to load service requests</h3>
        <p className="text-dark-500 dark:text-dark-400">Please try again later</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm">
        {/* Header */}
        <div className="p-4 border-b border-dark-200 dark:border-dark-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-dark-900 dark:text-white">My Service Requests</h2>
            <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
              Track and manage your product service requests
            </p>
          </div>
          <Link to="/service-request" className="btn btn-primary flex items-center gap-2">
            <PlusIcon className="w-5 h-5" />
            New Request
          </Link>
        </div>

        {/* Requests List */}
        {requests && requests.length > 0 ? (
          <div className="divide-y divide-dark-200 dark:divide-dark-700">
            {requests.map((request) => {
              const status = statusConfig[request.status]
              const StatusIcon = status.icon
              return (
                <div key={request.id} className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-dark-900 dark:text-white">
                          #{request.ticket_number}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                        <span className={`text-xs font-medium capitalize ${priorityColors[request.priority]}`}>
                          {request.priority} Priority
                        </span>
                      </div>
                      <h3 className="font-medium text-dark-900 dark:text-white">
                        {request.product_name}
                        {request.product_model && <span className="text-dark-500 dark:text-dark-400"> - {request.product_model}</span>}
                      </h3>
                      <p className="text-sm text-dark-600 dark:text-dark-400 mt-1">
                        <span className="font-medium">Issue:</span> {request.issue_type.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-dark-500 dark:text-dark-400 mt-1 line-clamp-2">
                        {request.issue_description}
                      </p>
                    </div>
                    <div className="text-sm text-dark-500 dark:text-dark-400 sm:text-right">
                      <p>Submitted</p>
                      <p className="text-dark-900 dark:text-white">{formatDate(request.created_at)}</p>
                      {request.resolved_at && (
                        <>
                          <p className="mt-2">Resolved</p>
                          <p className="text-green-600 dark:text-green-400">{formatDate(request.resolved_at)}</p>
                        </>
                      )}
                    </div>
                  </div>
                  {request.serial_number && (
                    <p className="text-xs text-dark-500 dark:text-dark-400 mt-2">
                      Serial: {request.serial_number}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <WrenchScrewdriverIcon className="w-16 h-16 mx-auto text-dark-300 dark:text-dark-600 mb-4" />
            <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">No service requests</h3>
            <p className="text-dark-500 dark:text-dark-400 mb-6">
              Need help with a product? Submit a service request and we'll assist you.
            </p>
            <Link to="/service-request" className="btn btn-primary">
              Submit Service Request
            </Link>
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-6">
        <h3 className="font-semibold text-dark-900 dark:text-white mb-2">Need Immediate Assistance?</h3>
        <p className="text-dark-600 dark:text-dark-400 text-sm mb-4">
          For urgent service matters, you can contact our support team directly.
        </p>
        <div className="flex flex-wrap gap-4">
          <a href="tel:+92423XXXXXXX" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
            Call: 042-3XXX-XXXX
          </a>
          <a href="mailto:service@fischer.com.pk" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
            Email: service@fischer.com.pk
          </a>
        </div>
      </div>
    </div>
  )
}
