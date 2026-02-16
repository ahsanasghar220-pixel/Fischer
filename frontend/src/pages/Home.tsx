import { useState, useEffect, useRef, memo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { motion, useInView } from 'framer-motion'
import { getCategoryProductImage } from '@/lib/categoryImages'
import {
  ArrowRightIcon,
  TruckIcon,
  ShieldCheckIcon,
  PhoneIcon,
  CreditCardIcon,
  SparklesIcon,
  StarIcon,
  FireIcon,
  BoltIcon,
  CubeIcon,
  GiftIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon, CheckCircleIcon } from '@heroicons/react/24/solid'
import api from '@/lib/api'
import ProductCard from '@/components/products/ProductCard'
import ProductCarousel from '@/components/products/ProductCarousel'
import QuickViewModal from '@/components/products/QuickViewModal'
import BannerCarousel from '@/components/ui/BannerCarousel'
import type { BannerSlide } from '@/components/ui/BannerCarousel'
import AnimatedSection, { StaggeredChildren } from '@/components/ui/AnimatedSection'
import { BundleCarousel, BundleGrid, BundleBanner, BundleQuickView } from '@/components/bundles'
import { useHomepageBundles, useAddBundleToCart } from '@/api/bundles'
import type { Bundle } from '@/api/bundles'
import toast from 'react-hot-toast'
import LogoSplitIntro from '@/components/home/LogoSplitIntro'
import NotableClients from '@/components/home/NotableClients'
import HeroProductBanner from '@/components/home/HeroProductBanner'

// Animated Counter component for stats
function AnimatedCounter({ value, suffix = '' }: { value: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [isInView, setIsInView] = useState(false)
  const [displayValue, setDisplayValue] = useState('0')

  // Use Intersection Observer instead of framer-motion
  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isInView) return

    // Extract numeric value - handle formats like "35+", "500K+", "1M+"
    const numericValue = parseInt(value.replace(/[^\d]/g, '')) || 0
    const hasPlus = value.includes('+')
    const hasK = value.toUpperCase().includes('K')
    const hasM = value.toUpperCase().includes('M')

    // If numeric value is 0, just show the original value immediately
    if (numericValue === 0) {
      setDisplayValue(value)
      return
    }

    const duration = 2000
    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)

      // Easing function for smooth deceleration
      const easeOutExpo = 1 - Math.pow(2, -10 * progress)

      // Use Math.round and ensure we hit the final value
      const currentValue = progress >= 1 ? numericValue : Math.round(easeOutExpo * numericValue)

      let formatted = currentValue.toString()
      if (hasK) formatted = currentValue + 'K'
      if (hasM) formatted = currentValue + 'M'
      if (hasPlus) formatted += '+'

      setDisplayValue(formatted)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        // Ensure final value is set correctly
        let finalFormatted = numericValue.toString()
        if (hasK) finalFormatted = numericValue + 'K'
        if (hasM) finalFormatted = numericValue + 'M'
        if (hasPlus) finalFormatted += '+'
        setDisplayValue(finalFormatted)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [isInView, value])

  return <span ref={ref}>{displayValue}{suffix}</span>
}

interface Category {
  id: number
  name: string
  slug: string
  image?: string
  icon?: string
  products_count: number
  description?: string
  features?: string[]
}

interface Product {
  id: number
  name: string
  slug: string
  price: number
  compare_price?: number | null
  description?: string
  short_description?: string
  primary_image?: string | null
  images?: Array<{ id: number; image?: string; image_path?: string; is_primary: boolean }>
  stock_status: string
  stock?: number
  is_new?: boolean
  is_bestseller?: boolean
  average_rating?: number
  review_count?: number
  category?: {
    name: string
    slug: string
  }
  brand?: {
    name: string
    slug: string
  }
}

interface Banner {
  id: number
  title: string
  subtitle?: string
  image: string
  button_text?: string
  button_link?: string
}

interface Testimonial {
  name: string
  role: string
  content: string
  image?: string
  rating: number
}

interface Stat {
  label: string
  value: string
  icon?: string
}

interface Feature {
  title: string
  description: string
  icon?: string
  color?: string
}

interface TrustBadge {
  title: string
  image?: string
}

interface NotableClient {
  id: number
  name: string
  logo: string | null
  website: string | null
}

interface SectionSettings {
  title?: string
  subtitle?: string
  is_enabled: boolean
  settings?: Record<string, any>
}

