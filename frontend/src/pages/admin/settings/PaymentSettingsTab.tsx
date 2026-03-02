import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { PaymentSettings } from './useSettingsData'
import type { UseMutationResult } from '@tanstack/react-query'

interface Props {
  paymentSettings: PaymentSettings
  setPaymentSettings: React.Dispatch<React.SetStateAction<PaymentSettings>>
  saveMutation: UseMutationResult<void, Error, Record<string, unknown>>
}

// ─── Reusable Toggle Switch ────────────────────────────────────────────────────
function Toggle({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id?: string }) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-dark-800 ${
        checked ? 'bg-primary-600' : 'bg-gray-200 dark:bg-dark-700'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

// ─── Mode Toggle (Test / Live) ─────────────────────────────────────────────────
function ModeToggle({
  sandbox,
  onChange,
}: {
  sandbox: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-dark-600 dark:text-dark-300">Environment:</span>
      <div className="flex items-center gap-2 rounded-lg border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-700 p-1">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`px-3 py-1 rounded-md text-xs font-semibold transition-all duration-150 ${
            sandbox
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200'
          }`}
        >
          Test
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`px-3 py-1 rounded-md text-xs font-semibold transition-all duration-150 ${
            !sandbox
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200'
          }`}
        >
          Live
        </button>
      </div>
      {sandbox ? (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-700/40">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
          Test Mode
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700/40">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
          Live Mode
        </span>
      )}
    </div>
  )
}

// ─── Shared Field Styles ───────────────────────────────────────────────────────
const fieldClass =
  'w-full px-3 py-2.5 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white text-sm placeholder:text-dark-400 dark:placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors'

const fieldClassMono =
  'w-full px-3 py-2.5 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white text-sm font-mono placeholder:text-dark-400 dark:placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors'

// ─── Field Label ───────────────────────────────────────────────────────────────
function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-dark-600 dark:text-dark-300 mb-1.5 uppercase tracking-wide">
      {children}
      {required && <span className="ml-1 text-red-500 font-bold">*</span>}
    </label>
  )
}

// ─── Info Box ──────────────────────────────────────────────────────────────────
function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 p-3.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 rounded-lg">
      <svg className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
      <p className="text-sm text-blue-700 dark:text-blue-300">{children}</p>
    </div>
  )
}

// ─── Warning Box ───────────────────────────────────────────────────────────────
function WarningBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-lg">
      <svg className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      <p className="text-sm text-amber-700 dark:text-amber-300">{children}</p>
    </div>
  )
}

// ─── Payment Method Card ───────────────────────────────────────────────────────
interface PaymentCardProps {
  icon: React.ReactNode
  name: string
  description: string
  enabled: boolean
  onToggle: (v: boolean) => void
  accentColor: string // Tailwind class prefix, e.g. "green"
  children?: React.ReactNode
}

