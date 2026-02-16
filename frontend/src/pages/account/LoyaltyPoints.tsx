import { useQuery } from '@tanstack/react-query'
import { GiftIcon, ArrowUpIcon, ArrowDownIcon, SparklesIcon } from '@heroicons/react/24/outline'
import api from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface LoyaltyTransaction {
  id: number
  points: number
  type: 'earned' | 'redeemed' | 'expired' | 'adjusted'
  description: string
  created_at: string
}

interface LoyaltyData {
  balance: number
  total_earned: number
  total_redeemed: number
  points_value: number
  points_per_amount: number
  review_bonus: number
  referral_bonus: number
  birthday_bonus: number
  enabled: boolean
  transactions: LoyaltyTransaction[]
}

export default function LoyaltyPoints() {
  const { data, isLoading, error } = useQuery<LoyaltyData>({
    queryKey: ['loyalty-points'],
    queryFn: async () => {
      const response = await api.get('/api/account/loyalty-points')
      return response.data.data
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-12 text-center">
        <GiftIcon className="w-16 h-16 mx-auto text-dark-300 dark:text-dark-600 mb-4" />
        <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">Unable to load loyalty points</h3>
        <p className="text-dark-500 dark:text-dark-400">Please try again later</p>
      </div>
    )
  }

  const pointsValueInPKR = (data?.balance || 0) * (data?.points_value || 1)

  return (
    <div className="space-y-6">
      {/* Points Summary */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <SparklesIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-medium opacity-90">Available Points</h2>
            <p className="text-3xl font-bold">{data?.balance?.toLocaleString() || 0}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-white/80">
          <span>Worth</span>
          <span className="font-semibold text-white">{formatPrice(pointsValueInPKR)}</span>
          <span>in discounts</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <ArrowUpIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-dark-500 dark:text-dark-400">Total Earned</p>
              <p className="text-xl font-bold text-dark-900 dark:text-white">
                {data?.total_earned?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <ArrowDownIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-dark-500 dark:text-dark-400">Total Redeemed</p>
              <p className="text-xl font-bold text-dark-900 dark:text-white">
                {data?.total_redeemed?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How to Earn */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm">
        <div className="p-4 border-b border-dark-200 dark:border-dark-700">
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white">How to Earn Points</h3>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-dark-600 dark:text-dark-400">Every Rs. {data?.points_per_amount?.toLocaleString() || 100} spent</span>
            <span className="font-semibold text-primary-600 dark:text-primary-400">+1 Point</span>
          </div>
          {(data?.review_bonus ?? 10) > 0 && (
            <div className="flex items-center justify-between py-2">
              <span className="text-dark-600 dark:text-dark-400">Write a product review</span>
              <span className="font-semibold text-primary-600 dark:text-primary-400">+{data?.review_bonus || 10} Points</span>
            </div>
          )}
          {(data?.referral_bonus ?? 50) > 0 && (
            <div className="flex items-center justify-between py-2">
              <span className="text-dark-600 dark:text-dark-400">Refer a friend</span>
              <span className="font-semibold text-primary-600 dark:text-primary-400">+{data?.referral_bonus || 50} Points</span>
            </div>
          )}
          {(data?.birthday_bonus ?? 100) > 0 && (
            <div className="flex items-center justify-between py-2">
              <span className="text-dark-600 dark:text-dark-400">Birthday bonus</span>
              <span className="font-semibold text-primary-600 dark:text-primary-400">+{data?.birthday_bonus || 100} Points</span>
            </div>
          )}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm">
        <div className="p-4 border-b border-dark-200 dark:border-dark-700">
          <h3 className="text-lg font-semibold text-dark-900 dark:text-white">Transaction History</h3>
        </div>
        {data?.transactions && data.transactions.length > 0 ? (
          <div className="divide-y divide-dark-200 dark:divide-dark-700">
            {data.transactions.map((transaction) => (
              <div key={transaction.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'earned'
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : transaction.type === 'redeemed'
                      ? 'bg-blue-100 dark:bg-blue-900/30'
                      : transaction.type === 'expired'
                      ? 'bg-red-100 dark:bg-red-900/30'
                      : 'bg-dark-100 dark:bg-dark-700'
                  }`}>
                    {transaction.type === 'earned' ? (
                      <ArrowUpIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : transaction.type === 'redeemed' ? (
                      <ArrowDownIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <GiftIcon className="w-5 h-5 text-dark-400 dark:text-dark-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-dark-900 dark:text-white">{transaction.description}</p>
                    <p className="text-sm text-dark-500 dark:text-dark-400">
                      {formatDate(transaction.created_at)}
                    </p>
                  </div>
                </div>
                <span className={`font-semibold ${
                  transaction.points > 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {transaction.points > 0 ? '+' : ''}{transaction.points.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <GiftIcon className="w-16 h-16 mx-auto text-dark-300 dark:text-dark-600 mb-4" />
            <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">No transactions yet</h3>
            <p className="text-dark-500 dark:text-dark-400">Start shopping to earn loyalty points!</p>
          </div>
        )}
      </div>
    </div>
  )
}
