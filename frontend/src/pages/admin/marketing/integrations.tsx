import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowTopRightOnSquareIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import api from '@/lib/api'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PlatformField {
  key: string
  label: string
  sensitive: boolean
}

interface PlatformDef {
  key: string
  label: string
  color: string
  darkTextOnBadge?: boolean
  fields: PlatformField[]
  helpUrl: string
  icon: (props: { className?: string }) => JSX.Element
}

interface Integration {
  platform: string
  is_enabled: boolean
  config: Record<string, string>
  updated_at?: string
}

// ---------------------------------------------------------------------------
// Platform icons -- simple SVG badges using brand colors
// ---------------------------------------------------------------------------

function MetaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#1877F2" />
      <path
        d="M21 10h-2.6c-1 0-1.4.6-1.4 1.4V14h4l-.5 4h-3.5v10h-4V18h-3v-4h3v-3c0-3 1.8-4.6 4.5-4.6 1.3 0 2.5.1 2.5.1V10z"
        fill="#fff"
      />
    </svg>
  )
}

function GoogleAnalyticsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#F9AB00" />
      <rect x="8" y="18" width="4" height="6" rx="1" fill="#fff" />
      <rect x="14" y="13" width="4" height="11" rx="1" fill="#fff" />
      <rect x="20" y="8" width="4" height="16" rx="1" fill="#fff" />
    </svg>
  )
}

function GoogleAdsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#4285F4" />
      <path d="M10 22l6-14h3l-6 14h-3z" fill="#FBBC04" />
      <path d="M16 22l6-14h3l-6 14h-3z" fill="#fff" />
      <circle cx="11.5" cy="22" r="2.5" fill="#34A853" />
    </svg>
  )
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#010101" />
      <path
        d="M21.5 13.2a4.4 4.4 0 01-3-1.2v5.5a4.5 4.5 0 11-3.9-4.5v2.5a2.1 2.1 0 101.5 2v-9h2.4a4.4 4.4 0 003 3.7z"
        fill="#00F2EA"
      />
      <path
        d="M20.5 12.2a4.4 4.4 0 01-3-1.2v5.5a4.5 4.5 0 11-3.9-4.5v2.5a2.1 2.1 0 101.5 2V8h2.4a4.4 4.4 0 003 3.7v.5z"
        fill="#FF004F"
        opacity="0.6"
      />
    </svg>
  )
}

function SnapchatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#FFFC00" />
      <path
        d="M16 8c2.2 0 3.8 1.5 4 4v1.8l1.5.5c.3.1.5.4.3.7l-1.3 2.2c1.5.6 2.2 1 2.2 1.5 0 .4-.4.6-1 .7-.5.1-1 .1-1.5.3-.3.1-.6.4-1 1a5 5 0 01-3.2 1.3 5 5 0 01-3.2-1.3c-.4-.6-.7-.9-1-1-.5-.2-1-.2-1.5-.3-.6-.1-1-.3-1-.7 0-.5.7-.9 2.2-1.5l-1.3-2.2c-.2-.3 0-.6.3-.7l1.5-.5V12c.2-2.5 1.8-4 4-4z"
        fill="#fff"
      />
    </svg>
  )
}

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="#E60023" />
      <path
        d="M16 7a9 9 0 00-3.3 17.4c-.1-.8-.1-2.1 0-3l.8-3.4s-.2-.4-.2-1.1c0-1 .6-1.8 1.3-1.8.6 0 .9.5.9 1 0 .6-.4 1.5-.6 2.4-.2.7.3 1.3 1 1.3 1.2 0 2.2-1.3 2.2-3.2 0-1.7-1.2-2.8-2.9-2.8-2 0-3.1 1.5-3.1 3 0 .6.2 1.2.5 1.6.1.1.1.1 0 .3l-.2.7c0 .1-.1.2-.3.1-.9-.4-1.4-1.7-1.4-2.7 0-2.2 1.6-4.2 4.6-4.2 2.4 0 4.3 1.7 4.3 4 0 2.4-1.5 4.4-3.7 4.4-.7 0-1.4-.4-1.6-.8l-.5 1.7c-.2.7-.6 1.3-1 1.8A9 9 0 0016 7z"
        fill="#fff"
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Platform definitions
// ---------------------------------------------------------------------------