function PaymentMethodCard({ icon, name, description, enabled, onToggle, accentColor, children }: PaymentCardProps) {
  const accentMap: Record<string, string> = {
    green: 'bg-emerald-100 dark:bg-emerald-900/30',
    red: 'bg-red-100 dark:bg-red-900/30',
    teal: 'bg-teal-100 dark:bg-teal-900/30',
    purple: 'bg-purple-100 dark:bg-purple-900/30',
    blue: 'bg-blue-100 dark:bg-blue-900/30',
  }
  const iconBg = accentMap[accentColor] ?? 'bg-gray-100 dark:bg-dark-700'

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        enabled
          ? 'border-primary-300 dark:border-primary-600/60 shadow-sm shadow-primary-100/50 dark:shadow-none'
          : 'border-dark-200 dark:border-dark-600'
      }`}
    >
      {/* Card header */}
      <div className="flex items-center justify-between gap-4 p-5 bg-white dark:bg-dark-800">
        <div className="flex items-center gap-4 min-w-0">
          {/* Icon box */}
          <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center ${iconBg}`}>{icon}</div>

          {/* Name + description + status badge */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-dark-900 dark:text-white text-base leading-tight">{name}</span>
              {enabled ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-dark-100 text-dark-500 dark:bg-dark-700 dark:text-dark-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-dark-400 inline-block" />
                  Inactive
                </span>
              )}
            </div>
            <p className="text-sm text-dark-500 dark:text-dark-400 mt-0.5 truncate">{description}</p>
          </div>
        </div>

        {/* Toggle */}
        <div className="flex-shrink-0">
          <Toggle checked={enabled} onChange={onToggle} />
        </div>
      </div>

      {/* Expandable configuration panel */}
      {enabled && children && (
        <div className="border-t border-dark-200 dark:border-dark-600 bg-dark-50 dark:bg-dark-800/60 p-5 space-y-5">
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Section Divider ───────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <span className="text-xs font-bold uppercase tracking-widest text-dark-400 dark:text-dark-500">{children}</span>
      <div className="flex-1 h-px bg-dark-200 dark:bg-dark-600" />
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function PaymentSettingsTab({ paymentSettings, setPaymentSettings, saveMutation }: Props) {
  const set = <K extends keyof PaymentSettings>(key: K, value: PaymentSettings[K]) =>
    setPaymentSettings((prev) => ({ ...prev, [key]: value }))

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        saveMutation.mutate({ payment: paymentSettings })
      }}
      className="space-y-4 max-w-3xl"
    >
      {/* Page header */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-dark-900 dark:text-white">Payment Methods</h2>
        <p className="text-sm text-dark-500 dark:text-dark-400 mt-0.5">
          Enable and configure the payment methods available to your customers at checkout.
        </p>
      </div>

      {/* ── 1. Cash on Delivery ── */}
      <PaymentMethodCard
        icon={<span className="text-2xl">💵</span>}
        name="Cash on Delivery"
        description="Customers pay in cash when they receive their order"
        enabled={paymentSettings.cod_enabled}
        onToggle={(v) => set('cod_enabled', v)}
        accentColor="green"
      >
        <SectionLabel>Configuration</SectionLabel>
        <div className="max-w-xs">
          <FieldLabel>Extra Charges (PKR)</FieldLabel>
          <input
            type="number"
            min={0}
            value={paymentSettings.cod_extra_charges}
            onChange={(e) => set('cod_extra_charges', parseInt(e.target.value) || 0)}
            placeholder="0"
            className={fieldClass}
          />
          <p className="text-xs text-dark-400 dark:text-dark-500 mt-1.5">
            Set to 0 to not charge any extra fee for COD orders.
          </p>
        </div>
      </PaymentMethodCard>

      {/* ── 2. JazzCash ── */}
      <PaymentMethodCard
        icon={
          <span className="text-base font-extrabold text-red-600 dark:text-red-400 tracking-tight leading-none">
            Jazz<br />Cash
          </span>
        }
        name="JazzCash"
        description="Mobile wallet and online banking via JazzCash"
        enabled={paymentSettings.jazzcash_enabled}
        onToggle={(v) => set('jazzcash_enabled', v)}
        accentColor="red"
      >
        {/* Mode toggle */}
        <div>
          <SectionLabel>Mode</SectionLabel>
          <ModeToggle
            sandbox={paymentSettings.jazzcash_sandbox}
            onChange={(v) => set('jazzcash_sandbox', v)}
          />
        </div>

        {/* Credentials */}
        <div>
          <SectionLabel>Credentials</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Merchant ID</FieldLabel>
              <input
                type="text"
                value={paymentSettings.jazzcash_merchant_id}
                onChange={(e) => set('jazzcash_merchant_id', e.target.value)}
                placeholder="MC12345"
                className={fieldClass}
                autoComplete="off"
              />
            </div>
            <div>
              <FieldLabel required>Password</FieldLabel>
              <input
                type="password"
                value={paymentSettings.jazzcash_password}
                onChange={(e) => set('jazzcash_password', e.target.value)}
                placeholder="••••••••"
                className={fieldClass}
                autoComplete="new-password"
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel required>Integrity Salt</FieldLabel>
              <input
                type="password"
                value={paymentSettings.jazzcash_integrity_salt}
                onChange={(e) => set('jazzcash_integrity_salt', e.target.value)}
                placeholder="Enter your integrity salt from JazzCash portal"
                className={fieldClass}
                autoComplete="new-password"
              />
              <p className="text-xs text-dark-400 dark:text-dark-500 mt-1.5">
                Found in your JazzCash Merchant Portal under Security Settings.
              </p>
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Return URL</FieldLabel>
              <input
                type="url"
                value={paymentSettings.jazzcash_return_url}
                onChange={(e) => set('jazzcash_return_url', e.target.value)}
                placeholder="https://yoursite.com/payment/jazzcash/callback"
                className={fieldClass}
              />
            </div>
          </div>
        </div>

        <InfoBox>
          <strong>Setup Guide:</strong> Register at{' '}
          <a
            href="https://www.jazzcash.com.pk/business"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-semibold hover:text-blue-900 dark:hover:text-blue-200 transition-colors"
          >
            JazzCash Business Portal
          </a>{' '}
          to obtain your API credentials.
        </InfoBox>
      </PaymentMethodCard>

      {/* ── 3. EasyPaisa ── */}
      <PaymentMethodCard
        icon={
          <span className="text-base font-extrabold text-teal-600 dark:text-teal-400 tracking-tight leading-none">
            Easy<br />Paisa
          </span>
        }
        name="EasyPaisa"
        description="Mobile wallet and online banking via EasyPaisa"
        enabled={paymentSettings.easypaisa_enabled}
        onToggle={(v) => set('easypaisa_enabled', v)}
        accentColor="teal"
      >
        {/* Mode toggle */}
        <div>
          <SectionLabel>Mode</SectionLabel>
          <ModeToggle
            sandbox={paymentSettings.easypaisa_sandbox}
            onChange={(v) => set('easypaisa_sandbox', v)}
          />
        </div>

        {/* Credentials */}
        <div>
          <SectionLabel>Credentials</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Store ID</FieldLabel>
              <input
                type="text"
                value={paymentSettings.easypaisa_store_id}
                onChange={(e) => set('easypaisa_store_id', e.target.value)}
                placeholder="12345"
                className={fieldClass}
                autoComplete="off"
              />
            </div>
            <div>
              <FieldLabel required>Hash Key</FieldLabel>
              <input
                type="password"
                value={paymentSettings.easypaisa_hash_key}
                onChange={(e) => set('easypaisa_hash_key', e.target.value)}
                placeholder="••••••••"
                className={fieldClass}
                autoComplete="new-password"
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Return URL</FieldLabel>
              <input
                type="url"
                value={paymentSettings.easypaisa_return_url}
                onChange={(e) => set('easypaisa_return_url', e.target.value)}
                placeholder="https://yoursite.com/payment/easypaisa/callback"
                className={fieldClass}
              />
            </div>
          </div>
        </div>

        <InfoBox>
          <strong>Setup Guide:</strong> Apply for a merchant account at{' '}
          <a
            href="https://www.easypaisa.com.pk/business"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-semibold hover:text-blue-900 dark:hover:text-blue-200 transition-colors"
          >
            EasyPaisa Business
          </a>{' '}
          to get your Store ID and Hash Key.
        </InfoBox>
      </PaymentMethodCard>

      {/* ── 4. Credit/Debit Card (Checkout.com) ── */}
      <PaymentMethodCard
        icon={<span className="text-2xl">💳</span>}
        name="Credit / Debit Card"
        description="Visa, Mastercard and more via Checkout.com"
        enabled={paymentSettings.card_enabled}
        onToggle={(v) => set('card_enabled', v)}
        accentColor="purple"
      >
        {/* Mode toggle */}
        <div>
          <SectionLabel>Mode</SectionLabel>
          <ModeToggle
            sandbox={paymentSettings.checkout_sandbox}
            onChange={(v) => set('checkout_sandbox', v)}
          />
        </div>

        {/* API Keys */}
        <div>
          <SectionLabel>API Keys</SectionLabel>
          <div className="space-y-4">
            <div>
              <FieldLabel required>Public Key</FieldLabel>
              <input
                type="text"
                value={paymentSettings.checkout_public_key}
                onChange={(e) => set('checkout_public_key', e.target.value)}
                placeholder={paymentSettings.checkout_sandbox ? 'pk_sbox_...' : 'pk_live_...'}
                className={fieldClassMono}
                autoComplete="off"
              />
              <p className="text-xs text-dark-400 dark:text-dark-500 mt-1.5">
                This key is safe to include in your frontend code.
              </p>
            </div>
            <div>
              <FieldLabel required>Secret Key</FieldLabel>
              <input
                type="password"
                value={paymentSettings.checkout_secret_key}
                onChange={(e) => set('checkout_secret_key', e.target.value)}
                placeholder={paymentSettings.checkout_sandbox ? 'sk_sbox_...' : 'sk_live_...'}
                className={fieldClassMono}
                autoComplete="new-password"
              />
            </div>
          </div>
        </div>

        <WarningBox>
          <strong>Security Notice:</strong> Never expose your Secret Key in client-side code or version control. It must only be used server-side.
        </WarningBox>

        <InfoBox>
          <strong>Setup Guide:</strong> Get your API keys from the{' '}
          <a
            href="https://dashboard.checkout.com/developers/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-semibold hover:text-blue-900 dark:hover:text-blue-200 transition-colors"
          >
            Checkout.com Dashboard
          </a>
          . Use sandbox keys during development and testing.
        </InfoBox>
      </PaymentMethodCard>

      {/* ── 5. Bank Transfer ── */}
      <PaymentMethodCard
        icon={<span className="text-2xl">🏦</span>}
        name="Bank Transfer"
        description="Customers transfer directly to your bank account"
        enabled={paymentSettings.bank_transfer_enabled}
        onToggle={(v) => set('bank_transfer_enabled', v)}
        accentColor="blue"
      >
        <div>
          <SectionLabel>Bank Account Details</SectionLabel>
          <p className="text-sm text-dark-500 dark:text-dark-400 mb-4">
            These details will be displayed to customers who select bank transfer at checkout.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Bank Name</FieldLabel>
              <input
                type="text"
                value={paymentSettings.bank_name}
                onChange={(e) => set('bank_name', e.target.value)}
                placeholder="HBL, MCB, UBL, Meezan, etc."
                className={fieldClass}
              />
            </div>
            <div>
              <FieldLabel>Bank Branch</FieldLabel>
              <input
                type="text"
                value={paymentSettings.bank_branch}
                onChange={(e) => set('bank_branch', e.target.value)}
                placeholder="e.g. Haider Road Township Branch, Lahore"
                className={fieldClass}
              />
            </div>
            <div>
              <FieldLabel required>Account Title</FieldLabel>
              <input
                type="text"
                value={paymentSettings.bank_account_title}
                onChange={(e) => set('bank_account_title', e.target.value)}
                placeholder="Fischer Electronics Pvt Ltd"
                className={fieldClass}
              />
            </div>
            <div>
              <FieldLabel required>Account Number</FieldLabel>
              <input
                type="text"
                value={paymentSettings.bank_account_number}
                onChange={(e) => set('bank_account_number', e.target.value)}
                placeholder="1234567890123"
                className={fieldClass}
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>IBAN</FieldLabel>
              <input
                type="text"
                value={paymentSettings.bank_iban}
                onChange={(e) => set('bank_iban', e.target.value)}
                placeholder="PK36HABB0000000000000000"
                className={fieldClass}
              />
            </div>
          </div>
        </div>
      </PaymentMethodCard>

      {/* ── Save Button ── */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="w-full flex items-center justify-center gap-2.5 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-dark-800"
        >
          {saveMutation.isPending ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Save Payment Settings</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
