import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { Helmet } from 'react-helmet-async'
import { useCheckout } from './useCheckout'
import ShippingForm from './ShippingForm'
import PaymentStep, { DeliveryStep } from './PaymentStep'
import OrderSummary from './OrderSummary'

export default function Checkout() {
  const {
    step,
    setStep,
    form,
    setForm,
    selectedAddress,
    items,
    subtotal,
    discount,
    couponCode,
    isAuthenticated,
    addresses,
    shippingMethods,
    selectedShippingMethod,
    grandTotal,
    placeOrderMutation,
    handleInputChange,
    handleAddressSelect,
    nextStep,
    handleSubmit,
  } = useCheckout()

  if (!items || items.length === 0) {
    return (
      <motion.div
        className="min-h-screen bg-dark-50 dark:bg-dark-900 flex items-center justify-center transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.h1
            className="text-2xl font-bold text-dark-900 dark:text-white mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Your cart is empty
          </motion.h1>
          <motion.p
            className="text-dark-500 dark:text-dark-400 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Add some products before checkout
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link to="/shop" className="btn btn-primary">Go Shopping</Link>
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
      <Helmet><title>Checkout - Fischer Pakistan</title></Helmet>
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 border-b border-dark-200 dark:border-dark-700">
        <div className="container mx-auto px-4 py-6">
          <motion.h1
            className="text-2xl sm:text-3xl font-bold text-dark-900 dark:text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Checkout
          </motion.h1>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white dark:bg-dark-800 border-b border-dark-200 dark:border-dark-700">
        <div className="container mx-auto px-4 py-4">
          <motion.div
            className="flex items-center justify-center gap-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {[
              { num: 1, label: 'Shipping' },
              { num: 2, label: 'Delivery' },
              { num: 3, label: 'Payment' },
            ].map((s, i) => (
              <motion.div
                key={s.num}
                className="flex items-center"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <motion.div
                  className={`flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full text-xs md:text-sm font-medium ${
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
                  {step > s.num ? <CheckCircleIcon className="w-4 h-4 md:w-5 md:h-5" /> : s.num}
                </motion.div>
                <span className={`ml-2 hidden sm:inline ${step >= s.num ? 'text-dark-900 dark:text-white font-medium' : 'text-dark-400'}`}>
                  {s.label}
                </span>
                {i < 2 && (
                  <motion.div
                    className={`w-8 sm:w-16 h-0.5 mx-2 sm:mx-4 ${step > s.num ? 'bg-green-500' : 'bg-dark-200 dark:bg-dark-700'}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-4 lg:gap-8">
            {/* Main Content */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <AnimatePresence mode="wait">
                {/* Step 1: Shipping Address */}
                {step === 1 && (
                  <ShippingForm
                    form={form}
                    addresses={addresses}
                    selectedAddress={selectedAddress}
                    isAuthenticated={isAuthenticated}
                    handleInputChange={handleInputChange}
                    handleAddressSelect={handleAddressSelect}
                    onNext={nextStep}
                  />
                )}

                {/* Step 2: Delivery Method */}
                {step === 2 && (
                  <DeliveryStep
                    form={form}
                    shippingMethods={shippingMethods}
                    onBack={() => setStep(1)}
                    onNext={nextStep}
                    onMethodSelect={(methodId) => setForm(prev => ({ ...prev, shipping_method_id: methodId }))}
                  />
                )}

                {/* Step 3: Payment */}
                {step === 3 && (
                  <PaymentStep
                    form={form}
                    grandTotal={grandTotal}
                    isPending={placeOrderMutation.isPending}
                    handleInputChange={handleInputChange}
                    onBack={() => setStep(2)}
                    onPaymentSelect={(methodId) => setForm(prev => ({ ...prev, payment_method: methodId }))}
                  />
                )}
              </AnimatePresence>
            </motion.div>

            {/* Order Summary Sidebar */}
            <motion.div
              className="lg:col-span-1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <OrderSummary
                items={items}
                subtotal={subtotal}
                discount={discount}
                grandTotal={grandTotal}
                couponCode={couponCode}
                selectedShippingMethod={selectedShippingMethod}
              />
            </motion.div>
          </div>
        </form>
      </div>
    </motion.div>
  )
}
