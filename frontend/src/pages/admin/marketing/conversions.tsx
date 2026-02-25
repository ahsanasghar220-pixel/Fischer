import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  SignalIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  InboxIcon,
} from '@heroicons/react/24/outline'
import api from '@/lib/api'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ConversionLog {
  id: number
  platform: string
  event_type: string
  order_id: string | null
  payload: Record<string, unknown>
  response: Record<string, unknown>
  status: 'success' | 'failed' | 'pending'
  error_message: string | null
  created_at: string
}

interface Summary {
  total: number
  successful: number
  failed: number
  pending: number
  by_platform: Record<string, number>
}

interface ConversionsResponse {
  summary: Summary
  data: {
    data: ConversionLog[]
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

// ---------------------------------------------------------------------------
// Platform config
// ---------------------------------------------------------------------------

const PLATFORM_CONFIG: Record<string, { label: string; color: string; bgClass: string; textClass: string }> = {
  meta: {
    label: 'Meta',
    color: '#1877F2',
    bgClass: 'bg-[#1877F2]/10 dark:bg-[#1877F2]/20',
    textClass: 'text-[#1877F2]',
  },
  google_analytics: {
    label: 'GA4',
    color: '#F9AB00',
    bgClass: 'bg-[#F9AB00]/10 dark:bg-[#F9AB00]/20',
    textClass: 'text-[#d49200] dark:text-[#F9AB00]',
  },
  google_ads: {
    label: 'Google Ads',
    color: '#4285F4',
    bgClass: 'bg-[#4285F4]/10 dark:bg-[#4285F4]/20',
    textClass: 'text-[#4285F4]',
  },
  tiktok: {
    label: 'TikTok',
    color: '#00F2EA',
    bgClass: 'bg-[#00d4ce]/10 dark:bg-[#00F2EA]/20',
    textClass: 'text-[#00a8a3] dark:text-[#00F2EA]',
  },
  snapchat: {
    label: 'Snapchat',
    color: '#FFFC00',
    bgClass: 'bg-[#FFFC00]/10 dark:bg-[#FFFC00]/20',
    textClass: 'text-[#b5b200] dark:text-[#FFFC00]',
  },
  pinterest: {
    label: 'Pinterest',
    color: '#E60023',
    bgClass: 'bg-[#E60023]/10 dark:bg-[#E60023]/20',
    textClass: 'text-[#E60023]',
  },
}

const EVENT_TYPES = [
  'Purchase', 'AddToCart', 'PageView', 'ViewContent', 'InitiateCheckout',
  'CompleteRegistration', 'Search', 'AddPaymentInfo',
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString()
}

function getPlatformConfig(platform: string) {
  return PLATFORM_CONFIG[platform] || {
    label: platform,
    color: '#6B7280',
    bgClass: 'bg-dark-100 dark:bg-dark-700',
    textClass: 'text-dark-600 dark:text-dark-400',
  }
}

// ---------------------------------------------------------------------------
// Skeleton loaders
// ---------------------------------------------------------------------------

function SkeletonKPI() {
  return (
    <div className="bg-white dark:bg-dark-800 rounded-2xl border border-dark-200 dark:border-dark-700 shadow-sm p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-dark-200 dark:bg-dark-700" />
        <div className="h-3 w-20 bg-dark-200 dark:bg-dark-700 rounded" />
      </div>
      <div className="h-7 w-24 bg-dark-200 dark:bg-dark-700 rounded" />
    </div>
  )
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-dark-200 dark:bg-dark-700 rounded w-3/4" />
        </td>
      ))}
    </tr>
  )
}

// ---------------------------------------------------------------------------
// Expandable Row Detail
// ---------------------------------------------------------------------------

