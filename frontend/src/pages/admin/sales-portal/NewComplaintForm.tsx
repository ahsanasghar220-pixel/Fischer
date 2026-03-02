import { useState, useCallback } from 'react'
import { createComplaint, uploadComplaintAttachment } from '@/api/complaints'
import type {
  ComplainantType,
  ComplaintCategory,
  PurchaseChannel,
  CreateComplaintPayload,
} from '@/types/complaints'
import ProductPickerModal, { type PickedProduct } from './ProductPickerModal'

const PAKISTAN_CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan',
  'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Bahawalpur',
  'Sargodha', 'Sukkur', 'Larkana', 'Sheikhupura', 'Rahim Yar Khan', 'Jhang',
  'Dera Ghazi Khan', 'Gujrat', 'Sahiwal', 'Wah Cantonment', 'Mardan', 'Kasur',
  'Okara', 'Mingora', 'Nawabshah', 'Mirpur Khas', 'Chiniot', 'Kotri',
]

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
]

const PURCHASE_CHANNELS: { value: PurchaseChannel; label: string }[] = [
  { value: 'website', label: 'Fischer Website' },
  { value: 'dealer', label: 'Dealer/Shop' },
  { value: 'retailer', label: 'Retailer' },
  { value: 'market', label: 'Market' },
  { value: 'other', label: 'Other' },
]

const COMPLAINT_CATEGORIES: { value: ComplaintCategory; label: string }[] = [
  { value: 'defect', label: 'Defect' },
  { value: 'delivery', label: 'Delivery Issue' },
  { value: 'missing_item', label: 'Missing Item' },
  { value: 'installation', label: 'Installation Issue' },
  { value: 'warranty', label: 'Warranty Claim' },
  { value: 'other', label: 'Other' },
]

const COMPLAINANT_OPTIONS: { value: ComplainantType; label: string; description: string }[] = [
  {
    value: 'offline_customer',
    label: 'Offline Customer',
    description: 'Bought from dealer or market',
  },
  {
    value: 'online_customer',
    label: 'Online Customer',
    description: 'Has a website account',
  },
  {
    value: 'dealer',
    label: 'Dealer',
    description: 'Batch or B2B complaint',
  },
]

const INPUT_CLS =
  'w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400'
const LABEL_CLS = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
const CARD_CLS =
  'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm'
const SECTION_HEADING_CLS = 'text-lg font-semibold text-gray-900 dark:text-white'

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={`${CARD_CLS} p-4 space-y-4`}>
      <h2 className={SECTION_HEADING_CLS}>{title}</h2>
      {children}
    </div>
  )
}

