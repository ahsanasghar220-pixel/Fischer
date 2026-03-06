import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { createOrder } from '@/api/b2b'
import type { BrandName, NewOrderItem } from '@/types/b2b'
import ProductPickerModal, { type PickedProduct } from './ProductPickerModal'
import DealerAutocomplete from './DealerAutocomplete'
import {
  PlusIcon,
  TrashIcon,
  ShoppingBagIcon,
  BuildingStorefrontIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'

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

function formatPrice(price: string | number | null | undefined): string {
  if (price == null || price === '') return ''
  const num = typeof price === 'string' ? parseFloat(price) : price
  if (isNaN(num)) return ''
  return `Rs. ${num.toLocaleString()}`
}

function parseNumericPrice(price: string | number | null | undefined): number {
  if (price == null || price === '') return 0
  const num = typeof price === 'string' ? parseFloat(price) : price
  return isNaN(num) ? 0 : num
}

// ─── Shared class tokens ──────────────────────────────────────────────────────

const INPUT_CLS =
  'w-full px-3.5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm transition-colors'

const LABEL_CLS =
  'block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5'

const SECTION_CLS =
  'bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden'

// ─── Product Image Placeholder ────────────────────────────────────────────────

function ImagePlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
      <ShoppingBagIcon className="w-6 h-6 text-gray-300 dark:text-gray-500" />
    </div>
  )
}

// ─── Individual Order Item Card ───────────────────────────────────────────────

interface ItemCardProps {
  item: OrderItemDraft
  index: number
  totalItems: number
  onOpenPicker: (id: string) => void
  onRemove: (id: string) => void
  onQuantityChange: (id: string, delta: number) => void
  onNotesChange: (id: string, notes: string) => void
  onClearProduct: (id: string) => void
}

function ItemCard({
  item,
  index,
  totalItems,
  onOpenPicker,
  onRemove,
  onQuantityChange,
  onNotesChange,
  onClearProduct,
}: ItemCardProps) {
  const hasProduct = !!item.product_id

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-900/50">
      {/* Item header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Item {index + 1}
        </span>
        {totalItems > 1 && (
          <button
            onClick={() => onRemove(item.id)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            aria-label="Remove item"
          >
            <TrashIcon className="w-3.5 h-3.5" />
            Remove
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Product Selection */}
        {hasProduct ? (
          /* Selected product display */
          <div className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700/50 rounded-2xl p-3 group">
            {/* Thumbnail */}
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-700">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.product_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImagePlaceholder />
              )}
            </div>

            {/* Product info */}
            <div className="flex-1 min-w-0">
              {item.category_name && (
                <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide truncate mb-0.5">
                  {item.category_name}
                </p>
              )}
              <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2">
                {item.product_name}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-0.5">{item.sku}</p>
              {item.unit_price != null && (
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-1">
                  {formatPrice(item.unit_price)}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <button
                onClick={() => onOpenPicker(item.id)}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Change
              </button>
              <button
                onClick={() => onClearProduct(item.id)}
                className="text-xs font-medium text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        ) : (
          /* Pick product CTA */
          <button
            onClick={() => onOpenPicker(item.id)}
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
              <PlusIcon className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                Choose a Product
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Browse catalog — all products &amp; variants
              </p>
            </div>
            <ChevronRightIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
          </button>
        )}

        {/* Quantity stepper */}
        <div>
          <p className={LABEL_CLS}>Quantity</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onQuantityChange(item.id, -1)}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all disabled:opacity-40"
              disabled={item.quantity <= 1}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <div className="flex-1 text-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                {item.quantity}
              </span>
              {item.unit_price != null && item.quantity > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  = {formatPrice(parseNumericPrice(item.unit_price) * item.quantity)}
                </p>
              )}
            </div>
            <button
              onClick={() => onQuantityChange(item.id, 1)}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        {/* Notes */}
        <div>
          <p className={LABEL_CLS}>Notes (optional)</p>
          <input
            type="text"
            value={item.notes}
            onChange={(e) => onNotesChange(item.id, e.target.value)}
            placeholder="e.g. colour preference, special packing..."
            className={INPUT_CLS}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Order Summary ────────────────────────────────────────────────────────────

interface SummaryProps {
  items: OrderItemDraft[]
}