const PLATFORMS: PlatformDef[] = [
  {
    key: 'meta',
    label: 'Meta Pixel',
    color: '#1877F2',
    icon: MetaIcon,
    fields: [
      { key: 'pixel_id', label: 'Pixel ID', sensitive: false },
      { key: 'access_token', label: 'Conversions API Token', sensitive: true },
    ],
    helpUrl: 'https://www.facebook.com/business/help/952192354843755',
  },
  {
    key: 'google_analytics',
    label: 'Google Analytics 4',
    color: '#F9AB00',
    darkTextOnBadge: true,
    icon: GoogleAnalyticsIcon,
    fields: [
      { key: 'measurement_id', label: 'Measurement ID (G-XXXXXXXX)', sensitive: false },
    ],
    helpUrl: 'https://support.google.com/analytics/answer/9539598',
  },
  {
    key: 'google_ads',
    label: 'Google Ads',
    color: '#4285F4',
    icon: GoogleAdsIcon,
    fields: [
      { key: 'conversion_id', label: 'Conversion ID', sensitive: false },
      { key: 'conversion_label', label: 'Conversion Label', sensitive: false },
    ],
    helpUrl: 'https://support.google.com/google-ads/answer/6095821',
  },
  {
    key: 'tiktok',
    label: 'TikTok Pixel',
    color: '#00F2EA',
    darkTextOnBadge: true,
    icon: TikTokIcon,
    fields: [
      { key: 'pixel_id', label: 'Pixel ID', sensitive: false },
    ],
    helpUrl: 'https://ads.tiktok.com/help/article/get-started-pixel',
  },
  {
    key: 'snapchat',
    label: 'Snapchat Pixel',
    color: '#FFFC00',
    darkTextOnBadge: true,
    icon: SnapchatIcon,
    fields: [
      { key: 'pixel_id', label: 'Pixel ID', sensitive: false },
    ],
    helpUrl: 'https://businesshelp.snapchat.com/s/article/snap-pixel',
  },
  {
    key: 'pinterest',
    label: 'Pinterest Tag',
    color: '#E60023',
    icon: PinterestIcon,
    fields: [
      { key: 'tag_id', label: 'Tag ID', sensitive: false },
    ],
    helpUrl: 'https://help.pinterest.com/en/business/article/install-the-pinterest-tag',
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function maskValue(value: string): string {
  if (!value || value.length <= 4) return value ? '\u2022'.repeat(value.length) : ''
  return '\u2022'.repeat(value.length - 4) + value.slice(-4)
}

function timeAgo(dateString?: string): string {
  if (!dateString) return 'Never'
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

type ConnectionStatus = 'connected' | 'incomplete' | 'disabled'

function getConnectionStatus(platform: PlatformDef, integration: Integration): ConnectionStatus {
  if (!integration.is_enabled) return 'disabled'
  const allFilled = platform.fields.every(
    (f) => integration.config?.[f.key] && integration.config[f.key].trim() !== ''
  )
  return allFilled ? 'connected' : 'incomplete'
}

const STATUS_CONFIG: Record<ConnectionStatus, { dot: string; label: string; textClass: string }> = {
  connected: {
    dot: 'bg-emerald-500',
    label: 'Connected',
    textClass: 'text-emerald-600 dark:text-emerald-400',
  },
  incomplete: {
    dot: 'bg-amber-500',
    label: 'Incomplete',
    textClass: 'text-amber-600 dark:text-amber-400',
  },
  disabled: {
    dot: 'bg-dark-300 dark:bg-dark-600',
    label: 'Disabled',
    textClass: 'text-dark-400 dark:text-dark-500',
  },
}

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-dark-800 rounded-2xl border border-dark-200 dark:border-dark-700 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-dark-200 dark:bg-dark-700" />
          <div>
            <div className="h-4 w-28 bg-dark-200 dark:bg-dark-700 rounded" />
            <div className="h-3 w-20 bg-dark-100 dark:bg-dark-700 rounded mt-2" />
          </div>
        </div>
        <div className="w-11 h-6 bg-dark-200 dark:bg-dark-700 rounded-full" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <div className="h-3 w-16 bg-dark-200 dark:bg-dark-700 rounded mb-2" />
          <div className="h-10 bg-dark-100 dark:bg-dark-700 rounded-lg" />
        </div>
        <div>
          <div className="h-3 w-24 bg-dark-200 dark:bg-dark-700 rounded mb-2" />
          <div className="h-10 bg-dark-100 dark:bg-dark-700 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Toggle switch
// ---------------------------------------------------------------------------

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: (val: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full
        border-2 border-transparent transition-colors duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        dark:focus:ring-offset-dark-800
        disabled:opacity-50 disabled:cursor-not-allowed
        ${checked ? 'bg-primary-600' : 'bg-dark-300 dark:bg-dark-600'}
      `}
    >
      <span
        className={`
          pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm
          ring-0 transition-transform duration-200 ease-in-out
          ${checked ? 'translate-x-5' : 'translate-x-0.5'}
        `}
      />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: ConnectionStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${cfg.textClass}`}>
      <span className={`w-2 h-2 rounded-full ${cfg.dot} ${status === 'connected' ? 'animate-pulse' : ''}`} />
      {cfg.label}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Save feedback
// ---------------------------------------------------------------------------

function SaveFeedback({ status }: { status: 'idle' | 'saving' | 'saved' | 'error' }) {
  if (status === 'idle') return null

  if (status === 'saving') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400">
        <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Saving...
      </span>
    )
  }

  if (status === 'saved') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 animate-in fade-in">
        <CheckCircleIcon className="w-3.5 h-3.5" />
        Saved
      </span>
    )
  }

  return (
    <span className="text-xs text-red-500 dark:text-red-400">
      Failed to save. Try again.
    </span>
  )
}