function RowDetail({ log }: { log: ConversionLog }) {
  return (
    <tr>
      <td colSpan={5} className="px-4 py-4 bg-dark-50/50 dark:bg-dark-900/50">
        <div className="grid md:grid-cols-2 gap-4 max-w-4xl">
          {/* Payload */}
          <div>
            <h4 className="text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wide mb-2">
              Request Payload
            </h4>
            <pre className="text-xs text-dark-700 dark:text-dark-300 bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-lg p-3 overflow-x-auto max-h-48">
              {JSON.stringify(log.payload, null, 2)}
            </pre>
          </div>

          {/* Response */}
          <div>
            <h4 className="text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wide mb-2">
              Response
            </h4>
            <pre className="text-xs text-dark-700 dark:text-dark-300 bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-lg p-3 overflow-x-auto max-h-48">
              {JSON.stringify(log.response, null, 2)}
            </pre>
          </div>

          {/* Error message */}
          {log.error_message && (
            <div className="md:col-span-2">
              <h4 className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wide mb-2">
                Error Message
              </h4>
              <div className="text-sm text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-3">
                {log.error_message}
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}

// ---------------------------------------------------------------------------
// Mini bar chart for platform breakdown
// ---------------------------------------------------------------------------

function PlatformBreakdown({ byPlatform }: { byPlatform: Record<string, number> }) {
  const entries = Object.entries(byPlatform).sort((a, b) => b[1] - a[1])
  const max = entries.length > 0 ? entries[0][1] : 1

  return (
    <div className="space-y-2">
      {entries.map(([platform, count]) => {
        const cfg = getPlatformConfig(platform)
        const pct = max > 0 ? (count / max) * 100 : 0
        return (
          <div key={platform} className="flex items-center gap-3">
            <span className="text-xs font-medium text-dark-600 dark:text-dark-400 w-20 truncate">
              {cfg.label}
            </span>
            <div className="flex-1 h-4 bg-dark-100 dark:bg-dark-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: cfg.color }}
              />
            </div>
            <span className="text-xs font-semibold text-dark-700 dark:text-dark-300 w-10 text-right">
              {count}
            </span>
          </div>
        )
      })}
      {entries.length === 0 && (
        <p className="text-xs text-dark-400 dark:text-dark-500">No data yet</p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function Conversions() {
  const [page, setPage] = useState(1)
  const [platformFilter, setPlatformFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [eventTypeFilter, setEventTypeFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [expandedRow, setExpandedRow] = useState<number | null>(null)

  const { data, isLoading } = useQuery<ConversionsResponse>({
    queryKey: ['conversion-logs', page, platformFilter, statusFilter, eventTypeFilter, dateFrom, dateTo],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      if (platformFilter) params.set('platform', platformFilter)
      if (statusFilter) params.set('status', statusFilter)
      if (eventTypeFilter) params.set('event_type', eventTypeFilter)
      if (dateFrom) params.set('from', dateFrom)
      if (dateTo) params.set('to', dateTo)
      const res = await api.get(`/api/admin/marketing/conversions?${params.toString()}`)
      return res.data
    },
  })

  const summary = data?.summary
  const logs = data?.data?.data || []
  const pagination = data?.data

  const successRate = summary && summary.total > 0
    ? ((summary.successful / summary.total) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Conversion Tracking</h1>
        <p className="text-dark-500 dark:text-dark-400 text-sm mt-1">
          Monitor server-side conversion events across all marketing platforms.
        </p>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonKPI key={i} />)}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Events */}
          <div className="bg-white dark:bg-dark-800 rounded-2xl border border-dark-200 dark:border-dark-700 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <SignalIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wide">Total Events</span>
            </div>
            <p className="text-2xl font-bold text-dark-900 dark:text-white">{summary.total.toLocaleString()}</p>
          </div>

          {/* Success Rate */}
          <div className="bg-white dark:bg-dark-800 rounded-2xl border border-dark-200 dark:border-dark-700 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wide">Success Rate</span>
            </div>
            <p className="text-2xl font-bold text-dark-900 dark:text-white">{successRate}%</p>
            {/* Ring progress */}
            <div className="mt-2 flex items-center gap-2">
              <svg className="w-6 h-6 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3"
                  className="text-dark-100 dark:text-dark-700" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3"
                  className="text-emerald-500"
                  strokeDasharray={`${parseFloat(successRate) * 0.88} 88`}
                  strokeLinecap="round" />
              </svg>
              <span className="text-xs text-dark-400 dark:text-dark-500">
                {summary.successful} of {summary.total}
              </span>
            </div>
          </div>

          {/* Failed */}
          <div className="bg-white dark:bg-dark-800 rounded-2xl border border-dark-200 dark:border-dark-700 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <span className="text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wide">Failed</span>
            </div>
            <p className="text-2xl font-bold text-dark-900 dark:text-white">{summary.failed.toLocaleString()}</p>
            <p className="text-xs text-dark-400 dark:text-dark-500 mt-1">
              {summary.pending} pending
            </p>
          </div>

          {/* Platform Breakdown */}
          <div className="bg-white dark:bg-dark-800 rounded-2xl border border-dark-200 dark:border-dark-700 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wide">By Platform</span>
            </div>
            <PlatformBreakdown byPlatform={summary.by_platform} />
          </div>
        </div>
      ) : null}

      {/* Filter bar */}
      <div className="bg-white dark:bg-dark-800 rounded-2xl border border-dark-200 dark:border-dark-700 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <select
            value={platformFilter}
            onChange={(e) => { setPlatformFilter(e.target.value); setPage(1) }}
            className="px-3 py-2 text-sm border border-dark-200 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-900 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Platforms</option>
            <option value="meta">Meta</option>
            <option value="google_analytics">Google Analytics</option>
            <option value="google_ads">Google Ads</option>
            <option value="tiktok">TikTok</option>
            <option value="snapchat">Snapchat</option>
            <option value="pinterest">Pinterest</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className="px-3 py-2 text-sm border border-dark-200 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-900 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Statuses</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
          <select
            value={eventTypeFilter}
            onChange={(e) => { setEventTypeFilter(e.target.value); setPage(1) }}
            className="px-3 py-2 text-sm border border-dark-200 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-900 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Events</option>
            {EVENT_TYPES.map(et => (
              <option key={et} value={et}>{et}</option>
            ))}
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
            className="px-3 py-2 text-sm border border-dark-200 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-900 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
            className="px-3 py-2 text-sm border border-dark-200 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-900 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-dark-800 rounded-2xl border border-dark-200 dark:border-dark-700 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-50 dark:bg-dark-900">
                <tr>
                  {['Platform', 'Event Type', 'Order ID', 'Status', 'Timestamp'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-200 dark:divide-dark-700">
                {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
              </tbody>
            </table>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <InboxIcon className="w-12 h-12 text-dark-300 dark:text-dark-600 mx-auto mb-3" />
            <p className="text-dark-500 dark:text-dark-400 font-medium">No conversion events found</p>
            <p className="text-sm text-dark-400 dark:text-dark-500 mt-1">
              Conversion events will appear here when marketing pixels fire on orders.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-50 dark:bg-dark-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wide w-8" />
                    <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wide">Platform</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wide">Event Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wide">Order ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wide">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-200 dark:divide-dark-700">
                  {logs.map((log) => {
                    const isExpanded = expandedRow === log.id
                    const platformCfg = getPlatformConfig(log.platform)

                    return (
                      <>
                        <tr
                          key={log.id}
                          onClick={() => setExpandedRow(isExpanded ? null : log.id)}
                          className="hover:bg-dark-50 dark:hover:bg-dark-900/50 transition-colors cursor-pointer"
                        >
                          {/* Expand icon */}
                          <td className="px-4 py-3 text-dark-400">
                            {isExpanded ? (
                              <ChevronDownIcon className="w-4 h-4" />
                            ) : (
                              <ChevronRightIcon className="w-4 h-4" />
                            )}
                          </td>

                          {/* Platform */}
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${platformCfg.bgClass} ${platformCfg.textClass}`}>
                              {platformCfg.label}
                            </span>
                          </td>

                          {/* Event Type */}
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-dark-300">
                              {log.event_type}
                            </span>
                          </td>

                          {/* Order ID */}
                          <td className="px-4 py-3 text-sm text-dark-700 dark:text-dark-300">
                            {log.order_id ? (
                              <Link
                                to={`/admin/orders/${log.order_id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                              >
                                #{log.order_id}
                              </Link>
                            ) : (
                              <span className="text-dark-400 dark:text-dark-500">--</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            {log.status === 'success' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                                <CheckCircleIcon className="w-3 h-3" />
                                Success
                              </span>
                            )}
                            {log.status === 'failed' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
                                <ExclamationTriangleIcon className="w-3 h-3" />
                                Failed
                              </span>
                            )}
                            {log.status === 'pending' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                                <ClockIcon className="w-3 h-3" />
                                Pending
                              </span>
                            )}
                          </td>

                          {/* Timestamp */}
                          <td className="px-4 py-3 text-sm text-dark-500 dark:text-dark-400">
                            {timeAgo(log.created_at)}
                          </td>
                        </tr>

                        {/* Expanded detail */}
                        {isExpanded && <RowDetail key={`detail-${log.id}`} log={log} />}
                      </>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
              <div className="p-4 border-t border-dark-200 dark:border-dark-700 flex items-center justify-between">
                <p className="text-sm text-dark-500 dark:text-dark-400">
                  Showing {((page - 1) * pagination.per_page) + 1} to {Math.min(page * pagination.per_page, pagination.total)} of {pagination.total} events
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1.5 border border-dark-200 dark:border-dark-600 rounded-lg text-sm text-dark-700 dark:text-dark-300 disabled:opacity-50 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-dark-500 dark:text-dark-400">
                    {page} / {pagination.last_page}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.last_page}
                    className="px-3 py-1.5 border border-dark-200 dark:border-dark-600 rounded-lg text-sm text-dark-700 dark:text-dark-300 disabled:opacity-50 hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
