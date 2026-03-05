import { useState } from 'react'
import { ChevronDownIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { PAKISTAN_CITIES } from '@/data'
import type { Address, CheckoutForm } from './useCheckout'

// ── Validation helpers ────────────────────────────────────────────────────────

/**
 * Pakistan phone validation.
 * Accepts:
 *   03XXXXXXXXX          — standard 11-digit mobile (all operators)
 *   0300-1234567         — hyphenated
 *   0300 1234567         — spaced
 *   +923001234567        — international with +
 *   00923001234567       — international with 0092
 */
function validatePhone(raw: string): string | null {
  if (!raw.trim()) return 'Phone number is required'

  // Strip formatting characters to get the digit-only form
  let normalized = raw.trim().replace(/[\s\-()]/g, '')

  // Normalize international prefix → local 0X format
  if (normalized.startsWith('+92')) {
    normalized = '0' + normalized.slice(3)
  } else if (normalized.startsWith('0092')) {
    normalized = '0' + normalized.slice(4)
  }

  // After stripping separators only digits should remain
  if (!/^\d+$/.test(normalized)) {
    return 'Only digits, spaces, hyphens, and + are allowed'
  }

  if (normalized.length !== 11) {
    return `Must be 11 digits — you have ${normalized.length} (e.g., 03001234567)`
  }

  // Pakistan mobiles always start with 03
  if (!normalized.startsWith('03')) {
    return 'Pakistani mobile numbers start with 03 (e.g., 0300, 0311, 0321, 0333…)'
  }

  return null
}

/**
 * Email validation covering the common Pakistani edge-cases:
 * blocks spaces, consecutive dots, missing domain TLD, etc.
 */
function validateEmail(value: string): string | null {
  if (!value.trim()) return 'Email address is required'
  if (value.includes(' '))  return 'Email cannot contain spaces'
  if (/\.{2,}/.test(value)) return 'Email cannot contain consecutive dots (..)'
  if (value.startsWith('.') || value.endsWith('.')) return 'Email cannot start or end with a dot'

  const parts = value.split('@')
  if (parts.length !== 2 || !parts[0] || !parts[1]) return 'Please enter a valid email (e.g., name@gmail.com)'

  const [local, domain] = parts
  if (!local) return 'Missing part before @'
  if (!domain.includes('.')) return 'Domain must include a dot (e.g., gmail.com)'

  const domainParts = domain.split('.')
  if (domainParts.some(p => p.length === 0)) return 'Invalid domain format'
  const tld = domainParts[domainParts.length - 1]
  if (tld.length < 2) return 'Domain extension too short (e.g., .com, .pk, .net)'

  // Standard RFC-5322-ish pattern
  const re = /^[a-zA-Z0-9][a-zA-Z0-9._+\-]*[a-zA-Z0-9]?@[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/
  if (!re.test(value)) return 'Please enter a valid email address'

  return null
}

// Allow only digits + formatting keys on phone input
function onPhoneKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
  const nav = ['Backspace','Delete','Tab','Enter','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End']
  if (nav.includes(e.key)) return
  if ((e.ctrlKey || e.metaKey) && ['a','c','v','x','z'].includes(e.key.toLowerCase())) return
  if (/^[\d+\-\s]$/.test(e.key)) return
  e.preventDefault()
}

// Prevent paste of non-phone characters
function onPhonePaste(e: React.ClipboardEvent<HTMLInputElement>) {
  const pasted = e.clipboardData.getData('text')
  if (!/^[\d+\-\s()]+$/.test(pasted)) e.preventDefault()
}

// Block spaces in email field
function onEmailKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key === ' ') e.preventDefault()
}

// ── Component ─────────────────────────────────────────────────────────────────

interface ShippingFormProps {
  form: CheckoutForm
  addresses: Address[] | undefined
  selectedAddress: Address | null
  isAuthenticated: boolean
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  handleAddressSelect: (address: Address) => void
  onNext: () => void
}

const inputBase =
  'w-full px-4 py-2 border rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 focus:outline-none focus:ring-2 transition-colors'
const inputNormal = `${inputBase} border-dark-200 dark:border-dark-600 focus:ring-primary-500`
const inputError  = `${inputBase} border-red-400 dark:border-red-500 focus:ring-red-400`

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
      <ExclamationCircleIcon className="w-3.5 h-3.5 shrink-0" />
      {msg}
    </p>
  )
}

