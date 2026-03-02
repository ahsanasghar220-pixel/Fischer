import { useState, useCallback } from 'react'
import { createOrder } from '@/api/b2b'
import type { BrandName, NewOrderItem } from '@/types/b2b'
import ProductPickerModal, { type PickedProduct } from './ProductPickerModal'

const PAKISTAN_CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan',
  'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Bahawalpur',
  'Sargodha', 'Sukkur', 'Larkana', 'Sheikhupura', 'Rahim Yar Khan', 'Jhang',
  'Dera Ghazi Khan', 'Gujrat', 'Sahiwal', 'Wah Cantonment', 'Mardan', 'Kasur',
  'Okara', 'Mingora', 'Nawabshah', 'Mirpur Khas', 'Chiniot', 'Kotri',
]

interface OrderItemDraft {
  id: string
  product_id: number | null
  sku: string
  product_name: string
  image_url: string | null
  category_name: string | null
  unit_price: string | number | null
  quantity: number
  notes: string
}

function makeEmptyItem(): OrderItemDraft {
  return {
    id: crypto.randomUUID(),
    product_id: null,
    sku: '',
    product_name: '',
    image_url: null,
    category_name: null,
    unit_price: null,
    quantity: 1,
    notes: '',
  }
}

const INPUT_CLS =
  'w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400'
const LABEL_CLS = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
const CARD_CLS =
  'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm'

function formatPrice(price: string | number | null | undefined): string {
  if (price == null || price === '') return ''
  const num = typeof price === 'string' ? parseFloat(price) : price
  if (isNaN(num)) return ''
  return `Rs. ${num.toLocaleString()}`
}

