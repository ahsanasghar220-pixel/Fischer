import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { PAKISTAN_CITIES } from '@/data'
import ProductLookup from './ProductLookup'

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

export type ServiceFormData = {
  service_type: string
  product_category: string
  product_model: string
  serial_number: string
  purchase_date: string
  issue_description: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  preferred_date: string
  preferred_time: string
}

interface ServiceFormProps {
  step: number
  direction: number
  formData: ServiceFormData
  setFormData: (data: ServiceFormData) => void
  onNextStep: () => void
  onPrevStep: (target: number) => void
  onSubmit: (e: React.FormEvent) => void
  isPending: boolean
}

export default function ServiceForm({
  step,
  direction,
  formData,
  setFormData,
  onNextStep,
  onPrevStep,
  onSubmit,
  isPending,
}: ServiceFormProps) {
  return (
    <form onSubmit={onSubmit}>
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
                  className={`p-3 md:p-4 border rounded-lg cursor-pointer transition-colors ${
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
                onClick={onNextStep}
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
              <ProductLookup
                values={{
                  product_category: formData.product_category,
                  product_model: formData.product_model,
                  serial_number: formData.serial_number,
                  purchase_date: formData.purchase_date,
                  issue_description: formData.issue_description,
                }}
                onChange={(fields) => setFormData({ ...formData, ...fields })}
              />
            </div>
            <motion.div
              className="mt-6 flex justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <motion.button
                type="button"
                onClick={() => onPrevStep(1)}
                className="btn btn-outline px-8"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Back
              </motion.button>
              <motion.button
                type="button"
                onClick={onNextStep}
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
                  {PAKISTAN_CITIES.map((city) => (
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
                onClick={() => onPrevStep(2)}
                className="btn btn-outline px-8"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Back
              </motion.button>
              <motion.button
                type="button"
                onClick={onNextStep}
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
                onClick={() => onPrevStep(3)}
                className="btn btn-outline px-8"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Back
              </motion.button>
              <motion.button
                type="submit"
                disabled={isPending}
                className="btn btn-primary px-8 flex items-center gap-2"
                whileHover={{ scale: isPending ? 1 : 1.02 }}
                whileTap={{ scale: isPending ? 1 : 0.98 }}
              >
                {isPending && <LoadingSpinner size="sm" />}
                Submit Request
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  )
}
