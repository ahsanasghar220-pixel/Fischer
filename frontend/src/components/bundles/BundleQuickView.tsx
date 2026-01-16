import { useState, useEffect, useMemo, Fragment } from 'react'
import { Link } from 'react-router-dom'
import { Dialog, Transition } from '@headlessui/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XMarkIcon,
  ShoppingCartIcon,
  ClockIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  GiftIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { useCalculateBundlePrice, useAddBundleToCart } from '@/api/bundles'
import type { Bundle, BundleSlot, SlotSelection, PricingBreakdown } from '@/api/bundles'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

interface BundleQuickViewProps {
  bundle: Bundle | null
  isOpen: boolean
  onClose: () => void
}

interface CountdownTime {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function BundleQuickView({ bundle, isOpen, onClose }: BundleQuickViewProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selections, setSelections] = useState<Map<number, number[]>>(new Map())
  const [countdown, setCountdown] = useState<CountdownTime | null>(null)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [pricingBreakdown, setPricingBreakdown] = useState<PricingBreakdown | null>(null)

  const calculatePrice = useCalculateBundlePrice()
  const addBundleToCart = useAddBundleToCart()

  // Reset state when bundle changes
  useEffect(() => {
    if (bundle) {
      setSelectedImageIndex(0)
      setSelections(new Map())
      setPricingBreakdown(null)
    }
  }, [bundle?.id])

  // Calculate countdown
  useEffect(() => {
    if (!bundle?.ends_at) {
      setCountdown(null)
      return
    }

    const calculateCountdown = () => {
      const endDate = new Date(bundle.ends_at!).getTime()
      const now = Date.now()
      const diff = endDate - now

      if (diff <= 0) {
        setCountdown(null)
        return
      }

      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }

    calculateCountdown()
    const timer = setInterval(calculateCountdown, 1000)
    return () => clearInterval(timer)
  }, [bundle?.ends_at])

  // Calculate pricing when selections change
  useEffect(() => {
    if (!bundle || bundle.bundle_type !== 'configurable') return
    if (selections.size === 0) {
      setPricingBreakdown(null)
      return
    }

    const slotSelections: SlotSelection[] = []
    selections.forEach((productIds, slotId) => {
      if (productIds.length > 0) {
        slotSelections.push({
          slot_id: slotId,
          product_ids: productIds,
        })
      }
    })

    if (slotSelections.length > 0) {
      calculatePrice.mutate(
        { slug: bundle.slug, selections: slotSelections },
        {
          onSuccess: (data) => setPricingBreakdown(data),
        }
      )
    }
  }, [selections, bundle])

  // Handle slot selection
  const handleSlotSelection = (slotId: number, productId: number, allowsMultiple: boolean) => {
    setSelections((prev) => {
      const newSelections = new Map(prev)
      const current = newSelections.get(slotId) || []

      if (allowsMultiple) {
        const isSelected = current.includes(productId)
        if (isSelected) {
          newSelections.set(slotId, current.filter((id) => id !== productId))
        } else {
          newSelections.set(slotId, [...current, productId])
        }
      } else {
        newSelections.set(slotId, [productId])
      }

      return newSelections
    })
  }

