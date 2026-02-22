import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { EmailSettings } from './useSettingsData'
import type { UseMutationResult } from '@tanstack/react-query'

interface Props {
  emailSettings: EmailSettings
  setEmailSettings: React.Dispatch<React.SetStateAction<EmailSettings>>
  saveMutation: UseMutationResult<void, Error, Record<string, unknown>>
}

export default function EmailSettingsTab({ emailSettings, setEmailSettings, saveMutation }: Props) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        saveMutation.mutate({ email: emailSettings })
      }}
      className="space-y-6 max-w-2xl"
    >
      <div className="space-y-4">
        <h3 className="font-medium text-dark-900 dark:text-white">SMTP Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">SMTP Host</label>
            <input
              type="text"
              value={emailSettings.smtp_host}
              onChange={(e) => setEmailSettings({ ...emailSettings, smtp_host: e.target.value })}
              placeholder="smtp.gmail.com"
              className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">SMTP Port</label>
            <input
              type="text"
              value={emailSettings.smtp_port}
              onChange={(e) => setEmailSettings({ ...emailSettings, smtp_port: e.target.value })}
              className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Username</label>
            <input
              type="text"
              value={emailSettings.smtp_username}
              onChange={(e) => setEmailSettings({ ...emailSettings, smtp_username: e.target.value })}
              className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Password</label>
            <input
              type="password"
              value={emailSettings.smtp_password}
              onChange={(e) => setEmailSettings({ ...emailSettings, smtp_password: e.target.value })}
              className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Encryption</label>
          <select
            value={emailSettings.smtp_encryption}
            onChange={(e) => setEmailSettings({ ...emailSettings, smtp_encryption: e.target.value })}
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
          >
            <option value="tls">TLS</option>
            <option value="ssl">SSL</option>
            <option value="none">None</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-dark-900 dark:text-white">Sender Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">From Email</label>
            <input
              type="email"
              value={emailSettings.from_email}
              onChange={(e) => setEmailSettings({ ...emailSettings, from_email: e.target.value })}
              className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">From Name</label>
            <input
              type="text"
              value={emailSettings.from_name}
              onChange={(e) => setEmailSettings({ ...emailSettings, from_name: e.target.value })}
              className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-dark-900 dark:text-white">Email Notifications</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-4 border border-dark-200 dark:border-dark-600 rounded-lg">
            <div>
              <span className="font-medium text-dark-900 dark:text-white">Order Confirmation</span>
              <p className="text-sm text-dark-500 dark:text-dark-400">Send email when order is placed</p>
            </div>
            <input
              type="checkbox"
              checked={emailSettings.order_confirmation_enabled}
              onChange={(e) => setEmailSettings({ ...emailSettings, order_confirmation_enabled: e.target.checked })}
              className="w-5 h-5 rounded text-primary-500"
            />
          </label>
          <label className="flex items-center justify-between p-4 border border-dark-200 dark:border-dark-600 rounded-lg">
            <div>
              <span className="font-medium text-dark-900 dark:text-white">Shipping Notifications</span>
              <p className="text-sm text-dark-500 dark:text-dark-400">Send email when order is shipped</p>
            </div>
            <input
              type="checkbox"
              checked={emailSettings.shipping_notification_enabled}
              onChange={(e) => setEmailSettings({ ...emailSettings, shipping_notification_enabled: e.target.checked })}
              className="w-5 h-5 rounded text-primary-500"
            />
          </label>
          <label className="flex items-center justify-between p-4 border border-dark-200 dark:border-dark-600 rounded-lg">
            <div>
              <span className="font-medium text-dark-900 dark:text-white">Welcome Email</span>
              <p className="text-sm text-dark-500 dark:text-dark-400">Send email when user registers</p>
            </div>
            <input
              type="checkbox"
              checked={emailSettings.welcome_email_enabled}
              onChange={(e) => setEmailSettings({ ...emailSettings, welcome_email_enabled: e.target.checked })}
              className="w-5 h-5 rounded text-primary-500"
            />
          </label>
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
