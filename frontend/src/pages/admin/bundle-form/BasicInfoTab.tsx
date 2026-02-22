import type { BundleFormData } from './types'

interface BasicInfoTabProps {
  formData: BundleFormData
  setFormData: React.Dispatch<React.SetStateAction<BundleFormData>>
  isEditing: boolean
}

export default function BasicInfoTab({ formData, setFormData, isEditing }: BasicInfoTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
            Bundle Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g., Kitchen Essentials Bundle"
          />
          <p className="text-xs text-dark-400 dark:text-dark-500 mt-1">
            The display name shown to customers on the website
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
            SKU
          </label>
          <input
            type="text"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Auto-generated if empty"
          />
          <p className="text-xs text-dark-400 dark:text-dark-500 mt-1">
            Unique stock-keeping unit identifier for inventory tracking
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
          Short Description
        </label>
        <input
          type="text"
          value={formData.short_description}
          onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
          className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Brief description for cards"
          maxLength={500}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
          Full Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Detailed bundle description"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
            Bundle Type *
          </label>
          <select
            value={formData.bundle_type}
            onChange={(e) =>
              setFormData({ ...formData, bundle_type: e.target.value as 'fixed' | 'configurable' })
            }
            disabled={isEditing}
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
          >
            <option value="fixed">Fixed Bundle - Pre-defined products</option>
            <option value="configurable">Configurable - Customer picks from slots</option>
          </select>
          {isEditing ? (
            <p className="mt-1 text-xs text-dark-500">Bundle type cannot be changed after creation</p>
          ) : (
            <p className="text-xs text-dark-400 dark:text-dark-500 mt-1">
              Fixed = pre-defined set of products that customers buy as-is. Configurable = customers
              choose products from defined slots/options.
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
            Cart Display
          </label>
          <select
            value={formData.cart_display}
            onChange={(e) =>
              setFormData({
                ...formData,
                cart_display: e.target.value as 'single_item' | 'grouped' | 'individual',
              })
            }
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="single_item">Single Line Item</option>
            <option value="grouped">Grouped Items</option>
            <option value="individual">Individual Items</option>
          </select>
          <p className="text-xs text-dark-400 dark:text-dark-500 mt-1">
            Single Item = appears as one line item in cart. Grouped = expandable group showing all
            products. Individual = each product shown as separate line item.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
          />
          <span className="text-sm text-dark-700 dark:text-dark-300">Active</span>
        </label>
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.allow_coupon_stacking}
              onChange={(e) => setFormData({ ...formData, allow_coupon_stacking: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-dark-700 dark:text-dark-300">Allow Coupon Stacking</span>
          </label>
          <p className="text-xs text-dark-400 dark:text-dark-500 mt-1 ml-6">
            Allow customers to apply additional coupons on top of the bundle discount
          </p>
        </div>
      </div>
    </div>
  )
}
