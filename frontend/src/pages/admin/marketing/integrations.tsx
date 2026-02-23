import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

const PLATFORMS = [
  { key: 'meta', label: 'Meta Pixel', fields: [{ key: 'pixel_id', label: 'Pixel ID' }, { key: 'access_token', label: 'Conversions API Token (optional)', type: 'password' }] },
  { key: 'google_analytics', label: 'Google Analytics (GA4)', fields: [{ key: 'measurement_id', label: 'Measurement ID (G-XXXXXXXX)' }] },
  { key: 'google_ads', label: 'Google Ads', fields: [{ key: 'conversion_id', label: 'Conversion ID' }, { key: 'conversion_label', label: 'Conversion Label' }] },
  { key: 'tiktok', label: 'TikTok Pixel', fields: [{ key: 'pixel_id', label: 'Pixel ID' }] },
  { key: 'snapchat', label: 'Snapchat Pixel', fields: [{ key: 'pixel_id', label: 'Pixel ID' }] },
  { key: 'pinterest', label: 'Pinterest Tag', fields: [{ key: 'tag_id', label: 'Tag ID' }] },
]

interface Integration {
  platform: string
  is_enabled: boolean
  config: Record<string, string>
}

export default function MarketingIntegrations() {
  const queryClient = useQueryClient()
  const [saving, setSaving] = useState<string | null>(null)

  const { data: integrations = [] } = useQuery<Integration[]>({
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['marketing-integrations'] }),
  })

  const getIntegration = (platform: string): Integration =>
    integrations.find(i => i.platform === platform) ?? { platform, is_enabled: false, config: {} }

  const save = async (platform: string, updates: Partial<Integration>) => {
    setSaving(platform)
    const current = getIntegration(platform)
    await mutation.mutateAsync({ ...current, ...updates })
    setSaving(null)
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Marketing Integrations</h1>
      <p className="text-dark-500 dark:text-dark-400 text-sm">Connect your advertising platforms to enable pixel tracking and conversion APIs.</p>

      <div className="grid gap-4">
        {PLATFORMS.map(platform => {
          const integration = getIntegration(platform.key)
          return (
            <div key={platform.key} className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-dark-900 dark:text-white">{platform.label}</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" className="sr-only"
                      checked={integration.is_enabled}
                      onChange={e => save(platform.key, { is_enabled: e.target.checked })} />
                    <div className={`w-10 h-5 rounded-full transition-colors ${integration.is_enabled ? 'bg-primary-500' : 'bg-dark-300 dark:bg-dark-600'}`} />
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${integration.is_enabled ? 'translate-x-5' : ''}`} />
                  </div>
                  <span className="text-sm text-dark-600 dark:text-dark-400">{integration.is_enabled ? 'Enabled' : 'Disabled'}</span>
                </label>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {platform.fields.map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-medium text-dark-500 dark:text-dark-400 mb-1">{field.label}</label>
                    <input
                      type={field.type ?? 'text'}
                      defaultValue={integration.config?.[field.key] ?? ''}
                      placeholder={`Enter ${field.label}`}
                      className="w-full px-3 py-2 text-sm border border-dark-200 dark:border-dark-700 rounded-lg bg-white dark:bg-dark-900 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      onBlur={e => {
                        const newConfig = { ...integration.config, [field.key]: e.target.value }
                        save(platform.key, { config: newConfig })
                      }}
                    />
                  </div>
                ))}
              </div>

              {saving === platform.key && (
                <p className="text-xs text-primary-500 mt-2">Saving...</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
