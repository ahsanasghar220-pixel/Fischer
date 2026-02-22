type FormData = {
  meta_title: string
  meta_description: string
  [key: string]: unknown
}

interface SeoTabProps {
  formData: FormData
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
}

export default function SeoTab({ formData, onChange }: SeoTabProps) {
  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">SEO</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
            Meta Title
          </label>
          <input
            type="text"
            name="meta_title"
            value={formData.meta_title}
            onChange={onChange}
            placeholder="Leave blank to use product name"
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
            Meta Description
          </label>
          <textarea
            name="meta_description"
            value={formData.meta_description}
            onChange={onChange}
            rows={3}
            placeholder="Brief description for search engines (max 160 chars)"
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p className="text-xs text-dark-400 dark:text-dark-500 mt-1">
            {formData.meta_description.length}/160 characters
          </p>
        </div>
      </div>
    </div>
  )
}
