import type { Product } from '@/types'

interface VariantsTabProps {
  product?: Product
}

export default function VariantsTab({ product }: VariantsTabProps) {
  const variants = product?.variants ?? []

  if (variants.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Variants</h2>
        <p className="text-dark-500 dark:text-dark-400 text-sm">
          No variants configured for this product. Variant management can be added here.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Variants</h2>
      <div className="divide-y divide-dark-200 dark:divide-dark-700">
        {variants.map((variant) => (
          <div key={variant.id} className="py-3 flex items-center justify-between">
            <div>
              <p className="font-medium text-dark-900 dark:text-white">{variant.name}</p>
              <p className="text-sm text-dark-500 dark:text-dark-400">SKU: {variant.sku}</p>
            </div>
            <div className="text-right">
              <p className="text-dark-900 dark:text-white">
                Rs. {variant.price?.toLocaleString()}
              </p>
              <p className="text-sm text-dark-500 dark:text-dark-400">Stock: {variant.stock}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
