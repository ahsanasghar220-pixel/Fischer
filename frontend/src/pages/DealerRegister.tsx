import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { BuildingStorefrontIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import api from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const businessTypes = [
  { value: 'retailer', label: 'Retailer', description: 'Physical or online retail store' },
  { value: 'wholesaler', label: 'Wholesaler', description: 'Wholesale distribution business' },
  { value: 'distributor', label: 'Distributor', description: 'Regional distribution company' },
  { value: 'contractor', label: 'Contractor', description: 'Construction or installation contractor' },
]

const pakistanCities = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan',
  'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Abbottabad',
]

export default function DealerRegister() {
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)

  const [formData, setFormData] = useState({
    // Business Info
    business_name: '',
    business_type: '',
    registration_number: '',
    ntn_number: '',
    years_in_business: '',
    annual_revenue: '',

    // Contact Info
    contact_name: '',
    email: '',
    phone: '',
    whatsapp: '',

    // Address
    address: '',
    city: '',
    state: 'Punjab',

    // Account
    password: '',
    password_confirmation: '',

    // Additional
    existing_brands: '',
    expected_monthly_volume: '',
    warehouse_size: '',
    delivery_capability: false,
    terms_accepted: false,
  })

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await api.post('/dealers/register', data)
    },
    onSuccess: () => {
      setSubmitted(true)
    },
    onError: (error: Error & { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }) => {
      if (error.response?.data?.errors) {
        Object.values(error.response.data.errors).forEach((messages) => {
          messages.forEach((msg) => toast.error(msg))
        })
      } else {
        toast.error(error.response?.data?.message || 'Registration failed')
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.terms_accepted) {
      toast.error('Please accept the terms and conditions')
      return
    }
    mutation.mutate(formData)
  }

  const validateStep = (stepNum: number): boolean => {
    if (stepNum === 1) {
      if (!formData.business_name || !formData.business_type) {
        toast.error('Please fill in all required fields')
        return false
      }
    }
    if (stepNum === 2) {
      if (!formData.contact_name || !formData.email || !formData.phone) {
        toast.error('Please fill in all required fields')
        return false
      }
    }
    if (stepNum === 3) {
      if (!formData.address || !formData.city) {
        toast.error('Please fill in all required fields')
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

  if (submitted) {
    return (
      <div className="min-h-screen bg-dark-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-dark-900 mb-2">Application Submitted!</h2>
          <p className="text-dark-500 mb-6">
            Thank you for your interest in becoming a Fischer dealer. Our team will review your application and contact you within 2-3 business days.
          </p>
          <p className="text-sm text-dark-500 mb-6">
            A confirmation email has been sent to <strong>{formData.email}</strong>
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/" className="btn btn-primary">
              Return Home
            </Link>
            <Link to="/shop" className="btn btn-dark-outline">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Header */}
      <div className="bg-dark-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
              <BuildingStorefrontIcon className="w-7 h-7 text-dark-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Become a Dealer</h1>
              <p className="text-dark-300">Partner with Fischer and grow your business</p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-primary-500 py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <span className="text-3xl font-bold text-dark-900">Up to 30%</span>
              <p className="text-dark-700">Dealer Discount</p>
            </div>
            <div>
              <span className="text-3xl font-bold text-dark-900">Marketing</span>
              <p className="text-dark-700">Support & Materials</p>
            </div>
            <div>
              <span className="text-3xl font-bold text-dark-900">Credit</span>
              <p className="text-dark-700">Facility Available</p>
            </div>
            <div>
              <span className="text-3xl font-bold text-dark-900">Priority</span>
              <p className="text-dark-700">Technical Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-4">
            {[
              { num: 1, label: 'Business Info' },
              { num: 2, label: 'Contact' },
              { num: 3, label: 'Location' },
              { num: 4, label: 'Account' },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full font-medium ${
                    step > s.num
                      ? 'bg-green-500 text-white'
                      : step === s.num
                      ? 'bg-primary-500 text-white'
                      : 'bg-dark-200 text-dark-500'
                  }`}
                >
                  {step > s.num ? <CheckCircleIcon className="w-5 h-5" /> : s.num}
                </div>
                <span className={`ml-2 hidden sm:inline ${step >= s.num ? 'text-dark-900' : 'text-dark-400'}`}>
                  {s.label}
                </span>
                {i < 3 && <div className="w-8 md:w-16 h-0.5 mx-2 bg-dark-200" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Business Info */}
            {step === 1 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-dark-900 mb-6">Business Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1">Business Name *</label>
                    <input
                      type="text"
                      value={formData.business_name}
                      onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-2">Business Type *</label>
                    <div className="grid md:grid-cols-2 gap-3">
                      {businessTypes.map((type) => (
                        <div
                          key={type.value}
                          onClick={() => setFormData({ ...formData, business_type: type.value })}
                          className={`p-3 border rounded-lg cursor-pointer ${
                            formData.business_type === type.value
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-dark-200 hover:border-dark-400'
                          }`}
                        >
                          <span className="font-medium text-dark-900">{type.label}</span>
                          <p className="text-xs text-dark-500">{type.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">Registration Number</label>
                      <input
                        type="text"
                        value={formData.registration_number}
                        onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                        placeholder="Business registration #"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">NTN Number</label>
                      <input
                        type="text"
                        value={formData.ntn_number}
                        onChange={(e) => setFormData({ ...formData, ntn_number: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">Years in Business</label>
                      <select
                        value={formData.years_in_business}
                        onChange={(e) => setFormData({ ...formData, years_in_business: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select</option>
                        <option value="0-1">Less than 1 year</option>
                        <option value="1-3">1-3 years</option>
                        <option value="3-5">3-5 years</option>
                        <option value="5-10">5-10 years</option>
                        <option value="10+">10+ years</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">Annual Revenue</label>
                      <select
                        value={formData.annual_revenue}
                        onChange={(e) => setFormData({ ...formData, annual_revenue: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select</option>
                        <option value="<10M">Less than 10M PKR</option>
                        <option value="10-50M">10-50M PKR</option>
                        <option value="50-100M">50-100M PKR</option>
                        <option value=">100M">100M+ PKR</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button type="button" onClick={nextStep} className="btn btn-primary px-8">
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Contact Info */}
            {step === 2 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-dark-900 mb-6">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1">Contact Person Name *</label>
                    <input
                      type="text"
                      value={formData.contact_name}
                      onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">Phone *</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="03XX-XXXXXXX"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">WhatsApp</label>
                      <input
                        type="tel"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        placeholder="03XX-XXXXXXX"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-between">
                  <button type="button" onClick={() => setStep(1)} className="btn btn-dark-outline px-8">Back</button>
                  <button type="button" onClick={nextStep} className="btn btn-primary px-8">Continue</button>
                </div>
              </div>
            )}

            {/* Step 3: Location */}
            {step === 3 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-dark-900 mb-6">Business Location</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1">Business Address *</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">City *</label>
                      <select
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      >
                        <option value="">Select city</option>
                        {pakistanCities.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">State/Province *</label>
                      <select
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      >
                        <option value="Punjab">Punjab</option>
                        <option value="Sindh">Sindh</option>
                        <option value="KPK">Khyber Pakhtunkhwa</option>
                        <option value="Balochistan">Balochistan</option>
                        <option value="Islamabad">Islamabad</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1">Existing Brands You Carry</label>
                    <input
                      type="text"
                      value={formData.existing_brands}
                      onChange={(e) => setFormData({ ...formData, existing_brands: e.target.value })}
                      placeholder="e.g., Brand A, Brand B"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">Expected Monthly Volume</label>
                      <select
                        value={formData.expected_monthly_volume}
                        onChange={(e) => setFormData({ ...formData, expected_monthly_volume: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select</option>
                        <option value="<100K">Less than 100K PKR</option>
                        <option value="100K-500K">100K - 500K PKR</option>
                        <option value="500K-1M">500K - 1M PKR</option>
                        <option value=">1M">More than 1M PKR</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">Warehouse Size</label>
                      <select
                        value={formData.warehouse_size}
                        onChange={(e) => setFormData({ ...formData, warehouse_size: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select</option>
                        <option value="<500">Less than 500 sq ft</option>
                        <option value="500-1000">500 - 1000 sq ft</option>
                        <option value="1000-5000">1000 - 5000 sq ft</option>
                        <option value=">5000">More than 5000 sq ft</option>
                      </select>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.delivery_capability}
                      onChange={(e) => setFormData({ ...formData, delivery_capability: e.target.checked })}
                      className="rounded text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-dark-600">I have delivery capability in my area</span>
                  </label>
                </div>
                <div className="mt-6 flex justify-between">
                  <button type="button" onClick={() => setStep(2)} className="btn btn-dark-outline px-8">Back</button>
                  <button type="button" onClick={nextStep} className="btn btn-primary px-8">Continue</button>
                </div>
              </div>
            )}

            {/* Step 4: Account */}
            {step === 4 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-dark-900 mb-6">Create Account</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1">Password *</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                      minLength={8}
                    />
                    <p className="text-xs text-dark-500 mt-1">Minimum 8 characters</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1">Confirm Password *</label>
                    <input
                      type="password"
                      value={formData.password_confirmation}
                      onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.terms_accepted}
                      onChange={(e) => setFormData({ ...formData, terms_accepted: e.target.checked })}
                      className="mt-1 rounded text-primary-500 focus:ring-primary-500"
                      required
                    />
                    <span className="text-sm text-dark-600">
                      I agree to the{' '}
                      <Link to="/dealer-terms" className="text-primary-600 hover:underline">Dealer Terms & Conditions</Link>
                      {' '}and{' '}
                      <Link to="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>
                    </span>
                  </label>
                </div>
                <div className="mt-6 flex justify-between">
                  <button type="button" onClick={() => setStep(3)} className="btn btn-dark-outline px-8">Back</button>
                  <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="btn btn-primary px-8 flex items-center gap-2"
                  >
                    {mutation.isPending && <LoadingSpinner size="sm" />}
                    Submit Application
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