export default function NewComplaintForm() {
  // Step 1: Who is complaining
  const [complainantType, setComplainantType] = useState<ComplainantType>('offline_customer')

  // Step 2: Complainant info
  const [complainantName, setComplainantName] = useState('')
  const [complainantPhone, setComplainantPhone] = useState('')
  const [complainantCity, setComplainantCity] = useState('')
  const [onlineOrderRef, setOnlineOrderRef] = useState('')

  // Step 3: Product info
  const [pickerOpen, setPickerOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [selectedProductName, setSelectedProductName] = useState('')
  const [selectedProductImage, setSelectedProductImage] = useState<string | null>(null)
  const [selectedProductSku, setSelectedProductSku] = useState('')
  const [useManualProduct, setUseManualProduct] = useState(false)
  const [manualSku, setManualSku] = useState('')
  const [manualProductName, setManualProductName] = useState('')
  const [purchaseMonth, setPurchaseMonth] = useState<number | ''>('')
  const [purchaseYear, setPurchaseYear] = useState<number | ''>('')
  const [purchaseChannel, setPurchaseChannel] = useState<PurchaseChannel | ''>('')
  const [dealerShopName, setDealerShopName] = useState('')
  const [serialNumber, setSerialNumber] = useState('')

  // Step 4: Complaint details
  const [category, setCategory] = useState<ComplaintCategory | ''>('')
  const [description, setDescription] = useState('')
  const [photoFiles, setPhotoFiles] = useState<File[]>([])

  // Submission
  const [submitting, setSubmitting] = useState(false)
  const [successInfo, setSuccessInfo] = useState<{ number: string } | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  const handlePickerSelect = useCallback((picked: PickedProduct) => {
    setSelectedProductId(picked.product.id)
    setSelectedProductName(picked.displayName)
    setSelectedProductImage(picked.product.image_url)
    setSelectedProductSku(picked.sku)
    setPickerOpen(false)
  }, [])

  const handleClearProduct = useCallback(() => {
    setSelectedProductId(null)
    setSelectedProductName('')
    setSelectedProductImage(null)
    setSelectedProductSku('')
  }, [])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const combined = [...photoFiles, ...files].slice(0, 4)
    setPhotoFiles(combined)
    e.target.value = ''
  }

  const removePhoto = (index: number) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const resetForm = () => {
    setComplainantType('offline_customer')
    setComplainantName('')
    setComplainantPhone('')
    setComplainantCity('')
    setOnlineOrderRef('')
    setSelectedProductId(null)
    setSelectedProductName('')
    setSelectedProductImage(null)
    setSelectedProductSku('')
    setUseManualProduct(false)
    setManualSku('')
    setManualProductName('')
    setPurchaseMonth('')
    setPurchaseYear('')
    setPurchaseChannel('')
    setDealerShopName('')
    setSerialNumber('')
    setCategory('')
    setDescription('')
    setPhotoFiles([])
    setErrorMessage('')
  }

  const handleSubmit = async () => {
    setErrorMessage('')

    if (!complainantName.trim()) {
      setErrorMessage('Complainant name is required.')
      return
    }
    if (!complainantPhone.trim()) {
      setErrorMessage('Phone number is required.')
      return
    }
    if (!category) {
      setErrorMessage('Please select a complaint category.')
      return
    }
    if (description.trim().length < 20) {
      setErrorMessage('Description must be at least 20 characters.')
      return
    }

    setSubmitting(true)
    try {
      const payload: CreateComplaintPayload = {
        complainant_type: complainantType,
        complainant_name: complainantName.trim(),
        complainant_phone: complainantPhone.trim(),
        complainant_city: complainantCity,
        complaint_category: category as ComplaintCategory,
        description: description.trim(),
      }

      if (complainantType === 'online_customer' && onlineOrderRef.trim()) {
        // store as notes reference — no dedicated field in payload, keep for description
      }

      if (!useManualProduct && selectedProductId) {
        payload.product_id = selectedProductId
      } else if (useManualProduct) {
        if (manualSku.trim()) payload.sku_manual = manualSku.trim()
        if (manualProductName.trim()) payload.product_name_manual = manualProductName.trim()
      }

      if (purchaseMonth !== '') payload.approx_purchase_month = Number(purchaseMonth)
      if (purchaseYear !== '') payload.approx_purchase_year = Number(purchaseYear)
      if (purchaseChannel) payload.purchase_channel = purchaseChannel as PurchaseChannel
      if (dealerShopName.trim()) payload.dealer_purchased_from = dealerShopName.trim()
      if (serialNumber.trim()) payload.serial_number = serialNumber.trim()

      const complaint = await createComplaint(payload)

      // Upload photos if any
      if (photoFiles.length > 0) {
        await Promise.allSettled(
          photoFiles.map((file) => uploadComplaintAttachment(complaint.id, file)),
        )
      }

      setSuccessInfo({ number: complaint.complaint_number })
      resetForm()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setErrorMessage(
        axiosErr?.response?.data?.message || 'Failed to submit complaint. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const showDealerShopField =
    purchaseChannel === 'dealer' || purchaseChannel === 'retailer'

  return (
    <>
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Success */}
      {successInfo && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-xl p-5">
          <p className="text-green-800 dark:text-green-100 font-bold text-lg">
            Complaint Filed Successfully
          </p>
          <p className="text-green-700 dark:text-green-200 text-sm mt-1">Reference number:</p>
          <p className="mt-2 text-2xl font-mono font-bold text-green-900 dark:text-green-100 tracking-wider">
            {successInfo.number}
          </p>
          <p className="text-green-700 dark:text-green-300 text-sm mt-3">
            Give this number to the customer so they can track their complaint.
          </p>
          <button
            onClick={() => setSuccessInfo(null)}
            className="mt-4 text-sm font-medium text-green-800 dark:text-green-200 underline"
          >
            File another complaint
          </button>
        </div>
      )}

      {/* Error */}
      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Step 1 — Who is complaining */}
      <SectionCard title="Who is complaining?">
        <div className="space-y-2">
          {COMPLAINANT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setComplainantType(opt.value)}
              className={[
                'w-full text-left p-4 rounded-xl border-2 transition-colors',
                complainantType === opt.value
                  ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500',
              ].join(' ')}
            >
              <div className="flex items-center gap-3">
                {/* Radio indicator */}
                <div
                  className={[
                    'w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center',
                    complainantType === opt.value
                      ? 'border-blue-500 dark:border-blue-400'
                      : 'border-gray-300 dark:border-gray-500',
                  ].join(' ')}
                >
                  {complainantType === opt.value && (
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 dark:bg-blue-400" />
                  )}
                </div>
                <div>
                  <p
                    className={[
                      'text-sm font-semibold',
                      complainantType === opt.value
                        ? 'text-blue-900 dark:text-blue-100'
                        : 'text-gray-900 dark:text-white',
                    ].join(' ')}
                  >
                    {opt.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {opt.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Step 2 — Complainant Info */}
      <SectionCard title="Complainant Details">
        <div>
          <label className={LABEL_CLS}>
            {complainantType === 'dealer' ? 'Dealer Name' : 'Customer Name'} *
          </label>
          <input
            type="text"
            value={complainantName}
            onChange={(e) => setComplainantName(e.target.value)}
            placeholder="Full name"
            className={INPUT_CLS}
          />
        </div>

        <div>
          <label className={LABEL_CLS}>Phone Number *</label>
          <input
            type="tel"
            value={complainantPhone}
            onChange={(e) => setComplainantPhone(e.target.value)}
            placeholder="03XX-XXXXXXX"
            className={INPUT_CLS}
          />
        </div>

        <div>
          <label className={LABEL_CLS}>City</label>
          <select
            value={complainantCity}
            onChange={(e) => setComplainantCity(e.target.value)}
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

        {complainantType === 'online_customer' && (
          <div>
            <label className={LABEL_CLS}>Order Number (optional)</label>
            <input
              type="text"
              value={onlineOrderRef}
              onChange={(e) => setOnlineOrderRef(e.target.value)}
              placeholder="e.g. ORD-2026-00123"
              className={INPUT_CLS}
            />
          </div>
        )}
      </SectionCard>

      {/* Step 3 — Product Info */}
      <SectionCard title="Product Information">
        {/* Toggle: browse vs manual */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setUseManualProduct(false)
              setManualSku('')
              setManualProductName('')
            }}
            className={[
              'flex-1 py-2 rounded-lg text-sm font-medium border transition-colors',
              !useManualProduct
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700',
            ].join(' ')}
          >
            Browse Products
          </button>
          <button
            onClick={() => {
              setUseManualProduct(true)
              setSelectedProductId(null)
              setSelectedProductName('')
              setSelectedProductImage(null)
              setSelectedProductSku('')
            }}
            className={[
              'flex-1 py-2 rounded-lg text-sm font-medium border transition-colors',
              useManualProduct
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700',
            ].join(' ')}
          >
            Enter Manually
          </button>
        </div>

        {!useManualProduct && (
          <div>
            {selectedProductId ? (
              /* Selected product card */
              <div className="flex items-center gap-3 bg-white dark:bg-gray-700 border border-blue-200 dark:border-blue-600 rounded-xl p-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-600">
                  {selectedProductImage ? (
                    <img src={selectedProductImage} alt={selectedProductName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-300 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2">
                    {selectedProductName}
                  </p>
                  {selectedProductSku && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">SKU: {selectedProductSku}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button
                    onClick={() => setPickerOpen(true)}
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Change
                  </button>
                  <button
                    onClick={handleClearProduct}
                    className="text-xs font-medium text-red-500 dark:text-red-400 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              /* Browse button */
              <button
                onClick={() => setPickerOpen(true)}
                className="w-full flex items-center gap-3 p-3.5 bg-white dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                    Browse Products
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
          </div>
        )}

        {useManualProduct && (
          <div className="space-y-3">
            <div>
              <label className={LABEL_CLS}>SKU (optional)</label>
              <input
                type="text"
                value={manualSku}
                onChange={(e) => setManualSku(e.target.value)}
                placeholder="e.g. FKH-60-SS"
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className={LABEL_CLS}>Product Name</label>
              <input
                type="text"
                value={manualProductName}
                onChange={(e) => setManualProductName(e.target.value)}
                placeholder="e.g. Fischer 60cm Kitchen Hood"
                className={INPUT_CLS}
              />
            </div>
          </div>
        )}

        {/* Purchase month / year */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>Purchase Month</label>
            <select
              value={purchaseMonth}
              onChange={(e) => setPurchaseMonth(e.target.value === '' ? '' : Number(e.target.value))}
              className={INPUT_CLS}
            >
              <option value="">Month</option>
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLS}>Year</label>
            <select
              value={purchaseYear}
              onChange={(e) => setPurchaseYear(e.target.value === '' ? '' : Number(e.target.value))}
              className={INPUT_CLS}
            >
              <option value="">Year</option>
              {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Purchase channel */}
        <div>
          <label className={LABEL_CLS}>Purchased From</label>
          <select
            value={purchaseChannel}
            onChange={(e) => setPurchaseChannel(e.target.value as PurchaseChannel | '')}
            className={INPUT_CLS}
          >
            <option value="">Select channel</option>
            {PURCHASE_CHANNELS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {showDealerShopField && (
          <div>
            <label className={LABEL_CLS}>Dealer / Shop Name</label>
            <input
              type="text"
              value={dealerShopName}
              onChange={(e) => setDealerShopName(e.target.value)}
              placeholder="Name of the shop or dealer"
              className={INPUT_CLS}
            />
          </div>
        )}

        {/* Serial number */}
        <div>
          <label className={LABEL_CLS}>Serial Number (optional)</label>
          <input
            type="text"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            placeholder="Found on product label"
            className={INPUT_CLS}
          />
        </div>
      </SectionCard>

      {/* Step 4 — Complaint Details */}
      <SectionCard title="The Complaint">
        <div>
          <label className={LABEL_CLS}>Category *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ComplaintCategory | '')}
            className={INPUT_CLS}
          >
            <option value="">Select category</option>
            {COMPLAINT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={LABEL_CLS}>Description *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe the issue in detail (minimum 20 characters)..."
            className={`${INPUT_CLS} resize-none`}
          />
          <p
            className={[
              'text-xs mt-1',
              description.trim().length > 0 && description.trim().length < 20
                ? 'text-red-500 dark:text-red-400'
                : 'text-gray-400 dark:text-gray-500',
            ].join(' ')}
          >
            {description.trim().length} / 20 minimum characters
          </p>
        </div>

        {/* Photo upload */}
        <div>
          <label className={LABEL_CLS}>Photos (optional, max 4)</label>
          {photoFiles.length < 4 && (
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors bg-gray-50 dark:bg-gray-900">
              <svg
                className="w-6 h-6 text-gray-400 dark:text-gray-500 mb-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Tap to add photo ({photoFiles.length}/4)
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          )}

          {photoFiles.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {photoFiles.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Photo ${index + 1}`}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                  />
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600 transition-colors"
                    aria-label={`Remove photo ${index + 1}`}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </SectionCard>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-4 text-lg font-semibold transition-colors disabled:opacity-50"
      >
        {submitting ? 'Submitting Complaint...' : 'Submit Complaint'}
      </button>
    </div>

    {/* Product Picker Modal */}
    <ProductPickerModal
      isOpen={pickerOpen}
      onClose={() => setPickerOpen(false)}
      onSelect={handlePickerSelect}
      title="Select Product"
    />
    </>
  )
}
