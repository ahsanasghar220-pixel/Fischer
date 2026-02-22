import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { GeneralSettings } from './useSettingsData'
import type { UseMutationResult } from '@tanstack/react-query'

interface Props {
  generalSettings: GeneralSettings
  setGeneralSettings: React.Dispatch<React.SetStateAction<GeneralSettings>>
  saveMutation: UseMutationResult<void, Error, Record<string, unknown>>
}

export default function GeneralSettingsTab({ generalSettings, setGeneralSettings, saveMutation }: Props) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        saveMutation.mutate({ general: generalSettings })
      }}
      className="space-y-6 max-w-2xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Site Name</label>
          <input
            type="text"
            value={generalSettings.site_name}
            onChange={(e) => setGeneralSettings({ ...generalSettings, site_name: e.target.value })}
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Tagline</label>
          <input
            type="text"
            value={generalSettings.site_tagline}
            onChange={(e) => setGeneralSettings({ ...generalSettings, site_tagline: e.target.value })}
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Contact Email</label>
          <input
            type="email"
            value={generalSettings.contact_email}
            onChange={(e) => setGeneralSettings({ ...generalSettings, contact_email: e.target.value })}
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Contact Phone</label>
          <input
            type="text"
            value={generalSettings.contact_phone}
            onChange={(e) => setGeneralSettings({ ...generalSettings, contact_phone: e.target.value })}
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">WhatsApp Number</label>
        <input
          type="text"
          value={generalSettings.whatsapp_number}
          onChange={(e) => setGeneralSettings({ ...generalSettings, whatsapp_number: e.target.value })}
          className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <p className="text-xs text-dark-500 mt-1">Include country code (e.g., +923001234567)</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Address</label>
        <textarea
          value={generalSettings.address}
          onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Logo URL</label>
          <input
            type="text"
            value={generalSettings.logo_url}
            onChange={(e) => setGeneralSettings({ ...generalSettings, logo_url: e.target.value })}
            placeholder="/images/logo.webp"
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Favicon URL</label>
          <input
            type="text"
            value={generalSettings.favicon_url}
            onChange={(e) => setGeneralSettings({ ...generalSettings, favicon_url: e.target.value })}
            placeholder="/favicon.ico"
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Footer Text</label>
        <textarea
          value={generalSettings.footer_text}
          onChange={(e) => setGeneralSettings({ ...generalSettings, footer_text: e.target.value })}
          rows={2}
          placeholder="Copyright text or additional footer information"
          className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

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
