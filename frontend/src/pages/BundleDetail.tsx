import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import {
  ShoppingCartIcon,
  ClockIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  SparklesIcon,
  TruckIcon,
  ShieldCheckIcon,
  GiftIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { useBundle, useRelatedBundles, useCalculateBundlePrice, useAddBundleToCart } from '@/api/bundles'
import type { BundleSlot, SlotSelection, PricingBreakdown } from '@/api/bundles'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import BundleCard from '@/components/bundles/BundleCard'
import ScrollReveal, { StaggerContainer, StaggerItem } from '@/components/effects/ScrollReveal'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

interface CountdownTime {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function BundleDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [selections, setSelections] = useState<Map<number, number[]>>(new Map())
  const [countdown, setCountdown] = useState<CountdownTime | null>(null)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const { data: bundle, isLoading, error } = useBundle(slug || '')
  const { data: relatedBundles } = useRelatedBundles(slug || '')
  const calculatePrice = useCalculateBundlePrice()
  const addBundleToCart = useAddBundleToCart()

  // Pricing breakdown for configurable bundles
  const [pricingBreakdown, setPricingBreakdown] = useState<PricingBreakdown | null>(null)

  // Calculate countdown
  useEffect(() => {
    if (!bundle?.ends_at) return

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

  // Calculate pricing when selections change (for configurable bundles)
  useEffect(() => {
    if (!bundle || bundle.bundle_type !== 'configurable' || !slug) return
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
        { slug, selections: slotSelections },
        {
          onSuccess: (data) => setPricingBreakdown(data),
        }
      )
    }
  }, [selections, bundle, slug])

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
    if (!bundle || !slug) return

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
        bundleSlug: slug,
        selections: slotSelections,
      })
      toast.success('Bundle added to cart!')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add bundle to cart')
    } finally {
      setIsAddingToCart(false)
    }
  }

  // Get all images for gallery
  const allImages = useMemo(() => {
    if (!bundle) return []
    const images: { src: string; alt: string }[] = []

    if (bundle.featured_image) {
      images.push({ src: bundle.featured_image, alt: bundle.name })
    }

    bundle.images?.forEach((img) => {
      if (img.image !== bundle.featured_image) {
        images.push({ src: img.image, alt: img.alt_text || bundle.name })
      }
    })

    bundle.gallery_images?.forEach((img) => {
      if (!images.some((i) => i.src === img)) {
        images.push({ src: img, alt: bundle.name })
      }
    })

    return images.length > 0 ? images : [{ src: '/placeholder-bundle.jpg', alt: 'Bundle placeholder' }]
  }, [bundle])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !bundle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white mb-4">
          Bundle not found
        </h1>
        <Link
          to="/"
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          Return to Homepage
        </Link>
      </div>
    )
  }

  const displayPrice = pricingBreakdown?.discounted_price ?? bundle.discounted_price
  const displayOriginalPrice = pricingBreakdown?.original_price ?? bundle.original_price
  const displaySavings = pricingBreakdown?.savings ?? bundle.savings
  const displaySavingsPercentage = pricingBreakdown?.savings_percentage ?? bundle.savings_percentage

  return (
    <>
      <Helmet>
        <title>{bundle.meta_title || bundle.name} | Fischer Electronics</title>
        <meta name="description" content={bundle.meta_description || bundle.short_description || ''} />
      </Helmet>

      <main className="bg-white dark:bg-dark-900 min-h-screen">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-dark-500 dark:text-dark-400">
            <Link to="/" className="hover:text-primary-600">Home</Link>
            <span>/</span>
            <Link to="/bundles" className="hover:text-primary-600">Bundles</Link>
            <span>/</span>
            <span className="text-dark-900 dark:text-white">{bundle.name}</span>
          </nav>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left - Gallery */}
            <ScrollReveal animation="fadeUp">
              <div className="sticky top-24">
                {/* Main Image */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-dark-800 mb-4">
                  {isVideoPlaying && bundle.video_url ? (
                    <video
                      src={bundle.video_url}
                      autoPlay
                      controls
                      className="w-full h-full object-cover"
                      onEnded={() => setIsVideoPlaying(false)}
                    />
                  ) : (
                    <motion.img
                      key={selectedImageIndex}
                      src={allImages[selectedImageIndex].src}
                      alt={allImages[selectedImageIndex].alt}
                      className="w-full h-full object-cover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}

                  {/* Badge */}
                  {bundle.badge_label && (
                    <div className={`absolute top-4 left-4 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide text-white bg-gradient-to-r ${
                      bundle.badge_color === 'gold' ? 'from-amber-500 to-yellow-400' :
                      bundle.badge_color === 'red' ? 'from-red-500 to-rose-400' :
                      bundle.badge_color === 'blue' ? 'from-blue-500 to-cyan-400' :
                      'from-green-500 to-emerald-400'
                    } shadow-lg`}>
                      <SparklesIcon className="w-4 h-4 inline mr-1.5" />
                      {bundle.badge_label}
                    </div>
                  )}

                  {/* Video Play Button */}
                  {bundle.video_url && !isVideoPlaying && (
                    <button
                      onClick={() => setIsVideoPlaying(true)}
                      className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-black/70 hover:bg-black/80 text-white rounded-full transition-colors"
                    >
                      <PlayIcon className="w-5 h-5" />
                      Watch Video
                    </button>
                  )}

                  {/* Navigation Arrows */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-dark-700/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-dark-600 transition-colors"
                      >
                        <ChevronLeftIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setSelectedImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-dark-700/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-dark-600 transition-colors"
                      >
                        <ChevronRightIcon className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                {allImages.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {allImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedImageIndex(idx)
                          setIsVideoPlaying(false)
                        }}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImageIndex === idx
                            ? 'border-primary-500 ring-2 ring-primary-500/30'
                            : 'border-transparent hover:border-gray-300 dark:hover:border-dark-600'
                        }`}
                      >
                        <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </ScrollReveal>

            {/* Right - Details */}
            <ScrollReveal animation="fadeUp" delay={0.2}>
              <div className="space-y-6">
                {/* Bundle Type Badge */}
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full ${
                    bundle.bundle_type === 'fixed'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                  }`}>
                    {bundle.bundle_type === 'fixed' ? 'Fixed Bundle' : 'Build Your Own'}
                  </span>
                  {bundle.stock_remaining !== null && bundle.stock_remaining < 10 && (
                    <span className="px-3 py-1 text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
                      Only {bundle.stock_remaining} left!
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-3xl lg:text-4xl font-bold text-dark-900 dark:text-white">
                  {bundle.name}
                </h1>

                {/* Short Description */}
                {bundle.short_description && (
                  <p className="text-lg text-dark-600 dark:text-dark-300">
                    {bundle.short_description}
                  </p>
                )}

                {/* Countdown Timer */}
                {bundle.show_countdown && countdown && (
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

                {/* Pricing */}
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
                  {bundle.show_savings && displaySavings > 0 && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        You save {formatPrice(displaySavings)} ({displaySavingsPercentage.toFixed(0)}% off)
                      </span>
                    </div>
                  )}
                </div>

                {/* Fixed Bundle - Products List */}
                {bundle.bundle_type === 'fixed' && bundle.items.length > 0 && (
                  <div className="border dark:border-dark-700 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 dark:bg-dark-800 px-4 py-3 border-b dark:border-dark-700">
                      <h3 className="font-semibold text-dark-900 dark:text-white flex items-center gap-2">
                        <GiftIcon className="w-5 h-5 text-primary-500" />
                        What's Included ({bundle.items.length} items)
                      </h3>
                    </div>
                    <div className="divide-y dark:divide-dark-700">
                      {bundle.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-4">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-dark-700 flex-shrink-0">
                            {item.product.image ? (
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <GiftIcon className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/product/${item.product.slug}`}
                              className="font-medium text-dark-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 line-clamp-1"
                            >
                              {item.product.name}
                            </Link>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-dark-500 dark:text-dark-400">
                                Qty: {item.quantity}
                              </span>
                              {item.product.is_in_stock ? (
                                <span className="text-xs text-green-600 dark:text-green-400">In Stock</span>
                              ) : (
                                <span className="text-xs text-red-600 dark:text-red-400">Out of Stock</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-medium text-dark-900 dark:text-white">
                              {formatPrice(item.line_total)}
                            </span>
                            {item.quantity > 1 && (
                              <p className="text-xs text-dark-500 dark:text-dark-400">
                                {formatPrice(item.effective_price)} each
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Configurable Bundle - Slot Selection */}
                {bundle.bundle_type === 'configurable' && bundle.slots.length > 0 && (
                  <div className="space-y-6">
                    <h3 className="font-semibold text-lg text-dark-900 dark:text-white">
                      Build Your Bundle
                    </h3>
                    {bundle.slots.map((slot) => (
                      <SlotSelector
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

                {/* Add to Cart */}
                <div className="space-y-4">
                  <motion.button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || !bundle.is_available || (bundle.bundle_type === 'configurable' && !allRequiredSlotsFilled)}
                    className={`w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                      isAddingToCart || !bundle.is_available || (bundle.bundle_type === 'configurable' && !allRequiredSlotsFilled)
                        ? 'bg-gray-300 dark:bg-dark-600 text-gray-500 dark:text-dark-400 cursor-not-allowed'
                        : 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/25 hover:scale-[1.02]'
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isAddingToCart ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Adding to Cart...
                      </>
                    ) : (
                      <>
                        <ShoppingCartIcon className="w-6 h-6" />
                        {bundle.cta_text || 'Add Bundle to Cart'}
                      </>
                    )}
                  </motion.button>

                  {bundle.bundle_type === 'configurable' && !allRequiredSlotsFilled && (
                    <p className="text-sm text-center text-amber-600 dark:text-amber-400">
                      Please complete all required selections above
                    </p>
                  )}
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t dark:border-dark-700">
                  <div className="text-center">
                    <TruckIcon className="w-8 h-8 mx-auto text-primary-500 mb-2" />
                    <p className="text-xs text-dark-600 dark:text-dark-400">Free Delivery</p>
                  </div>
                  <div className="text-center">
                    <ShieldCheckIcon className="w-8 h-8 mx-auto text-primary-500 mb-2" />
                    <p className="text-xs text-dark-600 dark:text-dark-400">Warranty</p>
                  </div>
                  <div className="text-center">
                    <GiftIcon className="w-8 h-8 mx-auto text-primary-500 mb-2" />
                    <p className="text-xs text-dark-600 dark:text-dark-400">Bundle Savings</p>
                  </div>
                </div>

                {/* Full Description */}
                {bundle.description && (
                  <div className="pt-6 border-t dark:border-dark-700">
                    <h3 className="font-semibold text-lg text-dark-900 dark:text-white mb-4">
                      About This Bundle
                    </h3>
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: bundle.description }}
                    />
                  </div>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Related Bundles */}
        {relatedBundles && relatedBundles.length > 0 && (
          <section className="bg-gray-50 dark:bg-dark-800/50 py-16">
            <div className="container mx-auto px-4">
              <ScrollReveal>
                <h2 className="text-2xl lg:text-3xl font-bold text-dark-900 dark:text-white mb-8">
                  You May Also Like
                </h2>
              </ScrollReveal>
              <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
                {relatedBundles.slice(0, 3).map((relatedBundle) => (
                  <StaggerItem key={relatedBundle.id}>
                    <BundleCard bundle={relatedBundle} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </section>
        )}
      </main>
    </>
  )
}

// Slot Selector Component
interface SlotSelectorProps {
  slot: BundleSlot
  selectedProductIds: number[]
  onSelect: (productId: number) => void
}

function SlotSelector({ slot, selectedProductIds, onSelect }: SlotSelectorProps) {
  const isComplete = selectedProductIds.length >= slot.min_selections
  const canSelectMore = slot.allows_multiple && selectedProductIds.length < slot.max_selections

  return (
    <div className={`border rounded-xl overflow-hidden transition-colors ${
      isComplete
        ? 'border-green-500 dark:border-green-500/50'
        : slot.is_required
        ? 'border-amber-500 dark:border-amber-500/50'
        : 'border-gray-200 dark:border-dark-700'
    }`}>
      {/* Header */}
      <div className={`px-4 py-3 flex items-center justify-between ${
        isComplete
          ? 'bg-green-50 dark:bg-green-900/20'
          : 'bg-gray-50 dark:bg-dark-800'
      }`}>
        <div>
          <h4 className="font-semibold text-dark-900 dark:text-white flex items-center gap-2">
            {slot.name}
            {slot.is_required && (
              <span className="text-xs text-red-500">*Required</span>
            )}
            {isComplete && (
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
            )}
          </h4>
          {slot.description && (
            <p className="text-sm text-dark-500 dark:text-dark-400 mt-0.5">
              {slot.description}
            </p>
          )}
        </div>
        <div className="text-sm text-dark-500 dark:text-dark-400">
          {slot.allows_multiple ? (
            <span>
              Select {slot.min_selections}-{slot.max_selections}
            </span>
          ) : (
            <span>Select 1</span>
          )}
        </div>
      </div>

      {/* Products */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {slot.products.map((slotProduct) => {
          const isSelected = selectedProductIds.includes(slotProduct.product_id)
          const canSelect = isSelected || !slot.allows_multiple || canSelectMore

          return (
            <motion.button
              key={slotProduct.id}
              onClick={() => canSelect && onSelect(slotProduct.product_id)}
              disabled={!canSelect}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : canSelect
                  ? 'border-gray-200 dark:border-dark-600 hover:border-primary-300 dark:hover:border-primary-700'
                  : 'border-gray-100 dark:border-dark-700 opacity-50 cursor-not-allowed'
              }`}
              whileHover={canSelect ? { scale: 1.02 } : {}}
              whileTap={canSelect ? { scale: 0.98 } : {}}
            >
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-dark-700 flex-shrink-0">
                {slotProduct.product.image ? (
                  <img
                    src={slotProduct.product.image}
                    alt={slotProduct.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <GiftIcon className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm line-clamp-1 ${
                  isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-dark-900 dark:text-white'
                }`}>
                  {slotProduct.product.name}
                </p>
                <p className="text-sm text-dark-500 dark:text-dark-400">
                  {formatPrice(slotProduct.effective_price)}
                </p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                isSelected
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-gray-300 dark:border-dark-500'
              }`}>
                {isSelected && <CheckIcon className="w-4 h-4 text-white" />}
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