export default function ShippingForm({
  form,
  addresses,
  selectedAddress,
  isAuthenticated,
  handleInputChange,
  handleAddressSelect,
  onNext,
}: ShippingFormProps) {
  const [errors, setErrors]   = useState<{ email?: string; phone?: string }>({})
  const [touched, setTouched] = useState<{ email?: boolean; phone?: boolean }>({})

  // Live-validate if already touched
  const liveValidate = (field: 'email' | 'phone', value: string) => {
    if (!touched[field]) return
    setErrors(prev => ({
      ...prev,
      [field]: (field === 'email' ? validateEmail(value) : validatePhone(value)) ?? undefined,
    }))
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.includes(' ')) return          // block spaces silently
    handleInputChange(e)
    liveValidate('email', e.target.value)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e)
    liveValidate('phone', e.target.value)
  }

  const blurEmail = () => {
    setTouched(p => ({ ...p, email: true }))
    setErrors(p => ({ ...p, email: validateEmail(form.email) ?? undefined }))
  }

  const blurPhone = () => {
    setTouched(p => ({ ...p, phone: true }))
    setErrors(p => ({ ...p, phone: validatePhone(form.shipping_phone) ?? undefined }))
  }

  const handleNext = () => {
    const emailErr = validateEmail(form.email)
    const phoneErr = validatePhone(form.shipping_phone)
    setTouched({ email: true, phone: true })
    setErrors({ email: emailErr ?? undefined, phone: phoneErr ?? undefined })
    if (emailErr || phoneErr) return
    onNext()
  }

  return (
    <motion.div
      key="step1"
      className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-6">Shipping Address</h2>

      {/* Saved Addresses */}
      {addresses && addresses.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Saved Addresses</label>
          <div className="grid gap-3">
            {addresses.map((address) => (
              <div
                key={address.id}
                onClick={() => handleAddressSelect(address)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedAddress?.id === address.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-dark-200 dark:border-dark-600 hover:border-dark-400 dark:hover:border-dark-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-medium text-dark-900 dark:text-white">{address.label}</span>
                    {address.is_default && (
                      <span className="ml-2 text-xs bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-300 px-2 py-0.5 rounded">Default</span>
                    )}
                    <p className="text-sm text-dark-600 dark:text-dark-400 mt-1">{address.name} • {address.phone}</p>
                    <p className="text-sm text-dark-500 dark:text-dark-400">{address.address_line_1}, {address.city}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    selectedAddress?.id === address.id ? 'border-primary-500 bg-primary-500' : 'border-dark-300 dark:border-dark-500'
                  }`}>
                    {selectedAddress?.id === address.id && <CheckCircleIcon className="w-full h-full text-white" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <span className="text-dark-400">— or enter a new address —</span>
          </div>
        </div>
      )}

      {/* Email — always shown */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
          Email Address *
          {isAuthenticated && (
            <span className="ml-2 text-xs font-normal text-dark-400">(used for order confirmation)</span>
          )}
        </label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleEmailChange}
          onBlur={blurEmail}
          onKeyDown={onEmailKeyDown}
          autoComplete="email"
          placeholder="you@example.com"
          className={touched.email && errors.email ? inputError : inputNormal}
          required
        />
        <FieldError msg={touched.email ? errors.email : undefined} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Full Name *</label>
          <input
            type="text"
            name="shipping_name"
            value={form.shipping_name}
            onChange={handleInputChange}
            className={inputNormal}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Phone Number *</label>
          <input
            type="tel"
            name="shipping_phone"
            value={form.shipping_phone}
            onChange={handlePhoneChange}
            onBlur={blurPhone}
            onKeyDown={onPhoneKeyDown}
            onPaste={onPhonePaste}
            autoComplete="tel"
            placeholder="03001234567 or +923001234567"
            className={touched.phone && errors.phone ? inputError : inputNormal}
            required
          />
          <FieldError msg={touched.phone ? errors.phone : undefined} />
          {!errors.phone && (
            <p className="mt-1 text-xs text-dark-400">
              Jazz / Zong / Telenor / Ufone — 11 digits (e.g., 03001234567)
            </p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Address *</label>
        <input
          type="text"
          name="shipping_address_line_1"
          value={form.shipping_address_line_1}
          onChange={handleInputChange}
          placeholder="Street address, house number"
          className={inputNormal}
          required
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Address Line 2</label>
        <input
          type="text"
          name="shipping_address_line_2"
          value={form.shipping_address_line_2}
          onChange={handleInputChange}
          placeholder="Apartment, suite, unit, etc. (optional)"
          className={inputNormal}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">City *</label>
          <div className="relative">
            <select
              name="shipping_city"
              value={form.shipping_city}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select city</option>
              {PAKISTAN_CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <ChevronDownIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-dark-400" />
          </div>
          {form.shipping_city.toLowerCase() === 'lahore' && (
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
              Free Delivery in Lahore!
            </p>
          )}
          {form.shipping_city && form.shipping_city.toLowerCase() !== 'lahore' && (
            <p className="mt-1.5 text-xs text-dark-500 dark:text-dark-400">Standard delivery charges apply</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">State/Province *</label>
          <select
            name="shipping_state"
            value={form.shipping_state}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          >
            <option value="Punjab">Punjab</option>
            <option value="Sindh">Sindh</option>
            <option value="KPK">Khyber Pakhtunkhwa</option>
            <option value="Balochistan">Balochistan</option>
            <option value="Islamabad">Islamabad</option>
            <option value="AJK">Azad Kashmir</option>
            <option value="GB">Gilgit-Baltistan</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Postal Code</label>
          <input
            type="text"
            name="shipping_postal_code"
            value={form.shipping_postal_code}
            onChange={handleInputChange}
            className={inputNormal}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <motion.button
          type="button"
          onClick={handleNext}
          className="w-full sm:w-auto btn btn-primary px-8 min-h-[44px]"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Continue to Payment
        </motion.button>
      </div>
    </motion.div>
  )
}
