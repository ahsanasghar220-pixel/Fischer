import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ChevronDownIcon, CheckCircleIcon, TruckIcon, CreditCardIcon } from '@heroicons/react/24/outline'
import api from '@/lib/api'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { formatPrice } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

interface ShippingMethod {
  id: number
  name: string
  description: string
  price: number
  estimated_days: string
}

interface Address {
  id: number
  label: string
  name: string
  phone: string
  address_line_1: string
  address_line_2?: string
  city: string
  state: string
  postal_code: string
  is_default: boolean
}

interface CheckoutForm {
  email: string
  shipping_name: string
  shipping_phone: string
  shipping_address_line_1: string
  shipping_address_line_2: string
  shipping_city: string
  shipping_state: string
  shipping_postal_code: string
  billing_same_as_shipping: boolean
  billing_name: string
  billing_phone: string
  billing_address_line_1: string
  billing_address_line_2: string
  billing_city: string
  billing_state: string
  billing_postal_code: string
  shipping_method_id: number | null
  payment_method: string
  notes: string
}

const paymentMethods = [
  { id: 'cod', name: 'Cash on Delivery', description: 'Pay when you receive your order', icon: '💵' },
  { id: 'jazzcash', name: 'JazzCash', description: 'Pay with JazzCash mobile wallet', icon: '📱' },
  { id: 'easypaisa', name: 'EasyPaisa', description: 'Pay with EasyPaisa mobile wallet', icon: '📱' },
  { id: 'card', name: 'Credit/Debit Card', description: 'Pay with Visa, Mastercard', icon: '💳' },
  { id: 'bank_transfer', name: 'Bank Transfer', description: 'Direct bank transfer', icon: '🏦' },
]

const pakistanCities = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan',
  'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Abbottabad',
  'Bahawalpur', 'Sargodha', 'Sukkur', 'Mardan', 'Sahiwal', 'Sheikhupura'
]