interface HomeData {
  banners: Banner[]
  categories: Category[]
  video_categories?: Category[]
  bestsellers: Product[]
  testimonials: Testimonial[]
  stats: Stat[]
  features: Feature[]
  trust_badges: TrustBadge[]
  notable_clients: NotableClient[]
  sections: Record<string, SectionSettings & { sort_order?: number }>
  settings: Record<string, string>
}

// Fallback Statistics for the hero section
const defaultStats = [
  { label: 'Years Experience', value: '35+', icon: 'StarIcon' },
  { label: 'Happy Customers', value: '500K+', icon: 'CheckCircleIcon' },
  { label: 'Dealers Nationwide', value: '500+', icon: 'CubeIcon' },
  { label: 'Products Sold', value: '1M+', icon: 'FireIcon' },
]

// Fallback Features for the USP section
const defaultFeatures = [
  {
    title: 'Free Delivery in Lahore',
    description: 'Standard delivery charges apply for other cities',
    icon: 'TruckIcon',
    color: 'blue',
  },
  {
    title: '1 Year Warranty',
    description: 'Official warranty on all products with dedicated support',
    icon: 'ShieldCheckIcon',
    color: 'emerald',
  },
  {
    title: 'Flexible Payment',
    description: 'Multiple payment options including COD & Easy Installments',
    icon: 'CreditCardIcon',
    color: 'purple',
  },
  {
    title: '24/7 Support',
    description: 'Round-the-clock customer service and technical support',
    icon: 'PhoneIcon',
    color: 'orange',
  },
]

// Fallback Testimonials
const defaultTestimonials: Testimonial[] = [
  {
    name: 'Ahmed Khan',
    role: 'Homeowner, Lahore',
    content: 'Fischer water cooler has been serving our office for 3 years without any issues. Excellent build quality and after-sales service.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  },
  {
    name: 'Sara Malik',
    role: 'Restaurant Owner',
    content: 'We installed Fischer cooking ranges in our restaurant. The performance is outstanding and very fuel efficient.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
  },
  {
    name: 'Usman Ali',
    role: 'Dealer, Karachi',
    content: 'Being a Fischer dealer for 10 years, I can vouch for their product quality and excellent dealer support program.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  },
]

// Icon mapping for dynamic icons from backend
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  StarIcon,
  CheckCircleIcon,
  CubeIcon,
  FireIcon,
  TruckIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  PhoneIcon,
  BoltIcon,
  SparklesIcon,
}

// Color mapping for features
const colorMap: Record<string, { gradient: string; bg: string; text: string }> = {
  blue: { gradient: 'from-blue-500 to-cyan-400', bg: 'bg-blue-500/10', text: '#3b82f6' },
  emerald: { gradient: 'from-emerald-500 to-teal-400', bg: 'bg-emerald-500/10', text: '#10b981' },
  purple: { gradient: 'from-purple-500 to-pink-400', bg: 'bg-purple-500/10', text: '#a855f7' },
  orange: { gradient: 'from-orange-500 to-red-400', bg: 'bg-orange-500/10', text: '#f97316' },
  primary: { gradient: 'from-primary-500 to-primary-400', bg: 'bg-primary-500/10', text: '#951212' },
  red: { gradient: 'from-primary-500 to-primary-600', bg: 'bg-primary-500/10', text: '#951212' },
  green: { gradient: 'from-green-500 to-emerald-400', bg: 'bg-green-500/10', text: '#22c55e' },
  cyan: { gradient: 'from-cyan-500 to-blue-400', bg: 'bg-cyan-500/10', text: '#06b6d4' },
}

// Get features for a category - prefer API data, fallback to defaults
const getCategoryFeatures = (category: Category): string[] => {
  if (category.features && category.features.length > 0) {
    return category.features
  }
  return ['Premium Quality', 'Energy Efficient', '1 Year Warranty', 'Latest Technology']
}

// Category Showcase - Clean Split-Screen Layout
interface CategoryShowcaseProps {
  category: Category
  index: number
  categoryVideos: Record<string, string>
}

const CategoryShowcase = memo(function CategoryShowcase({ category, index, categoryVideos }: CategoryShowcaseProps) {
  const ref = useRef(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const isVideoInView = useInView(videoContainerRef, { once: false, amount: 0.3 })
  const isEven = index % 2 === 0
  const videoSrc = categoryVideos[category.slug]

  // Auto-play video when in view
  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoSrc) return

    if (isVideoInView) {
      video.play().catch(() => {
        // Video autoplay prevented - user interaction required
      })
    } else {
      video.pause()
    }
  }, [isVideoInView, videoSrc])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${!isEven ? 'lg:flex-row-reverse' : ''}`}
    >
      {/* Video Side */}
      <div ref={videoContainerRef} className={`relative ${!isEven ? 'lg:order-2' : ''}`}>
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-dark-100 dark:bg-dark-900">
          {videoSrc ? (
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-100 to-dark-200 dark:from-dark-800 dark:to-dark-900">
              <div className="text-dark-400 dark:text-dark-600 text-sm">No video available</div>
            </div>
          )}
        </div>
      </div>

      {/* Content Side */}
      <div className={`${!isEven ? 'lg:order-1' : ''}`}>
        <div className="space-y-6">
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark-900 dark:text-white">
            {category.name}
          </h3>

          {/* Features list */}
          <div className="grid sm:grid-cols-2 gap-3">
            {getCategoryFeatures(category).slice(0, 6).map(
              (feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircleIcon className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-dark-700 dark:text-dark-300 text-sm font-medium">{feature}</span>
                </div>
              )
            )}
          </div>

          {/* CTA Button */}
          <div className="pt-4">
            <Link
              to={`/category/${category.slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                       bg-primary-500 dark:bg-primary-600
                       text-white font-semibold
                       hover:bg-primary-600 dark:hover:bg-primary-700
                       hover:shadow-lg hover:-translate-y-0.5
                       transition-all duration-300"
            >
              Explore {category.name}
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
})

