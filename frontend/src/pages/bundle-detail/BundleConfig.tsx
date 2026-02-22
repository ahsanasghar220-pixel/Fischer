import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  CheckIcon,
  GiftIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import type { BundleSlot } from '@/api/bundles'
import type { Bundle } from '@/api/bundles'
import { formatPrice, formatDescription } from '@/lib/utils'

// ─── Slot Selector ──────────────────────────────────────────────────────────

interface SlotSelectorProps {
  slot: BundleSlot
  selectedProductIds: number[]
  onSelect: (productId: number) => void
}

function SlotSelector({ slot, selectedProductIds, onSelect }: SlotSelectorProps) {
  const isComplete = selectedProductIds.length >= slot.min_selections
  const canSelectMore = slot.allows_multiple && selectedProductIds.length < slot.max_selections

  return (
    <div className={`border rounded-xl overflow-hidden transition-colors ${
      isComplete
        ? 'border-green-500 dark:border-green-500/50'
        : slot.is_required
        ? 'border-orange-500 dark:border-orange-500/50'
        : 'border-gray-200 dark:border-dark-700'
    }`}>
      {/* Header */}
      <div className={`px-4 py-3 flex items-center justify-between ${
        isComplete
          ? 'bg-green-50 dark:bg-green-900/20'
          : 'bg-gray-50 dark:bg-dark-800'
      }`}>
        <div>
          <h4 className="font-semibold text-dark-900 dark:text-white flex items-center gap-2">
            {slot.name}
            {slot.is_required && (
              <span className="text-xs text-red-500">*Required</span>
            )}
            {isComplete && (
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
            )}
          </h4>
          {slot.description && (
            <div className="text-sm text-dark-500 dark:text-dark-400 mt-0.5 space-y-0.5">
              {formatDescription(slot.description).map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          )}
        </div>
        <div className="text-sm text-dark-500 dark:text-dark-400">
          {slot.allows_multiple ? (
            <span>
              Select {slot.min_selections}-{slot.max_selections}
            </span>
          ) : (
            <span>Select 1</span>
          )}
        </div>
      </div>

      {/* Products */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {slot.products.map((slotProduct) => {
          const isSelected = selectedProductIds.includes(slotProduct.product_id)
          const canSelect = isSelected || !slot.allows_multiple || canSelectMore

          return (
            <motion.button
              key={slotProduct.id}
              onClick={() => canSelect && onSelect(slotProduct.product_id)}
              disabled={!canSelect}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : canSelect
                  ? 'border-gray-200 dark:border-dark-600 hover:border-primary-300 dark:hover:border-primary-700'
                  : 'border-gray-100 dark:border-dark-700 opacity-50 cursor-not-allowed'
              }`}
              whileHover={canSelect ? { scale: 1.02 } : {}}
              whileTap={canSelect ? { scale: 0.98 } : {}}
            >
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-dark-700 flex-shrink-0">
                {slotProduct.product.image ? (
                  <img
                    src={slotProduct.product.image}
                    alt={slotProduct.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <GiftIcon className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm line-clamp-1 ${
                  isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-dark-900 dark:text-white'
                }`}>
                  {slotProduct.product.name}
                </p>
                <p className="text-sm text-dark-500 dark:text-dark-400">
                  {formatPrice(slotProduct.effective_price)}
                </p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                isSelected
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-gray-300 dark:border-dark-500'
              }`}>
                {isSelected && <CheckIcon className="w-4 h-4 text-white" />}
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// ─── BundleConfig ────────────────────────────────────────────────────────────

interface BundleConfigProps {
  bundle: Bundle
  selections: Map<number, number[]>
  onSlotSelect: (slotId: number, productId: number) => void
}

export default function BundleConfig({ bundle, selections, onSlotSelect }: BundleConfigProps) {
  return (
    <>
      {/* Fixed Bundle - Products List */}
      {bundle.bundle_type === 'fixed' && bundle.items.length > 0 && (
        <div className="border dark:border-dark-700 rounded-xl overflow-hidden">
          <div className="bg-gray-50 dark:bg-dark-800 px-4 py-3 border-b dark:border-dark-700">
            <h3 className="font-semibold text-dark-900 dark:text-white flex items-center gap-2">
              <GiftIcon className="w-5 h-5 text-primary-500" />
              What's Included ({bundle.items.length} items)
            </h3>
          </div>
          <div className="divide-y dark:divide-dark-700">
            {bundle.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-dark-700 flex-shrink-0">
                  {item.product.image ? (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <GiftIcon className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/product/${item.product.slug}`}
                    className="font-medium text-dark-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 line-clamp-1"
                  >
                    {item.product.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-dark-500 dark:text-dark-400">
                      Qty: {item.quantity}
                    </span>
                    {item.product.is_in_stock ? (
                      <span className="text-xs text-green-600 dark:text-green-400">In Stock</span>
                    ) : (
                      <span className="text-xs text-red-600 dark:text-red-400">Out of Stock</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-medium text-dark-900 dark:text-white">
                    {formatPrice(item.line_total)}
                  </span>
                  {item.quantity > 1 && (
                    <p className="text-xs text-dark-500 dark:text-dark-400">
                      {formatPrice(item.effective_price)} each
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Configurable Bundle - Slot Selection */}
      {bundle.bundle_type === 'configurable' && bundle.slots.length > 0 && (
        <div className="space-y-6">
          <h3 className="font-semibold text-lg text-dark-900 dark:text-white">
            Build Your Bundle
          </h3>
          {bundle.slots.map((slot) => (
            <SlotSelector
              key={slot.id}
              slot={slot}
              selectedProductIds={selections.get(slot.id) || []}
              onSelect={(productId) => onSlotSelect(slot.id, productId)}
            />
          ))}
        </div>
      )}
    </>
  )
}
