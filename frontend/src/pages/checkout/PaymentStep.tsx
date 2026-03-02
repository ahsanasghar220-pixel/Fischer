import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CreditCardIcon, TruckIcon, ArrowUpTrayIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { formatPrice } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { PAYMENT_METHODS } from '@/data'
import type { ShippingMethod } from '@/types'
import type { CheckoutForm } from './useCheckout'
import api from '@/lib/api'

interface DeliveryStepProps {
  form: CheckoutForm
  shippingMethods: ShippingMethod[] | undefined
  onBack: () => void
  onNext: () => void
  onMethodSelect: (methodId: number) => void
}

export function DeliveryStep({
  form,
  shippingMethods,
  onBack,
  onNext,
  onMethodSelect,
}: DeliveryStepProps) {
  return (
    <motion.div
      key="step2"
      className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-6">
        <TruckIcon className="w-6 h-6 inline-block mr-2" />
        Delivery Method
      </h2>

      {shippingMethods && shippingMethods.length > 0 ? (
        <div className="space-y-3">
          {shippingMethods.map((method) => (
            <div
              key={method.id}
              onClick={() => onMethodSelect(method.id)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                form.shipping_method_id === method.id
                  ? 'border-primary-500 bg-primary-500/10 dark:bg-primary-900/20 shadow-md'
                  : 'border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-800 hover:border-primary-300 dark:hover:border-dark-500 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-dark-900 dark:text-white">{method.name}</span>
                    {method.cost === 0 && (
                      <span className="px-2 py-0.5 bg-green-500/15 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full">
                        FREE
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-dark-600 dark:text-dark-400">{method.description}</p>
                  <p className="text-sm text-dark-500 dark:text-dark-500 mt-0.5">Delivery in {method.estimated_delivery}</p>
                </div>
                {method.cost > 0 && (
                  <div className="text-right ml-4">
                    <span className="font-bold text-lg text-primary-600 dark:text-primary-400">
                      {formatPrice(method.cost)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-dark-500 dark:text-dark-400">
          {form.shipping_city
            ? 'No shipping methods available for this location'
            : 'Please select a city first'}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3 justify-between">
        <motion.button
          type="button"
          onClick={onBack}
          className="btn btn-outline dark:border-dark-600 dark:text-dark-300 dark:hover:bg-dark-700 px-8 min-h-[44px]"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Back
        </motion.button>
        <motion.button
          type="button"
          onClick={onNext}
          className="btn btn-primary px-8 min-h-[44px]"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Continue to Payment
        </motion.button>
      </div>
    </motion.div>
  )
}

interface PaymentStepProps {
  form: CheckoutForm
  grandTotal: number
  isPending: boolean
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  onBack: () => void
  onPaymentSelect: (methodId: string) => void
  onReceiptUpload: (path: string) => void
}

export default function PaymentStep({
  form,
  grandTotal,
  isPending,
  handleInputChange,
  onBack,
  onPaymentSelect,
  onReceiptUpload,
}: PaymentStepProps) {
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Payment methods and bank details loaded from API, with hardcoded fallback
  const [paymentMethods, setPaymentMethods] = useState(PAYMENT_METHODS)
  const [bankDetails, setBankDetails] = useState<{
    bank_name: string
    bank_branch: string
    account_title: string
    account_number: string
    iban: string
  } | null>(null)

  useEffect(() => {
    api.get('/api/settings/payment')
      .then(res => {
        const data = res.data?.data
        if (Array.isArray(data?.methods) && data.methods.length > 0) {
          setPaymentMethods(data.methods)
        }
        if (data?.bank_details) setBankDetails(data.bank_details)
      })
      .catch(() => { /* keep hardcoded fallback */ })
  }, [])

  const handleReceiptChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show local preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (ev) => setReceiptPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setReceiptPreview(null)
    }

    setUploadError(null)
    setUploadLoading(true)
    try {
      const formData = new FormData()
      formData.append('receipt', file)
      const res = await api.post('/api/checkout/upload-receipt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onReceiptUpload(res.data.data.path)
    } catch {
      setUploadError('Upload failed. Please try again.')
      setReceiptPreview(null)
      onReceiptUpload('')
    } finally {
      setUploadLoading(false)
    }
  }

  const handleRemoveReceipt = () => {
    setReceiptPreview(null)
    setUploadError(null)
    onReceiptUpload('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <motion.div
      key="step3"
      className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-6">
        <CreditCardIcon className="w-6 h-6 inline-block mr-2" />
        Payment Method
      </h2>

      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            onClick={() => onPaymentSelect(method.id)}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all active:scale-[0.98] ${
              form.payment_method === method.id
                ? 'border-primary-500 bg-primary-500/10 dark:bg-primary-900/20 shadow-md'
                : 'border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-800 hover:border-primary-300 dark:hover:border-dark-500 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">{method.icon}</span>
              <div>
                <span className="font-medium text-dark-900 dark:text-white">{method.name}</span>
                <p className="text-sm text-dark-500 dark:text-dark-400">{method.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bank Transfer Instructions & Receipt Upload */}
      {form.payment_method === 'bank_transfer' && (
        <div className="mt-6 p-6 bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-200 dark:border-blue-800 rounded-lg space-y-4">
          <h3 className="font-semibold text-dark-900 dark:text-white flex items-center gap-2">
            <span className="text-2xl">🏦</span>
            Bank Transfer Details
          </h3>

          {/* Bank details - dynamic from settings */}
          <div className="bg-white dark:bg-dark-700 rounded-lg p-4 space-y-2 text-sm">
            {bankDetails?.bank_name && (
              <div className="flex justify-between gap-2">
                <span className="text-dark-500 dark:text-dark-400 shrink-0">Bank</span>
                <span className="font-medium text-dark-900 dark:text-white text-right">{bankDetails.bank_name}</span>
              </div>
            )}
            {bankDetails?.bank_branch && (
              <div className="flex justify-between gap-2">
                <span className="text-dark-500 dark:text-dark-400 shrink-0">Branch</span>
                <span className="font-medium text-dark-900 dark:text-white text-right">{bankDetails.bank_branch}</span>
              </div>
            )}
            {bankDetails?.account_title && (
              <div className="flex justify-between gap-2">
                <span className="text-dark-500 dark:text-dark-400 shrink-0">Account Name</span>
                <span className="font-medium text-dark-900 dark:text-white text-right">{bankDetails.account_title}</span>
              </div>
            )}
            {bankDetails?.account_number && (
              <div className="flex justify-between gap-2">
                <span className="text-dark-500 dark:text-dark-400 shrink-0">Account No.</span>
                <span className="font-mono font-semibold text-dark-900 dark:text-white text-right">{bankDetails.account_number}</span>
              </div>
            )}
            {bankDetails?.iban && (
              <div className="flex justify-between gap-2">
                <span className="text-dark-500 dark:text-dark-400 shrink-0">IBAN</span>
                <span className="font-mono font-semibold text-dark-900 dark:text-white text-right">{bankDetails.iban}</span>
              </div>
            )}
            {!bankDetails && (
              <p className="text-dark-500 dark:text-dark-400 text-center py-2">Loading bank details...</p>
            )}
          </div>

          <p className="text-xs text-dark-500 dark:text-dark-400">
            After transferring, upload your payment receipt below. Your order will be confirmed after admin verification.
          </p>

          {/* Receipt upload */}
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              Upload Payment Receipt <span className="text-red-500">*</span>
            </label>

            {form.payment_proof && !uploadError ? (
              <div className="border-2 border-green-400 dark:border-green-600 rounded-lg p-3 bg-green-50 dark:bg-green-900/10">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {receiptPreview ? (
                      <img src={receiptPreview} alt="Receipt preview" className="w-16 h-16 object-cover rounded-lg shrink-0 border border-green-200" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-green-100 dark:bg-green-800 flex items-center justify-center shrink-0">
                        <span className="text-2xl">📄</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">Receipt uploaded</span>
                      </div>
                      <p className="text-xs text-dark-500 dark:text-dark-400 mt-0.5">Tap to replace</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveReceipt}
                    className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 shrink-0"
                    title="Remove receipt"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => !uploadLoading && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  uploadError
                    ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
                    : 'border-blue-300 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 bg-white dark:bg-dark-700'
                }`}
              >
                {uploadLoading ? (
                  <div className="flex flex-col items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span className="text-sm text-dark-500 dark:text-dark-400">Uploading receipt…</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <ArrowUpTrayIcon className="w-8 h-8 text-blue-400 dark:text-blue-500" />
                    <span className="text-sm font-medium text-dark-700 dark:text-dark-300">
                      {uploadError ? 'Try again — tap to select file' : 'Tap to upload receipt'}
                    </span>
                    <span className="text-xs text-dark-400">JPG, PNG or PDF · Max 5 MB</span>
                    {uploadError && <span className="text-xs text-red-500">{uploadError}</span>}
                  </div>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,application/pdf"
              className="hidden"
              onChange={handleReceiptChange}
            />
          </div>

          {/* Optional transaction reference */}
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              Transaction ID / Reference <span className="text-dark-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              name="transaction_id"
              value={form.transaction_id}
              onChange={handleInputChange}
              placeholder="e.g. TXN123456"
              className="w-full px-4 py-3 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      )}

      {/* JazzCash/EasyPaisa Notice */}
      {(form.payment_method === 'jazzcash' || form.payment_method === 'easypaisa') && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-300">
            ✓ You will be redirected to {form.payment_method === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'} secure payment gateway after placing your order.
          </p>
        </div>
      )}

      {/* Card Notice */}
      {form.payment_method === 'card' && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            ✓ You will be redirected to Paymob's secure payment page to enter your card details. Visa and Mastercard accepted.
          </p>
        </div>
      )}

      {/* Order Notes */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
          Order Notes (Optional)
        </label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleInputChange}
          rows={3}
          placeholder="Any special instructions for your order..."
          className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-3 justify-between">
        <motion.button
          type="button"
          onClick={onBack}
          className="btn btn-outline dark:border-dark-600 dark:text-dark-300 dark:hover:bg-dark-700 px-8 min-h-[44px]"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Back
        </motion.button>
        <motion.button
          type="submit"
          disabled={isPending}
          className="btn btn-primary px-6 sm:px-8 min-h-[44px] flex items-center gap-2"
          whileHover={{ scale: isPending ? 1 : 1.02 }}
          whileTap={{ scale: isPending ? 1 : 0.98 }}
        >
          {isPending ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Processing...
            </>
          ) : (
            `Place Order - ${formatPrice(grandTotal)}`
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}
