import type { BundleFormData } from './types'

interface DisplayTabProps {
  formData: BundleFormData
  setFormData: React.Dispatch<React.SetStateAction<BundleFormData>>
}

export default function DisplayTab({ formData, setFormData }: DisplayTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
            Badge Label
          </label>
          <input
            type="text"
            value={formData.badge_label}
            onChange={(e) => setFormData({ ...formData, badge_label: e.target.value })}
            placeholder="e.g., Best Value, Limited Time"
            maxLength={50}
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p className="text-xs text-dark-400 dark:text-dark-500 mt-1">
            Text shown on the bundle badge (e.g. 'Best Value', 'Limited Time')
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
            Badge Color
          </label>
          <select
            value={formData.badge_color}
            onChange={(e) => setFormData({ ...formData, badge_color: e.target.value })}
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="gold">Gold</option>
            <option value="red">Red</option>
            <option value="blue">Blue</option>
            <option value="green">Green</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
          CTA Button Text
        </label>
        <input
          type="text"
          value={formData.cta_text}
          onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
          maxLength={100}
          className="w-full md:w-1/2 px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <p className="text-xs text-dark-400 dark:text-dark-500 mt-1">
          Text shown on the Add to Cart button (e.g. 'Buy Now', 'Add Bundle to Cart')
        </p>
      </div>

      <div className="border-t border-dark-200 dark:border-dark-700 pt-6">
        <h4 className="font-medium text-dark-900 dark:text-white mb-4">Homepage Display</h4>
        <div className="space-y-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.show_on_homepage}
              onChange={(e) => setFormData({ ...formData, show_on_homepage: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-dark-700 dark:text-dark-300">Show on Homepage</span>
          </label>

          {formData.show_on_homepage && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-6">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                  Position
                </label>
                <select
                  value={formData.homepage_position}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      homepage_position: e.target.value as '' | 'carousel' | 'grid' | 'banner',
                    })
                  }
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Position</option>
                  <option value="carousel">Carousel</option>
                  <option value="grid">Grid</option>
                  <option value="banner">Banner</option>
                </select>
                <p className="text-xs text-dark-400 dark:text-dark-500 mt-1">
                  Carousel = rotating product slider. Grid = static product grid layout. Banner =
                  large promotional hero banner.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.show_countdown}
              onChange={(e) => setFormData({ ...formData, show_countdown: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-dark-700 dark:text-dark-300">Show Countdown Timer</span>
          </label>
          <p className="text-xs text-dark-400 dark:text-dark-500 mt-1 ml-6">
            Display a countdown timer if the bundle has an end date
          </p>
        </div>
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.show_savings}
              onChange={(e) => setFormData({ ...formData, show_savings: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-dark-700 dark:text-dark-300">Show Savings Amount</span>
          </label>
          <p className="text-xs text-dark-400 dark:text-dark-500 mt-1 ml-6">
            Display the savings amount/percentage to customers
          </p>
        </div>
      </div>
    </div>
  )
}
