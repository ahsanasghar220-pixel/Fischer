import type { BundleFormData } from './types'

interface SeoTabProps {
  formData: BundleFormData
  setFormData: React.Dispatch<React.SetStateAction<BundleFormData>>
}

export default function SeoTab({ formData, setFormData }: SeoTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
          Meta Title
        </label>
        <input
          type="text"
          value={formData.meta_title}
          onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
          placeholder={formData.name || 'Bundle name will be used if empty'}
          maxLength={255}
          className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
          Meta Description
        </label>
        <textarea
          value={formData.meta_description}
          onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
          placeholder={formData.short_description || 'Short description will be used if empty'}
          rows={3}
          maxLength={500}
          className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
    </div>
  )
}
