import { useState, useRef } from 'react'
import { StarIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface ReviewFormProps {
  productId: number
  onSuccess: () => void
  onCancel?: () => void
}

export default function ReviewForm({ productId, onSuccess, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [pros, setPros] = useState<string[]>([''])
  const [cons, setCons] = useState<string[]>([''])
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remaining = 5 - images.length
    const newFiles = files.slice(0, remaining)

    for (const file of newFiles) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 2MB limit`)
        return
      }
    }

    setImages(prev => [...prev, ...newFiles])
    const newPreviews = newFiles.map(f => URL.createObjectURL(f))
    setPreviews(prev => [...prev, ...newPreviews])

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index])
    setImages(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const updatePro = (index: number, value: string) => {
    const updated = [...pros]
    updated[index] = value
    setPros(updated)
  }

  const updateCon = (index: number, value: string) => {
    const updated = [...cons]
    updated[index] = value
    setCons(updated)
  }

  const addPro = () => { if (pros.length < 5) setPros([...pros, '']) }
  const addCon = () => { if (cons.length < 5) setCons([...cons, '']) }
  const removePro = (i: number) => setPros(pros.filter((_, idx) => idx !== i))
  const removeCon = (i: number) => setCons(cons.filter((_, idx) => idx !== i))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast.error('Please select a star rating')
      return
    }
    if (content.length < 10) {
      toast.error('Review must be at least 10 characters')
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('product_id', productId.toString())
      formData.append('rating', rating.toString())
      formData.append('content', content)
      if (title) formData.append('title', title)

      const filteredPros = pros.filter(p => p.trim())
      const filteredCons = cons.filter(c => c.trim())
      filteredPros.forEach((p, i) => formData.append(`pros[${i}]`, p))
      filteredCons.forEach((c, i) => formData.append(`cons[${i}]`, c))

      images.forEach((img, i) => formData.append(`images[${i}]`, img))

      await api.post('/api/reviews', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      toast.success('Review submitted! It will appear after admin approval.')
      onSuccess()
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to submit review'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Star Rating */}
      <div>
        <label className="block text-sm font-medium text-dark-900 dark:text-white mb-2">
          Your Rating *
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              {(hoverRating || rating) >= star ? (
                <StarSolidIcon className="w-8 h-8 text-primary-500" />
              ) : (
                <StarIcon className="w-8 h-8 text-dark-300 dark:text-dark-600" />
              )}
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-dark-500 dark:text-dark-400 self-center">
              {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : 'Excellent'}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-dark-900 dark:text-white mb-1">
          Review Title <span className="text-dark-400">(optional)</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={255}
          placeholder="Summarize your review"
          className="w-full px-4 py-2.5 rounded-lg border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-dark-900 dark:text-white mb-1">
          Your Review *
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          minLength={10}
          maxLength={2000}
          rows={4}
          placeholder="Share your experience with this product..."
          className="w-full px-4 py-2.5 rounded-lg border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-dark-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
          required
        />
        <p className="text-xs text-dark-400 mt-1">{content.length}/2000</p>
      </div>

      {/* Pros */}
      <div>
        <label className="block text-sm font-medium text-dark-900 dark:text-white mb-1">
          Pros <span className="text-dark-400">(optional)</span>
        </label>
        {pros.map((pro, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              type="text"
              value={pro}
              onChange={(e) => updatePro(i, e.target.value)}
              placeholder="What did you like?"
              className="flex-1 px-3 py-2 rounded-lg border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-dark-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {pros.length > 1 && (
              <button type="button" onClick={() => removePro(i)} className="text-dark-400 hover:text-dark-600">
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
        {pros.length < 5 && (
          <button type="button" onClick={addPro} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
            + Add another pro
          </button>
        )}
      </div>

      {/* Cons */}
      <div>
        <label className="block text-sm font-medium text-dark-900 dark:text-white mb-1">
          Cons <span className="text-dark-400">(optional)</span>
        </label>
        {cons.map((con, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              type="text"
              value={con}
              onChange={(e) => updateCon(i, e.target.value)}
              placeholder="What could be improved?"
              className="flex-1 px-3 py-2 rounded-lg border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-dark-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {cons.length > 1 && (
              <button type="button" onClick={() => removeCon(i)} className="text-dark-400 hover:text-dark-600">
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
        {cons.length < 5 && (
          <button type="button" onClick={addCon} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
            + Add another con
          </button>
        )}
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-dark-900 dark:text-white mb-1">
          Photos <span className="text-dark-400">(optional, up to 5)</span>
        </label>
        <div className="flex flex-wrap gap-3">
          {previews.map((preview, i) => (
            <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-dark-200 dark:border-dark-600">
              <img src={preview} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 rounded-full text-white"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
          {images.length < 5 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-lg border-2 border-dashed border-dark-300 dark:border-dark-600 flex flex-col items-center justify-center text-dark-400 hover:text-dark-600 hover:border-dark-400 transition-colors"
            >
              <PhotoIcon className="w-6 h-6" />
              <span className="text-xs mt-1">Add</span>
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          className="hidden"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 border border-dark-200 dark:border-dark-600 text-dark-600 dark:text-dark-300 rounded-lg hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
