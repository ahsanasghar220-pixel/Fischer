import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { ShippingSettings } from './useSettingsData'
import type { UseMutationResult } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface Props {
  shippingSettings: ShippingSettings
  setShippingSettings: React.Dispatch<React.SetStateAction<ShippingSettings>>
  saveMutation: UseMutationResult<void, Error, Record<string, unknown>>
}

interface ShippingMethodItem {
  id: number
  name: string
  description: string
  base_cost: number
  min_delivery_days: number | null
  max_delivery_days: number | null
  is_active: boolean
}

export default function ShippingSettingsTab({ shippingSettings, setShippingSettings, saveMutation }: Props) {
  const queryClient = useQueryClient()

  // ── Fetch all shipping methods ────────────────────────────────────────────────
  const { data: methods, isLoading: methodsLoading } = useQuery<ShippingMethodItem[]>({
    queryKey: ['admin-shipping-methods'],
    queryFn: async () => {
      const res = await api.get('/api/admin/shipping-methods')
      return res.data.data.data as ShippingMethodItem[]
    },
  })

  // ── Toggle active/inactive ────────────────────────────────────────────────────
  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: number; is_active: boolean }) => {
      await api.put(`/api/admin/shipping-methods/${id}`, { is_active })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shipping-methods'] })
      toast.success('Delivery method updated')
    },
    onError: () => toast.error('Failed to update delivery method'),
  })

  return (
    <div className="space-y-8 max-w-2xl">

      {/* ── Delivery Methods ─────────────────────────────────────────────────── */}
      <div>
        <h3 className="text-base font-bold text-dark-900 dark:text-white mb-1">Delivery Methods</h3>
        <p className="text-sm text-dark-500 dark:text-dark-400 mb-4">
          Enable or disable the delivery options shown to customers at checkout.
          If only one method is active, the delivery step is skipped automatically.
        </p>

        {methodsLoading ? (
          <div className="flex items-center gap-2 py-4 text-dark-400">
            <LoadingSpinner size="sm" />
            <span className="text-sm">Loading methods…</span>
          </div>
        ) : !methods || methods.length === 0 ? (
          <p className="text-sm text-dark-400 dark:text-dark-500 py-4">No delivery methods found.</p>
        ) : (
          <div className="space-y-3">
            {methods.map((method) => {
              const deliveryLabel = method.min_delivery_days && method.max_delivery_days
                ? `${method.min_delivery_days}–${method.max_delivery_days} days`
                : method.min_delivery_days
                ? `${method.min_delivery_days}+ days`
                : null

              return (
                <div
                  key={method.id}
                  className={`flex items-center justify-between gap-4 p-4 rounded-xl border transition-colors ${
                    method.is_active
                      ? 'border-primary-300 dark:border-primary-600/60 bg-white dark:bg-dark-800'
                      : 'border-dark-200 dark:border-dark-600 bg-dark-50 dark:bg-dark-800/50'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-dark-900 dark:text-white text-sm">{method.name}</span>
                      {method.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-dark-100 text-dark-500 dark:bg-dark-700 dark:text-dark-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-dark-400 inline-block" />
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-dark-500 dark:text-dark-400 mt-0.5">
                      {method.description}
                      {deliveryLabel && <> · {deliveryLabel}</>}
                      {method.base_cost > 0
                        ? <> · Rs {method.base_cost.toLocaleString()}</>
                        : <> · Free</>}
                    </p>
                  </div>

                  {/* Toggle */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={method.is_active}
                    disabled={toggleMutation.isPending}
                    onClick={() => toggleMutation.mutate({ id: method.id, is_active: !method.is_active })}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-dark-800 disabled:opacity-50 ${
                      method.is_active ? 'bg-primary-600' : 'bg-gray-200 dark:bg-dark-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out ${
                        method.is_active ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Cost & Threshold Settings ─────────────────────────────────────────── */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          saveMutation.mutate({ shipping: shippingSettings })
        }}
        className="space-y-6"
      >
        <h3 className="text-base font-bold text-dark-900 dark:text-white">Cost & Threshold Settings</h3>

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
    </div>
  )
}
