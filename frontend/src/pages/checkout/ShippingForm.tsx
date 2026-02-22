import { ChevronDownIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { PAKISTAN_CITIES } from '@/data'
import type { Address, CheckoutForm } from './useCheckout'

interface ShippingFormProps {
  form: CheckoutForm
  addresses: Address[] | undefined
  selectedAddress: Address | null
  isAuthenticated: boolean
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  handleAddressSelect: (address: Address) => void
  onNext: () => void
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
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
            Saved Addresses
          </label>
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
                    <p className="text-sm text-dark-600 dark:text-dark-400 mt-1">
                      {address.name} • {address.phone}
                    </p>
                    <p className="text-sm text-dark-500 dark:text-dark-400">
                      {address.address_line_1}, {address.city}
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    selectedAddress?.id === address.id
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-dark-300 dark:border-dark-500'
                  }`}>
                    {selectedAddress?.id === address.id && (
                      <CheckCircleIcon className="w-full h-full text-white" />
                    )}
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

      {/* Guest Email */}
      {!isAuthenticated && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Email *</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Full Name *</label>
          <input
            type="text"
            name="shipping_name"
            value={form.shipping_name}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Phone *</label>
          <input
            type="tel"
            name="shipping_phone"
            value={form.shipping_phone}
            onChange={handleInputChange}
            placeholder="03XX-XXXXXXX or 03XX XXXXXXX"
            pattern="^03[0-9]{2}[-\s]?[0-9]{7}$"
            title="Please enter a valid Pakistani phone number (e.g., 03001234567, 0300-1234567, or 0300 1234567)"
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
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
          className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
          className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
            <p className="mt-1.5 text-xs text-dark-500 dark:text-dark-400">
              Standard delivery charges apply
            </p>
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
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <motion.button
          type="button"
          onClick={onNext}
          className="btn btn-primary px-8"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Continue to Delivery
        </motion.button>
      </div>
    </motion.div>
  )
}
