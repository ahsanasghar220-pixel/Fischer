import { motion, AnimatePresence } from 'framer-motion'
import { ClockIcon } from '@heroicons/react/24/outline'
import { formatPrice } from '@/lib/utils'

interface CountdownTime {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface BundlePricingProps {
  displayPrice: number
  displayOriginalPrice: number
  displaySavings: number
  displaySavingsPercentage: number
  showSavings?: boolean
  showCountdown?: boolean
  countdown: CountdownTime | null
}

export default function BundlePricing({
  displayPrice,
  displayOriginalPrice,
  displaySavings,
  displaySavingsPercentage,
  showSavings,
  showCountdown,
  countdown,
}: BundlePricingProps) {
  return (
    <>
      {/* Countdown Timer */}
      {showCountdown && countdown && (
        <motion.div
          className="bg-gradient-to-r from-red-500/10 to-orange-500/10 dark:from-red-900/30 dark:to-orange-900/30 rounded-xl p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
            <ClockIcon className="w-5 h-5" />
            <span className="font-semibold">Limited Time Offer!</span>
          </div>
          <div className="flex gap-3">
            {[
              { value: countdown.days, label: 'Days' },
              { value: countdown.hours, label: 'Hours' },
              { value: countdown.minutes, label: 'Minutes' },
              { value: countdown.seconds, label: 'Seconds' },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="bg-white dark:bg-dark-800 rounded-lg px-3 py-2 shadow-sm">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={item.value}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="text-2xl font-bold text-dark-900 dark:text-white"
                    >
                      {item.value.toString().padStart(2, '0')}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <span className="text-xs text-dark-500 dark:text-dark-400 mt-1">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Price Block */}
      <div className="bg-gray-50 dark:bg-dark-800 rounded-xl p-6">
        <div className="flex items-end gap-4 mb-2">
          <span className="text-4xl font-bold text-dark-900 dark:text-white">
            {formatPrice(displayPrice)}
          </span>
          {displaySavings > 0 && (
            <span className="text-xl text-dark-400 line-through">
              {formatPrice(displayOriginalPrice)}
            </span>
          )}
        </div>
        {showSavings && displaySavings > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
              You save {formatPrice(displaySavings)} ({displaySavingsPercentage.toFixed(0)}% off)
            </span>
          </div>
        )}
      </div>
    </>
  )
}