// ---------------------------------------------------------------------------
// Integration card
// ---------------------------------------------------------------------------

function IntegrationCard({
  platform,
  integration,
  onSave,
}: {
  platform: PlatformDef
  integration: Integration
  onSave: (platform: string, updates: Partial<Integration>) => Promise<void>
}) {
  const [localConfig, setLocalConfig] = useState<Record<string, string>>(
    integration.config ?? {}
  )
  const [revealedFields, setRevealedFields] = useState<Record<string, boolean>>({})
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [hasSavedOnce, setHasSavedOnce] = useState<Record<string, boolean>>(() => {
    // mark fields as "previously saved" if they already have values
    const saved: Record<string, boolean> = {}
    platform.fields.forEach((f) => {
      if (integration.config?.[f.key]) saved[f.key] = true
    })
    return saved
  })

  // Sync when external data changes (e.g. after mutation refetch)
  useEffect(() => {
    setLocalConfig(integration.config ?? {})
    const saved: Record<string, boolean> = {}
    platform.fields.forEach((f) => {
      if (integration.config?.[f.key]) saved[f.key] = true
    })
    setHasSavedOnce(saved)
  }, [integration.config, platform.fields])

  const status = getConnectionStatus(platform, integration)
  const Icon = platform.icon

  const handleToggle = useCallback(
    async (val: boolean) => {
      setSaveStatus('saving')
      try {
        await onSave(platform.key, { is_enabled: val })
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch {
        setSaveStatus('error')
        setTimeout(() => setSaveStatus('idle'), 3000)
      }
    },
    [onSave, platform.key]
  )

  const handleFieldSave = useCallback(
    async (fieldKey: string, value: string) => {
      const newConfig = { ...localConfig, [fieldKey]: value }
      setLocalConfig(newConfig)
      setSaveStatus('saving')
      try {
        await onSave(platform.key, { config: newConfig })
        setHasSavedOnce((prev) => ({ ...prev, [fieldKey]: true }))
        setRevealedFields((prev) => ({ ...prev, [fieldKey]: false }))
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch {
        setSaveStatus('error')
        setTimeout(() => setSaveStatus('idle'), 3000)
      }
    },
    [localConfig, onSave, platform.key]
  )

  const toggleReveal = (fieldKey: string) => {
    setRevealedFields((prev) => ({ ...prev, [fieldKey]: !prev[fieldKey] }))
  }

  const getDisplayValue = (field: PlatformField): string => {
    const raw = localConfig[field.key] ?? ''
    if (!raw) return ''
    if (field.sensitive && hasSavedOnce[field.key] && !revealedFields[field.key]) {
      return maskValue(raw)
    }
    return raw
  }

  const isFieldMasked = (field: PlatformField): boolean => {
    return field.sensitive && hasSavedOnce[field.key] && !revealedFields[field.key]
  }

  return (
    <div
      className={`
        bg-white dark:bg-dark-800 rounded-2xl border transition-all duration-200
        ${status === 'connected'
          ? 'border-emerald-200 dark:border-emerald-800/40 shadow-sm shadow-emerald-100 dark:shadow-none'
          : 'border-dark-200 dark:border-dark-700'
        }
      `}
    >
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-sm">
              <Icon className="w-10 h-10" />
            </div>
            <div>
              <h3 className="font-semibold text-dark-900 dark:text-white text-sm">
                {platform.label}
              </h3>
              <StatusBadge status={status} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SaveFeedback status={saveStatus} />
            <Toggle
              checked={integration.is_enabled}
              onChange={handleToggle}
            />
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="p-6 pt-4">
        <div className="grid sm:grid-cols-2 gap-4">
          {platform.fields.map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-medium text-dark-500 dark:text-dark-400 mb-1.5">
                {field.label}
              </label>
              <div className="relative">
                <input
                  type={isFieldMasked(field) ? 'text' : 'text'}
                  value={getDisplayValue(field)}
                  readOnly={isFieldMasked(field)}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  onChange={(e) => {
                    setLocalConfig((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }}
                  onFocus={() => {
                    if (isFieldMasked(field)) {
                      setRevealedFields((prev) => ({ ...prev, [field.key]: true }))
                    }
                  }}
                  onBlur={(e) => {
                    const currentVal = e.target.value
                    const prevVal = integration.config?.[field.key] ?? ''
                    if (currentVal !== prevVal) {
                      handleFieldSave(field.key, currentVal)
                    } else if (field.sensitive && hasSavedOnce[field.key]) {
                      setRevealedFields((prev) => ({ ...prev, [field.key]: false }))
                    }
                  }}
                  className={`
                    w-full pl-3 py-2.5 text-sm rounded-lg transition-colors
                    border border-dark-200 dark:border-dark-600
                    bg-white dark:bg-dark-900
                    text-dark-900 dark:text-white
                    placeholder:text-dark-400 dark:placeholder:text-dark-500
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    ${field.sensitive ? 'pr-10' : 'pr-3'}
                    ${isFieldMasked(field) ? 'font-mono tracking-wider cursor-pointer' : ''}
                  `}
                />
                {field.sensitive && hasSavedOnce[field.key] && (
                  <button
                    type="button"
                    onClick={() => toggleReveal(field.key)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600 dark:hover:text-dark-300 transition-colors"
                    title={revealedFields[field.key] ? 'Hide value' : 'Show value'}
                  >
                    {revealedFields[field.key] ? (
                      <EyeSlashIcon className="w-4 h-4" />
                    ) : (
                      <EyeIcon className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
              <a
                href={platform.helpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 mt-1 transition-colors"
              >
                How to get this?
                <ArrowTopRightOnSquareIcon className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Footer -- last updated */}
      <div className="px-6 py-3 border-t border-dark-100 dark:border-dark-700/50 bg-dark-50/50 dark:bg-dark-800/50 rounded-b-2xl">
        <p className="text-[11px] text-dark-400 dark:text-dark-500">
          Last updated: {timeAgo(integration.updated_at)}
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function MarketingIntegrations() {
  const queryClient = useQueryClient()

  const { data: integrations, isLoading } = useQuery<Integration[]>({
    queryKey: ['marketing-integrations'],
    queryFn: async () => {
      const res = await api.get('/api/admin/marketing/integrations')
      return res.data.data
    },
  })

  const mutation = useMutation({
    mutationFn: async (data: Integration) => {
      await api.post('/api/admin/marketing/integrations', data)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['marketing-integrations'] }),
  })

  const getIntegration = (platform: string): Integration =>
    integrations?.find((i) => i.platform === platform) ?? {
      platform,
      is_enabled: false,
      config: {},
    }

  const handleSave = useCallback(
    async (platform: string, updates: Partial<Integration>) => {
      const current = getIntegration(platform)
      const merged: Integration = {
        ...current,
        ...updates,
        config: updates.config
          ? { ...current.config, ...updates.config }
          : current.config,
      }
      await mutation.mutateAsync(merged)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [integrations, mutation]
  )

  const enabledCount = integrations
    ? integrations.filter((i) => i.is_enabled).length
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-dark-900 dark:text-white">
              Marketing Integrations
            </h1>
            {!isLoading && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                {enabledCount} active
              </span>
            )}
          </div>
          <p className="text-dark-500 dark:text-dark-400 text-sm mt-1">
            Connect your advertising platforms to enable pixel tracking and conversion APIs.
          </p>
        </div>
      </div>

      {/* Cards */}
      {isLoading ? (
        <div className="grid gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-5">
          {PLATFORMS.map((platform) => (
            <IntegrationCard
              key={platform.key}
              platform={platform}
              integration={getIntegration(platform.key)}
              onSave={handleSave}
            />
          ))}
        </div>
      )}
    </div>
  )
}
