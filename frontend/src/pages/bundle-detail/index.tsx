import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import {
  ShoppingCartIcon,
  TruckIcon,
  ShieldCheckIcon,
  GiftIcon,
} from '@heroicons/react/24/outline'
import { useBundle, useRelatedBundles, useCalculateBundlePrice, useAddBundleToCart } from '@/api/bundles'
import type { SlotSelection, PricingBreakdown } from '@/api/bundles'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import BundleCard from '@/components/bundles/BundleCard'
import ScrollReveal, { StaggerContainer, StaggerItem } from '@/components/effects/ScrollReveal'
import { formatDescription } from '@/lib/utils'
import toast from 'react-hot-toast'
import BundleGallery from './BundleGallery'
import BundlePricing from './BundlePricing'
import BundleConfig from './BundleConfig'

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
  const handleSlotSelection = (slotId: number, productId: number) => {
    const slot = bundle?.slots.find((s) => s.id === slotId)
    const allowsMultiple = slot?.allows_multiple ?? false

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

    return images.length > 0 ? images : [{ src: '//images/all-products.webp', alt: 'Bundle placeholder' }]
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 xl:gap-12">
            {/* Left - Gallery */}
            <BundleGallery
              images={allImages}
              selectedIndex={selectedImageIndex}
              onSelectIndex={(idx) => {
                setSelectedImageIndex(idx)
                setIsVideoPlaying(false)
              }}
              isVideoPlaying={isVideoPlaying}
              onPlayVideo={() => setIsVideoPlaying(true)}
              onVideoEnded={() => setIsVideoPlaying(false)}
              videoUrl={bundle.video_url}
              badgeLabel={bundle.badge_label}
              badgeColor={bundle.badge_color}
            />

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
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-dark-900 dark:text-white">
                  {bundle.name}
                </h1>

                {/* Short Description */}
                {bundle.short_description && (
                  <div className="text-lg text-dark-600 dark:text-dark-300 space-y-1">
                    {formatDescription(bundle.short_description).map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                )}

                {/* Pricing */}
                <BundlePricing
                  displayPrice={displayPrice}
                  displayOriginalPrice={displayOriginalPrice}
                  displaySavings={displaySavings}
                  displaySavingsPercentage={displaySavingsPercentage}
                  showSavings={bundle.show_savings}
                  showCountdown={bundle.show_countdown}
                  countdown={countdown}
                />

                {/* Bundle Configuration */}
                <BundleConfig
                  bundle={bundle}
                  selections={selections}
                  onSlotSelect={handleSlotSelection}
                />

                {/* Add to Cart */}
                <div className="space-y-4">
                  <motion.button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || !bundle.is_available || (bundle.bundle_type === 'configurable' && !allRequiredSlotsFilled)}
                    className={`w-full flex items-center justify-center gap-2.5 px-6 py-3 rounded-lg font-semibold text-base transition-all ${
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
                        <ShoppingCartIcon className="w-5 h-5" />
                        {bundle.cta_text || 'Add Bundle to Cart'}
                      </>
                    )}
                  </motion.button>

                  {bundle.bundle_type === 'configurable' && !allRequiredSlotsFilled && (
                    <p className="text-sm text-center text-orange-600 dark:text-orange-400">
                      Please complete all required selections above
                    </p>
                  )}
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 pt-4 border-t dark:border-dark-700">
                  <div className="text-center">
                    <TruckIcon className="w-8 h-8 mx-auto text-primary-500 mb-2" />
                    <p className="text-xs text-dark-600 dark:text-dark-400">Free Delivery in Lahore</p>
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
                      dangerouslySetInnerHTML={{ __html: bundle.description.replace(/\\n/g, '<br>').replace(/\n/g, '<br>') }}
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
