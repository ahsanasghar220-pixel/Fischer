import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { SeoSettings } from './useSettingsData'
import type { UseMutationResult } from '@tanstack/react-query'

interface Props {
  seoSettings: SeoSettings
  setSeoSettings: React.Dispatch<React.SetStateAction<SeoSettings>>
  saveMutation: UseMutationResult<void, Error, Record<string, unknown>>
}

export default function SeoSettingsTab({ seoSettings, setSeoSettings, saveMutation }: Props) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        saveMutation.mutate({ seo: seoSettings })
      }}
      className="space-y-6 max-w-2xl"
    >
      <div>
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Default Meta Title</label>
        <input
          type="text"
          value={seoSettings.meta_title}
          onChange={(e) => setSeoSettings({ ...seoSettings, meta_title: e.target.value })}
          className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Default Meta Description</label>
        <textarea
          value={seoSettings.meta_description}
          onChange={(e) => setSeoSettings({ ...seoSettings, meta_description: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Meta Keywords</label>
        <input
          type="text"
          value={seoSettings.meta_keywords}
          onChange={(e) => setSeoSettings({ ...seoSettings, meta_keywords: e.target.value })}
          placeholder="keyword1, keyword2, keyword3"
          className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Google Analytics ID</label>
          <input
            type="text"
            value={seoSettings.google_analytics_id}
            onChange={(e) => setSeoSettings({ ...seoSettings, google_analytics_id: e.target.value })}
            placeholder="G-XXXXXXXXXX"
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Facebook Pixel ID</label>
          <input
            type="text"
            value={seoSettings.facebook_pixel_id}
            onChange={(e) => setSeoSettings({ ...seoSettings, facebook_pixel_id: e.target.value })}
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Default OG Image URL</label>
        <input
          type="text"
          value={seoSettings.og_image}
          onChange={(e) => setSeoSettings({ ...seoSettings, og_image: e.target.value })}
          placeholder="/images/og-image.webp"
          className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
        />
      </div>

      <label className="flex items-center justify-between p-4 border border-dark-200 dark:border-dark-600 rounded-lg">
        <div>
          <span className="font-medium text-dark-900 dark:text-white">Enable Sitemap</span>
          <p className="text-sm text-dark-500 dark:text-dark-400">Auto-generate XML sitemap</p>
        </div>
        <input
          type="checkbox"
          checked={seoSettings.sitemap_enabled}
          onChange={(e) => setSeoSettings({ ...seoSettings, sitemap_enabled: e.target.checked })}
          className="w-5 h-5 rounded text-primary-500"
        />
      </label>

      <button
        type="submit"
        disabled={saveMutation.isPending}
        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
      >
        {saveMutation.isPending && <LoadingSpinner size="sm" />}
        Save Changes
      </button>
    </form>
  )
}
