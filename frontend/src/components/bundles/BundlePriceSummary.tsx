import { ClockIcon } from '@heroicons/react/24/outline'
import { formatPrice } from '@/lib/utils'

interface CountdownTime {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface BundlePriceSummaryProps {
  displayPrice: number
  displayOriginalPrice: number
  displaySavings: number
  displaySavingsPercentage: number
  showSavings?: boolean
  showCountdown?: boolean
  countdown: CountdownTime | null
}

export default function BundlePriceSummary({
  displayPrice,
  displayOriginalPrice,
  displaySavings,
  displaySavingsPercentage,
  showSavings,
  showCountdown,
  countdown,
}: BundlePriceSummaryProps) {
  return (
    <>
      {/* Countdown */}
      {showCountdown && countdown && (
        <div className="flex items-center gap-2 mt-4 px-3 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
          <ClockIcon className="w-5 h-5 text-primary-500" />
          <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
            Ends in {countdown.days}d {countdown.hours}h {countdown.minutes}m
          </span>
        </div>
      )}

      {/* Pricing */}
      <div className="mt-4 p-4 bg-gray-50 dark:bg-dark-700 rounded-xl">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-dark-900 dark:text-white">
            {formatPrice(displayPrice)}
          </span>
          {displaySavings > 0 && (
            <span className="text-lg text-dark-400 line-through">
              {formatPrice(displayOriginalPrice)}
            </span>
          )}
        </div>
        {showSavings && displaySavings > 0 && (
          <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded text-sm font-semibold text-green-600 dark:text-green-400">
            Save {formatPrice(displaySavings)} ({displaySavingsPercentage.toFixed(0)}% off)
          </div>
        )}
      </div>
    </>
  )
}