export default function NewOrderForm() {
  const [dealerName, setDealerName] = useState('')
  const [city, setCity] = useState('')
  const [brand, setBrand] = useState<BrandName>('Fischer')
  const [remarks, setRemarks] = useState('')
  const [items, setItems] = useState<OrderItemDraft[]>([makeEmptyItem()])
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Product picker modal state
  const [pickerOpen, setPickerOpen] = useState(false)
  const [activeItemId, setActiveItemId] = useState<string | null>(null)

  const updateItem = useCallback((id: string, patch: Partial<OrderItemDraft>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }, [])

  const handleOpenPicker = useCallback((itemId: string) => {
    setActiveItemId(itemId)
    setPickerOpen(true)
  }, [])

  const handlePickerSelect = useCallback(
    (picked: PickedProduct) => {
      if (!activeItemId) return
      updateItem(activeItemId, {
        product_id: picked.product.id,
        sku: picked.sku,
        product_name: picked.displayName,
        image_url: picked.product.image_url,
        category_name: picked.product.category_name,
        unit_price: picked.price,
      })
      setPickerOpen(false)
      setActiveItemId(null)
    },
    [activeItemId, updateItem],
  )

  const handlePickerClose = useCallback(() => {
    setPickerOpen(false)
    setActiveItemId(null)
  }, [])

  const handleQuantityChange = useCallback((id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item,
      ),
    )
  }, [])

  const handleRemoveItem = useCallback((id: string) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((item) => item.id !== id) : prev))
  }, [])

  const handleAddItem = useCallback(() => {
    setItems((prev) => [...prev, makeEmptyItem()])
  }, [])

  const handleClearProduct = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, product_id: null, sku: '', product_name: '', image_url: null, category_name: null, unit_price: null }
          : item,
      ),
    )
  }, [])

  const handleSubmit = async () => {
    setErrorMessage('')
    setSuccessMessage('')

    if (!dealerName.trim()) {
      setErrorMessage('Dealer name is required.')
      return
    }
    if (!city) {
      setErrorMessage('Please select a city.')
      return
    }

    const validItems = items.filter((i) => i.sku.trim() || i.product_id)
    if (validItems.length === 0) {
      setErrorMessage('Please add at least one product.')
      return
    }

    setSubmitting(true)
    try {
      const orderItems: NewOrderItem[] = validItems.map((i) => ({
        product_id: i.product_id,
        sku: i.sku,
        product_name: i.product_name,
        quantity: i.quantity,
        notes: i.notes,
      }))

      const result = await createOrder({
        dealer_name: dealerName.trim(),
        city,
        brand_name: brand,
        remarks: remarks.trim(),
        items: orderItems,
      })

      setSuccessMessage(`Order ${result.order_number} submitted!`)
      setDealerName('')
      setCity('')
      setBrand('Fischer')
      setRemarks('')
      setItems([makeEmptyItem()])
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setErrorMessage(
        axiosErr?.response?.data?.message || 'Failed to submit order. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="space-y-5 max-w-2xl mx-auto">
        {/* Success Banner */}
        {successMessage && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-xl p-4">
            <p className="text-green-800 dark:text-green-200 font-semibold text-base">
              {successMessage}
            </p>
            <p className="text-green-700 dark:text-green-300 text-sm mt-1">
              The order has been submitted for production.
            </p>
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl p-4">
            <p className="text-red-800 dark:text-red-200 text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Dealer Info Card */}
        <div className={`${CARD_CLS} p-4 space-y-4`}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dealer Information</h2>

          <div>
            <label className={LABEL_CLS}>Dealer Name *</label>
            <input
              type="text"
              value={dealerName}
              onChange={(e) => setDealerName(e.target.value)}
              placeholder="Enter dealer name"
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className={LABEL_CLS}>City *</label>
            <select value={city} onChange={(e) => setCity(e.target.value)} className={INPUT_CLS}>
              <option value="">Select city</option>
              {PAKISTAN_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLS}>Brand</label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value as BrandName)}
              className={INPUT_CLS}
            >
              <option value="Fischer">Fischer</option>
              <option value="OEM">OEM</option>
              <option value="ODM">ODM</option>
            </select>
          </div>
        </div>

        {/* Products Card */}
        <div className={`${CARD_CLS} p-4 space-y-4`}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Products</h2>

          {items.map((item, index) => (
            <div
              key={item.id}
              className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 space-y-3 bg-gray-50 dark:bg-gray-900"
            >
              {/* Item header */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Item {index + 1}
                </span>
                {items.length > 1 && (
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    aria-label="Remove item"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Product selection */}
              {item.product_id ? (
                /* Selected product card */
                <div className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-xl p-3">
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-300 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {item.category_name && (
                      <p className="text-xs font-medium text-blue-600 dark:text-blue-400 truncate">
                        {item.category_name}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2">
                      {item.product_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">SKU: {item.sku}</p>
                    {item.unit_price && (
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5">
                        {formatPrice(item.unit_price)}
                      </p>
                    )}
                  </div>
                  {/* Change button */}
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleOpenPicker(item.id)}
                      className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Change
                    </button>
                    <button
                      onClick={() => handleClearProduct(item.id)}
                      className="text-xs font-medium text-red-500 dark:text-red-400 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                /* Pick product button */
                <button
                  onClick={() => handleOpenPicker(item.id)}
                  className="w-full flex items-center gap-3 p-3.5 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                      Choose Product
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Browse catalog with images &amp; variants
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}

              {/* Quantity Stepper */}
              <div>
                <label className={LABEL_CLS}>Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleQuantityChange(item.id, -1)}
                    className="w-11 h-11 flex items-center justify-center rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors active:scale-95"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="text-xl font-semibold text-gray-900 dark:text-white w-10 text-center tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(item.id, 1)}
                    className="w-11 h-11 flex items-center justify-center rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors active:scale-95"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className={LABEL_CLS}>Notes (optional)</label>
                <input
                  type="text"
                  value={item.notes}
                  onChange={(e) => updateItem(item.id, { notes: e.target.value })}
                  placeholder="e.g. colour preference, special packing..."
                  className={INPUT_CLS}
                />
              </div>
            </div>
          ))}

          {/* Add Another Product */}
          <button
            onClick={handleAddItem}
            className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            + Add Another Product
          </button>
        </div>

        {/* Remarks Card */}
        <div className={`${CARD_CLS} p-4`}>
          <label className={LABEL_CLS}>Order Remarks (optional)</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={3}
            placeholder="Any additional notes about this order..."
            className={`${INPUT_CLS} resize-none`}
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-4 text-lg font-semibold transition-colors disabled:opacity-50"
        >
          {submitting ? 'Submitting Order...' : 'Submit Order'}
        </button>
      </div>

      {/* Product Picker Modal */}
      <ProductPickerModal
        isOpen={pickerOpen}
        onClose={handlePickerClose}
        onSelect={handlePickerSelect}
        title="Choose Product"
      />
    </>
  )
}
