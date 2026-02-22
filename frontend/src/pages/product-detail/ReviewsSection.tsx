import { motion } from 'framer-motion'
import { StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon, CheckBadgeIcon, HandThumbUpIcon } from '@heroicons/react/24/solid'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'
import ReviewForm from '@/components/products/ReviewForm'
import type { Review } from '@/types'
import toast from 'react-hot-toast'

interface ReviewsSectionProps {
  productId: number
  reviews: Review[]
  isAuthenticated: boolean
  canReview: boolean | null
  showReviewForm: boolean
  onShowAuthModal: () => void
  onShowReviewForm: (show: boolean) => void
  onReviewSuccess: () => void
}

export default function ReviewsSection({
  productId,
  reviews,
  isAuthenticated,
  canReview,
  showReviewForm,
  onShowAuthModal,
  onShowReviewForm,
  onReviewSuccess,
}: ReviewsSectionProps) {
  return (
    <div>
      {/* Write a Review Button / Form */}
      <div className="mb-8">
        {showReviewForm ? (
          <div className="p-6 bg-dark-50 dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700">
            <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-6">Write a Review</h3>
            <ReviewForm
              productId={productId}
              onSuccess={onReviewSuccess}
              onCancel={() => onShowReviewForm(false)}
            />
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-lg transition-colors duration-200"
            onClick={() => {
              if (!isAuthenticated) {
                onShowAuthModal()
                return
              }
              if (canReview === false) {
                toast.error('Purchase this product to leave a review')
                return
              }
              onShowReviewForm(true)
            }}
          >
            ✍ Write a Review
          </motion.button>
        )}
      </div>

      {/* Reviews List */}
      {reviews && reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              className="border-b border-dark-200 dark:border-dark-700 pb-6 last:border-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center flex-wrap gap-2 mb-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    star <= review.rating ? (
                      <StarSolidIcon key={star} className="w-4 h-4 text-primary-500" />
                    ) : (
                      <StarIcon key={star} className="w-4 h-4 text-dark-200 dark:text-dark-600" />
                    )
                  ))}
                </div>
                <span className="font-medium text-dark-900 dark:text-white">{review.user.name}</span>
                {review.is_verified_purchase && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                    <CheckBadgeIcon className="w-4 h-4" />
                    Verified Purchase
                  </span>
                )}
                <span className="text-dark-400">•</span>
                <span className="text-sm text-dark-500 dark:text-dark-400">{formatDate(review.created_at)}</span>
              </div>
              {review.title && (
                <h4 className="font-medium text-dark-900 dark:text-white mb-1">{review.title}</h4>
              )}
              <p className="text-dark-600 dark:text-dark-400">{review.content}</p>
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {review.images.map((img, i) => (
                    <motion.img
                      key={i}
                      src={img.image}
                      alt={`Review image ${i + 1}`}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded cursor-pointer"
                      whileHover={{ scale: 1.1 }}
                    />
                  ))}
                </div>
              )}
              {review.helpful_count > 0 && (
                <div className="flex items-center gap-1 mt-3 text-xs text-dark-400">
                  <HandThumbUpIcon className="w-3.5 h-3.5" />
                  {review.helpful_count} found this helpful
                </div>
              )}
              <button
                className="mt-2 text-xs text-dark-400 hover:text-primary-500 transition-colors inline-flex items-center gap-1"
                onClick={async () => {
                  if (!isAuthenticated) { onShowAuthModal(); return }
                  try {
                    await api.post(`/api/reviews/${review.id}/helpful`)
                    toast.success('Thanks for your feedback!')
                  } catch {
                    toast.error('Could not mark as helpful')
                  }
                }}
              >
                <HandThumbUpIcon className="w-3.5 h-3.5" />
                Helpful
              </button>
            </motion.div>
          ))}
        </div>
      ) : !showReviewForm ? (
        <p className="text-dark-500 dark:text-dark-400 text-center py-4">
          No reviews yet. Be the first to review this product!
        </p>
      ) : null}
    </div>
  )
}
