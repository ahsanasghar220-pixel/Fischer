import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { WrenchScrewdriverIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

// Animation variants for step transitions
const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
  }),
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

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
  const [direction, setDirection] = useState(0) // For step animation direction
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
      const response = await api.post('/api/service-requests', data)
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
      setDirection(1)
      setStep(step + 1)
    }
  }

  const prevStep = (targetStep: number) => {
    setDirection(-1)
    setStep(targetStep)
  }

  if (submitted) {
    return (
      <motion.div
        className="min-h-screen bg-dark-50 dark:bg-dark-900 flex items-center justify-center py-12 px-4 transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="max-w-md w-full bg-white dark:bg-dark-800 rounded-xl shadow-sm p-8 text-center transition-colors"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <motion.div
            className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: 'spring', stiffness: 400 }}
            >
              <CheckCircleIcon className="w-10 h-10 text-green-600 dark:text-green-500" />
            </motion.div>
          </motion.div>
          <motion.h2
            className="text-2xl font-bold text-dark-900 dark:text-white mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Request Submitted!
          </motion.h2>
          <motion.p
            className="text-dark-500 dark:text-dark-400 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            Your service request has been submitted successfully. Our team will contact you shortly.
          </motion.p>
          <motion.div
            className="bg-dark-50 dark:bg-dark-700 rounded-lg p-4 mb-6 transition-colors"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-sm text-dark-500 dark:text-dark-400">Your Ticket Number</p>
            <motion.p
              className="text-2xl font-bold text-dark-900 dark:text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              {ticketNumber}
            </motion.p>
          </motion.div>
          <motion.p
            className="text-sm text-dark-500 dark:text-dark-400 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Please save this ticket number for future reference. You can track your request status in your account.
          </motion.p>
          <motion.div
            className="flex flex-col gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            {isAuthenticated ? (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link to="/account/service-requests" className="btn btn-primary w-full">
                  Track Request
                </Link>
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link to="/login" className="btn btn-primary w-full">
                  Login to Track
                </Link>
              </motion.div>
            )}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link to="/" className="btn btn-outline w-full">
                Return Home
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="min-h-screen bg-dark-50 dark:bg-dark-900 transition-colors"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <motion.div
        className="bg-dark-900 dark:bg-dark-950 text-white py-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <motion.div
              className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <WrenchScrewdriverIcon className="w-7 h-7 text-dark-900" />
            </motion.div>
            <div>
              <motion.h1
                className="text-3xl font-bold"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                Service Request
              </motion.h1>
              <motion.p
                className="text-dark-300 dark:text-dark-400"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                Schedule a service for your Fischer appliance
              </motion.p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Progress Steps */}
      <motion.div
        className="bg-white dark:bg-dark-800 border-b border-dark-200 dark:border-dark-700 transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-4">
            {[
              { num: 1, label: 'Service Type' },
              { num: 2, label: 'Product Details' },
              { num: 3, label: 'Contact Info' },
              { num: 4, label: 'Schedule' },
            ].map((s, i) => (
              <motion.div
                key={s.num}
                className="flex items-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <motion.div
                  className={`flex items-center justify-center w-8 h-8 rounded-full font-medium transition-all duration-300 ${
                    step > s.num
                      ? 'bg-green-500 text-white'
                      : step === s.num
                      ? 'bg-primary-500 text-white'
                      : 'bg-dark-200 dark:bg-dark-600 text-dark-500 dark:text-dark-400'
                  }`}
                  animate={{
                    scale: step === s.num ? [1, 1.1, 1] : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {step > s.num ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    s.num
                  )}
                </motion.div>
                <span className={`ml-2 hidden sm:inline transition-colors duration-300 ${step >= s.num ? 'text-dark-900 dark:text-white' : 'text-dark-400 dark:text-dark-500'}`}>
                  {s.label}
                </span>
                {i < 3 && (
                  <motion.div
                    className="w-8 md:w-16 h-0.5 mx-2 bg-dark-200 dark:bg-dark-600 overflow-hidden"
                  >
                    <motion.div
                      className="h-full bg-green-500"
                      initial={{ width: '0%' }}
                      animate={{ width: step > s.num ? '100%' : '0%' }}
                      transition={{ duration: 0.4 }}
                    />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait" custom={direction}>
            {/* Step 1: Service Type */}
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6 transition-colors"
              >
                <motion.h2
                  className="text-xl font-semibold text-dark-900 dark:text-white mb-6"
                  {...fadeInUp}
                  transition={{ delay: 0.1 }}
                >
                  Select Service Type
                </motion.h2>
                <div className="space-y-3">
                  {serviceTypes.map((type, index) => (
                    <motion.div
                      key={type.value}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + index * 0.05 }}
                      onClick={() => setFormData({ ...formData, service_type: type.value })}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
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
                        <motion.div
                          className={`w-5 h-5 rounded-full border-2 transition-colors ${
                            formData.service_type === type.value
                              ? 'border-primary-500 bg-primary-500'
                              : 'border-dark-300 dark:border-dark-500'
                          }`}
                          animate={{
                            scale: formData.service_type === type.value ? [1, 1.2, 1] : 1,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          {formData.service_type === type.value && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 400 }}
                            >
                              <CheckCircleIcon className="w-full h-full text-white" />
                            </motion.div>
                          )}
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <motion.div
                  className="mt-6 flex justify-end"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.button
                    type="button"
                    onClick={nextStep}
                    className="btn btn-primary px-8"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Continue
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            {/* Step 2: Product Details */}
            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6 transition-colors"
              >
                <motion.h2
                  className="text-xl font-semibold text-dark-900 dark:text-white mb-6"
                  {...fadeInUp}
                  transition={{ delay: 0.1 }}
                >
                  Product Details
                </motion.h2>
                <div className="space-y-4">
                  {[
                    { label: 'Product Category *', field: 'product_category', type: 'select', options: productCategories, placeholder: 'Select product category' },
                    { label: 'Model Number', field: 'product_model', type: 'text', placeholder: 'e.g., FC-2000' },
                    { label: 'Serial Number', field: 'serial_number', type: 'text', placeholder: 'Found on product label' },
                    { label: 'Purchase Date', field: 'purchase_date', type: 'date' },
                  ].map((item, index) => (
                    <motion.div
                      key={item.field}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + index * 0.05 }}
                    >
                      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">{item.label}</label>
                      {item.type === 'select' ? (
                        <select
                          value={formData[item.field as keyof typeof formData]}
                          onChange={(e) => setFormData({ ...formData, [item.field]: e.target.value })}
                          className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                          required={item.label.includes('*')}
                        >
                          <option value="">{item.placeholder}</option>
                          {item.options?.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={item.type}
                          value={formData[item.field as keyof typeof formData]}
                          onChange={(e) => setFormData({ ...formData, [item.field]: e.target.value })}
                          placeholder={item.placeholder}
                          className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 dark:placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                        />
                      )}
                    </motion.div>
                  ))}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Issue Description *</label>
                    <textarea
                      value={formData.issue_description}
                      onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
                      rows={4}
                      placeholder="Please describe the issue in detail..."
                      className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 dark:placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                      required
                    />
                  </motion.div>
                </div>
                <motion.div
                  className="mt-6 flex justify-between"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.button
                    type="button"
                    onClick={() => prevStep(1)}
                    className="btn btn-outline px-8"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Back
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={nextStep}
                    className="btn btn-primary px-8"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Continue
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            {/* Step 3: Contact Info */}
            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6 transition-colors"
              >
                <motion.h2
                  className="text-xl font-semibold text-dark-900 dark:text-white mb-6"
                  {...fadeInUp}
                  transition={{ delay: 0.1 }}
                >
                  Contact Information
                </motion.h2>
                <div className="space-y-4">
                  <motion.div
                    className="grid md:grid-cols-2 gap-4"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
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
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Address *</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={2}
                      placeholder="Complete address for service visit"
                      className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white placeholder-dark-400 dark:placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                      required
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
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
                  </motion.div>
                </div>
                <motion.div
                  className="mt-6 flex justify-between"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                >
                  <motion.button
                    type="button"
                    onClick={() => prevStep(2)}
                    className="btn btn-outline px-8"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Back
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={nextStep}
                    className="btn btn-primary px-8"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Continue
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            {/* Step 4: Schedule */}
            {step === 4 && (
              <motion.div
                key="step4"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6 transition-colors"
              >
                <motion.h2
                  className="text-xl font-semibold text-dark-900 dark:text-white mb-6"
                  {...fadeInUp}
                  transition={{ delay: 0.1 }}
                >
                  Schedule Service
                </motion.h2>
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Preferred Date</label>
                    <input
                      type="date"
                      value={formData.preferred_date}
                      onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
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
                  </motion.div>
                  <motion.p
                    className="text-sm text-dark-500 dark:text-dark-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                  >
                    * Our team will confirm the exact date and time based on availability in your area.
                  </motion.p>
                </div>

                {/* Summary */}
                <motion.div
                  className="mt-6 p-4 bg-dark-50 dark:bg-dark-700 rounded-lg transition-colors"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="font-semibold text-dark-900 dark:text-white mb-3">Request Summary</h3>
                  <div className="space-y-2 text-sm">
                    {[
                      { label: 'Service Type:', value: formData.service_type.replace('_', ' ') },
                      { label: 'Product:', value: formData.product_category },
                      { label: 'City:', value: formData.city },
                    ].map((item, index) => (
                      <motion.div
                        key={item.label}
                        className="flex justify-between"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + index * 0.05 }}
                      >
                        <span className="text-dark-500 dark:text-dark-400">{item.label}</span>
                        <span className="text-dark-900 dark:text-white capitalize">{item.value}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  className="mt-6 flex justify-between"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.button
                    type="button"
                    onClick={() => prevStep(3)}
                    className="btn btn-outline px-8"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Back
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={mutation.isPending}
                    className="btn btn-primary px-8 flex items-center gap-2"
                    whileHover={{ scale: mutation.isPending ? 1 : 1.02 }}
                    whileTap={{ scale: mutation.isPending ? 1 : 0.98 }}
                  >
                    {mutation.isPending && <LoadingSpinner size="sm" />}
                    Submit Request
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
            </AnimatePresence>
          </form>
        </div>
      </div>
    </motion.div>
  )
}
