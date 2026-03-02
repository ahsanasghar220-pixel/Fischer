import { useState } from 'react'
import { MagnifyingGlassIcon, ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline'
import api from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { formatDate } from '@/lib/utils'

interface ComplaintTrackData {
  reference: string
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed'
  category: string
  created_at: string
  resolved_at: string | null
  updated_at: string
}

const CATEGORY_LABELS: Record<string, string> = {
  defect: 'Product Defect',
  delivery: 'Delivery Issue',
  service: 'Service Request',
  billing: 'Billing Issue',
  other: 'Other',
}

const STATUS_CONFIG: Record<string, { label: string; icon: typeof CheckCircleIcon; badgeClass: string; message: string }> = {
  open: {
    label: 'Open',
    icon: ClockIcon,
    badgeClass: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800',
    message: 'Your complaint has been received and is in our queue.',
  },
  assigned: {
    label: 'Assigned',
    icon: ClockIcon,
    badgeClass: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800',
    message: 'Your complaint has been assigned to our team.',
  },
  in_progress: {
    label: 'In Progress',
    icon: ClockIcon,
    badgeClass: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
    message: 'Our team is actively working on your complaint.',
  },
  resolved: {
    label: 'Resolved',
    icon: CheckCircleIcon,
    badgeClass: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800',
    message: 'Your complaint has been resolved.',
  },
  closed: {
    label: 'Closed',
    icon: XCircleIcon,
    badgeClass: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700',
    message: 'This complaint has been closed.',
  },
}

export default function TrackComplaint() {
  const [reference, setReference] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ComplaintTrackData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ref = reference.trim().toUpperCase()
    if (!ref) return

    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await api.get(`/api/complaints/track/${ref}`)
      setResult(response.data.data)
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setError('Complaint not found. Please check your reference number.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const statusConfig = result ? (STATUS_CONFIG[result.status] || STATUS_CONFIG.open) : null
  const categoryLabel = result ? (CATEGORY_LABELS[result.category] || result.category) : ''

  return (
    <div className="min-h-[70vh] py-10 md:py-16">
      <div className="container-xl max-w-lg mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-500 dark:text-red-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-dark-900 dark:text-white mb-2">
            Track Your Complaint
          </h1>
          <p className="text-dark-500 dark:text-dark-400">
            Enter your complaint reference number to check the status
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="mb-10">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="CPL-2026-00089"
                className="w-full pl-12 pr-4 py-4 border-2 border-dark-200 dark:border-dark-600 rounded-xl bg-white dark:bg-dark-800 text-dark-900 dark:text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-base font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={!reference.trim() || loading}
              className="px-6 md:px-8 py-4 bg-primary-500 hover:bg-primary-600 text-dark-900 font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Track'}
            </button>
          </div>
        </form>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" />
            <p className="text-dark-500 dark:text-dark-400 mt-4">Looking up your complaint...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-10 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-800">
            <XCircleIcon className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-dark-900 dark:text-white mb-1">Not Found</h3>
            <p className="text-dark-500 dark:text-dark-400 text-sm">{error}</p>
          </div>
        )}

        {/* Result Card */}
        {result && statusConfig && (
          <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-dark-200/50 dark:border-dark-700/50 overflow-hidden">
            {/* Top accent bar based on status */}
            <div className={`h-1 w-full ${
              result.status === 'resolved' ? 'bg-green-500' :
              result.status === 'closed' ? 'bg-gray-400' :
              result.status === 'in_progress' ? 'bg-blue-500' :
              result.status === 'assigned' ? 'bg-orange-500' :
              'bg-red-500'
            }`} />

            <div className="p-6 space-y-5">
              {/* Reference + Status */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-dark-400 dark:text-dark-500 uppercase tracking-wide mb-1">Reference Number</p>
                  <p className="text-2xl font-bold text-dark-900 dark:text-white font-mono">{result.reference}</p>
                </div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold self-start ${statusConfig.badgeClass}`}>
                  <statusConfig.icon className="w-4 h-4" />
                  {statusConfig.label}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm border-t border-dark-100 dark:border-dark-700 pt-5">
                <div>
                  <p className="text-dark-400 dark:text-dark-500 text-xs uppercase tracking-wide mb-1">Category</p>
                  <p className="font-semibold text-dark-900 dark:text-white">{categoryLabel}</p>
                </div>
                <div>
                  <p className="text-dark-400 dark:text-dark-500 text-xs uppercase tracking-wide mb-1">Date Filed</p>
                  <p className="font-semibold text-dark-900 dark:text-white">{formatDate(result.created_at)}</p>
                </div>
                {result.resolved_at && (
                  <div className="col-span-2">
                    <p className="text-dark-400 dark:text-dark-500 text-xs uppercase tracking-wide mb-1">Resolved On</p>
                    <p className="font-semibold text-emerald-700 dark:text-emerald-400">{formatDate(result.resolved_at)}</p>
                  </div>
                )}
              </div>

              {/* Status Message */}
              <div className={`rounded-xl p-4 text-sm ${
                result.status === 'resolved' ? 'bg-green-50 dark:bg-green-900/10 text-green-800 dark:text-green-300' :
                result.status === 'closed' ? 'bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400' :
                result.status === 'in_progress' ? 'bg-blue-50 dark:bg-blue-900/10 text-blue-800 dark:text-blue-300' :
                result.status === 'assigned' ? 'bg-orange-50 dark:bg-orange-900/10 text-orange-800 dark:text-orange-300' :
                'bg-red-50 dark:bg-red-900/10 text-red-800 dark:text-red-300'
              }`}>
                {statusConfig.message}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
