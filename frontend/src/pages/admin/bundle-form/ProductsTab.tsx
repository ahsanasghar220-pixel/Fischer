import { PlusIcon, TrashIcon, XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { formatPrice } from '@/lib/utils'
import ProductSearchModal from './ProductSearchModal'
import type { BundleFormData, BundleItem, BundleSlot, BundleProductLocal } from './types'

interface ProductsTabProps {
  formData: BundleFormData
  items: BundleItem[]
  setItems: React.Dispatch<React.SetStateAction<BundleItem[]>>
  slots: BundleSlot[]
  setSlots: React.Dispatch<React.SetStateAction<BundleSlot[]>>
  productSearch: string
  setProductSearch: (v: string) => void
  showProductSearch: boolean
  setShowProductSearch: (v: boolean) => void
  setSelectedSlotIndex: (v: number | null) => void
  searchResults: BundleProductLocal[] | undefined
  loadingProducts: boolean
  onAddProduct: (product: BundleProductLocal) => void
  onRemoveProduct: (index: number) => void
  onAddSlot: () => void
  onRemoveSlot: (index: number) => void
  onRemoveSlotProduct: (slotIndex: number, productIndex: number) => void
}

export default function ProductsTab({
  formData,
  items,
  setItems,
  slots,
  setSlots,
  productSearch,
  setProductSearch,
  showProductSearch,
  setShowProductSearch,
  setSelectedSlotIndex,
  searchResults,
  loadingProducts,
  onAddProduct,
  onRemoveProduct,
  onAddSlot,
  onRemoveSlot,
  onRemoveSlotProduct,
}: ProductsTabProps) {
  return (
    <div className="space-y-6">
      {formData.bundle_type === 'fixed' ? (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-dark-900 dark:text-white">Bundle Items</h3>
            <button
              type="button"
              onClick={() => {
                setShowProductSearch(true)
                setSelectedSlotIndex(null)
              }}
              className="btn btn-primary btn-sm flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Add Product
            </button>
          </div>

          {items.length === 0 ? (
            <p className="text-dark-500 dark:text-dark-400 text-center py-8">
              No products added yet. Click "Add Product" to add items to this bundle.
            </p>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => {
                const isOOS = item.product?.stock_status === 'out_of_stock'
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-4 p-4 rounded-lg ${
                      isOOS
                        ? 'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30'
                        : 'bg-dark-50 dark:bg-dark-700'
                    }`}
                  >
                    <div className="w-12 h-12 bg-dark-200 dark:bg-dark-600 rounded overflow-hidden flex-shrink-0">
                      {item.product?.primary_image && (
                        <img
                          src={item.product.primary_image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-dark-900 dark:text-white">
                          {item.product?.name}
                        </p>
                        {isOOS && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded">
                            <ExclamationTriangleIcon className="w-3 h-3" />
                            Out of Stock
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-dark-500 dark:text-dark-400">
                        {formatPrice(item.product?.price || 0)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <label className="text-xs text-dark-500 dark:text-dark-400">Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const newItems = [...items]
                            newItems[index].quantity = parseInt(e.target.value) || 1
                            setItems(newItems)
                          }}
                          className="w-16 px-2 py-1 border border-dark-200 dark:border-dark-600 rounded bg-white dark:bg-dark-800 text-dark-900 dark:text-white text-center"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-dark-500 dark:text-dark-400">
                          Override Price
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price_override || ''}
                          onChange={(e) => {
                            const newItems = [...items]
                            newItems[index].price_override = e.target.value
                              ? parseFloat(e.target.value)
                              : undefined
                            setItems(newItems)
                          }}
                          placeholder="Original"
                          className="w-24 px-2 py-1 border border-dark-200 dark:border-dark-600 rounded bg-white dark:bg-dark-800 text-dark-900 dark:text-white text-center"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveProduct(index)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-dark-900 dark:text-white">Bundle Slots</h3>
            <button
              type="button"
              onClick={onAddSlot}
              className="btn btn-primary btn-sm flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Add Slot
            </button>
          </div>

          {slots.length === 0 ? (
            <p className="text-dark-500 dark:text-dark-400 text-center py-8">
              No slots added yet. Click "Add Slot" to create selection options for customers.
            </p>
          ) : (
            <div className="space-y-6">
              {slots.map((slot, slotIndex) => (
                <div
                  key={slotIndex}
                  className="border border-dark-200 dark:border-dark-600 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={slot.name}
                        onChange={(e) => {
                          const newSlots = [...slots]
                          newSlots[slotIndex].name = e.target.value
                          setSlots(newSlots)
                        }}
                        placeholder="Slot Name"
                        className="px-3 py-2 border border-dark-200 dark:border-dark-600 rounded bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                      />
                      <div className="flex gap-2">
                        <div>
                          <label className="text-xs text-dark-500">Min</label>
                          <input
                            type="number"
                            min="0"
                            value={slot.min_selections}
                            onChange={(e) => {
                              const newSlots = [...slots]
                              newSlots[slotIndex].min_selections = parseInt(e.target.value) || 0
                              setSlots(newSlots)
                            }}
                            className="w-16 px-2 py-1 border border-dark-200 dark:border-dark-600 rounded bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-dark-500">Max</label>
                          <input
                            type="number"
                            min="1"
                            value={slot.max_selections}
                            onChange={(e) => {
                              const newSlots = [...slots]
                              newSlots[slotIndex].max_selections = parseInt(e.target.value) || 1
                              setSlots(newSlots)
                            }}
                            className="w-16 px-2 py-1 border border-dark-200 dark:border-dark-600 rounded bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
                          />
                        </div>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={slot.is_required}
                            onChange={(e) => {
                              const newSlots = [...slots]
                              newSlots[slotIndex].is_required = e.target.checked
                              setSlots(newSlots)
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-xs text-dark-500">Required</span>
                        </label>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveSlot(slotIndex)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {slot.products.map((product, productIndex) => {
                      const isProductOOS = product.product?.stock_status === 'out_of_stock'
                      return (
                        <div
                          key={productIndex}
                          className={`flex items-center gap-3 p-2 rounded ${
                            isProductOOS
                              ? 'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30'
                              : 'bg-dark-50 dark:bg-dark-700'
                          }`}
                        >
                          <div className="w-8 h-8 bg-dark-200 dark:bg-dark-600 rounded overflow-hidden">
                            {product.product?.primary_image && (
                              <img
                                src={product.product.primary_image}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <span className="flex-1 text-sm text-dark-900 dark:text-white flex items-center gap-2">
                            {product.product?.name}
                            {isProductOOS && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded">
                                <ExclamationTriangleIcon className="w-3 h-3" />
                                Out of Stock
                              </span>
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() => onRemoveSlotProduct(slotIndex, productIndex)}
                            className="p-1 text-red-500"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    })}
                    <button
                      type="button"
                      onClick={() => {
                        setShowProductSearch(true)
                        setSelectedSlotIndex(slotIndex)
                      }}
                      className="w-full py-2 border-2 border-dashed border-dark-300 dark:border-dark-600 rounded text-dark-500 hover:border-primary-500 hover:text-primary-500 text-sm"
                    >
                      + Add Product to Slot
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showProductSearch && (
        <ProductSearchModal
          productSearch={productSearch}
          setProductSearch={setProductSearch}
          searchResults={searchResults}
          loadingProducts={loadingProducts}
          onAdd={onAddProduct}
          onClose={() => {
            setShowProductSearch(false)
            setSelectedSlotIndex(null)
          }}
        />
      )}
    </div>
  )
}
