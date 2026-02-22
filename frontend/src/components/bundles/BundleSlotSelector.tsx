import { CheckIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import type { BundleSlot } from '@/api/bundles'

// ─── QuickSlotSelector ────────────────────────────────────────────────────────

interface QuickSlotSelectorProps {
  slot: BundleSlot
  selectedProductIds: number[]
  onSelect: (productId: number) => void
}

export function QuickSlotSelector({ slot, selectedProductIds, onSelect }: QuickSlotSelectorProps) {
  const isComplete = selectedProductIds.length >= slot.min_selections
  const canSelectMore = slot.allows_multiple && selectedProductIds.length < slot.max_selections

  return (
    <div className={`border rounded-lg overflow-hidden ${
      isComplete
        ? 'border-green-500/50'
        : slot.is_required
        ? 'border-orange-500/50'
        : 'border-gray-200 dark:border-dark-600'
    }`}>
      <div className={`px-3 py-2 text-sm font-medium flex items-center justify-between ${
        isComplete ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-dark-700'
      }`}>
        <span className="flex items-center gap-2">
          {slot.name}
          {slot.is_required && <span className="text-red-500 text-xs">*</span>}
          {isComplete && <CheckCircleIcon className="w-4 h-4 text-green-500" />}
        </span>
        <span className="text-xs text-dark-500 dark:text-dark-400">
          {slot.allows_multiple ? `${slot.min_selections}-${slot.max_selections}` : '1'}
        </span>
      </div>
      <div className="p-2 flex flex-wrap gap-2">
        {slot.products.slice(0, 6).map((slotProduct) => {
          const isSelected = selectedProductIds.includes(slotProduct.product_id)
          const isOOS = slotProduct.product?.is_in_stock === false
          const canSelect = !isOOS && (isSelected || !slot.allows_multiple || canSelectMore)

          return (
            <button
              key={slotProduct.id}
              onClick={() => canSelect && onSelect(slotProduct.product_id)}
              disabled={!canSelect}
              title={isOOS ? `${slotProduct.product.name} is out of stock` : undefined}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border text-sm transition-all ${
                isOOS
                  ? 'border-gray-200 dark:border-dark-700 bg-gray-100 dark:bg-dark-800 opacity-50 cursor-not-allowed'
                  : isSelected
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : canSelect
                  ? 'border-gray-200 dark:border-dark-600 hover:border-primary-300'
                  : 'border-gray-100 dark:border-dark-700 opacity-50 cursor-not-allowed'
              }`}
            >
              {slotProduct.product.image && (
                <img
                  src={slotProduct.product.image}
                  alt=""
                  className={`w-6 h-6 rounded object-cover ${isOOS ? 'grayscale' : ''}`}
                />
              )}
              <span className={`truncate max-w-[100px] ${isOOS ? 'line-through text-dark-400' : ''}`}>
                {slotProduct.product.name}
              </span>
              {isOOS && (
                <span className="text-[9px] font-semibold text-red-500 dark:text-red-400 whitespace-nowrap">
                  OOS
                </span>
              )}
              {isSelected && !isOOS && <CheckIcon className="w-4 h-4 text-primary-500 flex-shrink-0" />}
            </button>
          )
        })}
        {slot.products.length > 6 && (
          <span className="text-xs text-dark-500 dark:text-dark-400 self-center">
            +{slot.products.length - 6} more
          </span>
        )}
      </div>
    </div>
  )
}

// ─── BundleSlotSelector (full list) ──────────────────────────────────────────

interface BundleSlotSelectorProps {
  slots: BundleSlot[]
  selections: Map<number, number[]>
  onSelect: (slotId: number, productId: number, allowsMultiple: boolean) => void
}

export default function BundleSlotSelector({ slots, selections, onSelect }: BundleSlotSelectorProps) {
  return (
    <div className="mt-4 space-y-4">
      {slots.map((slot) => (
        <QuickSlotSelector
          key={slot.id}
          slot={slot}
          selectedProductIds={selections.get(slot.id) || []}
          onSelect={(productId) => onSelect(slot.id, productId, slot.allows_multiple)}
        />
      ))}
    </div>
  )
}
