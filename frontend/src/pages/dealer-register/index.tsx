import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { BuildingStorefrontIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import DealerForm, { type DealerFormData } from './DealerForm'

export default function DealerRegister() {
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)

  const [formData, setFormData] = useState<DealerFormData>({
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
    mutationFn: async (data: DealerFormData) => {
      await api.post('/api/dealers/register', data)
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
      <div className="min-h-screen bg-dark-50 dark:bg-dark-900 flex items-center justify-center py-12 px-4 transition-colors">
        <div className="max-w-md w-full bg-white dark:bg-dark-800 rounded-xl shadow-sm p-8 text-center transition-colors">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-2">Application Submitted!</h2>
          <p className="text-dark-500 dark:text-dark-400 mb-6">
            Thank you for your interest in becoming a Fischer dealer. Our team will review your application and contact you within 2-3 business days.
          </p>
          <p className="text-sm text-dark-500 dark:text-dark-400 mb-6">
            A confirmation email has been sent to <strong className="text-dark-700 dark:text-dark-300">{formData.email}</strong>
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/" className="btn btn-primary">
              Return Home
            </Link>
            <Link to="/shop" className="btn btn-outline">
              Browse Products
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
              <BuildingStorefrontIcon className="w-7 h-7 text-dark-900" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Become a Dealer</h1>
              <p className="text-sm sm:text-base text-dark-300 dark:text-dark-400">Partner with Fischer and grow your business</p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-primary-500 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 text-center">
            <div>
              <span className="text-2xl md:text-3xl font-bold text-dark-900">Up to 30%</span>
              <p className="text-dark-700">Dealer Discount</p>
            </div>
            <div>
              <span className="text-2xl md:text-3xl font-bold text-dark-900">Marketing</span>
              <p className="text-dark-700">Support & Materials</p>
            </div>
            <div>
              <span className="text-2xl md:text-3xl font-bold text-dark-900">Credit</span>
              <p className="text-dark-700">Facility Available</p>
            </div>
            <div>
              <span className="text-2xl md:text-3xl font-bold text-dark-900">Priority</span>
              <p className="text-dark-700">Technical Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white dark:bg-dark-800 border-b border-dark-200 dark:border-dark-700 transition-colors">
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
                  className={`flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full text-xs md:text-sm font-medium transition-colors ${
                    step > s.num
                      ? 'bg-green-500 text-white'
                      : step === s.num
                      ? 'bg-primary-500 text-white'
                      : 'bg-dark-200 dark:bg-dark-600 text-dark-500 dark:text-dark-400'
                  }`}
                >
                  {step > s.num ? <CheckCircleIcon className="w-4 h-4 md:w-5 md:h-5" /> : s.num}
                </div>
                <span className={`ml-2 hidden sm:inline text-sm md:text-base ${step >= s.num ? 'text-dark-900 dark:text-white' : 'text-dark-400'}`}>
                  {s.label}
                </span>
                {i < 3 && <div className="w-6 md:w-16 h-0.5 mx-1 md:mx-2 bg-dark-200 dark:bg-dark-600" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <DealerForm
            step={step}
            formData={formData}
            setFormData={setFormData}
            onNextStep={nextStep}
            onPrevStep={(target) => setStep(target)}
            onSubmit={handleSubmit}
            isPending={mutation.isPending}
          />
        </div>
      </div>
    </div>
  )
}
