import { useState, useEffect, useMemo, Fragment } from 'react'
import { Link } from 'react-router-dom'
import { Dialog, Transition } from '@headlessui/react'
import { motion } from 'framer-motion'
import {
  XMarkIcon,
  ShoppingCartIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  GiftIcon,
  ArrowTopRightOnSquareIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { useCalculateBundlePrice, useAddBundleToCart } from '@/api/bundles'
import type { Bundle, SlotSelection, PricingBreakdown } from '@/api/bundles.types'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { formatDescription } from '@/lib/utils'
import toast from 'react-hot-toast'
import BundleSlotSelector from './BundleSlotSelector'
import BundlePriceSummary from './BundlePriceSummary'

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

  // Check if the bundle contains any out-of-stock items
  const hasOutOfStockItems = useMemo(() => {
    if (!bundle) return false

    // For fixed bundles, check all items
    if (bundle.bundle_type === 'fixed' && bundle.items?.length > 0) {
      return bundle.items.some((item) => item.product?.is_in_stock === false)
    }

    return false
  }, [bundle])

  // For configurable bundles, check if any selected products are OOS
  const hasSelectedOutOfStockItems = useMemo(() => {
    if (!bundle || bundle.bundle_type !== 'configurable') return false

    for (const [slotId, productIds] of selections.entries()) {
      const slot = bundle.slots.find((s) => s.id === slotId)
      if (!slot) continue
      for (const pid of productIds) {
        const slotProduct = slot.products.find((sp) => sp.product_id === pid)
        if (slotProduct && slotProduct.product?.is_in_stock === false) {
          return true
        }
      }
    }
    return false
  }, [bundle, selections])

  const isAddToCartDisabled = useMemo(() => {
    if (!bundle) return true
    if (isAddingToCart || !bundle.is_available) return true
    if (hasOutOfStockItems) return true
    if (hasSelectedOutOfStockItems) return true
    if (bundle.bundle_type === 'configurable' && !allRequiredSlotsFilled) return true
    return false
  }, [bundle, isAddingToCart, hasOutOfStockItems, hasSelectedOutOfStockItems, allRequiredSlotsFilled])

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

    return images.length > 0 ? images : ['/images/all-products.webp']
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
                          bundle.badge_color === 'gold' ? 'from-primary-500 to-primary-400' :
                          bundle.badge_color === 'red' ? 'from-primary-500 to-primary-400' :
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
                      <div className="text-dark-600 dark:text-dark-300 mt-2 space-y-0.5">
                        {formatDescription(bundle.short_description).slice(0, 2).map((line, index) => (
                          <p key={index} className="text-sm">{line}</p>
                        ))}
                      </div>
                    )}

                    {/* Pricing Summary */}
                    <BundlePriceSummary
                      displayPrice={displayPrice}
                      displayOriginalPrice={displayOriginalPrice}
                      displaySavings={displaySavings}
                      displaySavingsPercentage={displaySavingsPercentage}
                      showSavings={bundle.show_savings}
                      showCountdown={bundle.show_countdown}
                      countdown={countdown}
                    />

                    {/* Fixed Bundle Items */}
                    {bundle.bundle_type === 'fixed' && bundle.items.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-sm font-semibold text-dark-900 dark:text-white mb-2">
                          Includes {bundle.items.length} items:
                        </h3>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {bundle.items.map((item) => {
                            const isOOS = item.product?.is_in_stock === false
                            return (
                              <div
                                key={item.id}
                                className={`flex items-center gap-3 p-2 rounded-lg ${
                                  isOOS
                                    ? 'bg-red-50 dark:bg-red-900/10 opacity-75'
                                    : 'bg-gray-50 dark:bg-dark-700'
                                }`}
                              >
                                <div className={`w-10 h-10 rounded overflow-hidden flex-shrink-0 ${
                                  isOOS ? 'bg-gray-200 dark:bg-dark-600 grayscale' : 'bg-white dark:bg-dark-600'
                                }`}>
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
                                  <p className={`text-sm font-medium truncate ${
                                    isOOS ? 'text-dark-400 dark:text-dark-500' : 'text-dark-900 dark:text-white'
                                  }`}>
                                    {item.product.name}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs text-dark-500 dark:text-dark-400">
                                      Qty: {item.quantity}
                                    </p>
                                    {isOOS && (
                                      <span className="text-[10px] font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded">
                                        Out of Stock
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        {hasOutOfStockItems && (
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                            <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                            This bundle contains out-of-stock items and cannot be added to cart
                          </div>
                        )}
                      </div>
                    )}

                    {/* Configurable Bundle Slots */}
                    {bundle.bundle_type === 'configurable' && bundle.slots.length > 0 && (
                      <BundleSlotSelector
                        slots={bundle.slots}
                        selections={selections}
                        onSelect={handleSlotSelection}
                      />
                    )}

                    {/* Actions */}
                    <div className="mt-6 space-y-3">
                      <button
                        onClick={handleAddToCart}
                        disabled={isAddToCartDisabled}
                        title={
                          hasOutOfStockItems || hasSelectedOutOfStockItems
                            ? 'Cannot add to cart - contains out-of-stock items'
                            : undefined
                        }
                        className={`w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                          isAddToCartDisabled
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
                            <ShoppingCartIcon className="w-4 h-4" />
                            {bundle.cta_text || 'Add to Cart'}
                          </>
                        )}
                      </button>

                      <Link
                        to={`/bundle/${bundle.slug}`}
                        onClick={onClose}
                        className="w-full flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-300 dark:border-dark-600 rounded-lg font-semibold text-sm text-dark-700 dark:text-dark-200 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                      >
                        View Full Details
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                      </Link>
                    </div>

                    {bundle.bundle_type === 'configurable' && !allRequiredSlotsFilled && (
                      <p className="mt-3 text-sm text-center text-orange-600 dark:text-orange-400">
                        Complete all required selections to add to cart
                      </p>
                    )}
                    {(hasOutOfStockItems || hasSelectedOutOfStockItems) && (
                      <p className="mt-3 text-sm text-center text-red-600 dark:text-red-400 flex items-center justify-center gap-1.5">
                        <ExclamationTriangleIcon className="w-4 h-4" />
                        Bundle contains out-of-stock items
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