function OrderSummary({ items }: SummaryProps) {
  const filledItems = items.filter((i) => i.product_id && i.unit_price != null)
  const totalQty = filledItems.reduce((s, i) => s + i.quantity, 0)
  const totalValue = filledItems.reduce(
    (s, i) => s + parseNumericPrice(i.unit_price) * i.quantity,
    0,
  )
  const hasTotal = totalValue > 0

  if (filledItems.length === 0) return null

  return (
    <div className={`${SECTION_CLS}`}>
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Order Summary
        </p>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {filledItems.map((item) => (
          <div key={item.id} className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-700">
              {item.image_url ? (
                <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
              ) : (
                <ImagePlaceholder />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                {item.product_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatPrice(item.unit_price)} &times; {item.quantity}
              </p>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white flex-shrink-0">
              {formatPrice(parseNumericPrice(item.unit_price) * item.quantity)}
            </p>
          </div>
        ))}
      </div>
      {hasTotal && (
        <div className="flex items-center justify-between px-4 py-3.5 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-200 dark:border-gray-600">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {filledItems.length} product{filledItems.length !== 1 ? 's' : ''} · {totalQty} unit{totalQty !== 1 ? 's' : ''}
            </p>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Dealer Price Total</p>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{formatPrice(totalValue)}</p>
        </div>
      )}
    </div>
  )
}

// ─── Main Form Component ──────────────────────────────────────────────────────

export default function NewOrderForm() {
  const [dealerName, setDealerName] = useState('')
  const [city, setCity] = useState('')
  const [brand, setBrand] = useState<BrandName>('Fischer')
  const [remarks, setRemarks] = useState('')
  const [items, setItems] = useState<OrderItemDraft[]>([makeEmptyItem()])
  const [submitting, setSubmitting] = useState(false)

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
          ? {
              ...item,
              product_id: null,
              sku: '',
              product_name: '',
              image_url: null,
              category_name: null,
              unit_price: null,
            }
          : item,
      ),
    )
  }, [])

  const handleNotesChange = useCallback((id: string, notes: string) => {
    updateItem(id, { notes })
  }, [updateItem])

  const handleSubmit = async () => {
    if (!dealerName.trim()) {
      toast.error('Dealer name is required.')
      return
    }
    if (!city) {
      toast.error('Please select a city.')
      return
    }

    const validItems = items.filter((i) => i.sku.trim() || i.product_id)
    if (validItems.length === 0) {
      toast.error('Please add at least one product.')
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

      toast.success(`Order ${result.order_number} submitted successfully!`, { duration: 6000 })
      setDealerName('')
      setCity('')
      setBrand('Fischer')
      setRemarks('')
      setItems([makeEmptyItem()])
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      toast.error(axiosErr?.response?.data?.message || 'Failed to submit order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const filledItemCount = items.filter((i) => i.product_id).length

  return (
    <>
      <div className="space-y-5 max-w-2xl mx-auto pb-8">

        {/* ── Dealer Info Card ────────────────────────────── */}
        <div className={SECTION_CLS}>
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
            <BuildingStorefrontIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Dealer Information
            </p>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className={LABEL_CLS}>Dealer Name <span className="text-red-400">*</span></label>
              <DealerAutocomplete
                value={dealerName}
                onChange={setDealerName}
                onSelectDealer={(d) => {
                  setDealerName(d.name)
                  if (d.city) setCity(d.city)
                }}
                inputClassName={INPUT_CLS}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS}>City <span className="text-red-400">*</span></label>
                <select value={city} onChange={(e) => setCity(e.target.value)} className={INPUT_CLS}>
                  <option value="">Select city</option>
                  {PAKISTAN_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
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
          </div>
        </div>

        {/* ── Products Section ────────────────────────────── */}
        <div className={SECTION_CLS}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
            <div className="flex items-center gap-2.5">
              <ShoppingBagIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Products
              </p>
            </div>
            {filledItemCount > 0 && (
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                {filledItemCount} selected
              </span>
            )}
          </div>

          <div className="p-4 space-y-4">
            {items.map((item, index) => (
              <ItemCard
                key={item.id}
                item={item}
                index={index}
                totalItems={items.length}
                onOpenPicker={handleOpenPicker}
                onRemove={handleRemoveItem}
                onQuantityChange={handleQuantityChange}
                onNotesChange={handleNotesChange}
                onClearProduct={handleClearProduct}
              />
            ))}

            {/* Add another product */}
            <button
              onClick={handleAddItem}
              className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl text-sm font-semibold text-gray-500 dark:text-gray-400 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all"
            >
              <PlusIcon className="w-4 h-4" />
              Add Another Product
            </button>
          </div>
        </div>

        {/* ── Order Summary ───────────────────────────────── */}
        <OrderSummary items={items} />

        {/* ── Remarks Card ────────────────────────────────── */}
        <div className={SECTION_CLS}>
          <div className="p-4">
            <label className={LABEL_CLS}>Order Remarks (optional)</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              placeholder="Any additional notes about this order..."
              className={`${INPUT_CLS} resize-none`}
            />
          </div>
        </div>

        {/* ── Submit Button ───────────────────────────────── */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-2xl py-4 text-base font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Submitting Order...
            </span>
          ) : (
            'Submit Order'
          )}
        </button>
      </div>

      {/* ── Product Picker Modal ────────────────────────── */}
      <ProductPickerModal
        isOpen={pickerOpen}
        onClose={handlePickerClose}
        onSelect={handlePickerSelect}
        title="Choose Product"
      />
    </>
  )
}
