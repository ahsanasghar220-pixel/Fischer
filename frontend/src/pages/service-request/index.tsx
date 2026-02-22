import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { WrenchScrewdriverIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'
import ServiceForm, { type ServiceFormData } from './ServiceForm'

export default function ServiceRequest() {
  const { isAuthenticated, user } = useAuthStore()
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [ticketNumber, setTicketNumber] = useState('')

  const [formData, setFormData] = useState<ServiceFormData>({
    service_type: '',
    product_category: '',
    product_model: '',
    serial_number: '',
    purchase_date: '',
    issue_description: '',
    name: user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    preferred_date: '',
    preferred_time: '',
  })

  const mutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
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
                className="text-2xl sm:text-3xl font-bold"
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
                  className={`flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full text-xs md:text-sm font-medium transition-all duration-300 ${
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
                      <CheckCircleIcon className="w-4 h-4 md:w-5 md:h-5" />
                    </motion.div>
                  ) : (
                    s.num
                  )}
                </motion.div>
                <span className={`ml-2 hidden sm:inline text-sm md:text-base transition-colors duration-300 ${step >= s.num ? 'text-dark-900 dark:text-white' : 'text-dark-400 dark:text-dark-500'}`}>
                  {s.label}
                </span>
                {i < 3 && (
                  <motion.div
                    className="w-6 md:w-16 h-0.5 mx-1 md:mx-2 bg-dark-200 dark:bg-dark-600 overflow-hidden"
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
          <ServiceForm
            step={step}
            direction={direction}
            formData={formData}
            setFormData={setFormData}
            onNextStep={nextStep}
            onPrevStep={prevStep}
            onSubmit={handleSubmit}
            isPending={mutation.isPending}
          />
        </div>
      </div>
    </motion.div>
  )
}