// Default category videos mapping (fallback)
// Videos are in frontend/public/videos/categories/ and copied during build
const defaultCategoryVideos: Record<string, string> = {
  // Kitchen Hoods variations
  'kitchen-hoods': '/videos/categories/built-in-hoods.mp4?v=2',
  'built-in-hoods': '/videos/categories/built-in-hoods.mp4?v=2',
  'hoods': '/videos/categories/built-in-hoods.mp4?v=2',

  // Kitchen Hobs variations
  'kitchen-hobs': '/videos/categories/built-in-hobs.mp4?v=2',
  'built-in-hobs': '/videos/categories/built-in-hobs.mp4?v=2',
  'hobs': '/videos/categories/built-in-hobs.mp4?v=2',

  // Oven Toasters variations
  'oven-toasters': '/videos/categories/oven-toasters.mp4?v=2',
  'oven-toaster': '/videos/categories/oven-toasters.mp4?v=2',
  'toaster-ovens': '/videos/categories/oven-toasters.mp4?v=2',
  'toasters': '/videos/categories/oven-toasters.mp4?v=2',

  // Air Fryers variations
  'air-fryers': '/videos/categories/air-fryers.mp4?v=2',
  'air-fryer': '/videos/categories/air-fryers.mp4?v=2',
  'fryers': '/videos/categories/air-fryers.mp4?v=2',
}

