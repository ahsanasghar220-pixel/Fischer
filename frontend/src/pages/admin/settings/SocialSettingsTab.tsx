import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { SocialSettings } from './useSettingsData'
import type { UseMutationResult } from '@tanstack/react-query'

interface Props {
  socialSettings: SocialSettings
  setSocialSettings: React.Dispatch<React.SetStateAction<SocialSettings>>
  saveMutation: UseMutationResult<void, Error, Record<string, unknown>>
}

export default function SocialSettingsTab({ socialSettings, setSocialSettings, saveMutation }: Props) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        saveMutation.mutate({ social: socialSettings })
      }}
      className="space-y-6 max-w-2xl"
    >
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Facebook URL</label>
          <input
            type="url"
            value={socialSettings.facebook_url}
            onChange={(e) => setSocialSettings({ ...socialSettings, facebook_url: e.target.value })}
            placeholder="https://facebook.com/yourpage"
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Instagram URL</label>
          <input
            type="url"
            value={socialSettings.instagram_url}
            onChange={(e) => setSocialSettings({ ...socialSettings, instagram_url: e.target.value })}
            placeholder="https://instagram.com/yourpage"
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">YouTube URL</label>
          <input
            type="url"
            value={socialSettings.youtube_url}
            onChange={(e) => setSocialSettings({ ...socialSettings, youtube_url: e.target.value })}
            placeholder="https://youtube.com/yourchannel"
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Twitter/X URL</label>
          <input
            type="url"
            value={socialSettings.twitter_url}
            onChange={(e) => setSocialSettings({ ...socialSettings, twitter_url: e.target.value })}
            placeholder="https://twitter.com/yourhandle"
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">LinkedIn URL</label>
          <input
            type="url"
            value={socialSettings.linkedin_url}
            onChange={(e) => setSocialSettings({ ...socialSettings, linkedin_url: e.target.value })}
            placeholder="https://linkedin.com/company/yourcompany"
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">TikTok URL</label>
          <input
            type="url"
            value={socialSettings.tiktok_url}
            onChange={(e) => setSocialSettings({ ...socialSettings, tiktok_url: e.target.value })}
            placeholder="https://tiktok.com/@yourhandle"
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
          />
        </div>
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