export default function Checkout() {
  const navigate = useNavigate()
  const { items, subtotal, discount, total, couponCode } = useCartStore()
  const { isAuthenticated, user } = useAuthStore()
  const [step, setStep] = useState(1)
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)

  const [form, setForm] = useState<CheckoutForm>({
    email: '',
    shipping_name: '',
    shipping_phone: '',
    shipping_address_line_1: '',
    shipping_address_line_2: '',
    shipping_city: '',
    shipping_state: 'Punjab',
    shipping_postal_code: '',
    billing_same_as_shipping: true,
    billing_name: '',
    billing_phone: '',
    billing_address_line_1: '',
    billing_address_line_2: '',
    billing_city: '',
    billing_state: 'Punjab',
    billing_postal_code: '',
    shipping_method_id: null,
    payment_method: 'cod',
    notes: '',
  })

  // Fetch saved addresses if authenticated
  const { data: addresses } = useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn: async () => {
      const response = await api.get('/addresses')
      return response.data.data
    },
    enabled: isAuthenticated,
  })

  // Fetch shipping methods
  const { data: shippingMethods } = useQuery<ShippingMethod[]>({
    queryKey: ['shipping-methods', form.shipping_city],
    queryFn: async () => {
      const response = await api.get('/shipping/methods', {
        params: { city: form.shipping_city }
      })
      return response.data.data
    },
    enabled: !!form.shipping_city,
  })

  // Place order mutation
  const placeOrderMutation = useMutation({
    mutationFn: async (data: CheckoutForm) => {
      const response = await api.post('/checkout', {
        ...data,
        items: items.map(item => ({
          product_id: item.product.id,
          variant_id: item.variant?.id,
          quantity: item.quantity,
        })),
        coupon_code: couponCode,
      })
      return response.data
    },
    onSuccess: (data) => {
      if (data.redirect_url) {
        window.location.href = data.redirect_url
      } else {
        navigate(`/order-success/${data.data.order_number}`)
      }
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to place order')
    },
  })

  // Pre-fill user data
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        email: user.email || '',
        shipping_name: user.name || '',
        shipping_phone: user.phone || '',
      }))
    }
  }, [user])

  // Set default address
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const defaultAddress = addresses.find(a => a.is_default) || addresses[0]
      setSelectedAddress(defaultAddress)
      setForm(prev => ({
        ...prev,
        shipping_name: defaultAddress.name,
        shipping_phone: defaultAddress.phone,
        shipping_address_line_1: defaultAddress.address_line_1,
        shipping_address_line_2: defaultAddress.address_line_2 || '',
        shipping_city: defaultAddress.city,
        shipping_state: defaultAddress.state,
        shipping_postal_code: defaultAddress.postal_code,
      }))
    }
  }, [addresses])

  // Set default shipping method
  useEffect(() => {
    if (shippingMethods && shippingMethods.length > 0 && !form.shipping_method_id) {
      setForm(prev => ({ ...prev, shipping_method_id: shippingMethods[0].id }))
    }
  }, [shippingMethods, form.shipping_method_id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address)
    setForm(prev => ({
      ...prev,
      shipping_name: address.name,
      shipping_phone: address.phone,
      shipping_address_line_1: address.address_line_1,
      shipping_address_line_2: address.address_line_2 || '',
      shipping_city: address.city,
      shipping_state: address.state,
      shipping_postal_code: address.postal_code,
    }))
  }

  const validateStep = (stepNum: number): boolean => {
    if (stepNum === 1) {
      if (!form.shipping_name || !form.shipping_phone || !form.shipping_address_line_1 || !form.shipping_city) {
        toast.error('Please fill in all required shipping fields')
        return false
      }
      if (!isAuthenticated && !form.email) {
        toast.error('Please enter your email address')
        return false
      }
    }
    if (stepNum === 2) {
      if (!form.shipping_method_id) {
        toast.error('Please select a shipping method')
        return false
      }
    }
    return true
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep(3)) return
    placeOrderMutation.mutate(form)
  }

  const selectedShippingMethod = shippingMethods?.find(m => m.id === form.shipping_method_id)
  const shippingCost = selectedShippingMethod?.price || 0
  const grandTotal = total + shippingCost

  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen bg-dark-50 dark:bg-dark-900 flex items-center justify-center transition-colors">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white mb-2">Your cart is empty</h1>
          <p className="text-dark-500 dark:text-dark-400 mb-4">Add some products before checkout</p>
          <Link to="/shop" className="btn btn-primary">Go Shopping</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-900 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 border-b border-dark-200 dark:border-dark-700">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white">Checkout</h1>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white dark:bg-dark-800 border-b border-dark-200 dark:border-dark-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-4">
            {[
              { num: 1, label: 'Shipping' },
              { num: 2, label: 'Delivery' },
              { num: 3, label: 'Payment' },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full font-medium ${
                    step > s.num
                      ? 'bg-green-500 text-white'
                      : step === s.num
                      ? 'bg-primary-500 text-white'
                      : 'bg-dark-200 dark:bg-dark-600 text-dark-500 dark:text-dark-400'
                  }`}
                >
                  {step > s.num ? <CheckCircleIcon className="w-5 h-5" /> : s.num}
                </div>
                <span className={`ml-2 ${step >= s.num ? 'text-dark-900 dark:text-white font-medium' : 'text-dark-400'}`}>
                  {s.label}
                </span>
                {i < 2 && <div className="w-16 h-0.5 mx-4 bg-dark-200 dark:bg-dark-600" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Step 1: Shipping Address */}
              {step === 1 && (
                <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
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
                        placeholder="03XX-XXXXXXX"
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
                          {pakistanCities.map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                        <ChevronDownIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-dark-400" />
                      </div>
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
                    <button type="button" onClick={nextStep} className="btn btn-primary px-8">
                      Continue to Delivery
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Delivery Method */}
              {step === 2 && (
                <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-6">
                    <TruckIcon className="w-6 h-6 inline-block mr-2" />
                    Delivery Method
                  </h2>

                  {shippingMethods && shippingMethods.length > 0 ? (
                    <div className="space-y-3">
                      {shippingMethods.map((method) => (
                        <div
                          key={method.id}
                          onClick={() => setForm(prev => ({ ...prev, shipping_method_id: method.id }))}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            form.shipping_method_id === method.id
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-dark-200 dark:border-dark-600 hover:border-dark-400 dark:hover:border-dark-500'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium text-dark-900 dark:text-white">{method.name}</span>
                              <p className="text-sm text-dark-500 dark:text-dark-400">{method.description}</p>
                              <p className="text-sm text-dark-500 dark:text-dark-400">Delivery in {method.estimated_days}</p>
                            </div>
                            <div className="text-right">
                              <span className="font-semibold text-dark-900 dark:text-white">
                                {method.price === 0 ? 'FREE' : formatPrice(method.price)}
                              </span>
                            </div>
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
                    <button type="button" onClick={() => setStep(1)} className="btn btn-outline dark:border-dark-600 dark:text-dark-300 dark:hover:bg-dark-700 px-8">
                      Back
                    </button>
                    <button type="button" onClick={nextStep} className="btn btn-primary px-8">
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-6">
                    <CreditCardIcon className="w-6 h-6 inline-block mr-2" />
                    Payment Method
                  </h2>

                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        onClick={() => setForm(prev => ({ ...prev, payment_method: method.id }))}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          form.payment_method === method.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-dark-200 dark:border-dark-600 hover:border-dark-400 dark:hover:border-dark-500'
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
                    <button type="button" onClick={() => setStep(2)} className="btn btn-outline dark:border-dark-600 dark:text-dark-300 dark:hover:bg-dark-700 px-8">
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={placeOrderMutation.isPending}
                      className="btn btn-primary px-8"
                    >
                      {placeOrderMutation.isPending ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Processing...
                        </>
                      ) : (
                        `Place Order - ${formatPrice(grandTotal)}`
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6 sticky top-4">
                <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Order Summary</h2>

                {/* Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-16 bg-dark-100 dark:bg-dark-700 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product.primary_image ? (
                          <img
                            src={item.product.primary_image}
                            alt={item.product.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-dark-400 text-xs">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-dark-900 dark:text-white truncate">{item.product.name}</p>
                        {item.variant && (
                          <p className="text-xs text-dark-500 dark:text-dark-400">{item.variant.name}</p>
                        )}
                        <p className="text-sm text-dark-500 dark:text-dark-400">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-medium text-dark-900 dark:text-white">
                        {formatPrice((item.variant?.price || item.product.price) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-dark-200 dark:border-dark-700 mt-4 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-600 dark:text-dark-400">Subtotal</span>
                    <span className="text-dark-900 dark:text-white">{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                      <span>Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-600 dark:text-dark-400">Shipping</span>
                    <span className="text-dark-900 dark:text-white">
                      {selectedShippingMethod
                        ? selectedShippingMethod.price === 0
                          ? 'FREE'
                          : formatPrice(selectedShippingMethod.price)
                        : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-dark-200 dark:border-dark-700">
                    <span className="font-semibold text-dark-900 dark:text-white">Total</span>
                    <span className="text-xl font-bold text-dark-900 dark:text-white">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                {couponCode && (
                  <div className="mt-4 p-2 bg-green-50 dark:bg-green-900/20 rounded text-sm text-green-700 dark:text-green-400">
                    Coupon applied: {couponCode}
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
