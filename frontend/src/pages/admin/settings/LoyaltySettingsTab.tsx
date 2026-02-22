import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { LoyaltySettings } from './useSettingsData'
import type { UseMutationResult } from '@tanstack/react-query'

interface Props {
  loyaltySettings: LoyaltySettings
  setLoyaltySettings: React.Dispatch<React.SetStateAction<LoyaltySettings>>
  saveMutation: UseMutationResult<void, Error, Record<string, unknown>>
}

export default function LoyaltySettingsTab({ loyaltySettings, setLoyaltySettings, saveMutation }: Props) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        saveMutation.mutate({ loyalty: loyaltySettings })
      }}
      className="space-y-6 max-w-2xl"
    >
      <label className="flex items-center justify-between p-4 border border-dark-200 dark:border-dark-600 rounded-lg">
        <div>
          <span className="font-medium text-dark-900 dark:text-white">Enable Loyalty Program</span>
          <p className="text-sm text-dark-500 dark:text-dark-400">Allow customers to earn and redeem loyalty points</p>
        </div>
        <input
          type="checkbox"
          checked={loyaltySettings.enabled}
          onChange={(e) => setLoyaltySettings({ ...loyaltySettings, enabled: e.target.checked })}
          className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
        />
      </label>

      <div className="space-y-4">
        <h3 className="font-medium text-dark-900 dark:text-white">Earning Rules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
              Points Per Amount Spent (PKR)
            </label>
            <input
              type="number"
              value={loyaltySettings.points_per_amount}
              onChange={(e) => setLoyaltySettings({ ...loyaltySettings, points_per_amount: parseInt(e.target.value) || 0 })}
              min="1"
              className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">Customer earns 1 point for every this amount spent (e.g., 100 = 1 point per Rs. 100)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
              Point Value (PKR)
            </label>
            <input
              type="number"
              value={loyaltySettings.point_value}
              onChange={(e) => setLoyaltySettings({ ...loyaltySettings, point_value: parseInt(e.target.value) || 1 })}
              min="1"
              className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">How much each point is worth in PKR when redeemed (e.g., 1 = Rs. 1 per point)</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-dark-900 dark:text-white">Bonus Points</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
              Review Bonus
            </label>
            <input
              type="number"
              value={loyaltySettings.review_bonus}
              onChange={(e) => setLoyaltySettings({ ...loyaltySettings, review_bonus: parseInt(e.target.value) || 0 })}
              min="0"
              className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">Points for writing a review</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
              Referral Bonus
            </label>
            <input
              type="number"
              value={loyaltySettings.referral_bonus}
              onChange={(e) => setLoyaltySettings({ ...loyaltySettings, referral_bonus: parseInt(e.target.value) || 0 })}
              min="0"
              className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">Points for referring a friend</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
              Birthday Bonus
            </label>
            <input
              type="number"
              value={loyaltySettings.birthday_bonus}
              onChange={(e) => setLoyaltySettings({ ...loyaltySettings, birthday_bonus: parseInt(e.target.value) || 0 })}
              min="0"
              className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">Points on customer birthday</p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
          Minimum Points to Redeem
        </label>
        <input
          type="number"
          value={loyaltySettings.min_redeem_points}
          onChange={(e) => setLoyaltySettings({ ...loyaltySettings, min_redeem_points: parseInt(e.target.value) || 0 })}
          min="0"
          className="w-full max-w-xs px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">Minimum points required before a customer can redeem (0 = no minimum)</p>
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
