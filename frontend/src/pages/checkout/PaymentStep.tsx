import { motion } from 'framer-motion'
import { CreditCardIcon, TruckIcon } from '@heroicons/react/24/outline'
import { formatPrice } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { PAYMENT_METHODS } from '@/data'
import type { ShippingMethod } from '@/types'
import type { CheckoutForm } from './useCheckout'

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

      <div className="mt-6 flex justify-between">
        <motion.button
          type="button"
          onClick={onBack}
          className="btn btn-outline dark:border-dark-600 dark:text-dark-300 dark:hover:bg-dark-700 px-8"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Back
        </motion.button>
        <motion.button
          type="button"
          onClick={onNext}
          className="btn btn-primary px-8"
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
}

export default function PaymentStep({
  form,
  grandTotal,
  isPending,
  handleInputChange,
  onBack,
  onPaymentSelect,
}: PaymentStepProps) {
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
        {PAYMENT_METHODS.map((method) => (
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

      {/* Bank Transfer Instructions & Transaction ID */}
      {form.payment_method === 'bank_transfer' && (
        <div className="mt-6 p-6 bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="font-semibold text-dark-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="text-2xl">🏦</span>
            Bank Transfer Details
          </h3>
          <div className="space-y-2 text-sm text-dark-700 dark:text-dark-300 mb-4">
            <p><strong>Bank Name:</strong> HBL - Habib Bank Limited</p>
            <p><strong>Account Title:</strong> Fischer Pakistan</p>
            <p><strong>Account Number:</strong> Contact: 0321-1234567</p>
            <p className="text-xs text-dark-500 dark:text-dark-400 mt-3">
              ⚠️ After transferring, enter your transaction ID below. Your order will be confirmed after admin verification.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              Transaction ID / Reference Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="transaction_id"
              value={form.transaction_id}
              onChange={handleInputChange}
              required
              placeholder="Enter your transaction ID or reference number"
              className="w-full px-4 py-3 border-2 border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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

      <div className="mt-6 flex justify-between">
        <motion.button
          type="button"
          onClick={onBack}
          className="btn btn-outline dark:border-dark-600 dark:text-dark-300 dark:hover:bg-dark-700 px-8"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Back
        </motion.button>
        <motion.button
          type="submit"
          disabled={isPending}
          className="btn btn-primary px-8"
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
