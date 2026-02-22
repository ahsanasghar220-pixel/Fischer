import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { ShippingSettings } from './useSettingsData'
import type { UseMutationResult } from '@tanstack/react-query'

interface Props {
  shippingSettings: ShippingSettings
  setShippingSettings: React.Dispatch<React.SetStateAction<ShippingSettings>>
  saveMutation: UseMutationResult<void, Error, Record<string, unknown>>
}

export default function ShippingSettingsTab({ shippingSettings, setShippingSettings, saveMutation }: Props) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        saveMutation.mutate({ shipping: shippingSettings })
      }}
      className="space-y-6 max-w-2xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
            Free Shipping Threshold (PKR)
          </label>
          <input
            type="number"
            value={shippingSettings.free_shipping_threshold}
            onChange={(e) => setShippingSettings({ ...shippingSettings, free_shipping_threshold: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">Orders above this amount get free shipping</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
            Default Shipping Cost (PKR)
          </label>
          <input
            type="number"
            value={shippingSettings.default_shipping_cost}
            onChange={(e) => setShippingSettings({ ...shippingSettings, default_shipping_cost: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
            Express Shipping Cost (PKR)
          </label>
          <input
            type="number"
            value={shippingSettings.express_shipping_cost}
            onChange={(e) => setShippingSettings({ ...shippingSettings, express_shipping_cost: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
            Same Day Delivery Cost (PKR)
          </label>
          <input
            type="number"
            value={shippingSettings.same_day_cost}
            onChange={(e) => setShippingSettings({ ...shippingSettings, same_day_cost: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-dark-900 dark:text-white">Delivery Time Estimates</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Standard</label>
            <input
              type="text"
              value={shippingSettings.delivery_time_standard}
              onChange={(e) => setShippingSettings({ ...shippingSettings, delivery_time_standard: e.target.value })}
              className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Express</label>
            <input
              type="text"
              value={shippingSettings.delivery_time_express}
              onChange={(e) => setShippingSettings({ ...shippingSettings, delivery_time_express: e.target.value })}
              className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Same Day</label>
            <input
              type="text"
              value={shippingSettings.delivery_time_same_day}
              onChange={(e) => setShippingSettings({ ...shippingSettings, delivery_time_same_day: e.target.value })}
              className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
            />
          </div>
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