export default function Home() {
  const [quickViewBundle, setQuickViewBundle] = useState<Bundle | null>(null)
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [introComplete, setIntroComplete] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)

  const { data } = useQuery<HomeData>({
    queryKey: ['home'],
    queryFn: async () => {
      const response = await api.get('/api/home')
      return response.data.data
    },
  })

  // Fetch homepage bundles
  const { data: homepageBundles } = useHomepageBundles()
  const addBundleToCart = useAddBundleToCart()

  // Handle adding fixed bundle to cart
  const handleAddBundleToCart = async (bundle: Bundle) => {
    if (bundle.bundle_type !== 'fixed') {
      setQuickViewBundle(bundle)
      return
    }

    try {
      await addBundleToCart.mutateAsync({ bundleSlug: bundle.slug })
      toast.success(`${bundle.name} added to cart!`)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add bundle to cart'
      toast.error(errorMessage)
    }
  }


  // Extract dynamic data with fallbacks
  const stats = data?.stats?.length ? data.stats : defaultStats
  const features = data?.features?.length ? data.features : defaultFeatures
  const testimonials = data?.testimonials?.length ? data.testimonials : defaultTestimonials
  const notableClients = data?.notable_clients || []
  const sections = data?.sections || {}

  // Check if sections are enabled
  const isSectionEnabled = (key: string) => {
    return sections[key]?.is_enabled !== false
  }

  // Dynamic banner slides from API
  const bannerSlides: BannerSlide[] = (data?.banners || []).map((banner) => ({
    image: banner.image,
    imageAlt: banner.title || 'Fischer Banner',
    title: banner.title,
    subtitle: banner.subtitle,
    ctaText: banner.button_text,
    ctaLink: banner.button_link,
    overlay: false,
  }))

  // Hero video URL from section settings
  const heroVideoUrl = sections.hero?.settings?.video_url || '/videos/hero-video.mp4?v=5'

  // Brand statement from section data
  const brandTitle = sections.brand_statement?.title || 'Premium Appliances'
  const brandSubtitle = sections.brand_statement?.subtitle || 'Crafted for Pakistan Since 1990'

  // Category videos from section settings
  const categoryVideos: Record<string, string> = sections.categories?.settings?.category_videos || defaultCategoryVideos

  // Dealer CTA from section settings
  const dealerSettings = sections.dealer_cta?.settings || {}
  const dealerBenefits = dealerSettings.benefits || [
    { title: 'Exclusive Margins', description: 'Competitive dealer margins & incentives', icon: '\u{1F4B0}' },
    { title: 'Marketing Support', description: 'Co-branded marketing materials', icon: '\u{1F4E2}' },
    { title: 'Training Programs', description: 'Product & sales training', icon: '\u{1F393}' },
    { title: 'Priority Support', description: 'Dedicated dealer support line', icon: '\u{1F3AF}' },
  ]

  // About section from section settings
  const aboutSettings = sections.about?.settings || {}
  const aboutContent = aboutSettings.content || 'Established in 1990, Fischer (Fatima Engineering Works) has been at the forefront of manufacturing high-quality home and commercial appliances. With over three decades of excellence, we\'ve become a household name trusted by millions across Pakistan.'
  const aboutImage = aboutSettings.image || '/images/about-factory.webp'
  const aboutFallbackImage = aboutSettings.fallback_image || '/images/about-fischer.webp'
  const aboutFeatures = aboutSettings.features || [
    'ISO 9001:2015 & PSQCA Certified',
    'Made in Pakistan with premium materials',
    'Nationwide service & support network',
    'Dedicated R&D for continuous innovation',
  ]



  // Use categories from API with centralized image fallback mapping
  const categories = (data?.categories || []).map(cat => ({
    ...cat,
    image: getCategoryProductImage(cat.slug, cat.image)
  }))

  // Helper to get icon component from string
  const getIcon = (iconName?: string) => {
    if (!iconName) return StarIcon
    return iconMap[iconName] || StarIcon
  }

  // Helper to get color classes
  const getColorClasses = (colorName?: string) => {
    return colorMap[colorName || 'primary'] || colorMap.primary
  }

  // ========== SECTION REGISTRY ==========
  // Maps section keys to their render functions for dynamic ordering
  const sectionRegistry: Record<string, () => React.ReactNode> = {
    brand_statement: () => (
      <AnimatedSection key="brand_statement" animation="fade-up" duration={800} threshold={0.1} easing="gentle">
        <section className="section bg-white dark:bg-dark-900">
          <div className="container-xl text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-dark-900 dark:text-white mb-6">
              {brandTitle}
            </h2>
            <p className="text-xl md:text-2xl text-dark-600 dark:text-dark-400 max-w-3xl mx-auto">
              {brandSubtitle}
            </p>
          </div>
        </section>
      </AnimatedSection>
    ),

    hero_products: () => (
      <HeroProductBanner
        key="hero_products"
        products={sections.hero_products?.settings?.products}
        title={sections.hero_products?.title}
        subtitle={sections.hero_products?.subtitle}
        badgeText={sections.hero_products?.settings?.badge_text}
      />
    ),

    stats: () => (
      <AnimatedSection key="stats" animation="fade-up" duration={800} threshold={0.15} easing="gentle">
        <section className="section bg-white dark:bg-dark-950">
          <div className="container-xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12 lg:gap-16">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-500 dark:text-primary-600 mb-3">
                    <AnimatedCounter value={stat.value} />
                  </div>
                  <div className="text-sm md:text-base text-dark-600 dark:text-dark-400 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>
    ),

    categories: () => categories.length > 0 ? (
      <section key="categories" className="section bg-white dark:bg-dark-900">
        <div className="container-xl">
          <AnimatedSection animation="fade-up" duration={800} easing="gentle">
            <div className="text-center mb-10 sm:mb-12 md:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-dark-900 dark:text-white mb-4">
                {sections.categories?.title || 'Explore Our Collections'}
              </h2>
              <p className="text-lg text-dark-600 dark:text-dark-400 max-w-2xl mx-auto">
                {sections.categories?.subtitle || 'Each category carefully curated with premium quality and innovative designs'}
              </p>
            </div>
          </AnimatedSection>
          <div className="space-y-12 sm:space-y-16 md:space-y-24 overflow-hidden">
            {(data?.video_categories?.length
              ? data.video_categories
              : categories.filter((c) => categoryVideos[c.slug])
            ).map((category, index) => (
              <CategoryShowcase key={category.id} category={category} index={index} categoryVideos={categoryVideos} />
            ))}
          </div>
        </div>
      </section>
    ) : null,

    features: () => (
      <AnimatedSection key="features" animation="fade-up" duration={800} threshold={0.08} easing="gentle">
        <section className="section bg-dark-50 dark:bg-dark-950">
          <div className="container-xl">
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-dark-900 dark:text-white mb-4">
                {sections.features?.title || 'Why Choose Fischer'}
              </h2>
            </div>
            <StaggeredChildren
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
              staggerDelay={100} duration={600} animation="fade-up" easing="gentle" once
            >
              {features.map((feature) => {
                const Icon = getIcon(feature.icon)
                const colors = getColorClasses(feature.color)
                return (
                  <div key={feature.title} className="text-center p-4 sm:p-6 hover-lift">
                    <div className={`inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 ${colors.bg} rounded-2xl mb-4`}>
                      <Icon className="w-6 h-6 md:w-8 md:h-8" style={{ color: colors.text }} />
                    </div>
                    <h3 className="text-lg font-bold text-dark-900 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-dark-600 dark:text-dark-400 leading-relaxed">{feature.description}</p>
                  </div>
                )
              })}
            </StaggeredChildren>
          </div>
        </section>
      </AnimatedSection>
    ),

    bestsellers: () => data?.bestsellers && data.bestsellers.length > 0 ? (
      <AnimatedSection key="bestsellers" animation="fade-up" duration={1100} threshold={0.05} easing="gentle" lazy>
        <section className="section bg-white dark:bg-dark-900 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-amber-500/6 rounded-full blur-[120px]" />
            <div className="absolute top-0 right-1/4 w-[350px] h-[350px] bg-primary-500/6 rounded-full blur-[100px]" />
          </div>
          <div className="container-xl relative">
            <AnimatedSection animation="fade-up" delay={150} duration={1000} easing="gentle">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/25 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-sm font-semibold mb-4">
                    <StarIcon className="w-4 h-4 fill-amber-700 dark:fill-amber-500" />
                    Customer Favorites
                  </span>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-dark-900 dark:text-white">
                    Best <span className="text-primary-600 dark:text-primary-500">Sellers</span>
                  </h2>
                  <p className="text-xl text-dark-600 dark:text-dark-400 mt-4 max-w-xl">
                    Top-rated appliances trusted by thousands of Pakistani homes
                  </p>
                </div>
                <Link
                  to="/shop?bestseller=1"
                  className="group inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-primary-500 dark:bg-primary-600 text-white font-semibold text-sm sm:text-base hover:bg-primary-600 dark:hover:bg-primary-700 hover:shadow-lg hover:-translate-y-0.5 hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  View All Best Sellers
                  <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </AnimatedSection>
          </div>
          <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw]">
            <AnimatedSection animation="fade-up" delay={300} duration={1000} easing="gentle">
              <ProductCarousel speed={90} fadeClass="from-white dark:from-dark-900">
                {data.bestsellers.slice(0, 12).map((product) => (
                  <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />
                ))}
              </ProductCarousel>
            </AnimatedSection>
          </div>
        </section>
      </AnimatedSection>
    ) : null,

    bundles: () => (
      <div key="bundles">
        {homepageBundles?.banner && homepageBundles.banner.length > 0 && (
          <section className="bg-dark-100 dark:bg-dark-950">
            <BundleBanner bundle={homepageBundles.banner[0]} onAddToCart={handleAddBundleToCart} variant="hero" />
          </section>
        )}
        {homepageBundles?.carousel && homepageBundles.carousel.length > 0 && (
          <AnimatedSection animation="fade-up" duration={1100} threshold={0.08} easing="gentle" lazy>
            <section className="section bg-white dark:bg-dark-900">
              <div className="container-xl">
                <AnimatedSection animation="fade-up" delay={150} duration={1000} easing="gentle">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/20 dark:bg-primary-900/30 text-primary-800 dark:text-primary-400 text-sm font-semibold mb-4">
                        <GiftIcon className="w-4 h-4" />
                        Special Bundles
                      </span>
                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-dark-900 dark:text-white">
                        Save More with <span className="text-primary-600 dark:text-primary-400">Bundles</span>
                      </h2>
                      <p className="text-xl text-dark-500 dark:text-dark-400 mt-4 max-w-xl">
                        Get the best value with our curated product bundles
                      </p>
                    </div>
                    <Link
                      to="/bundles"
                      className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 dark:bg-primary-600 text-white font-semibold hover:bg-primary-600 dark:hover:bg-primary-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                    >
                      View All Bundles
                      <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </AnimatedSection>
                <AnimatedSection animation="fade-up" delay={300} duration={1000} easing="gentle">
                  <BundleCarousel bundles={homepageBundles.carousel} onQuickView={setQuickViewBundle} onAddToCart={handleAddBundleToCart} />
                </AnimatedSection>
              </div>
            </section>
          </AnimatedSection>
        )}
        {homepageBundles?.grid && homepageBundles.grid.length > 0 && (
          <BundleGrid
            bundles={homepageBundles.grid}
            title="More Bundle Deals"
            subtitle="Discover more ways to save with our bundle offers"
            columns={3}
            onQuickView={setQuickViewBundle}
            onAddToCart={handleAddBundleToCart}
          />
        )}
      </div>
    ),

    banner_carousel: () => bannerSlides.length > 0 ? (
      <BannerCarousel
        key="banner_carousel"
        slides={bannerSlides}
        autoPlay
        autoPlayInterval={5000}
        height="lg"
      />
    ) : null,

    dealer_cta: () => (
      <AnimatedSection key="dealer_cta" animation="fade" duration={1200} threshold={0.1} easing="gentle">
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-dark-800 via-dark-900 to-dark-950">
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary-600/8 rounded-full blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
          </div>
          <div className="relative container-xl">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <AnimatedSection animation="fade-right" delay={200} distance={60} duration={1100} easing="gentle">
                <div className="text-center lg:text-left">
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-500/25 backdrop-blur-sm text-primary-100 text-sm font-bold mb-8">
                    <SparklesIcon className="w-5 h-5" />
                    {dealerSettings.badge_text || 'Partnership Opportunity'}
                  </span>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 sm:mb-8">
                    {sections.dealer_cta?.title || 'Become a Fischer Authorized Dealer'}
                  </h2>
                  <p className="text-xl text-dark-300 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                    {sections.dealer_cta?.subtitle || 'Join our nationwide network of 500+ dealers and grow your business with Pakistan\'s most trusted appliance brand.'}
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                    <Link
                      to={dealerSettings.button_link || '/become-dealer'}
                      className="group px-8 py-4 bg-primary-500 hover:bg-primary-600 hover:-translate-y-0.5 active:scale-[0.98] rounded-xl font-semibold text-white transition-all duration-300 flex items-center gap-2 hover:shadow-lg"
                    >
                      {dealerSettings.button_text || 'Apply Now'}
                      <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      to={dealerSettings.secondary_button_link || '/contact'}
                      className="px-8 py-4 bg-white/10 hover:bg-white/20 hover:-translate-y-0.5 active:scale-[0.98] backdrop-blur-sm rounded-xl font-semibold text-white transition-all duration-300 border border-white/20"
                    >
                      {dealerSettings.secondary_button_text || 'Contact Sales'}
                    </Link>
                  </div>
                </div>
              </AnimatedSection>
              <StaggeredChildren className="grid sm:grid-cols-2 gap-5" staggerDelay={150} duration={900} animation="fade-up" easing="gentle" once>
                {dealerBenefits.map((benefit: any) => (
                  <div
                    key={benefit.title}
                    className="p-6 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 hover:border-white/20 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col"
                  >
                    <span className="text-4xl mb-4 block">{benefit.icon}</span>
                    <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                    <p className="text-dark-300 text-sm leading-relaxed">{benefit.description || benefit.desc}</p>
                  </div>
                ))}
              </StaggeredChildren>
            </div>
          </div>
        </section>
      </AnimatedSection>
    ),

    testimonials: () => testimonials.length > 0 ? (
      <AnimatedSection key="testimonials" animation="fade-up" duration={1100} threshold={0.08} easing="gentle">
        <section className="section bg-dark-50 dark:bg-dark-950 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white dark:from-dark-900 to-transparent pointer-events-none" />
          <div className="container-xl relative">
            <AnimatedSection animation="fade-up" delay={150} duration={1000} easing="gentle">
              <div className="text-center mb-16">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/20 dark:bg-primary-900/30 text-primary-800 dark:text-primary-400 text-sm font-semibold mb-4">
                  <StarIcon className="w-4 h-4" />
                  {sections.testimonials?.title || 'Customer Reviews'}
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-dark-900 dark:text-white">
                  What Our <span className="text-primary-600 dark:text-primary-400">Customers</span> Say
                </h2>
                <p className="text-xl text-dark-500 dark:text-dark-400 mt-4 max-w-2xl mx-auto">
                  {sections.testimonials?.subtitle || 'Trusted by thousands of Pakistani households and businesses'}
                </p>
              </div>
            </AnimatedSection>
          </div>
          <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw]">
            <ProductCarousel speed={70} gap={24} fixedCardWidth={400} fadeClass="from-dark-50 dark:from-dark-950">
              {testimonials.map((testimonial) => {
                const initials = testimonial.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                return (
                  <div
                    key={testimonial.name}
                    className="bg-white dark:bg-dark-800 rounded-2xl p-6 sm:p-8 shadow-lg border border-dark-100 dark:border-dark-700 h-full"
                  >
                    <div className="flex gap-0.5 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <StarSolidIcon key={i} className={`w-5 h-5 ${i < testimonial.rating ? 'text-primary-500' : 'text-dark-200 dark:text-dark-700'}`} />
                      ))}
                    </div>
                    <p className="text-base sm:text-lg text-dark-700 dark:text-dark-200 leading-relaxed mb-6 line-clamp-4">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center gap-3 mt-auto">
                      {testimonial.image ? (
                        <img
                          src={testimonial.image} alt={testimonial.name} width={40} height={40} loading="lazy" decoding="async"
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-primary-100 dark:ring-primary-900/30"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement
                            if (fallback) fallback.classList.remove('hidden')
                          }}
                        />
                      ) : null}
                      <div className={`w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 ${testimonial.image ? 'hidden' : 'flex'} items-center justify-center`}>
                        <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{initials}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-dark-900 dark:text-white text-sm">{testimonial.name}</p>
                        <p className="text-xs text-dark-500 dark:text-dark-400">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </ProductCarousel>
          </div>
        </section>
      </AnimatedSection>
    ) : null,

    about: () => (
      <AnimatedSection key="about" animation="fade-up" duration={1100} threshold={0.08} easing="gentle">
        <section className="section bg-white dark:bg-dark-900 overflow-hidden">
          <div className="container-xl">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="relative">
                <div className="relative">
                  <div className="absolute -inset-10 pointer-events-none">
                    <div className="w-full h-full bg-gradient-to-r from-primary-500/20 to-primary-500/20 rounded-[4rem] blur-3xl opacity-50" />
                  </div>
                  <div className="relative">
                    <div className="rounded-[2.5rem] overflow-hidden shadow-2xl">
                      <img
                        src={aboutImage} alt="Fischer Factory - Manufacturing Facility" width={600} height={450} loading="lazy" decoding="async"
                        className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => { const target = e.currentTarget; if (!target.dataset.fallback) { target.dataset.fallback = 'true'; target.src = aboutFallbackImage } }}
                      />
                    </div>
                    <div className="absolute -bottom-8 -right-8 p-8 rounded-3xl bg-white dark:bg-dark-800 shadow-2xl border border-dark-100 dark:border-dark-700">
                      <div className="text-center">
                        <div className="text-5xl font-black text-primary-600 dark:text-primary-400">ISO</div>
                        <div className="text-lg font-bold text-dark-500 dark:text-dark-400">9001:2015</div>
                        <div className="text-sm text-dark-400 dark:text-dark-500">Certified</div>
                      </div>
                    </div>
                    <div className="absolute -top-6 -left-6 px-6 py-4 rounded-2xl bg-dark-900 text-white shadow-xl">
                      <span className="text-3xl font-black">35+</span>
                      <span className="block text-sm text-dark-300">Years</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/20 dark:bg-primary-900/30 text-primary-800 dark:text-primary-400 text-sm font-semibold mb-6">
                  <SparklesIcon className="w-4 h-4" />
                  {aboutSettings.badge_text || 'About Fischer'}
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-dark-900 dark:text-white mb-6 sm:mb-8 leading-tight">
                  {sections.about?.title || 'Pakistan\'s Most Trusted Appliance Brand'}
                </h2>
                <p className="text-xl text-dark-500 dark:text-dark-400 mb-10 leading-relaxed">{aboutContent}</p>
                <div className="grid sm:grid-cols-2 gap-6 mb-10">
                  {aboutFeatures.map((item: string, index: number) => (
                    <div key={index} className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500 transition-colors duration-300">
                        <CheckCircleIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-dark-700 dark:text-dark-200 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
                <Link
                  to={aboutSettings.button_link || '/about'}
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-primary-500 dark:bg-primary-600 hover:bg-primary-600 dark:hover:bg-primary-700 rounded-xl font-semibold text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  {aboutSettings.button_text || 'Learn More About Us'}
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>
    ),

    notable_clients: () => notableClients.length > 0 ? (
      <NotableClients key="notable_clients" clients={notableClients} speed="fast" />
    ) : null,
  }

  // Default section order (used when sort_order not available from API)
  const defaultOrder: string[] = [
    'brand_statement', 'hero_products', 'stats', 'categories', 'features',
    'bestsellers', 'bundles', 'banner_carousel',
    'dealer_cta', 'testimonials', 'about', 'notable_clients',
  ]

  // Build sorted section keys from API sort_order, falling back to default
  const sortedSectionKeys = Object.keys(sections).length > 0
    ? Object.entries(sections)
        .sort((a, b) => (a[1].sort_order ?? 999) - (b[1].sort_order ?? 999))
        .map(([key]) => key)
        // Include any registry keys not in the API (e.g., bundles, banner_carousel may not have DB entries)
        .concat(defaultOrder.filter(k => !sections[k]))
    : defaultOrder

  return (
    <>
      <Helmet>
        <title>Fischer Pakistan - Premium Home Appliances</title>
        <meta name="description" content="Discover premium home appliances by Fischer Pakistan. Shop kitchen appliances, air fryers, geysers, and more." />
      </Helmet>

      {!introComplete && (
        <LogoSplitIntro onComplete={() => setIntroComplete(true)} />
      )}

      <div className="bg-white dark:bg-dark-950">
        {/* Hero is always first */}
        <section className="relative h-[50vh] min-h-[450px] sm:h-[65vh] md:h-[75vh] lg:h-[85vh] xl:h-screen w-full overflow-hidden bg-dark-950">
          <div className={`absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-950 to-primary-950/30 transition-opacity duration-700 ${videoLoaded ? 'opacity-0' : 'opacity-100'}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
          </div>
          {videoError && (
            <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-primary-950/40 to-dark-950" />
          )}
          {!videoError && <video
            className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${videoLoaded ? 'opacity-100' : 'opacity-0'} object-contain sm:object-cover object-center`}
            style={{ objectPosition: 'center center' }}
            autoPlay loop muted playsInline preload="metadata"
            onCanPlayThrough={() => setVideoLoaded(true)}
            onLoadedData={() => setVideoLoaded(true)}
            onError={() => { setVideoError(true); setVideoLoaded(true) }}
          >
            <source src={heroVideoUrl} type="video/mp4" />
          </video>}
          <div className="absolute inset-0 bg-gradient-to-b from-dark-950/30 via-transparent to-dark-950/60" />
          <div className="hidden sm:flex absolute bottom-12 left-1/2 -translate-x-1/2 z-10">
            <div className="flex flex-col items-center gap-2 text-white">
              <span className="text-sm font-medium tracking-wider opacity-80">Scroll</span>
              <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </section>

        {/* Dynamic sections rendered in sort_order from admin */}
        {sortedSectionKeys.map((key) => {
          // Skip hero (rendered above) and sections without a renderer
          if (key === 'hero' || !sectionRegistry[key]) return null
          // Check if section is enabled (default to enabled if not in sections data)
          if (!isSectionEnabled(key)) return null
          return sectionRegistry[key]()
        })}

        {/* Modals */}
        <BundleQuickView bundle={quickViewBundle} isOpen={!!quickViewBundle} onClose={() => setQuickViewBundle(null)} />
        {quickViewProduct && (
          <QuickViewModal isOpen={!!quickViewProduct} onClose={() => setQuickViewProduct(null)} product={quickViewProduct} />
        )}
      </div>
    </>
  )
}