  // Check if all required slots are filled
  const allRequiredSlotsFilled = useMemo(() => {
    if (!bundle || bundle.bundle_type !== 'configurable') return true

    return bundle.slots.every((slot) => {
      if (!slot.is_required) return true
      const selected = selections.get(slot.id) || []
      return selected.length >= slot.min_selections
    })
  }, [bundle, selections])

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!bundle) return

    if (bundle.bundle_type === 'configurable' && !allRequiredSlotsFilled) {
      toast.error('Please complete all required selections')
      return
    }

    setIsAddingToCart(true)

    const slotSelections: SlotSelection[] | undefined =
      bundle.bundle_type === 'configurable'
        ? Array.from(selections.entries()).map(([slotId, productIds]) => ({
            slot_id: slotId,
            product_ids: productIds,
          }))
        : undefined

    try {
      await addBundleToCart.mutateAsync({
        bundleSlug: bundle.slug,
        selections: slotSelections,
      })
      toast.success('Bundle added to cart!')
      onClose()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add bundle to cart')
    } finally {
      setIsAddingToCart(false)
    }
  }

  // Get all images
  const allImages = useMemo(() => {
    if (!bundle) return []
    const images: string[] = []

    if (bundle.featured_image) {
      images.push(bundle.featured_image)
    }

    bundle.images?.forEach((img) => {
      if (img.image !== bundle.featured_image) {
        images.push(img.image)
      }
    })

    return images.length > 0 ? images : ['/placeholder-bundle.jpg']
  }, [bundle])

  if (!bundle) return null

  const displayPrice = pricingBreakdown?.discounted_price ?? bundle.discounted_price
  const displayOriginalPrice = pricingBreakdown?.original_price ?? bundle.original_price
  const displaySavings = pricingBreakdown?.savings ?? bundle.savings
  const displaySavingsPercentage = pricingBreakdown?.savings_percentage ?? bundle.savings_percentage

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl bg-white dark:bg-dark-800 rounded-2xl shadow-2xl overflow-hidden">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 p-2 bg-white/90 dark:bg-dark-700/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-dark-600 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-dark-600 dark:text-dark-300" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* Left - Image Gallery */}
                  <div className="relative bg-gray-100 dark:bg-dark-900">
                    {/* Main Image */}
                    <div className="relative aspect-square">
                      <motion.img
                        key={selectedImageIndex}
                        src={allImages[selectedImageIndex]}
                        alt={bundle.name}
                        className="w-full h-full object-cover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />

                      {/* Badge */}
                      {bundle.badge_label && (
                        <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide text-white bg-gradient-to-r ${
                          bundle.badge_color === 'gold' ? 'from-amber-500 to-yellow-400' :
                          bundle.badge_color === 'red' ? 'from-red-500 to-rose-400' :
                          bundle.badge_color === 'blue' ? 'from-blue-500 to-cyan-400' :
                          'from-green-500 to-emerald-400'
                        } shadow-lg`}>
                          {bundle.badge_label}
                        </div>
                      )}

                      {/* Navigation */}
                      {allImages.length > 1 && (
                        <>
                          <button
                            onClick={() =>
                              setSelectedImageIndex((prev) =>
                                prev === 0 ? allImages.length - 1 : prev - 1
                              )
                            }
                            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-dark-700/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-dark-600"
                          >
                            <ChevronLeftIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setSelectedImageIndex((prev) =>
                                prev === allImages.length - 1 ? 0 : prev + 1
                              )
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-dark-700/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-dark-600"
                          >
                            <ChevronRightIcon className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Thumbnails */}
                    {allImages.length > 1 && (
                      <div className="flex gap-2 p-3 overflow-x-auto">
                        {allImages.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                              selectedImageIndex === idx
                                ? 'border-primary-500'
                                : 'border-transparent hover:border-gray-300 dark:hover:border-dark-600'
                            }`}
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right - Details */}
                  <div className="p-6 max-h-[600px] overflow-y-auto">
                    {/* Type Badge */}
                    <span className={`inline-block px-2 py-1 text-xs font-semibold uppercase tracking-wider rounded ${
                      bundle.bundle_type === 'fixed'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                    }`}>
                      {bundle.bundle_type === 'fixed' ? 'Fixed Bundle' : 'Build Your Own'}
                    </span>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-dark-900 dark:text-white mt-3">
                      {bundle.name}
                    </h2>

                    {/* Short Description */}
                    {bundle.short_description && (
                      <p className="text-dark-600 dark:text-dark-300 mt-2 line-clamp-2">
                        {bundle.short_description}
                      </p>
                    )}

                    {/* Countdown */}
                    {bundle.show_countdown && countdown && (
                      <div className="flex items-center gap-2 mt-4 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <ClockIcon className="w-5 h-5 text-red-500" />
                        <span className="text-sm font-medium text-red-600 dark:text-red-400">
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
                      {bundle.show_savings && displaySavings > 0 && (
                        <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded text-sm font-semibold text-green-600 dark:text-green-400">
                          Save {formatPrice(displaySavings)} ({displaySavingsPercentage.toFixed(0)}% off)
                        </div>
                      )}
                    </div>

                    {/* Fixed Bundle Items */}
                    {bundle.bundle_type === 'fixed' && bundle.items.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-sm font-semibold text-dark-900 dark:text-white mb-2">
                          Includes {bundle.items.length} items:
                        </h3>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {bundle.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-dark-700 rounded-lg"
                            >
                              <div className="w-10 h-10 rounded overflow-hidden bg-white dark:bg-dark-600 flex-shrink-0">
                                {item.product.image ? (
                                  <img
                                    src={item.product.image}
                                    alt={item.product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <GiftIcon className="w-4 h-4 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-dark-900 dark:text-white truncate">
                                  {item.product.name}
                                </p>
                                <p className="text-xs text-dark-500 dark:text-dark-400">
                                  Qty: {item.quantity}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Configurable Bundle Slots */}
                    {bundle.bundle_type === 'configurable' && bundle.slots.length > 0 && (
                      <div className="mt-4 space-y-4">
                        {bundle.slots.map((slot) => (
                          <QuickSlotSelector
                            key={slot.id}
                            slot={slot}
                            selectedProductIds={selections.get(slot.id) || []}
                            onSelect={(productId) =>
                              handleSlotSelection(slot.id, productId, slot.allows_multiple)
                            }
                          />
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-6 space-y-3">
                      <button
                        onClick={handleAddToCart}
                        disabled={
                          isAddingToCart ||
                          !bundle.is_available ||
                          (bundle.bundle_type === 'configurable' && !allRequiredSlotsFilled)
                        }
                        className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                          isAddingToCart ||
                          !bundle.is_available ||
                          (bundle.bundle_type === 'configurable' && !allRequiredSlotsFilled)
                            ? 'bg-gray-300 dark:bg-dark-600 text-gray-500 cursor-not-allowed'
                            : 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                        }`}
                      >
                        {isAddingToCart ? (
                          <>
                            <LoadingSpinner size="sm" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <ShoppingCartIcon className="w-5 h-5" />
                            {bundle.cta_text || 'Add to Cart'}
                          </>
                        )}
                      </button>

                      <Link
                        to={`/bundle/${bundle.slug}`}
                        onClick={onClose}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-dark-600 rounded-xl font-semibold text-dark-700 dark:text-dark-200 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                      >
                        View Full Details
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                      </Link>
                    </div>

                    {bundle.bundle_type === 'configurable' && !allRequiredSlotsFilled && (
                      <p className="mt-3 text-sm text-center text-amber-600 dark:text-amber-400">
                        Complete all required selections to add to cart
                      </p>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

// Compact Slot Selector for Quick View
interface QuickSlotSelectorProps {
  slot: BundleSlot
  selectedProductIds: number[]
  onSelect: (productId: number) => void
}

function QuickSlotSelector({ slot, selectedProductIds, onSelect }: QuickSlotSelectorProps) {
  const isComplete = selectedProductIds.length >= slot.min_selections
  const canSelectMore = slot.allows_multiple && selectedProductIds.length < slot.max_selections

  return (
    <div className={`border rounded-lg overflow-hidden ${
      isComplete
        ? 'border-green-500/50'
        : slot.is_required
        ? 'border-amber-500/50'
        : 'border-gray-200 dark:border-dark-600'
    }`}>
      <div className={`px-3 py-2 text-sm font-medium flex items-center justify-between ${
        isComplete ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-dark-700'
      }`}>
        <span className="flex items-center gap-2">
          {slot.name}
          {slot.is_required && <span className="text-red-500 text-xs">*</span>}
          {isComplete && <CheckCircleIcon className="w-4 h-4 text-green-500" />}
        </span>
        <span className="text-xs text-dark-500 dark:text-dark-400">
          {slot.allows_multiple ? `${slot.min_selections}-${slot.max_selections}` : '1'}
        </span>
      </div>
      <div className="p-2 flex flex-wrap gap-2">
        {slot.products.slice(0, 6).map((slotProduct) => {
          const isSelected = selectedProductIds.includes(slotProduct.product_id)
          const canSelect = isSelected || !slot.allows_multiple || canSelectMore

          return (
            <button
              key={slotProduct.id}
              onClick={() => canSelect && onSelect(slotProduct.product_id)}
              disabled={!canSelect}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border text-sm transition-all ${
                isSelected
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : canSelect
                  ? 'border-gray-200 dark:border-dark-600 hover:border-primary-300'
                  : 'border-gray-100 dark:border-dark-700 opacity-50 cursor-not-allowed'
              }`}
            >
              {slotProduct.product.image && (
                <img
                  src={slotProduct.product.image}
                  alt=""
                  className="w-6 h-6 rounded object-cover"
                />
              )}
              <span className="truncate max-w-[100px]">{slotProduct.product.name}</span>
              {isSelected && <CheckIcon className="w-4 h-4 text-primary-500 flex-shrink-0" />}
            </button>
          )
        })}
        {slot.products.length > 6 && (
          <span className="text-xs text-dark-500 dark:text-dark-400 self-center">
            +{slot.products.length - 6} more
          </span>
        )}
      </div>
    </div>
  )
}
