import { motion } from 'framer-motion'

const productCategories = [
  'Water Cooler',
  'Geyser',
  'Cooking Range',
  'Microwave Oven',
  'Water Dispenser',
  'Deep Freezer',
  'Air Cooler',
  'Other',
]

export type ProductLookupFields = {
  product_category: string
  product_model: string
  serial_number: string
  purchase_date: string
  issue_description: string
}

interface ProductLookupProps {
  values: ProductLookupFields
  onChange: (fields: Partial<ProductLookupFields>) => void
}

export default function ProductLookup({ values, onChange }: ProductLookupProps) {
  const fields: {
    label: string
    field: keyof ProductLookupFields
    type: string
    options?: string[]
    placeholder?: string
  }[] = [
    { label: 'Product Category *', field: 'product_category', type: 'select', options: productCategories, placeholder: 'Select product category' },
    { label: 'Model Number', field: 'product_model', type: 'text', placeholder: 'e.g., FC-2000' },
    { label: 'Serial Number', field: 'serial_number', type: 'text', placeholder: 'Found on product label' },
    { label: 'Purchase Date', field: 'purchase_date', type: 'date' },
  ]

  return (
    <>
      {fields.map((item, index) => (
        <motion.div
          key={item.field}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + index * 0.05 }}
        >
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">{item.label}</label>
          {item.type === 'select' ? (
            <select
              value={values[item.field] as string}
              onChange={(e) => onChange({ [item.field]: e.target.value })}
              className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              required={item.label.includes('*')}
            >
              <option value="">{item.placeholder}</option>
              {item.options?.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              type={item.type}
              value={values[item.field] as string}
              onChange={(e) => onChange({ [item.field]: e.target.value })}
              placeholder={item.placeholder}
              className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 dark:placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            />
          )}
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Issue Description *</label>
        <textarea
          value={values.issue_description}
          onChange={(e) => onChange({ issue_description: e.target.value })}
          rows={4}
          placeholder="Please describe the issue in detail..."
          className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 dark:placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
          required
        />
      </motion.div>
    </>
  )
}
