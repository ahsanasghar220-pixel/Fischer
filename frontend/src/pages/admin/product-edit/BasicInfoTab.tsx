import type { Category } from '@/types'

type FormData = {
  name: string
  sku: string
  description: string
  short_description: string
  price: string
  compare_price: string
  cost_price: string
  stock: string
  low_stock_threshold: string
  stock_status: string
  is_active: boolean
  is_featured: boolean
  is_new: boolean
  is_bestseller: boolean
  category_id: string
  brand_id: string
  weight: string
  dimensions: string
  meta_title: string
  meta_description: string
}

interface BasicInfoTabProps {
  formData: FormData
  errors: Record<string, string>
  categories?: Category[]
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
}

export default function BasicInfoTab({ formData, errors, categories, onChange }: BasicInfoTabProps) {
  return (
    <>
      {/* Basic Info */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Basic Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onChange}
              required
              className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
              SKU *
            </label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={onChange}
              required
              className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
              Short Description
            </label>
            <textarea
              name="short_description"
              value={formData.short_description}
              onChange={onChange}
              rows={2}
              className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
              Full Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={onChange}
              rows={5}
              className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Pricing</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
              Price (PKR) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={onChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
              Compare Price
            </label>
            <input
              type="number"
              name="compare_price"
              value={formData.compare_price}
              onChange={onChange}
              min="0"
              step="0.01"
              placeholder="Original price for sale display"
              className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
              Cost Price
            </label>
            <input
              type="number"
              name="cost_price"
              value={formData.cost_price}
              onChange={onChange}
              min="0"
              step="0.01"
              placeholder="For profit calculation"
              className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Inventory */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Inventory</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
              Stock Quantity *
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={onChange}
              required
              min="0"
              className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
              Low Stock Alert
            </label>
            <input
              type="number"
              name="low_stock_threshold"
              value={formData.low_stock_threshold}
              onChange={onChange}
              min="0"
              className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
              Stock Status
            </label>
            <select
              name="stock_status"
              value={formData.stock_status}
              onChange={onChange}
              className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="in_stock">In Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="backorder">On Backorder</option>
              <option value="preorder">Pre-order</option>
            </select>
          </div>
        </div>
      </div>

      {/* Status flags */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Status</h2>
        <div className="space-y-3">
          {[
            { name: 'is_active', label: 'Active (visible on site)' },
            { name: 'is_featured', label: 'Featured Product' },
            { name: 'is_new', label: 'New Arrival' },
            { name: 'is_bestseller', label: 'Bestseller' },
          ].map(({ name, label }) => (
            <label key={name} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name={name}
                checked={formData[name as keyof typeof formData] as boolean}
                onChange={onChange}
                className="w-4 h-4 rounded border-dark-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-dark-700 dark:text-dark-300">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Category / Brand */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Organization</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
              Category
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={onChange}
              className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select Category</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Shipping */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Shipping</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
              Weight (kg)
            </label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={onChange}
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
              Dimensions (L x W x H cm)
            </label>
            <input
              type="text"
              name="dimensions"
              value={formData.dimensions}
              onChange={onChange}
              placeholder="e.g., 30 x 20 x 15"
              className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>
    </>
  )
}
