import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { PaymentSettings } from './useSettingsData'
import type { UseMutationResult } from '@tanstack/react-query'

interface Props {
  paymentSettings: PaymentSettings
  setPaymentSettings: React.Dispatch<React.SetStateAction<PaymentSettings>>
  saveMutation: UseMutationResult<void, Error, Record<string, unknown>>
}

export default function PaymentSettingsTab({ paymentSettings, setPaymentSettings, saveMutation }: Props) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        saveMutation.mutate({ payment: paymentSettings })
      }}
      className="space-y-6 max-w-3xl"
    >
      {/* Cash on Delivery */}
      <div className="border border-dark-200 dark:border-dark-600 rounded-xl overflow-hidden">
        <label className="flex items-center justify-between p-4 bg-white dark:bg-dark-700 cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <span className="text-xl">💵</span>
            </div>
            <div>
              <span className="font-medium text-dark-900 dark:text-white">Cash on Delivery</span>
              <p className="text-sm text-dark-500 dark:text-dark-400">Allow customers to pay when they receive</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={paymentSettings.cod_enabled}
            onChange={(e) => setPaymentSettings({ ...paymentSettings, cod_enabled: e.target.checked })}
            className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
          />
        </label>
        {paymentSettings.cod_enabled && (
          <div className="p-4 bg-dark-50 dark:bg-dark-800 border-t border-dark-200 dark:border-dark-600">
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                Extra Charges (PKR)
              </label>
              <input
                type="number"
                value={paymentSettings.cod_extra_charges}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, cod_extra_charges: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="w-full max-w-xs px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">Additional fee charged for COD orders (set to 0 for no extra charges)</p>
            </div>
          </div>
        )}
      </div>

      {/* JazzCash */}
      <div className="border border-dark-200 dark:border-dark-600 rounded-xl overflow-hidden">
        <label className="flex items-center justify-between p-4 bg-white dark:bg-dark-700 cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <span className="text-lg font-bold text-red-600">JC</span>
            </div>
            <div>
              <span className="font-medium text-dark-900 dark:text-white">JazzCash</span>
              <p className="text-sm text-dark-500 dark:text-dark-400">Mobile wallet &amp; online banking</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={paymentSettings.jazzcash_enabled}
            onChange={(e) => setPaymentSettings({ ...paymentSettings, jazzcash_enabled: e.target.checked })}
            className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
          />
        </label>
        {paymentSettings.jazzcash_enabled && (
          <div className="p-4 bg-dark-50 dark:bg-dark-800 border-t border-dark-200 dark:border-dark-600 space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-dark-700 dark:text-dark-300">
                <input
                  type="checkbox"
                  checked={paymentSettings.jazzcash_sandbox}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, jazzcash_sandbox: e.target.checked })}
                  className="w-4 h-4 rounded text-primary-500"
                />
                Sandbox Mode (Testing)
              </label>
              <span className={`px-2 py-1 text-xs rounded-full ${paymentSettings.jazzcash_sandbox ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                {paymentSettings.jazzcash_sandbox ? 'Test Mode' : 'Live Mode'}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Merchant ID *</label>
                <input
                  type="text"
                  value={paymentSettings.jazzcash_merchant_id}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, jazzcash_merchant_id: e.target.value })}
                  placeholder="MC12345"
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Password *</label>
                <input
                  type="password"
                  value={paymentSettings.jazzcash_password}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, jazzcash_password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Integrity Salt *</label>
                <input
                  type="password"
                  value={paymentSettings.jazzcash_integrity_salt}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, jazzcash_integrity_salt: e.target.value })}
                  placeholder="Enter your integrity salt from JazzCash portal"
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">Found in JazzCash Merchant Portal under Security Settings</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Return URL</label>
                <input
                  type="text"
                  value={paymentSettings.jazzcash_return_url}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, jazzcash_return_url: e.target.value })}
                  placeholder="https://yoursite.com/payment/jazzcash/callback"
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Setup Guide:</strong> Register at{' '}
                <a href="https://www.jazzcash.com.pk/business" target="_blank" rel="noopener noreferrer" className="underline">
                  JazzCash Business Portal
                </a>
                {' '}to get your API credentials.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* EasyPaisa */}
      <div className="border border-dark-200 dark:border-dark-600 rounded-xl overflow-hidden">
        <label className="flex items-center justify-between p-4 bg-white dark:bg-dark-700 cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <span className="text-lg font-bold text-green-600">EP</span>
            </div>
            <div>
              <span className="font-medium text-dark-900 dark:text-white">EasyPaisa</span>
              <p className="text-sm text-dark-500 dark:text-dark-400">Mobile wallet &amp; online banking</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={paymentSettings.easypaisa_enabled}
            onChange={(e) => setPaymentSettings({ ...paymentSettings, easypaisa_enabled: e.target.checked })}
            className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
          />
        </label>
        {paymentSettings.easypaisa_enabled && (
          <div className="p-4 bg-dark-50 dark:bg-dark-800 border-t border-dark-200 dark:border-dark-600 space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-dark-700 dark:text-dark-300">
                <input
                  type="checkbox"
                  checked={paymentSettings.easypaisa_sandbox}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, easypaisa_sandbox: e.target.checked })}
                  className="w-4 h-4 rounded text-primary-500"
                />
                Sandbox Mode (Testing)
              </label>
              <span className={`px-2 py-1 text-xs rounded-full ${paymentSettings.easypaisa_sandbox ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                {paymentSettings.easypaisa_sandbox ? 'Test Mode' : 'Live Mode'}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Store ID *</label>
                <input
                  type="text"
                  value={paymentSettings.easypaisa_store_id}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, easypaisa_store_id: e.target.value })}
                  placeholder="12345"
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Hash Key *</label>
                <input
                  type="password"
                  value={paymentSettings.easypaisa_hash_key}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, easypaisa_hash_key: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Return URL</label>
                <input
                  type="text"
                  value={paymentSettings.easypaisa_return_url}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, easypaisa_return_url: e.target.value })}
                  placeholder="https://yoursite.com/payment/easypaisa/callback"
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Setup Guide:</strong> Apply for merchant account at{' '}
                <a href="https://www.easypaisa.com.pk/business" target="_blank" rel="noopener noreferrer" className="underline">
                  EasyPaisa Business
                </a>
                {' '}to get your Store ID and Hash Key.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Credit/Debit Cards (Stripe) */}
      <div className="border border-dark-200 dark:border-dark-600 rounded-xl overflow-hidden">
        <label className="flex items-center justify-between p-4 bg-white dark:bg-dark-700 cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <span className="text-xl">💳</span>
            </div>
            <div>
              <span className="font-medium text-dark-900 dark:text-white">Credit/Debit Cards</span>
              <p className="text-sm text-dark-500 dark:text-dark-400">Visa, Mastercard via Stripe</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={paymentSettings.card_enabled}
            onChange={(e) => setPaymentSettings({ ...paymentSettings, card_enabled: e.target.checked })}
            className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
          />
        </label>
        {paymentSettings.card_enabled && (
          <div className="p-4 bg-dark-50 dark:bg-dark-800 border-t border-dark-200 dark:border-dark-600 space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-dark-700 dark:text-dark-300">
                <input
                  type="checkbox"
                  checked={paymentSettings.stripe_sandbox}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, stripe_sandbox: e.target.checked })}
                  className="w-4 h-4 rounded text-primary-500"
                />
                Test Mode
              </label>
              <span className={`px-2 py-1 text-xs rounded-full ${paymentSettings.stripe_sandbox ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                {paymentSettings.stripe_sandbox ? 'Test Mode' : 'Live Mode'}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Publishable Key *</label>
                <input
                  type="text"
                  value={paymentSettings.stripe_publishable_key}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, stripe_publishable_key: e.target.value })}
                  placeholder={paymentSettings.stripe_sandbox ? "pk_test_..." : "pk_live_..."}
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Secret Key *</label>
                <input
                  type="password"
                  value={paymentSettings.stripe_secret_key}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, stripe_secret_key: e.target.value })}
                  placeholder={paymentSettings.stripe_sandbox ? "sk_test_..." : "sk_live_..."}
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">Never share this key. Keep it secure on server-side only.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Webhook Secret</label>
                <input
                  type="password"
                  value={paymentSettings.stripe_webhook_secret}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, stripe_webhook_secret: e.target.value })}
                  placeholder="whsec_..."
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">Required for payment confirmations. Get it from Stripe Dashboard &rarr; Webhooks.</p>
              </div>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Setup Guide:</strong> Get your API keys from{' '}
                <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="underline">
                  Stripe Dashboard
                </a>
                . Use test keys during development.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bank Transfer */}
      <div className="border border-dark-200 dark:border-dark-600 rounded-xl overflow-hidden">
        <label className="flex items-center justify-between p-4 bg-white dark:bg-dark-700 cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="text-xl">🏦</span>
            </div>
            <div>
              <span className="font-medium text-dark-900 dark:text-white">Bank Transfer</span>
              <p className="text-sm text-dark-500 dark:text-dark-400">Direct bank account transfer</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={paymentSettings.bank_transfer_enabled}
            onChange={(e) => setPaymentSettings({ ...paymentSettings, bank_transfer_enabled: e.target.checked })}
            className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
          />
        </label>
        {paymentSettings.bank_transfer_enabled && (
          <div className="p-4 bg-dark-50 dark:bg-dark-800 border-t border-dark-200 dark:border-dark-600 space-y-4">
            <p className="text-sm text-dark-600 dark:text-dark-400">
              Enter your bank account details. These will be shown to customers who choose bank transfer.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Bank Name *</label>
                <input
                  type="text"
                  value={paymentSettings.bank_name}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, bank_name: e.target.value })}
                  placeholder="HBL, MCB, UBL, etc."
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Account Title *</label>
                <input
                  type="text"
                  value={paymentSettings.bank_account_title}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, bank_account_title: e.target.value })}
                  placeholder="Fischer Electronics Pvt Ltd"
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Account Number *</label>
                <input
                  type="text"
                  value={paymentSettings.bank_account_number}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, bank_account_number: e.target.value })}
                  placeholder="1234567890123"
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">IBAN</label>
                <input
                  type="text"
                  value={paymentSettings.bank_iban}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, bank_iban: e.target.value })}
                  placeholder="PK36HABB0000000000000000"
                  className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-dark-200 dark:border-dark-700">
        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2 font-medium"
        >
          {saveMutation.isPending && <LoadingSpinner size="sm" />}
          Save Payment Settings
        </button>
      </div>
    </form>
  )
}
