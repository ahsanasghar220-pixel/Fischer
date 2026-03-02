import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import {
  ArrowLeftIcon,
  UserIcon,
  CubeIcon,
  UserCircleIcon,
  ChatBubbleLeftIcon,
  PhotoIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ComplaintActivity {
  id: number
  type: 'status_change' | 'assignment' | 'comment'
  user_name: string
  body: string
  created_at: string
}

interface ComplaintAttachment {
  id: number
  url: string
  filename: string
}

interface ComplaintDetail {
  id: number
  reference_number: string
  status: string
  category: string

  // Complainant
  complainant_type: string
  complainant_name: string
  complainant_phone: string
  complainant_city: string
  purchase_location: string
  purchase_date: string
  purchase_channel: string

  // Product
  product_name: string
  product_sku: string
  serial_number: string

  // Assignment & description
  assigned_to_name: string | null
  assigned_to_id: number | null
  description: string

  // Filed by
  filed_by_name: string

  created_at: string
  updated_at: string

  activities: ComplaintActivity[]
  attachments: ComplaintAttachment[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    open:        'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
    assigned:    'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
    in_progress: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
    resolved:    'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
    closed:      'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
  }
  return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.open}`
}

function getCategoryBadge(category: string) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 capitalize">
      {category?.replace(/_/g, ' ') || '—'}
    </span>
  )
}

function formatDate(dt: string) {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatDateShort(dt: string) {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-PK', { month: 'long', year: 'numeric' })
}

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

const NEEDS_NOTES = ['resolved', 'closed']

// ─── Info Row helper ──────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-0">
      <dt className="sm:w-44 text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">{label}</dt>
      <dd className="text-sm text-gray-900 dark:text-white font-medium">{value}</dd>
    </div>
  )
}

// ─── Activity Entry ───────────────────────────────────────────────────────────

function ActivityEntry({ activity }: { activity: ComplaintActivity }) {
  const time = formatDate(activity.created_at)

  if (activity.type === 'comment') {
    return (
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <ChatBubbleLeftIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900 dark:text-white">{activity.user_name}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{time}</span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/60 rounded-xl rounded-tl-none px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
            {activity.body}
          </div>
        </div>
      </div>
    )
  }

  if (activity.type === 'status_change') {
    return (
      <div className="flex gap-3 items-start">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1 pt-1">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium text-gray-900 dark:text-white">{activity.user_name}</span>
            {' '}
            <span className="text-gray-500 dark:text-gray-400">{activity.body}</span>
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{time}</p>
        </div>
      </div>
    )
  }

  // assignment
  return (
    <div className="flex gap-3 items-start">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
        <UserCircleIcon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
      </div>
      <div className="flex-1 pt-1">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-medium text-gray-900 dark:text-white">{activity.user_name}</span>
          {' '}
          <span className="text-gray-500 dark:text-gray-400">{activity.body}</span>
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{time}</p>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ComplaintDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [selectedStatus, setSelectedStatus] = useState('')
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [assignUserId, setAssignUserId] = useState('')
  const [commentBody, setCommentBody] = useState('')
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  const { data: complaint, isLoading, error } = useQuery<ComplaintDetail>({
    queryKey: ['complaint', id],
    queryFn: async () => {
      const res = await api.get(`/api/complaints/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })

  // Pre-fill selected status when complaint loads
  useEffect(() => {
    if (complaint) {
      setSelectedStatus(complaint.status)
    }
  }, [complaint])

  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, resolution_notes }: { status: string; resolution_notes?: string }) => {
      await api.put(`/api/complaints/${id}/status`, { status, resolution_notes })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaint', id] })
      setResolutionNotes('')
    },
  })

  const assignMutation = useMutation({
    mutationFn: async (assigned_to_id: number) => {
      await api.post(`/api/complaints/${id}/assign`, { assigned_to_id })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaint', id] })
      setAssignUserId('')
    },
  })

  const commentMutation = useMutation({
    mutationFn: async (body: string) => {
      await api.post(`/api/complaints/${id}/comments`, { body })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaint', id] })
      setCommentBody('')
    },
  })

  const handleStatusUpdate = () => {
    if (!selectedStatus) return
    updateStatusMutation.mutate({
      status: selectedStatus,
      resolution_notes: NEEDS_NOTES.includes(selectedStatus) ? resolutionNotes : undefined,
    })
  }

  const handleAssign = () => {
    const uid = parseInt(assignUserId)
    if (!uid) return
    assignMutation.mutate(uid)
  }

  const handleAddComment = () => {
    if (!commentBody.trim()) return
    commentMutation.mutate(commentBody.trim())
  }

  // ─── Loading / Error ───────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <ArrowPathIcon className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading complaint…</span>
        </div>
      </div>
    )
  }

  if (error || !complaint) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-700 dark:text-gray-300">Failed to load complaint.</p>
        <button
          onClick={() => navigate('/admin/complaints')}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          Back to Complaints
        </button>
      </div>
    )
  }

  const activities = complaint.activities ?? []
  const attachments = complaint.attachments ?? []

  return (
    <div className="min-h-screen space-y-6 pb-10">

      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/admin/complaints')}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Complaints
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-2xl font-bold text-gray-900 dark:text-white">
              {complaint.reference_number}
            </span>
            <span className={getStatusBadge(complaint.status)}>
              {complaint.status.replace(/_/g, ' ')}
            </span>
            {getCategoryBadge(complaint.category)}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Filed {formatDate(complaint.created_at)}
          </p>
        </div>
      </div>

      {/* Status Update Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Update Status</h2>
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={handleStatusUpdate}
            disabled={updateStatusMutation.isPending || selectedStatus === complaint.status}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {updateStatusMutation.isPending ? 'Updating…' : 'Update Status'}
          </button>
        </div>

        {/* Resolution notes — shown when resolved/closed selected */}
        {NEEDS_NOTES.includes(selectedStatus) && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Resolution Notes
            </label>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              rows={3}
              placeholder="Describe how this complaint was resolved…"
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        )}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT COLUMN */}
        <div className="space-y-6">

          {/* Complainant Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Complainant</h3>
            </div>
            <dl className="space-y-3">
              <InfoRow label="Type" value={
                <span className="capitalize">{complaint.complainant_type?.replace(/_/g, ' ') || '—'}</span>
              } />
              <InfoRow label="Name" value={complaint.complainant_name || '—'} />
              <InfoRow label="Phone" value={complaint.complainant_phone || '—'} />
              <InfoRow label="City" value={complaint.complainant_city || '—'} />
              <InfoRow label="Where Purchased" value={complaint.purchase_location || '—'} />
              <InfoRow label="Purchase Date" value={complaint.purchase_date ? formatDateShort(complaint.purchase_date) : '—'} />
              <InfoRow label="Purchase Channel" value={
                <span className="capitalize">{complaint.purchase_channel?.replace(/_/g, ' ') || '—'}</span>
              } />
            </dl>
          </div>

          {/* Product Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                <CubeIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Product</h3>
            </div>
            <dl className="space-y-3">
              <InfoRow label="Product Name" value={complaint.product_name || '—'} />
              <InfoRow label="SKU" value={
                complaint.product_sku
                  ? <span className="font-mono text-sm">{complaint.product_sku}</span>
                  : '—'
              } />
              <InfoRow label="Serial Number" value={
                complaint.serial_number
                  ? <span className="font-mono text-sm">{complaint.serial_number}</span>
                  : '—'
              } />
            </dl>
          </div>

          {/* Description */}
          {complaint.description && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {complaint.description}
              </p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">

          {/* Assignment Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
                <UserCircleIcon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assignment</h3>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Currently Assigned To</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {complaint.assigned_to_name ?? (
                  <span className="text-gray-400 dark:text-gray-500 italic">Unassigned</span>
                )}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Assign to User ID
              </label>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
                Enter the numeric ID of the staff member to assign this complaint.
              </p>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={assignUserId}
                  onChange={(e) => setAssignUserId(e.target.value)}
                  placeholder="User ID"
                  className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAssign}
                  disabled={!assignUserId || assignMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {assignMutation.isPending ? 'Assigning…' : 'Assign'}
                </button>
              </div>
            </div>
          </div>

          {/* Add Comment */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center flex-shrink-0">
                <ChatBubbleLeftIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Comment</h3>
            </div>

            <textarea
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              rows={4}
              placeholder="Write a comment or internal note…"
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3"
            />
            <button
              onClick={handleAddComment}
              disabled={!commentBody.trim() || commentMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {commentMutation.isPending ? 'Posting…' : 'Add Comment'}
            </button>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
            <ClockIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activity Log</h3>
        </div>

        {activities.length === 0 ? (
          <div className="text-center py-10 text-gray-400 dark:text-gray-500">
            <ClockIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No activity recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {activities.map((activity) => (
              <ActivityEntry key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>

      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0">
              <PhotoIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Attachments ({attachments.length})
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {attachments.map((att) => (
              <button
                key={att.id}
                onClick={() => setLightboxUrl(att.url)}
                className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <img
                  src={att.url}
                  alt={att.filename}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-xl" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxUrl}
              alt="Attachment"
              className="max-w-full max-h-[85vh] rounded-xl object-contain"
            />
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute top-3 right-3 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors text-lg font-bold leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
