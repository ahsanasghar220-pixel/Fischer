import { useState, useEffect, useRef, useCallback } from 'react'
import { createOrder, searchProducts } from '@/api/b2b'
import type { BrandName, NewOrderItem, ProductSearchResult } from '@/types/b2b'

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
  quantity: number
  notes: string
  searchQuery: string
  searchResults: ProductSearchResult[]
  isSearching: boolean
  showDropdown: boolean
}

function makeEmptyItem(): OrderItemDraft {
  return {
    id: crypto.randomUUID(),
    product_id: null,
    sku: '',
    product_name: '',
    quantity: 1,
    notes: '',
    searchQuery: '',
    searchResults: [],
    isSearching: false,
    showDropdown: false,
  }
}

const INPUT_CLS =
  'w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400'
const LABEL_CLS = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
const CARD_CLS =
  'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm'

export default function NewOrderForm() {
  const [dealerName, setDealerName] = useState('')
  const [city, setCity] = useState('')
  const [brand, setBrand] = useState<BrandName>('Fischer')
  const [remarks, setRemarks] = useState('')
  const [items, setItems] = useState<OrderItemDraft[]>([makeEmptyItem()])
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      setItems((prev) =>
        prev.map((item) => {
          const ref = dropdownRefs.current[item.id]
          if (ref && !ref.contains(e.target as Node)) {
            return { ...item, showDropdown: false }
          }
          return item
        }),
      )
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const updateItem = useCallback((id: string, patch: Partial<OrderItemDraft>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }, [])

  const handleSearchChange = useCallback(
    (id: string, value: string) => {
      updateItem(id, {
        searchQuery: value,
        product_id: null,
        sku: '',
        product_name: '',
        showDropdown: value.length >= 2,
      })

      if (debounceTimers.current[id]) clearTimeout(debounceTimers.current[id])

      if (value.length < 2) {
        updateItem(id, { searchResults: [], isSearching: false })
        return
      }

      updateItem(id, { isSearching: true })
      debounceTimers.current[id] = setTimeout(async () => {
        try {
          const results = await searchProducts(value)
          updateItem(id, { searchResults: results, isSearching: false, showDropdown: true })
        } catch {
          updateItem(id, { isSearching: false })
        }
      }, 300)
    },
    [updateItem],
  )

  const handleSelectProduct = useCallback(
    (id: string, product: ProductSearchResult) => {
      updateItem(id, {
        product_id: product.id,
        sku: product.sku,
        product_name: product.name,
        searchQuery: product.name,
        showDropdown: false,
        searchResults: [],
      })
    },
    [updateItem],
  )

  const handleQuantityChange = useCallback(
    (id: string, delta: number) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item,
        ),
      )
    },
    [],
  )

  const handleRemoveItem = useCallback((id: string) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((item) => item.id !== id) : prev))
  }, [])

  const handleAddItem = useCallback(() => {
    setItems((prev) => [...prev, makeEmptyItem()])
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

    for (const item of validItems) {
      if (!item.product_name.trim()) {
        setErrorMessage('Each product must have a name.')
        return
      }
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
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={INPUT_CLS}
          >
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

            {/* Product Search */}
            <div
              ref={(el) => { dropdownRefs.current[item.id] = el }}
              className="relative"
            >
              <label className={LABEL_CLS}>Product *</label>
              <input
                type="text"
                value={item.searchQuery}
                onChange={(e) => handleSearchChange(item.id, e.target.value)}
                placeholder="Search by name or SKU..."
                className={INPUT_CLS}
              />

              {/* Dropdown */}
              {item.showDropdown && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                  {item.isSearching && (
                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      Searching...
                    </div>
                  )}
                  {!item.isSearching && item.searchResults.length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      No products found
                    </div>
                  )}
                  {!item.isSearching &&
                    item.searchResults.map((product) => (
                      <button
                        key={product.id}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          handleSelectProduct(item.id, product)
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                      >
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          SKU: {product.sku} &bull; Rs.{' '}
                          {typeof product.price === 'number'
                            ? product.price.toLocaleString()
                            : product.price}
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* Selected product pill */}
            {item.product_id && (
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg px-3 py-2">
                <svg
                  className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 truncate">
                    {item.product_name}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">SKU: {item.sku}</p>
                </div>
              </div>
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
  )
}
