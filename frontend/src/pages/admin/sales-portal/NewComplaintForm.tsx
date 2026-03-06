import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { createComplaint, uploadComplaintAttachment } from '@/api/complaints'
import type {
  ComplainantType,
  ComplaintCategory,
  PurchaseChannel,
  CreateComplaintPayload,
} from '@/types/complaints'
import ProductPickerModal, { type PickedProduct } from './ProductPickerModal'
import {
  UserIcon,
  CubeIcon,
  ChatBubbleLeftEllipsisIcon,
  CameraIcon,
  CheckCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'

// ─── Constants ────────────────────────────────────────────────────────────────

const PAKISTAN_CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan',
  'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Bahawalpur',
  'Sargodha', 'Sukkur', 'Larkana', 'Sheikhupura', 'Rahim Yar Khan', 'Jhang',
  'Dera Ghazi Khan', 'Gujrat', 'Sahiwal', 'Wah Cantonment', 'Mardan', 'Kasur',
  'Okara', 'Mingora', 'Nawabshah', 'Mirpur Khas', 'Chiniot', 'Kotri',
]

const MONTHS = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' },
  { value: 3, label: 'March' },   { value: 4, label: 'April' },
  { value: 5, label: 'May' },     { value: 6, label: 'June' },
  { value: 7, label: 'July' },    { value: 8, label: 'August' },
  { value: 9, label: 'September' },{ value: 10, label: 'October' },
  { value: 11, label: 'November' },{ value: 12, label: 'December' },
]

const PURCHASE_CHANNELS: { value: PurchaseChannel; label: string }[] = [
  { value: 'website', label: 'Fischer Website' },
  { value: 'dealer',  label: 'Dealer / Shop' },
  { value: 'retailer',label: 'Retailer' },
  { value: 'market',  label: 'Market' },
  { value: 'other',   label: 'Other' },
]

