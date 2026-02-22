import { formatPrice } from '@/lib/utils'
import type { BundleFormData, BundleItem } from './types'

interface PricingTabProps {
  formData: BundleFormData
  setFormData: React.Dispatch<React.SetStateAction<BundleFormData>>
  items: BundleItem[]
  originalPrice: number
  discountedPrice: number
  savings: number
}

export default function PricingTab({
  formData,
  setFormData,
  items,
  originalPrice,
  discountedPrice,
  savings,
}: PricingTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
            Discount Type *
          </label>
          <select
            value={formData.discount_type}
            onChange={(e) =>
              setFormData({
                ...formData,
                discount_type: e.target.value as 'fixed_price' | 'percentage',
              })
            }
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="percentage">Percentage Discount</option>
            <option value="fixed_price">Fixed Price</option>
          </select>
          <p className="text-xs text-dark-400 dark:text-dark-500 mt-1">
            Fixed Price = bundle sells at a set price regardless of individual product prices.
            Percentage = discount off the combined product prices.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
            {formData.discount_type === 'percentage' ? 'Discount Percentage *' : 'Bundle Price *'}
          </label>
          <div className="relative">
            {formData.discount_type === 'percentage' && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500">%</span>
            )}
            {formData.discount_type === 'fixed_price' && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500">Rs</span>
            )}
            <input
              type="number"
              min="0"
              step={formData.discount_type === 'percentage' ? '1' : '0.01'}
              max={formData.discount_type === 'percentage' ? '100' : undefined}
              value={formData.discount_value}
              onChange={(e) =>
                setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })
              }
              className={`w-full py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                formData.discount_type === 'fixed_price' ? 'pl-10 pr-4' : 'pl-4 pr-10'
              }`}
            />
          </div>
          <p className="text-xs text-dark-400 dark:text-dark-500 mt-1">
            {formData.discount_type === 'fixed_price'
              ? 'The final price customers pay for this bundle'
              : 'Percentage discount off the combined original price (e.g. 20 for 20% off)'}
          </p>
        </div>
      </div>

      {/* Price Preview */}
      {formData.bundle_type === 'fixed' && items.length > 0 && (
        <div className="bg-dark-50 dark:bg-dark-700 rounded-lg p-4">
          <h4 className="font-medium text-dark-900 dark:text-white mb-3">Price Preview</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-dark-500 dark:text-dark-400">Original Price:</span>
              <span className="text-dark-900 dark:text-white">{formatPrice(originalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-500 dark:text-dark-400">Bundle Price:</span>
              <span className="font-bold text-dark-900 dark:text-white">
                {formatPrice(discountedPrice)}
              </span>
            </div>
            <div className="flex justify-between text-green-600 dark:text-green-400">
              <span>Customer Saves:</span>
              <span className="font-medium">
                {formatPrice(savings)} ({((savings / originalPrice) * 100).toFixed(0)}%)
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
            Start Date
          </label>
          <input
            type="datetime-local"
            value={formData.starts_at}
            onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
            End Date
          </label>
          <input
            type="datetime-local"
            value={formData.ends_at}
            onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
          Stock Limit
        </label>
        <input
          type="number"
          min="0"
          value={formData.stock_limit}
          onChange={(e) => setFormData({ ...formData, stock_limit: e.target.value })}
          placeholder="Leave empty for unlimited"
          className="w-full md:w-1/2 px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <p className="text-xs text-dark-400 dark:text-dark-500 mt-1">
          Maximum number of this bundle that can be sold. Leave empty for unlimited stock.
        </p>
      </div>
    </div>
  )
}
