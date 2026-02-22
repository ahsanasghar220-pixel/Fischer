import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { NotificationSettings } from './useSettingsData'
import type { UseMutationResult } from '@tanstack/react-query'

interface Props {
  notificationSettings: NotificationSettings
  setNotificationSettings: React.Dispatch<React.SetStateAction<NotificationSettings>>
  saveMutation: UseMutationResult<void, Error, Record<string, unknown>>
}

export default function NotificationSettingsTab({ notificationSettings, setNotificationSettings, saveMutation }: Props) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        saveMutation.mutate({ notifications: notificationSettings })
      }}
      className="space-y-6 max-w-2xl"
    >
      <div className="space-y-4">
        <h3 className="font-medium text-dark-900 dark:text-white">Order Notifications</h3>
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
            Notification Recipient Emails
          </label>
          <textarea
            value={notificationSettings.order_notification_emails}
            onChange={(e) => setNotificationSettings({ ...notificationSettings, order_notification_emails: e.target.value })}
            rows={3}
            placeholder="email1@example.com, email2@example.com"
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">
            Comma-separated list of emails that will receive order notifications
          </p>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-4 border border-dark-200 dark:border-dark-600 rounded-lg">
            <div>
              <span className="font-medium text-dark-900 dark:text-white">Send Order Notifications</span>
              <p className="text-sm text-dark-500 dark:text-dark-400">
                Notify recipients above when a new order is placed
              </p>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.order_notification_enabled}
              onChange={(e) => setNotificationSettings({ ...notificationSettings, order_notification_enabled: e.target.checked })}
              className="w-5 h-5 rounded text-primary-500"
            />
          </label>
          <label className="flex items-center justify-between p-4 border border-dark-200 dark:border-dark-600 rounded-lg">
            <div>
              <span className="font-medium text-dark-900 dark:text-white">Send Confirmation to Customer</span>
              <p className="text-sm text-dark-500 dark:text-dark-400">
                Send order confirmation email to the customer
              </p>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.order_confirmation_to_customer}
              onChange={(e) => setNotificationSettings({ ...notificationSettings, order_confirmation_to_customer: e.target.checked })}
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