const COMPLAINT_CATEGORIES: { value: ComplaintCategory; label: string; color: string }[] = [
  { value: 'defect',        label: 'Defect',           color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
  { value: 'delivery',      label: 'Delivery Issue',   color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
  { value: 'missing_item',  label: 'Missing Item',     color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' },
  { value: 'installation',  label: 'Installation',     color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800' },
  { value: 'warranty',      label: 'Warranty Claim',   color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' },
  { value: 'other',         label: 'Other',            color: 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700' },
]

const COMPLAINANT_OPTIONS: { value: ComplainantType; label: string; description: string }[] = [
  { value: 'offline_customer', label: 'Offline Customer', description: 'Bought from dealer or market' },
  { value: 'online_customer',  label: 'Online Customer',  description: 'Has a website account' },
  { value: 'dealer',           label: 'Dealer',           description: 'Batch or B2B complaint' },
]

// ─── Shared class strings ─────────────────────────────────────────────────────

const INPUT_CLS =
  'w-full px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors'

const LABEL_CLS = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'

// ─── Section header component ─────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  iconBg = 'bg-blue-50 dark:bg-blue-900/20',
  iconColor = 'text-blue-600 dark:text-blue-400',
}: {
  icon: React.ElementType
  title: string
  subtitle?: string
  iconBg?: string
  iconColor?: string
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white leading-tight">{title}</h2>
        {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 ${className}`}>
      {children}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function NewComplaintForm() {
  // Who is complaining
  const [complainantType, setComplainantType] = useState<ComplainantType>('offline_customer')

  // Complainant info
  const [complainantName, setComplainantName] = useState('')
  const [complainantPhone, setComplainantPhone] = useState('')
  const [complainantCity, setComplainantCity] = useState('')
  const [onlineOrderRef, setOnlineOrderRef] = useState('')

  // Product info
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

  // Complaint details
  const [category, setCategory] = useState<ComplaintCategory | ''>('')
  const [description, setDescription] = useState('')
  const [photoFiles, setPhotoFiles] = useState<File[]>([])

  // Submission state
  const [submitting, setSubmitting] = useState(false)
  const [successInfo, setSuccessInfo] = useState<{ number: string } | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  // ── Handlers ────────────────────────────────────────────────────────────────

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
    setPhotoFiles((prev) => [...prev, ...files].slice(0, 4))
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

    if (!complainantName.trim()) { setErrorMessage('Complainant name is required.'); return }
    if (!complainantPhone.trim()) { setErrorMessage('Phone number is required.'); return }
    if (!complainantCity) { setErrorMessage('Please select a city.'); return }
    if (!category) { setErrorMessage('Please select a complaint category.'); return }
    if (description.trim().length < 20) { setErrorMessage('Description must be at least 20 characters.'); return }

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

      if (photoFiles.length > 0) {
        await Promise.allSettled(
          photoFiles.map((file) => uploadComplaintAttachment(complaint.id, file)),
        )
      }

      toast.success(`Complaint ${complaint.complaint_number} filed successfully!`, { duration: 6000 })
      setSuccessInfo({ number: complaint.complaint_number })
      resetForm()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      const msg = axiosErr?.response?.data?.message || 'Failed to submit complaint. Please try again.'
      toast.error(msg)
      setErrorMessage(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const showDealerShopField = purchaseChannel === 'dealer' || purchaseChannel === 'retailer'
  const descLength = description.trim().length

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="max-w-2xl mx-auto space-y-4 pb-6">

        {/* ── Success Banner ──────────────────────────────────────────────────── */}
        {successInfo && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
                <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-green-900 dark:text-green-100 font-semibold text-base">
                  Complaint Filed Successfully
                </p>
                <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                  Share this reference number with the customer so they can track their complaint.
                </p>
                <div className="mt-3 inline-flex items-center gap-2 bg-white dark:bg-green-900/30 border border-green-200 dark:border-green-600 rounded-xl px-4 py-2">
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium uppercase tracking-wide">
                    Reference
                  </span>
                  <span className="text-xl font-mono font-bold text-green-900 dark:text-green-100 tracking-wider">
                    {successInfo.number}
                  </span>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => setSuccessInfo(null)}
                    className="text-sm font-medium text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 underline"
                  >
                    File another complaint
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Error Banner ────────────────────────────────────────────────────── */}
        {errorMessage && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl px-4 py-3 flex items-start gap-3">
            <XMarkIcon className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 dark:text-red-200 text-sm flex-1">{errorMessage}</p>
            <button
              onClick={() => setErrorMessage('')}
              className="text-red-400 hover:text-red-600 dark:hover:text-red-300 flex-shrink-0"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Section 1: Who is Complaining ──────────────────────────────────── */}
        <Card>
          <SectionHeader
            icon={UserIcon}
            title="Who is Complaining?"
            iconBg="bg-blue-50 dark:bg-blue-900/20"
            iconColor="text-blue-600 dark:text-blue-400"
          />
          <div className="space-y-2">
            {COMPLAINANT_OPTIONS.map((opt) => {
              const active = complainantType === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setComplainantType(opt.value)}
                  className={[
                    'w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all',
                    active
                      ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-700/50',
                  ].join(' ')}
                >
                  <div
                    className={[
                      'w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center',
                      active
                        ? 'border-blue-500 dark:border-blue-400'
                        : 'border-gray-300 dark:border-gray-500',
                    ].join(' ')}
                  >
                    {active && (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 dark:bg-blue-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${active ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'}`}>
                      {opt.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{opt.description}</p>
                  </div>
                  {active && <ChevronRightIcon className="w-4 h-4 text-blue-400 dark:text-blue-300 flex-shrink-0" />}
                </button>
              )
            })}
          </div>
        </Card>

        {/* ── Section 2: Complainant Details ─────────────────────────────────── */}
        <Card>
          <SectionHeader
            icon={UserIcon}
            title="Complainant Details"
            subtitle="Contact information for the person filing the complaint"
            iconBg="bg-indigo-50 dark:bg-indigo-900/20"
            iconColor="text-indigo-600 dark:text-indigo-400"
          />
          <div className="space-y-4">
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

            <div className="grid grid-cols-2 gap-3">
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
                <label className={LABEL_CLS}>City *</label>
                <select
                  value={complainantCity}
                  onChange={(e) => setComplainantCity(e.target.value)}
                  className={INPUT_CLS}
                >
                  <option value="">Select city</option>
                  {PAKISTAN_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
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
          </div>
        </Card>

        {/* ── Section 3: Product Information ─────────────────────────────────── */}
        <Card>
          <SectionHeader
            icon={CubeIcon}
            title="Product Information"
            subtitle="Select the product this complaint is about"
            iconBg="bg-purple-50 dark:bg-purple-900/20"
            iconColor="text-purple-600 dark:text-purple-400"
          />

          {/* Browse vs Manual toggle */}
          <div className="flex gap-2 mb-4 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
            <button
              onClick={() => { setUseManualProduct(false); setManualSku(''); setManualProductName('') }}
              className={[
                'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all',
                !useManualProduct
                  ? 'bg-white dark:bg-gray-600 text-blue-700 dark:text-blue-300 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200',
              ].join(' ')}
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
              Browse Catalog
            </button>
            <button
              onClick={() => {
                setUseManualProduct(true)
                setSelectedProductId(null); setSelectedProductName(''); setSelectedProductImage(null); setSelectedProductSku('')
              }}
              className={[
                'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all',
                useManualProduct
                  ? 'bg-white dark:bg-gray-600 text-blue-700 dark:text-blue-300 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200',
              ].join(' ')}
            >
              <PencilSquareIcon className="w-4 h-4" />
              Enter Manually
            </button>
          </div>

          {/* Product browse area */}
          {!useManualProduct && (
            <div className="mb-4">
              {selectedProductId ? (
                <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-700 rounded-xl p-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                    {selectedProductImage ? (
                      <img
                        src={selectedProductImage}
                        alt={selectedProductName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <CubeIcon className="w-6 h-6 text-gray-300 dark:text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <CheckCircleIcon className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Product selected</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2">
                      {selectedProductName}
                    </p>
                    {selectedProductSku && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
                        SKU: {selectedProductSku}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
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
                <button
                  onClick={() => setPickerOpen(true)}
                  className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/60 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
                >
                  <div className="w-11 h-11 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center group-hover:border-blue-300 dark:group-hover:border-blue-600 flex-shrink-0 transition-colors shadow-sm">
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                      Browse Product Catalog
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      Search by name or category, select variant
                    </p>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-blue-400 dark:group-hover:text-blue-500 flex-shrink-0 transition-colors" />
                </button>
              )}
            </div>
          )}

          {/* Manual product entry */}
          {useManualProduct && (
            <div className="mb-4 space-y-3">
              <div>
                <label className={LABEL_CLS}>Product SKU (optional)</label>
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

          {/* Purchase details sub-section */}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Purchase Details</p>

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
                    <option key={m.value} value={m.value}>{m.label}</option>
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
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={LABEL_CLS}>Purchased From</label>
              <select
                value={purchaseChannel}
                onChange={(e) => setPurchaseChannel(e.target.value as PurchaseChannel | '')}
                className={INPUT_CLS}
              >
                <option value="">Select channel</option>
                {PURCHASE_CHANNELS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
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

            <div>
              <label className={LABEL_CLS}>Serial Number (optional)</label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="Found on the product label"
                className={INPUT_CLS}
              />
            </div>
          </div>
        </Card>

        {/* ── Section 4: The Complaint ────────────────────────────────────────── */}
        <Card>
          <SectionHeader
            icon={ChatBubbleLeftEllipsisIcon}
            title="The Complaint"
            subtitle="What is the issue?"
            iconBg="bg-rose-50 dark:bg-rose-900/20"
            iconColor="text-rose-600 dark:text-rose-400"
          />

          <div className="space-y-4">
            {/* Category grid */}
            <div>
              <label className={LABEL_CLS}>Category *</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {COMPLAINT_CATEGORIES.map((cat) => {
                  const active = category === cat.value
                  return (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className={[
                        'p-3 rounded-xl border-2 text-left text-sm font-medium transition-all',
                        active
                          ? `border-current ${cat.color}`
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600',
                      ].join(' ')}
                    >
                      {cat.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className={LABEL_CLS}>Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Describe the issue in detail — what happened, when it happened, and any other relevant context..."
                className={`${INPUT_CLS} resize-none`}
              />
              <div className="flex items-center justify-between mt-1.5">
                <p
                  className={[
                    'text-xs',
                    descLength > 0 && descLength < 20
                      ? 'text-red-500 dark:text-red-400'
                      : 'text-gray-400 dark:text-gray-500',
                  ].join(' ')}
                >
                  {descLength < 20
                    ? `${20 - descLength} more characters needed`
                    : `${descLength} characters`}
                </p>
                {descLength >= 20 && (
                  <CheckCircleIcon className="w-4 h-4 text-green-500 dark:text-green-400" />
                )}
              </div>
            </div>

            {/* Photo upload */}
            <div>
              <label className={LABEL_CLS}>
                <div className="flex items-center gap-2">
                  <CameraIcon className="w-4 h-4" />
                  Photos (optional, max 4)
                </div>
              </label>

              {photoFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {photoFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Photo ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-xl border border-gray-200 dark:border-gray-600"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors shadow-md"
                        aria-label={`Remove photo ${index + 1}`}
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {photoFiles.length < 4 && (
                <label className="flex items-center gap-3 w-full px-4 py-3 bg-gray-50 dark:bg-gray-700/60 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group">
                  <CameraIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 flex-shrink-0 transition-colors" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                      Add photos
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {photoFiles.length}/4 photos · tap to add
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </Card>

        {/* ── Submit Button ───────────────────────────────────────────────────── */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-2xl py-4 text-base font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Submitting Complaint...
            </span>
          ) : (
            'Submit Complaint'
          )}
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
