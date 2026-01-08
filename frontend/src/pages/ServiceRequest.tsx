import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { WrenchScrewdriverIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const serviceTypes = [
  { value: 'repair', label: 'Repair Service', description: 'Fix a broken or malfunctioning appliance' },
  { value: 'maintenance', label: 'Maintenance', description: 'Regular maintenance and servicing' },
  { value: 'installation', label: 'Installation', description: 'Install a new appliance' },
  { value: 'warranty', label: 'Warranty Claim', description: 'Claim under product warranty' },
  { value: 'inspection', label: 'Inspection', description: 'Professional inspection and diagnosis' },
]

const productCategories = [
  'Water Cooler',
  'Geyser',
  'Cooking Range',
  'Microwave Oven',
  'Water Dispenser',
  'Deep Freezer',
  'Air Cooler',
  'Other',
]

const pakistanCities = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan',
  'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Abbottabad',
]

export default function ServiceRequest() {
  const { isAuthenticated, user } = useAuthStore()
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [ticketNumber, setTicketNumber] = useState('')

  const [formData, setFormData] = useState({
    service_type: '',
    product_category: '',
    product_model: '',
    serial_number: '',
    purchase_date: '',
    issue_description: '',
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    preferred_date: '',
    preferred_time: '',
  })

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.post('/service-requests', data)
      return response.data
    },
    onSuccess: (data) => {
      setTicketNumber(data.data.ticket_number)
      setSubmitted(true)
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to submit request')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(formData)
  }

  const validateStep = (stepNum: number): boolean => {
    if (stepNum === 1) {
      if (!formData.service_type) {
        toast.error('Please select a service type')
        return false
      }
    }
    if (stepNum === 2) {
      if (!formData.product_category || !formData.issue_description) {
        toast.error('Please fill in all required fields')
        return false
      }
    }
    if (stepNum === 3) {
      if (!formData.name || !formData.phone || !formData.address || !formData.city) {
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
      <div className="min-h-screen bg-dark-50 dark:bg-dark-900 flex items-center justify-center py-12 px-4 transition-colors">
        <div className="max-w-md w-full bg-white dark:bg-dark-800 rounded-xl shadow-sm p-8 text-center transition-colors">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-10 h-10 text-green-600 dark:text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-2">Request Submitted!</h2>
          <p className="text-dark-500 dark:text-dark-400 mb-6">
            Your service request has been submitted successfully. Our team will contact you shortly.
          </p>
          <div className="bg-dark-50 dark:bg-dark-700 rounded-lg p-4 mb-6 transition-colors">
            <p className="text-sm text-dark-500 dark:text-dark-400">Your Ticket Number</p>
            <p className="text-2xl font-bold text-dark-900 dark:text-white">{ticketNumber}</p>
          </div>
          <p className="text-sm text-dark-500 dark:text-dark-400 mb-6">
            Please save this ticket number for future reference. You can track your request status in your account.
          </p>
          <div className="flex flex-col gap-3">
            {isAuthenticated ? (
              <Link to="/account/service-requests" className="btn btn-primary">
                Track Request
              </Link>
            ) : (
              <Link to="/login" className="btn btn-primary">
                Login to Track
              </Link>
            )}
            <Link to="/" className="btn btn-outline">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-900 transition-colors">
      {/* Header */}
      <div className="bg-dark-900 dark:bg-dark-950 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
              <WrenchScrewdriverIcon className="w-7 h-7 text-dark-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Service Request</h1>
              <p className="text-dark-300 dark:text-dark-400">Schedule a service for your Fischer appliance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white dark:bg-dark-800 border-b border-dark-200 dark:border-dark-700 transition-colors">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-4">
            {[
              { num: 1, label: 'Service Type' },
              { num: 2, label: 'Product Details' },
              { num: 3, label: 'Contact Info' },
              { num: 4, label: 'Schedule' },
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
                <span className={`ml-2 hidden sm:inline ${step >= s.num ? 'text-dark-900 dark:text-white' : 'text-dark-400 dark:text-dark-500'}`}>
                  {s.label}
                </span>
                {i < 3 && <div className="w-8 md:w-16 h-0.5 mx-2 bg-dark-200 dark:bg-dark-600" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Service Type */}
            {step === 1 && (
              <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6 transition-colors">
                <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-6">Select Service Type</h2>
                <div className="space-y-3">
                  {serviceTypes.map((type) => (
                    <div
                      key={type.value}
                      onClick={() => setFormData({ ...formData, service_type: type.value })}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData.service_type === type.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-dark-200 dark:border-dark-600 hover:border-dark-400 dark:hover:border-dark-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-dark-900 dark:text-white">{type.label}</h3>
                          <p className="text-sm text-dark-500 dark:text-dark-400">{type.description}</p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 ${
                            formData.service_type === type.value
                              ? 'border-primary-500 bg-primary-500'
                              : 'border-dark-300 dark:border-dark-500'
                          }`}
                        >
                          {formData.service_type === type.value && (
                            <CheckCircleIcon className="w-full h-full text-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <button type="button" onClick={nextStep} className="btn btn-primary px-8">
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Product Details */}
            {step === 2 && (
              <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6 transition-colors">
                <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-6">Product Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Product Category *</label>
                    <select
                      value={formData.product_category}
                      onChange={(e) => setFormData({ ...formData, product_category: e.target.value })}
                      className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                      required
                    >
                      <option value="">Select product category</option>
                      {productCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Model Number</label>
                    <input
                      type="text"
                      value={formData.product_model}
                      onChange={(e) => setFormData({ ...formData, product_model: e.target.value })}
                      placeholder="e.g., FC-2000"
                      className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 dark:placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Serial Number</label>
                    <input
                      type="text"
                      value={formData.serial_number}
                      onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                      placeholder="Found on product label"
                      className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 dark:placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Purchase Date</label>
                    <input
                      type="date"
                      value={formData.purchase_date}
                      onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                      className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Issue Description *</label>
                    <textarea
                      value={formData.issue_description}
                      onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
                      rows={4}
                      placeholder="Please describe the issue in detail..."
                      className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 dark:placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                      required
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-between">
                  <button type="button" onClick={() => setStep(1)} className="btn btn-outline px-8">
                    Back
                  </button>
                  <button type="button" onClick={nextStep} className="btn btn-primary px-8">
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Contact Info */}
            {step === 3 && (
              <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6 transition-colors">
                <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-6">Contact Information</h2>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Full Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Phone *</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="03XX-XXXXXXX"
                        className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 dark:placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Address *</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={2}
                      placeholder="Complete address for service visit"
                      className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 dark:placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">City *</label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                      required
                    >
                      <option value="">Select city</option>
                      {pakistanCities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-between">
                  <button type="button" onClick={() => setStep(2)} className="btn btn-outline px-8">
                    Back
                  </button>
                  <button type="button" onClick={nextStep} className="btn btn-primary px-8">
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Schedule */}
            {step === 4 && (
              <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6 transition-colors">
                <h2 className="text-xl font-semibold text-dark-900 dark:text-white mb-6">Schedule Service</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Preferred Date</label>
                    <input
                      type="date"
                      value={formData.preferred_date}
                      onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Preferred Time</label>
                    <select
                      value={formData.preferred_time}
                      onChange={(e) => setFormData({ ...formData, preferred_time: e.target.value })}
                      className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                    >
                      <option value="">Select preferred time</option>
                      <option value="morning">Morning (9 AM - 12 PM)</option>
                      <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
                      <option value="evening">Evening (4 PM - 7 PM)</option>
                    </select>
                  </div>
                  <p className="text-sm text-dark-500 dark:text-dark-400">
                    * Our team will confirm the exact date and time based on availability in your area.
                  </p>
                </div>

                {/* Summary */}
                <div className="mt-6 p-4 bg-dark-50 dark:bg-dark-700 rounded-lg transition-colors">
                  <h3 className="font-semibold text-dark-900 dark:text-white mb-3">Request Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-dark-500 dark:text-dark-400">Service Type:</span>
                      <span className="text-dark-900 dark:text-white capitalize">{formData.service_type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-500 dark:text-dark-400">Product:</span>
                      <span className="text-dark-900 dark:text-white">{formData.product_category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-500 dark:text-dark-400">City:</span>
                      <span className="text-dark-900 dark:text-white">{formData.city}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <button type="button" onClick={() => setStep(3)} className="btn btn-outline px-8">
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="btn btn-primary px-8 flex items-center gap-2"
                  >
                    {mutation.isPending && <LoadingSpinner size="sm" />}
                    Submit Request
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
