import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowRightIcon,
  TruckIcon,
  ShieldCheckIcon,
  PhoneIcon,
  CreditCardIcon,
  PlayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
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
import CategoryIcon from '@/components/ui/CategoryIcon'
import GrainOverlay from '@/components/effects/GrainOverlay'
import ScrollReveal, {
  StaggerContainer,
  StaggerItem,
  Parallax,
  HoverCard,
  Magnetic,
  ScrollProgress
} from '@/components/effects/ScrollReveal'
import { BundleCarousel, BundleGrid, BundleBanner, BundleQuickView } from '@/components/bundles'
import { useHomepageBundles, useAddBundleToCart } from '@/api/bundles'
import type { Bundle } from '@/api/bundles'
import toast from 'react-hot-toast'

interface Category {
  id: number
  name: string
  slug: string
  image?: string
  icon?: string
  products_count: number
  description?: string
}

interface Product {
  id: number
  name: string
  slug: string
  price: number
  compare_price?: number | null
  primary_image?: string | null
  stock_status: string
  is_new?: boolean
  is_bestseller?: boolean
  average_rating?: number
  review_count?: number
  category?: {
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

interface SectionSettings {
  title?: string
  subtitle?: string
  is_enabled: boolean
  settings?: Record<string, any>
}

interface HomeData {
  banners: Banner[]
  categories: Category[]
  featured_products: Product[]
  new_arrivals: Product[]
  bestsellers: Product[]
  testimonials: Testimonial[]
  stats: Stat[]
  features: Feature[]
  trust_badges: TrustBadge[]
  sections: Record<string, SectionSettings>
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
    title: 'Free Nationwide Delivery',
    description: 'Free shipping on orders above PKR 10,000 across Pakistan',
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

// Fallback Trust badges
const defaultTrustBadges = [
  { title: 'ISO 9001:2015' },
  { title: 'PSQCA Certified' },
  { title: 'Made in Pakistan' },
  { title: 'CE Approved' },
  { title: 'Eco Friendly' },
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
  orange: { gradient: 'from-orange-500 to-amber-400', bg: 'bg-orange-500/10', text: '#f97316' },
  primary: { gradient: 'from-primary-500 to-amber-400', bg: 'bg-primary-500/10', text: '#f4b42c' },
  red: { gradient: 'from-red-500 to-rose-400', bg: 'bg-red-500/10', text: '#ef4444' },
  green: { gradient: 'from-green-500 to-emerald-400', bg: 'bg-green-500/10', text: '#22c55e' },
  cyan: { gradient: 'from-cyan-500 to-blue-400', bg: 'bg-cyan-500/10', text: '#06b6d4' },
}

// Fallback categories
const fallbackCategories: Category[] = [
  { id: 1, name: 'Water Coolers', slug: 'water-coolers', products_count: 12 },
  { id: 2, name: 'Cooking Ranges', slug: 'cooking-ranges', products_count: 8 },
  { id: 3, name: 'Geysers', slug: 'geysers', products_count: 10 },
  { id: 4, name: 'Hobs', slug: 'hobs', products_count: 6 },
  { id: 5, name: 'Water Dispensers', slug: 'water-dispensers', products_count: 5 },
  { id: 6, name: 'Storage Coolers', slug: 'storage-coolers', products_count: 4 },
]

export default function Home() {
  const [currentBanner, setCurrentBanner] = useState(0)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [quickViewBundle, setQuickViewBundle] = useState<Bundle | null>(null)

  const { data } = useQuery<HomeData>({
    queryKey: ['home'],
    queryFn: async () => {
      const response = await api.get('/home')
      return response.data.data
    },
  })

  // Fetch homepage bundles
  const { data: homepageBundles } = useHomepageBundles()
  const addBundleToCart = useAddBundleToCart()

  // Handle adding fixed bundle to cart
  const handleAddBundleToCart = async (bundle: Bundle) => {
    if (bundle.bundle_type !== 'fixed') {
      // For configurable bundles, open quick view
      setQuickViewBundle(bundle)
      return
    }

    try {
      await addBundleToCart.mutateAsync({ bundleSlug: bundle.slug })
      toast.success(`${bundle.name} added to cart!`)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add bundle to cart')
    }
  }

  // Auto-slide banners
  useEffect(() => {
    if (!data?.banners?.length) return
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % data.banners.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [data?.banners?.length])

  // Extract dynamic data with fallbacks
  const stats = data?.stats?.length ? data.stats : defaultStats
  const features = data?.features?.length ? data.features : defaultFeatures
  const testimonials = data?.testimonials?.length ? data.testimonials : defaultTestimonials
  const trustBadges = data?.trust_badges?.length ? data.trust_badges : defaultTrustBadges
  const sections = data?.sections || {}

  // Check if sections are enabled
  const isSectionEnabled = (key: string) => {
    return sections[key]?.is_enabled !== false
  }

  // Auto-slide testimonials
  useEffect(() => {
    if (!testimonials.length) return
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [testimonials.length])

  // Don't block rendering - show content immediately with fallback data

  const banners = data?.banners?.length ? data.banners : [
    {
      id: 1,
      title: 'Premium Home Appliances',
      subtitle: 'ISO 9001:2015 certified products designed for Pakistani homes',
      image: '/images/hero-banner.jpg',
      button_text: 'Shop Now',
      button_link: '/shop',
    },
  ]

  const categories = data?.categories?.length ? data.categories : fallbackCategories

  // Helper to get icon component from string
  const getIcon = (iconName?: string) => {
    if (!iconName) return StarIcon
    return iconMap[iconName] || StarIcon
  }

  // Helper to get color classes
  const getColorClasses = (colorName?: string) => {
    return colorMap[colorName || 'primary'] || colorMap.primary
  }

  return (
    <div className="overflow-hidden bg-white dark:bg-dark-950 transition-colors">
      {/* Scroll Progress Indicator */}
      <ScrollProgress />

      {/* Global Grain Overlay for premium texture */}
      <GrainOverlay opacity={0.03} />

      {/* ==========================================
          HERO SECTION - Clean, Performant Design
          ========================================== */}
      <section className="relative min-h-[100vh] flex items-center overflow-hidden">
        {/* CSS-only Gradient Background - No JavaScript animations */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950" />

          {/* Static gradient orbs using CSS only */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }} />

          {/* Subtle grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(244,180,44,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(244,180,44,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        {/* Hero Content */}
        <div className="relative container-xl py-20 lg:py-32 z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Animated Badge */}
              <ScrollReveal animation="elastic" delay={0.1}>
                <Magnetic strength={0.2}>
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full
                            bg-gradient-to-r from-primary-500/20 to-primary-400/10
                            border border-primary-500/30 backdrop-blur-sm">
                    <div className="relative">
                      <SparklesIcon className="w-5 h-5 text-primary-400" />
                      <motion.div
                        className="absolute inset-0"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <SparklesIcon className="w-5 h-5 text-primary-400" />
                      </motion.div>
                    </div>
                    <span className="text-sm font-semibold text-primary-300 tracking-wide">
                      35+ Years of Excellence
                    </span>
                  </div>
                </Magnetic>
              </ScrollReveal>

              {/* Main Title with Gradient */}
              <ScrollReveal animation="fadeUp" delay={0.2}>
                <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black font-display leading-[0.9] tracking-tight">
                  <span className="block text-white">
                    {banners[currentBanner]?.title?.split(' ')[0] || 'Premium'}
                  </span>
                  <span className="block mt-2 bg-gradient-to-r from-primary-400 via-primary-500 to-amber-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                    {banners[currentBanner]?.title?.split(' ').slice(1).join(' ') || 'Home Appliances'}
                  </span>
                </h1>
              </ScrollReveal>

              {/* Animated Subtitle */}
              <ScrollReveal animation="blur" delay={0.3}>
                <p className="text-xl md:text-2xl text-dark-300 max-w-xl leading-relaxed font-light">
                  {banners[currentBanner]?.subtitle ||
                   'ISO 9001:2015 certified products designed for Pakistani homes'}
                </p>
              </ScrollReveal>

              {/* CTA Buttons */}
              <ScrollReveal animation="fadeUp" delay={0.2}>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Magnetic strength={0.15}>
                    <Link
                      to={banners[currentBanner]?.button_link || '/shop'}
                      className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-amber-500 rounded-2xl font-bold text-dark-900 text-lg
                               transition-all duration-300 hover:scale-105 hover:shadow-glow-lg hover:from-amber-400 hover:to-primary-400"
                    >
                      {banners[currentBanner]?.button_text || 'Explore Products'}
                      <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Magnetic>
                  <Magnetic strength={0.15}>
                    <Link
                      to="/about"
                      className="group px-8 py-4 rounded-2xl font-semibold text-white text-lg
                               border-2 border-white/20 backdrop-blur-sm
                               hover:bg-white/10 hover:border-white/40 transition-all duration-300
                               flex items-center gap-2"
                    >
                      <PlayIcon className="w-5 h-5" />
                      Our Story
                    </Link>
                  </Magnetic>
                </div>
              </ScrollReveal>

              {/* Trust Badges */}
              <StaggerContainer className="flex flex-wrap gap-3 pt-6" delay={0.25} staggerDelay={0.08}>
                {trustBadges.map((badge) => (
                  <StaggerItem key={badge.title}>
                    <span className="px-4 py-2 rounded-full text-sm font-medium
                                   bg-white/5 border border-white/10 text-dark-300
                                   hover:bg-white/10 hover:border-primary-500/30 transition-colors">
                      {badge.title}
                    </span>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>

            {/* Right - 3D Product Showcase */}
            <ScrollReveal animation="scale" delay={0.25} className="relative">
              {/* Rotating Ring */}
              <Parallax speed={0.2} direction="up">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[400px] h-[400px] lg:w-[500px] lg:h-[500px] rounded-full border border-primary-500/20 animate-spin-slow" />
                  <div className="absolute w-[350px] h-[350px] lg:w-[450px] lg:h-[450px] rounded-full border border-primary-500/10 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '20s' }} />
                </div>
              </Parallax>

              {/* Glow effect */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-80 h-80 bg-primary-500/20 rounded-full blur-[100px] animate-pulse-slow" />
              </div>

              {/* Product Card with 3D Hover */}
              <HoverCard className="relative mx-auto max-w-md" intensity={8}>
                <div className="relative bg-gradient-to-br from-dark-800/80 to-dark-900/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl
                              hover:border-primary-500/30 transition-all duration-500 group">
                  {/* Best Seller Badge */}
                  <div className="absolute -top-4 -right-4 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-amber-500 rounded-2xl shadow-lg shadow-primary-500/30
                                flex items-center gap-2 animate-bounce-slow">
                    <FireIcon className="w-5 h-5 text-dark-900" />
                    <span className="font-bold text-dark-900">BEST SELLER</span>
                  </div>

                  {/* Product Image */}
                  <div className="relative h-72 flex items-center justify-center mb-6">
                    <img
                      src="/images/products/water-cooler-100ltr.png"
                      alt="Featured Product - Electric Water Cooler FE-100"
                      width={280}
                      height={280}
                      loading="eager"
                      {...{ fetchpriority: "high" } as any}
                      className="max-h-full object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.currentTarget.src = 'https://fischerpk.com/wp-content/uploads/2022/06/electric-water-cooler-cooling-capacity-100-ltr-hr-800x800.png'
                      }}
                    />
                    {/* Reflection */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-gradient-to-t from-primary-500/10 to-transparent blur-xl" />
                  </div>

                  {/* Product Info */}
                  <div className="text-center space-y-4">
                    <div className="flex justify-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <StarSolidIcon key={i} className="w-5 h-5 text-primary-500" />
                      ))}
                      <span className="ml-2 text-dark-400 text-sm">(128 reviews)</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">Electric Water Cooler FE-100</h3>
                    <p className="text-dark-400">100 Ltr/Hr Cooling Capacity</p>
                    <div className="flex items-center justify-center gap-4">
                      <span className="text-4xl font-black bg-gradient-to-r from-primary-400 to-amber-400 bg-clip-text text-transparent">
                        PKR 112,500
                      </span>
                    </div>
                    <Link
                      to="/shop"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-colors"
                    >
                      View Details
                      <ArrowRightIcon className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </HoverCard>
            </ScrollReveal>
          </div>
        </div>

        {/* Scroll Indicator */}
        <ScrollReveal animation="bounce" delay={0.6}>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <span className="text-dark-400 text-sm font-medium">Scroll to explore</span>
            <div className="w-6 h-10 rounded-full border-2 border-dark-400 flex items-start justify-center p-1">
              <div className="w-1.5 h-3 bg-primary-500 rounded-full animate-slide-up" />
            </div>
          </div>
        </ScrollReveal>

        {/* Banner Navigation */}
        {banners.length > 1 && (
          <div className="absolute bottom-8 right-8 flex items-center gap-3">
            <button
              onClick={() => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-110"
              aria-label="Previous banner"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBanner(index)}
                  className={`h-2 rounded-full transition-all duration-500
                            ${index === currentBanner ? 'w-10 bg-primary-500' : 'w-2 bg-white/30 hover:bg-white/50'}`}
                  aria-label={`Go to banner ${index + 1}`}
                />
              ))}
            </div>
            <button
              onClick={() => setCurrentBanner((prev) => (prev + 1) % banners.length)}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-110"
              aria-label="Next banner"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </section>

      {/* ==========================================
          STATS BAR - Animated Counters
          ========================================== */}
      {isSectionEnabled('stats') && (
      <section className="relative -mt-20 z-20">
        <div className="container-xl">
          <ScrollReveal animation="slideUp" duration={1.4}>
            <HoverCard intensity={3} className="bg-white dark:bg-dark-800 rounded-3xl shadow-2xl border border-dark-100 dark:border-dark-700 p-8 md:p-12">
              <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-8" staggerDelay={0.1}>
                {stats.map((stat) => {
                  const Icon = getIcon(stat.icon)
                  return (
                    <StaggerItem key={stat.label}>
                      <Magnetic strength={0.2}>
                        <div className="text-center group cursor-pointer">
                          <div className="inline-flex items-center justify-center w-14 h-14 mb-4 rounded-2xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                            <Icon className="w-7 h-7" />
                          </div>
                          <div className="text-4xl md:text-5xl font-black text-dark-900 dark:text-white mb-2 group-hover:text-primary-500 transition-colors">
                            {stat.value}
                          </div>
                          <div className="text-dark-500 dark:text-dark-400 font-medium">
                            {stat.label}
                          </div>
                        </div>
                      </Magnetic>
                    </StaggerItem>
                  )
                })}
              </StaggerContainer>
            </HoverCard>
          </ScrollReveal>
        </div>
      </section>
      )}

      {/* ==========================================
          FEATURES - Bento Grid Style with 3D Hover
          ========================================== */}
      {isSectionEnabled('features') && (
      <section className="section bg-dark-50 dark:bg-dark-950">
        <div className="container-xl">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.08}>
            {features.map((feature) => {
              const Icon = getIcon(feature.icon)
              const colors = getColorClasses(feature.color)
              return (
                <StaggerItem key={feature.title}>
                  <HoverCard intensity={12}>
                    <div
                      className="group relative p-8 rounded-3xl overflow-hidden h-full
                                bg-white dark:bg-dark-800/50 border border-dark-100 dark:border-dark-700/50
                                hover:border-transparent hover:shadow-2xl hover:shadow-primary-500/10
                                transition-all duration-500"
                    >
                      {/* Gradient overlay on hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                      {/* Icon */}
                      <Magnetic strength={0.3}>
                        <div className={`relative w-16 h-16 ${colors.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          <Icon className="w-8 h-8" style={{ color: colors.text }} />
                        </div>
                      </Magnetic>

                      <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-dark-500 dark:text-dark-400 leading-relaxed">
                        {feature.description}
                      </p>

                      {/* Shine effect on hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      </div>
                    </div>
                  </HoverCard>
                </StaggerItem>
              )
            })}
          </StaggerContainer>
        </div>
      </section>
      )}

      {/* ==========================================
          BUNDLE BANNER - Featured Bundle Hero
          ========================================== */}
      {homepageBundles?.banner && homepageBundles.banner.length > 0 && (
        <section className="bg-dark-950">
          <BundleBanner
            bundle={homepageBundles.banner[0]}
            onAddToCart={handleAddBundleToCart}
            variant="hero"
          />
        </section>
      )}

      {/* ==========================================
          BUNDLE CAROUSEL - Featured Bundles Slider
          ========================================== */}
      {homepageBundles?.carousel && homepageBundles.carousel.length > 0 && (
        <section className="section bg-white dark:bg-dark-900">
          <div className="container-xl">
            <ScrollReveal animation="glide">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                  <ScrollReveal animation="elastic" delay={0.1}>
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-600 dark:text-amber-400 text-sm font-semibold mb-4">
                      <GiftIcon className="w-4 h-4" />
                      Special Bundles
                    </span>
                  </ScrollReveal>
                  <h2 className="text-4xl md:text-5xl font-black text-dark-900 dark:text-white">
                    Save More with{' '}
                    <span className="bg-gradient-to-r from-primary-500 via-amber-500 to-primary-400 bg-clip-text text-transparent">Bundles</span>
                  </h2>
                  <ScrollReveal animation="blur" delay={0.3}>
                    <p className="text-xl text-dark-500 dark:text-dark-400 mt-4 max-w-xl">
                      Get the best value with our curated product bundles
                    </p>
                  </ScrollReveal>
                </div>
                <Magnetic strength={0.2}>
                  <Link
                    to="/bundles"
                    className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-dark-900 dark:bg-white text-white dark:text-dark-900 font-semibold hover:bg-dark-800 dark:hover:bg-dark-100 transition-colors hover:shadow-lg"
                  >
                    View All Bundles
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Magnetic>
              </div>
            </ScrollReveal>
            <BundleCarousel
              bundles={homepageBundles.carousel}
              onQuickView={setQuickViewBundle}
              onAddToCart={handleAddBundleToCart}
            />
          </div>
        </section>
      )}

      {/* ==========================================
          CATEGORIES - Modern Cards with Hover Effects
          ========================================== */}
      {isSectionEnabled('categories') && (
      <section className="section bg-white dark:bg-dark-900">
        <div className="container-xl">
          {/* Section Header */}
          <ScrollReveal animation="glide">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div>
                <ScrollReveal animation="elastic" delay={0.1}>
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-semibold mb-4">
                    <CubeIcon className="w-4 h-4" />
                    Browse Products
                  </span>
                </ScrollReveal>
                <h2 className="text-4xl md:text-5xl font-black text-dark-900 dark:text-white">
                  Shop by{' '}
                  <span className="bg-gradient-to-r from-primary-500 via-amber-500 to-primary-400 bg-clip-text text-transparent">Category</span>
                </h2>
                <ScrollReveal animation="blur" delay={0.3}>
                  <p className="text-xl text-dark-500 dark:text-dark-400 mt-4 max-w-xl">
                    Explore our complete range of home and commercial appliances
                  </p>
                </ScrollReveal>
              </div>
              <Magnetic strength={0.2}>
                <Link
                  to="/categories"
                  className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-dark-900 dark:bg-white text-white dark:text-dark-900 font-semibold hover:bg-dark-800 dark:hover:bg-dark-100 transition-colors hover:shadow-lg"
                >
                  View All
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Magnetic>
            </div>
          </ScrollReveal>

          {/* Categories Grid */}
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6" staggerDelay={0.08}>
            {categories.slice(0, 6).map((category) => (
                <StaggerItem key={category.id}>
                  <HoverCard intensity={15}>
                    <Link
                      to={`/category/${category.slug}`}
                      className="group relative block"
                    >
                      <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-dark-100 to-dark-50 dark:from-dark-800 dark:to-dark-900 p-6
                                    border-2 border-transparent hover:border-primary-500
                                    transition-all duration-500 hover:shadow-2xl hover:shadow-primary-500/20">
                        {/* Background Glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-500/0 group-hover:from-primary-500/10 group-hover:to-amber-500/10 transition-all duration-500" />

                        {/* Icon/Image */}
                        <Magnetic strength={0.25}>
                          <div className="relative h-full flex flex-col items-center justify-center">
                            <div className="group-hover:scale-125 group-hover:rotate-3 transition-all duration-500">
                              <CategoryIcon slug={category.slug} className="w-20 h-20" />
                            </div>
                          </div>
                        </Magnetic>

                        {/* Overlay with info */}
                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-dark-900/90 via-dark-900/50 to-transparent translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                          <h3 className="font-bold text-white text-center truncate">{category.name}</h3>
                          <p className="text-sm text-dark-300 text-center">{category.products_count} Products</p>
                        </div>

                        {/* Shine effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        </div>
                      </div>

                      {/* Category Name (visible by default) */}
                      <div className="mt-4 text-center group-hover:opacity-0 transition-opacity duration-300">
                        <h3 className="font-bold text-dark-900 dark:text-white truncate">{category.name}</h3>
                        <p className="text-sm text-dark-500 dark:text-dark-400">{category.products_count} Products</p>
                      </div>
                    </Link>
                  </HoverCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* ==========================================
          FEATURED PRODUCTS - Premium Showcase
          ========================================== */}
      {isSectionEnabled('featured_products') && data?.featured_products && data.featured_products.length > 0 && (
        <section className="section bg-dark-950 relative overflow-hidden">
          {/* CSS-only Background Gradients with Parallax */}
          <Parallax speed={0.3} direction="up" className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-500/8 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/8 rounded-full blur-[100px]" />
          </Parallax>

          <div className="container-xl relative">
            {/* Section Header */}
            <ScrollReveal animation="zoom">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                <div>
                  <ScrollReveal animation="bounce" delay={0.1}>
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/20 text-primary-400 text-sm font-semibold mb-4">
                      <FireIcon className="w-4 h-4" />
                      Hand-picked for you
                    </span>
                  </ScrollReveal>
                  <h2 className="text-4xl md:text-5xl font-black text-white">
                    Featured{' '}
                    <span className="bg-gradient-to-r from-primary-500 via-amber-500 to-primary-400 bg-clip-text text-transparent">Products</span>
                  </h2>
                  <ScrollReveal animation="fadeUp" delay={0.25}>
                    <p className="text-xl text-dark-400 mt-4 max-w-xl">
                      Our most popular appliances loved by customers across Pakistan
                    </p>
                  </ScrollReveal>
                </div>
                <Magnetic strength={0.2}>
                  <Link
                    to="/shop?featured=1"
                    className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-white/20 text-white font-semibold hover:bg-white/10 hover:border-primary-500/50 transition-all duration-300"
                  >
                    View All Products
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Magnetic>
              </div>
            </ScrollReveal>

            {/* Products Grid */}
            <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6" staggerDelay={0.1}>
              {data.featured_products.slice(0, 10).map((product) => (
                <StaggerItem key={product.id}>
                  <HoverCard intensity={10}>
                    <ProductCard product={product} />
                  </HoverCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* ==========================================
          CTA BANNER - Become a Dealer
          ========================================== */}
      {isSectionEnabled('dealer_cta') && (
      <section className="relative py-24 overflow-hidden">
        {/* CSS-only Gradient Background with Parallax */}
        <Parallax speed={0.2} direction="down" className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-500 to-amber-500">
            {/* CSS-only animated orbs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-dark-900/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />

            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
          </div>
        </Parallax>

        <div className="relative container-xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <ScrollReveal animation="glide">
              <div className="text-center lg:text-left">
                <ScrollReveal animation="elastic" delay={0.1}>
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full
                                bg-dark-900/20 backdrop-blur-sm text-dark-900 text-sm font-bold mb-8">
                    <SparklesIcon className="w-5 h-5" />
                    Partnership Opportunity
                  </span>
                </ScrollReveal>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-dark-900 leading-tight mb-8">
                  Become a Fischer
                  <span className="block text-white drop-shadow-lg">
                    Authorized Dealer
                  </span>
                </h2>
                <ScrollReveal animation="blur" delay={0.2}>
                  <p className="text-xl text-dark-800 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                    Join our nationwide network of 500+ dealers and grow your business with
                    Pakistan's most trusted home appliance brand.
                  </p>
                </ScrollReveal>
                <ScrollReveal animation="fadeUp" delay={0.25}>
                  <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                    <Magnetic strength={0.15}>
                      <Link to="/become-dealer" className="group px-8 py-4 bg-dark-900 hover:bg-dark-800 rounded-2xl font-bold text-white text-lg transition-all hover:scale-105 hover:shadow-2xl flex items-center gap-2">
                        Apply Now
                        <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Magnetic>
                    <Magnetic strength={0.15}>
                      <Link to="/contact" className="px-8 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl font-bold text-dark-900 text-lg transition-all">
                        Contact Sales
                      </Link>
                    </Magnetic>
                  </div>
                </ScrollReveal>
              </div>
            </ScrollReveal>

            {/* Benefits Cards */}
            <StaggerContainer className="grid sm:grid-cols-2 gap-5" staggerDelay={0.08}>
              {[
                { title: 'Exclusive Margins', desc: 'Competitive dealer margins & incentives', icon: '💰' },
                { title: 'Marketing Support', desc: 'Co-branded marketing materials', icon: '📢' },
                { title: 'Training Programs', desc: 'Product & sales training', icon: '🎓' },
                { title: 'Priority Support', desc: 'Dedicated dealer support line', icon: '🎯' },
              ].map((benefit) => (
                <StaggerItem key={benefit.title}>
                  <HoverCard intensity={12}>
                    <div
                      className="p-6 rounded-3xl bg-dark-900/10 backdrop-blur-sm border border-dark-900/10
                               hover:bg-dark-900/20 transition-all duration-300"
                    >
                      <span className="text-4xl mb-4 block">{benefit.icon}</span>
                      <h3 className="text-xl font-bold text-dark-900 mb-2">{benefit.title}</h3>
                      <p className="text-dark-800">{benefit.desc}</p>
                    </div>
                  </HoverCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>
      )}

      {/* ==========================================
          NEW ARRIVALS - Horizontal Scroll
          ========================================== */}
      {isSectionEnabled('new_arrivals') && data?.new_arrivals && data.new_arrivals.length > 0 && (
        <section className="section bg-white dark:bg-dark-900">
          <div className="container-xl">
            <ScrollReveal animation="rotate">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                  <ScrollReveal animation="bounce" delay={0.1}>
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-semibold mb-4">
                      <BoltIcon className="w-4 h-4" />
                      Just Arrived
                    </span>
                  </ScrollReveal>
                  <h2 className="text-4xl md:text-5xl font-black text-dark-900 dark:text-white">
                    New{' '}
                    <span className="bg-gradient-to-r from-primary-500 via-amber-500 to-primary-400 bg-clip-text text-transparent">Arrivals</span>
                  </h2>
                  <ScrollReveal animation="blur" delay={0.25}>
                    <p className="text-xl text-dark-500 dark:text-dark-400 mt-4">
                      Check out our latest additions to the catalog
                    </p>
                  </ScrollReveal>
                </div>
                <Magnetic strength={0.2}>
                  <Link
                    to="/shop?new=1"
                    className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-dark-900 dark:bg-white text-white dark:text-dark-900 font-semibold hover:bg-dark-800 dark:hover:bg-dark-100 transition-colors hover:shadow-lg"
                  >
                    View All New
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Magnetic>
              </div>
            </ScrollReveal>

            <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6" staggerDelay={0.08}>
              {data.new_arrivals.slice(0, 5).map((product) => (
                <StaggerItem key={product.id}>
                  <HoverCard intensity={10}>
                    <ProductCard product={product} showNew />
                  </HoverCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* ==========================================
          TESTIMONIALS - Modern Slider
          ========================================== */}
      {isSectionEnabled('testimonials') && testimonials.length > 0 && (
      <section className="section bg-dark-50 dark:bg-dark-950 relative overflow-hidden">
        {/* Background decoration with Parallax */}
        <Parallax speed={0.15} direction="down" className="absolute top-0 left-0 w-full h-1/2 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-b from-white dark:from-dark-900 to-transparent" />
        </Parallax>

        <div className="container-xl relative">
          <ScrollReveal animation="flip">
            <div className="text-center mb-16">
              <ScrollReveal animation="elastic" delay={0.1}>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-semibold mb-4">
                  <StarIcon className="w-4 h-4" />
                  {sections.testimonials?.title || 'Customer Reviews'}
                </span>
              </ScrollReveal>
              <h2 className="text-4xl md:text-5xl font-black text-dark-900 dark:text-white">
                What Our{' '}
                <span className="bg-gradient-to-r from-primary-500 via-amber-500 to-primary-400 bg-clip-text text-transparent">Customers</span>{' '}
                Say
              </h2>
              <ScrollReveal animation="blur" delay={0.3}>
                <p className="text-xl text-dark-500 dark:text-dark-400 mt-4 max-w-2xl mx-auto">
                  {sections.testimonials?.subtitle || 'Trusted by thousands of Pakistani households and businesses'}
                </p>
              </ScrollReveal>
            </div>
          </ScrollReveal>

          {/* Testimonials Slider */}
          <ScrollReveal animation="scaleUp">
            <HoverCard intensity={5} className="max-w-4xl mx-auto">
              <div className="relative">
              {testimonials.map((testimonial, index) => {
                const initials = testimonial.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                return (
                <div
                  key={testimonial.name}
                  className={`transition-all duration-700 ${
                    index === activeTestimonial
                      ? 'opacity-100 translate-y-0 scale-100'
                      : 'opacity-0 translate-y-8 scale-95 absolute inset-0 pointer-events-none'
                  }`}
                >
                  <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] p-10 md:p-14 shadow-2xl border border-dark-100 dark:border-dark-700 hover:shadow-primary-500/10 transition-shadow">
                    {/* Quote icon */}
                    <div className="text-6xl text-primary-500/20 mb-6">"</div>

                    {/* Content */}
                    <p className="text-2xl md:text-3xl text-dark-700 dark:text-dark-200 leading-relaxed mb-10 font-light">
                      {testimonial.content}
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-6">
                      {testimonial.image ? (
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-2xl object-cover ring-4 ring-primary-100 dark:ring-primary-900/30"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement
                            if (fallback) fallback.classList.remove('hidden')
                          }}
                        />
                      ) : null}
                      <div className={`w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 ${testimonial.image ? 'hidden' : 'flex'} items-center justify-center`}>
                        <span className="text-xl font-bold text-primary-600 dark:text-primary-400">{initials}</span>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-dark-900 dark:text-white">{testimonial.name}</p>
                        <p className="text-dark-500 dark:text-dark-400">{testimonial.role}</p>
                      </div>
                      <div className="ml-auto flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <StarSolidIcon
                            key={i}
                            className={`w-6 h-6 ${i < testimonial.rating ? 'text-primary-500' : 'text-dark-200 dark:text-dark-700'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )})}
            </div>

              {/* Navigation dots */}
              <div className="flex justify-center gap-3 mt-8">
                {testimonials.map((_, index) => (
                  <Magnetic key={index} strength={0.5}>
                    <button
                      onClick={() => setActiveTestimonial(index)}
                      className={`h-3 rounded-full transition-all duration-300 hover:scale-125
                                ${index === activeTestimonial ? 'w-10 bg-primary-500' : 'w-3 bg-dark-300 dark:bg-dark-600 hover:bg-primary-300'}`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  </Magnetic>
                ))}
              </div>
            </HoverCard>
          </ScrollReveal>
        </div>
      </section>
      )}

      {/* ==========================================
          WHY FISCHER - Premium Section
          ========================================== */}
      {isSectionEnabled('about') && (
      <section className="section bg-white dark:bg-dark-900 overflow-hidden">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left - Image with effects */}
            <div className="relative">
              <HoverCard intensity={8}>
                <div className="relative">
                  {/* Background decoration */}
                  <div className="absolute -inset-10 pointer-events-none">
                    <div className="w-full h-full bg-gradient-to-r from-primary-500/20 to-amber-500/20 rounded-[4rem] blur-3xl opacity-50" />
                  </div>

                  <div className="relative">
                    <div className="rounded-[2.5rem] overflow-hidden shadow-2xl">
                      <img
                        src="/images/about-factory.jpg"
                        alt="Fischer Factory - Manufacturing Facility"
                        width={600}
                        height={450}
                        className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-700"
                        onError={(e) => {
                          const target = e.currentTarget
                          if (!target.dataset.fallback) {
                            target.dataset.fallback = 'true'
                            target.src = '/images/about-fischer.jpg'
                          }
                        }}
                      />
                    </div>

                    {/* ISO Badge */}
                    <Magnetic strength={0.3}>
                      <div className="absolute -bottom-8 -right-8 p-8 rounded-3xl bg-white dark:bg-dark-800 shadow-2xl border border-dark-100 dark:border-dark-700 animate-float">
                        <div className="text-center">
                          <div className="text-5xl font-black bg-gradient-to-r from-primary-500 to-amber-500 bg-clip-text text-transparent">
                            ISO
                          </div>
                          <div className="text-lg font-bold text-dark-500 dark:text-dark-400">9001:2015</div>
                          <div className="text-sm text-dark-400 dark:text-dark-500">Certified</div>
                        </div>
                      </div>
                    </Magnetic>

                    {/* Years badge */}
                    <Magnetic strength={0.3}>
                      <div className="absolute -top-6 -left-6 px-6 py-4 rounded-2xl bg-dark-900 text-white shadow-xl animate-float" style={{ animationDelay: '0.5s' }}>
                        <span className="text-3xl font-black">35+</span>
                        <span className="block text-sm text-dark-300">Years</span>
                      </div>
                    </Magnetic>
                  </div>
                </div>
              </HoverCard>
            </div>

            {/* Right - Content */}
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-semibold mb-6">
                <SparklesIcon className="w-4 h-4" />
                About Fischer
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-dark-900 dark:text-white mb-8 leading-tight">
                Pakistan's Most{' '}
                <span className="bg-gradient-to-r from-primary-500 via-amber-500 to-primary-400 bg-clip-text text-transparent">Trusted</span>{' '}
                Appliance Brand
              </h2>
              <p className="text-xl text-dark-500 dark:text-dark-400 mb-10 leading-relaxed">
                Established in 1990, Fischer (Fatima Engineering Works) has been at the
                forefront of manufacturing high-quality home and commercial appliances.
                With over three decades of excellence, we've become a household name
                trusted by millions across Pakistan.
              </p>

              {/* Feature list */}
              <div className="grid sm:grid-cols-2 gap-6 mb-10">
                {[
                  'ISO 9001:2015 & PSQCA Certified',
                  'Made in Pakistan with premium materials',
                  'Nationwide service & support network',
                  'Dedicated R&D for continuous innovation',
                ].map((item, index) => (
                  <Magnetic key={index} strength={0.15}>
                    <div className="flex items-center gap-4 group cursor-pointer">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30
                                    flex items-center justify-center flex-shrink-0
                                    group-hover:bg-primary-500 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        <CheckCircleIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-dark-700 dark:text-dark-200 font-medium group-hover:text-primary-500 transition-colors">{item}</span>
                    </div>
                  </Magnetic>
                ))}
              </div>

              <Magnetic strength={0.15}>
                <Link to="/about" className="group inline-flex items-center gap-2 px-8 py-4 bg-dark-900 dark:bg-white hover:bg-dark-800 dark:hover:bg-dark-100 rounded-2xl font-bold text-white dark:text-dark-900 text-lg transition-all hover:scale-105 hover:shadow-xl">
                  Learn More About Us
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Magnetic>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* ==========================================
          NEWSLETTER - Clean Design
          ========================================== */}
      {isSectionEnabled('newsletter') && (
      <section className="relative py-24 overflow-hidden">
        {/* CSS-only gradient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(244,180,44,0.12)_0%,transparent_70%)]" />
            <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(244,180,44,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(244,180,44,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />
          </div>
        </div>

        <div className="relative container-xl">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full
                          bg-primary-500/20 border border-primary-500/30 text-primary-400 text-sm font-semibold mb-8">
              <BoltIcon className="w-5 h-5" />
              Stay Updated
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
              Get Exclusive{' '}
              <span className="bg-gradient-to-r from-primary-500 via-amber-500 to-primary-400 bg-clip-text text-transparent">Offers</span>
            </h2>
            <p className="text-xl text-dark-300 mb-10 max-w-xl mx-auto">
              Subscribe to get exclusive offers, new product announcements, and tips for your home appliances.
            </p>

            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-8 py-5 rounded-2xl bg-white/10 border-2 border-white/10
                         text-white placeholder:text-dark-400
                         focus:outline-none focus:border-primary-500 focus:bg-white/20
                         transition-all duration-300 hover:border-white/20"
              />
              <Magnetic strength={0.2}>
                <button
                  type="submit"
                  className="px-8 py-5 bg-gradient-to-r from-primary-500 to-amber-500 hover:from-primary-400 hover:to-amber-400
                           rounded-2xl font-bold text-dark-900 text-lg
                           transition-all duration-300 hover:scale-105 hover:shadow-glow"
                >
                  Subscribe
                </button>
              </Magnetic>
            </form>

            <p className="text-sm text-dark-400 mt-6">
              No spam, unsubscribe anytime. Privacy policy applies.
            </p>
          </div>
        </div>
      </section>
      )}

      {/* ==========================================
          BUNDLE GRID - More Bundles Section
          ========================================== */}
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

      {/* Bundle Quick View Modal */}
      <BundleQuickView
        bundle={quickViewBundle}
        isOpen={!!quickViewBundle}
        onClose={() => setQuickViewBundle(null)}
      />
    </div>
  )
}
