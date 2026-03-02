import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import {
  ArrowLeftIcon,
  UserIcon,
  CubeIcon,
  UserCircleIcon,
  ChatBubbleLeftEllipsisIcon,
  PhotoIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ClockIcon,
  ExclamationCircleIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarDaysIcon,
  TagIcon,
  ShoppingBagIcon,
  FingerPrintIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActivityLogEntry {
  id: number
  action_type: 'status_change' | 'assignment' | 'comment' | 'note'
  old_status: string | null
  new_status: string | null
  body: string | null
  created_at: string
  user: { id: number; full_name: string } | null
}

interface AttachmentEntry {
  id: number
  file_name: string
  file_path: string
  created_at: string
}

interface ComplaintDetailData {
  id: number
  complaint_number: string
  status: string
  complaint_category: string
  complainant_type: string
  complainant_name: string
  complainant_phone: string
  complainant_city: string
  dealer_purchased_from: string | null
  purchase_channel: string | null
  approx_purchase_month: number | null
  approx_purchase_year: number | null
  product_name: string | null
  sku: string | null
  serial_number: string | null
  description: string
  resolution_notes: string | null
  resolved_at: string | null
  filed_by_type: string
  filed_by: { id: number; full_name: string } | null
  assigned_to: { id: number; full_name: string } | null
  product: { id: number; name: string; sku: string } | null
  attachments: AttachmentEntry[]
  activity_log: ActivityLogEntry[]
  created_at: string
  updated_at: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; badge: string; dot: string }> = {
  open:        { label: 'Open',        badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 ring-1 ring-red-200 dark:ring-red-800',       dot: 'bg-red-500' },
  assigned:    { label: 'Assigned',    badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 ring-1 ring-orange-200 dark:ring-orange-800', dot: 'bg-orange-500' },
  in_progress: { label: 'In Progress', badge: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 ring-1 ring-yellow-200 dark:ring-yellow-800', dot: 'bg-yellow-500' },
  resolved:    { label: 'Resolved',    badge: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 ring-1 ring-green-200 dark:ring-green-800', dot: 'bg-green-500' },
  closed:      { label: 'Closed',      badge: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 ring-1 ring-gray-200 dark:ring-gray-600',    dot: 'bg-gray-400' },
}

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.open
}

const CATEGORY_BADGE: Record<string, string> = {
  defect:       'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  delivery:     'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  missing_item: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
  installation: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400',
  warranty:     'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
  other:        'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
}

function CategoryBadge({ category }: { category: string }) {
  const cls = CATEGORY_BADGE[category] ?? CATEGORY_BADGE.other
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium capitalize ${cls}`}>
      {category?.replace(/_/g, ' ') || '—'}
    </span>
  )
}

const MONTHS = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function formatPurchaseDate(month: number | null, year: number | null): string {
  if (!month && !year) return '—'
  const m = month ? MONTHS[month] : ''
  const y = year ? String(year) : ''
  return [m, y].filter(Boolean).join(' ')
}

function formatDate(dt: string, includeTime = false) {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  })
}

const STATUS_OPTIONS = [
  { value: 'open',        label: 'Open' },
  { value: 'assigned',    label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved',    label: 'Resolved' },
  { value: 'closed',      label: 'Closed' },
]

const INPUT_CLS =
  'w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors'

// ─── Info Row ─────────────────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 dark:border-gray-700/60 last:border-0">
      <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
        <div className="text-sm text-gray-900 dark:text-white font-medium">{value || '—'}</div>
      </div>
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function Card({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

function CardHeader({
  icon: Icon,
  title,
  iconBg = 'bg-gray-100 dark:bg-gray-700',
  iconColor = 'text-gray-600 dark:text-gray-400',
}: {
  icon: React.ElementType
  title: string
  iconBg?: string
  iconColor?: string
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-700">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
    </div>
  )
}

// ─── Activity Entry ───────────────────────────────────────────────────────────

function ActivityEntry({ log }: { log: ActivityLogEntry }) {
  const userName = log.user?.full_name ?? 'System'
  const time = formatDate(log.created_at, true)

  if (log.action_type === 'comment' || log.action_type === 'note') {
    return (
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <ChatBubbleLeftEllipsisIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{userName}</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">{time}</span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/60 rounded-xl rounded-tl-none px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
            {log.body}
          </div>
        </div>
      </div>
    )
  }

  if (log.action_type === 'status_change') {
    const oldCfg = log.old_status ? getStatusConfig(log.old_status) : null
    const newCfg = log.new_status ? getStatusConfig(log.new_status) : null
    return (
      <div className="flex gap-3 items-start">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1 pt-1">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{userName}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">changed status</span>
            {oldCfg && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${oldCfg.badge}`}>
                {oldCfg.label}
              </span>
            )}
            {oldCfg && newCfg && <span className="text-xs text-gray-400">→</span>}
            {newCfg && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${newCfg.badge}`}>
                {newCfg.label}
              </span>
            )}
          </div>
          {log.body && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{log.body}</p>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{time}</p>
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
          <span className="font-semibold text-gray-900 dark:text-white">{userName}</span>{' '}
          <span className="text-gray-500 dark:text-gray-400">{log.body || 'updated assignment'}</span>
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

  const { data: complaint, isLoading, error } = useQuery<ComplaintDetailData>({
    queryKey: ['complaint', id],
    queryFn: async () => {
      const res = await api.get(`/api/complaints/${id}`)
      // Backend returns { success, data: { complaint: {...} } }
      return res.data.data.complaint ?? res.data.data
    },
    enabled: !!id,
  })

  useEffect(() => {
    if (complaint) setSelectedStatus(complaint.status)
  }, [complaint])

  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, resolution_notes }: { status: string; resolution_notes?: string }) => {
      await api.put(`/api/complaints/${id}/status`, { status, resolution_notes })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaint', id] })
      queryClient.invalidateQueries({ queryKey: ['complaints'] })
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
    const needsNotes = ['resolved', 'closed'].includes(selectedStatus)
    updateStatusMutation.mutate({
      status: selectedStatus,
      resolution_notes: needsNotes ? resolutionNotes : undefined,
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

  const needsResolutionNotes = ['resolved', 'closed'].includes(selectedStatus)
  const statusChanged = complaint && selectedStatus !== complaint.status

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-500 dark:text-gray-400">
          <ArrowPathIcon className="w-8 h-8 animate-spin text-blue-500 dark:text-blue-400" />
          <span className="text-sm font-medium">Loading complaint…</span>
        </div>
      </div>
    )
  }

  // ── Error ─────────────────────────────────────────────────────────────────────

  if (error || !complaint) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <ExclamationCircleIcon className="w-8 h-8 text-red-500 dark:text-red-400" />
        </div>
        <div className="text-center">
          <p className="text-gray-800 dark:text-gray-200 font-semibold">Complaint not found</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">The complaint may have been removed or you may not have access.</p>
        </div>
        <button
          onClick={() => navigate('/admin/complaints')}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Complaints
        </button>
      </div>
    )
  }

  const activities = complaint.activity_log ?? []
  const attachments = complaint.attachments ?? []
  const statusCfg = getStatusConfig(complaint.status)

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen space-y-5 pb-12">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div>
        <button
          onClick={() => navigate('/admin/complaints')}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium transition-colors mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Complaints
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-2xl font-bold text-gray-900 dark:text-white tracking-wider">
                {complaint.complaint_number}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${statusCfg.badge}`}>
                <span className={`w-2 h-2 rounded-full ${statusCfg.dot} flex-shrink-0`} />
                {statusCfg.label}
              </span>
              <CategoryBadge category={complaint.complaint_category} />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1.5">
              <CalendarDaysIcon className="w-4 h-4" />
              Filed {formatDate(complaint.created_at, true)}
              {complaint.filed_by && (
                <span className="text-gray-400 dark:text-gray-500">
                  {' '}by{' '}
                  <span className="text-gray-600 dark:text-gray-300 font-medium">{complaint.filed_by.full_name}</span>
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ── Resolution notes banner (if resolved) ───────────────────────────── */}
      {complaint.resolution_notes && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-800 dark:text-green-200">Resolution Notes</p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1 leading-relaxed">
                {complaint.resolution_notes}
              </p>
              {complaint.resolved_at && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  Resolved on {formatDate(complaint.resolved_at, true)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Status Update Card ───────────────────────────────────────────────── */}
      <Card>
        <CardHeader
          icon={ArrowPathIcon}
          title="Update Status"
          iconBg="bg-blue-50 dark:bg-blue-900/20"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <div className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={INPUT_CLS}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={handleStatusUpdate}
              disabled={updateStatusMutation.isPending || !statusChanged}
              className="sm:w-auto flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {updateStatusMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  Updating…
                </span>
              ) : (
                'Update Status'
              )}
            </button>
          </div>

          {needsResolutionNotes && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Resolution Notes {selectedStatus === 'resolved' ? '*' : '(optional)'}
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={3}
                placeholder="Describe how this complaint was resolved…"
                className={`${INPUT_CLS} resize-none`}
              />
            </div>
          )}

          {updateStatusMutation.isError && (
            <p className="text-sm text-red-600 dark:text-red-400">
              Failed to update status. Please try again.
            </p>
          )}
          {updateStatusMutation.isSuccess && (
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1.5">
              <CheckCircleIcon className="w-4 h-4" />
              Status updated successfully.
            </p>
          )}
        </div>
      </Card>

      {/* ── Main two-column layout ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* LEFT */}
        <div className="space-y-5">

          {/* Complainant */}
          <Card>
            <CardHeader
              icon={UserIcon}
              title="Complainant"
              iconBg="bg-blue-50 dark:bg-blue-900/20"
              iconColor="text-blue-600 dark:text-blue-400"
            />
            <div className="px-5 py-1 pb-2">
              <InfoRow
                icon={UserIcon}
                label="Type"
                value={
                  <span className="capitalize">
                    {complaint.complainant_type?.replace(/_/g, ' ') || '—'}
                  </span>
                }
              />
              <InfoRow
                icon={UserCircleIcon}
                label="Name"
                value={complaint.complainant_name}
              />
              <InfoRow
                icon={PhoneIcon}
                label="Phone"
                value={complaint.complainant_phone}
              />
              <InfoRow
                icon={MapPinIcon}
                label="City"
                value={complaint.complainant_city || null}
              />
            </div>
          </Card>

          {/* Product */}
          <Card>
            <CardHeader
              icon={CubeIcon}
              title="Product"
              iconBg="bg-purple-50 dark:bg-purple-900/20"
              iconColor="text-purple-600 dark:text-purple-400"
            />
            <div className="px-5 py-1 pb-2">
              <InfoRow
                icon={CubeIcon}
                label="Product Name"
                value={complaint.product_name || null}
              />
              <InfoRow
                icon={TagIcon}
                label="SKU"
                value={
                  complaint.sku
                    ? <span className="font-mono text-sm">{complaint.sku}</span>
                    : null
                }
              />
              <InfoRow
                icon={FingerPrintIcon}
                label="Serial Number"
                value={
                  complaint.serial_number
                    ? <span className="font-mono text-sm">{complaint.serial_number}</span>
                    : null
                }
              />
              <InfoRow
                icon={ShoppingBagIcon}
                label="Purchased From"
                value={
                  complaint.purchase_channel
                    ? <span className="capitalize">{complaint.purchase_channel.replace(/_/g, ' ')}</span>
                    : null
                }
              />
              {complaint.dealer_purchased_from && (
                <InfoRow
                  icon={ShoppingBagIcon}
                  label="Dealer / Shop"
                  value={complaint.dealer_purchased_from}
                />
              )}
              <InfoRow
                icon={CalendarDaysIcon}
                label="Purchase Date"
                value={formatPurchaseDate(complaint.approx_purchase_month, complaint.approx_purchase_year) || null}
              />
            </div>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader
              icon={PencilSquareIcon}
              title="Description"
              iconBg="bg-rose-50 dark:bg-rose-900/20"
              iconColor="text-rose-600 dark:text-rose-400"
            />
            <div className="p-5">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {complaint.description || <span className="text-gray-400 italic">No description provided.</span>}
              </p>
            </div>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="space-y-5">

          {/* Assignment */}
          <Card>
            <CardHeader
              icon={UserCircleIcon}
              title="Assignment"
              iconBg="bg-orange-50 dark:bg-orange-900/20"
              iconColor="text-orange-600 dark:text-orange-400"
            />
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                  <UserCircleIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Currently assigned to</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                    {complaint.assigned_to?.full_name ?? (
                      <span className="text-gray-400 dark:text-gray-500 italic font-normal">Unassigned</span>
                    )}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Assign to User ID
                </label>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
                  Enter the numeric ID of the staff member.
                </p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={assignUserId}
                    onChange={(e) => setAssignUserId(e.target.value)}
                    placeholder="e.g. 42"
                    className={INPUT_CLS}
                  />
                  <button
                    onClick={handleAssign}
                    disabled={!assignUserId || assignMutation.isPending}
                    className="flex-shrink-0 bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {assignMutation.isPending ? 'Assigning…' : 'Assign'}
                  </button>
                </div>
                {assignMutation.isSuccess && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                    Assigned successfully.
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Add Comment */}
          <Card>
            <CardHeader
              icon={ChatBubbleLeftEllipsisIcon}
              title="Add Comment"
              iconBg="bg-teal-50 dark:bg-teal-900/20"
              iconColor="text-teal-600 dark:text-teal-400"
            />
            <div className="p-5">
              <textarea
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                rows={4}
                placeholder="Write a comment or internal note…"
                className={`${INPUT_CLS} resize-none mb-3`}
              />
              <button
                onClick={handleAddComment}
                disabled={!commentBody.trim() || commentMutation.isPending}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
              >
                {commentMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Posting…
                  </span>
                ) : (
                  'Post Comment'
                )}
              </button>
              {commentMutation.isSuccess && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-2 text-center flex items-center justify-center gap-1">
                  <CheckCircleIcon className="w-3.5 h-3.5" />
                  Comment posted.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Attachments ──────────────────────────────────────────────────────── */}
      {attachments.length > 0 && (
        <Card>
          <CardHeader
            icon={PhotoIcon}
            title={`Attachments (${attachments.length})`}
            iconBg="bg-indigo-50 dark:bg-indigo-900/20"
            iconColor="text-indigo-600 dark:text-indigo-400"
          />
          <div className="p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {attachments.map((att) => (
                <button
                  key={att.id}
                  onClick={() => setLightboxUrl(att.file_path)}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <img
                    src={att.file_path}
                    alt={att.file_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* ── Activity Log ─────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader
          icon={ClockIcon}
          title="Activity Log"
          iconBg="bg-gray-100 dark:bg-gray-700"
          iconColor="text-gray-600 dark:text-gray-400"
        />
        <div className="p-5">
          {activities.length === 0 ? (
            <div className="text-center py-10">
              <ClockIcon className="w-10 h-10 mx-auto text-gray-200 dark:text-gray-700 mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No activity recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {activities.map((log) => (
                <ActivityEntry key={log.id} log={log} />
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* ── Lightbox ─────────────────────────────────────────────────────────── */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <div
            className="relative max-w-4xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxUrl}
              alt="Attachment"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
            />
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute top-3 right-3 w-9 h-9 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
              aria-label="Close image"
            >
              <span className="text-xl font-bold leading-none">&times;</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
