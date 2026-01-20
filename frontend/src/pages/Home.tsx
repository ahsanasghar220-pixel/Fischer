import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
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
import FullWidthBanner from '@/components/ui/FullWidthBanner'
import CategoryShowcase from '@/components/ui/CategoryShowcase'
import AnimatedSection, { StaggeredChildren } from '@/components/ui/AnimatedSection'
import { HoverCard } from '@/components/effects/ScrollReveal'
import { BundleCarousel, BundleGrid, BundleBanner, BundleQuickView } from '@/components/bundles'
import { useHomepageBundles, useAddBundleToCart } from '@/api/bundles'
import type { Bundle } from '@/api/bundles'
import toast from 'react-hot-toast'
import LogoSplitIntro from '@/components/home/LogoSplitIntro'
import KitchenLineArt from '@/components/home/KitchenLineArt'
import NotableClients from '@/components/home/NotableClients'

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
}

interface Product {
  id: number
  name: string
  slug: string
  price: number
  compare_price?: number | null
  primary_image?: string | null
  images?: Array<{ id: number; image: string; is_primary: boolean }>
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
  featured_products: Product[]
  new_arrivals: Product[]
  bestsellers: Product[]
  testimonials: Testimonial[]
  stats: Stat[]
  features: Feature[]
  trust_badges: TrustBadge[]
  notable_clients: NotableClient[]
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
  const [introComplete, setIntroComplete] = useState(false)

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
      console.log('Adding bundle to cart:', bundle.slug)
      const result = await addBundleToCart.mutateAsync({ bundleSlug: bundle.slug })
      console.log('Bundle added successfully:', result)
      toast.success(`${bundle.name} added to cart!`)
    } catch (err: any) {
      console.error('Failed to add bundle to cart:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add bundle to cart'
      toast.error(errorMessage)
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
  const notableClients = data?.notable_clients || []
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
    <>
      {/* Logo Split Intro Animation */}
      {!introComplete && (
        <LogoSplitIntro onComplete={() => setIntroComplete(true)} />
      )}

      <div className="bg-white dark:bg-dark-950">
      {/* ==========================================
          HERO SECTION - Performance Optimized
          ========================================== */}
      <section className="relative min-h-[100vh] flex items-center overflow-hidden">
        {/* Static Gradient Background - No animations */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950" />

          {/* Static gradient orbs - removed infinite animations */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-amber-500/8 rounded-full blur-[80px]" />

          {/* Subtle grid overlay - static */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(244,180,44,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(244,180,44,0.02)_1px,transparent_1px)] bg-[size:60px_60px] opacity-60" />
        </div>

        {/* Hero Content - CSS animations instead of framer-motion */}
        <div className="relative container-xl py-20 lg:py-32 z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content - CSS fade-in animations */}
            <div className="space-y-8 animate-fade-in-up">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full
                          bg-gradient-to-r from-primary-500/20 to-primary-400/10
                          border border-primary-500/30 backdrop-blur-sm
                          hover:scale-105 hover:border-primary-400/50
                          transition-all duration-300 cursor-default group">
                <SparklesIcon className="w-5 h-5 text-primary-400" />
                <span className="text-sm font-semibold text-primary-300 tracking-wide">
                  35+ Years of Excellence
                </span>
              </div>

              {/* Main Title */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black font-display leading-[0.9] tracking-tight">
                <span className="block text-white">
                  {banners[currentBanner]?.title?.split(' ')[0] || 'Premium'}
                </span>
                <span className="block mt-2 bg-gradient-to-r from-primary-400 via-amber-400 to-primary-500 bg-clip-text text-transparent">
                  {banners[currentBanner]?.title?.split(' ').slice(1).join(' ') || 'Home Appliances'}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl md:text-2xl text-dark-300 max-w-xl leading-relaxed font-light">
                {banners[currentBanner]?.subtitle ||
                 'ISO 9001:2015 certified products designed for Pakistani homes'}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  to={banners[currentBanner]?.button_link || '/shop'}
                  className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-amber-500 rounded-2xl font-bold text-dark-900 text-lg overflow-hidden
                           hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-1
                           active:scale-[0.98] transition-all duration-300"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                  <span className="relative">{banners[currentBanner]?.button_text || 'Explore Products'}</span>
                  <ArrowRightIcon className="relative w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
                <Link
                  to="/about"
                  className="group px-8 py-4 rounded-2xl font-semibold text-white text-lg
                           border-2 border-white/20 backdrop-blur-sm
                           hover:bg-white/10 hover:border-white/40 hover:-translate-y-1
                           active:scale-[0.98] transition-all duration-300
                           flex items-center gap-2"
                >
                  <PlayIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  Our Story
                </Link>
              </div>

              {/* Trust Badges - Simple CSS transitions */}
              <div className="flex flex-wrap gap-3 pt-6">
                {trustBadges.map((badge) => (
                  <span
                    key={badge.title}
                    className="px-4 py-2 rounded-full text-sm font-medium
                             bg-white/5 border border-white/10 text-dark-300
                             hover:bg-white/10 hover:border-primary-500/40 hover:text-primary-300 hover:scale-105
                             transition-all duration-300 cursor-default"
                  >
                    {badge.title}
                  </span>
                ))}
              </div>
            </div>

            {/* Right - Product Showcase - Static with hover effects */}
            <div className="relative animate-fade-in-up [animation-delay:200ms]">
              {/* Static decorative rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[400px] h-[400px] lg:w-[500px] lg:h-[500px] rounded-full border border-primary-500/20 opacity-40" />
                <div className="absolute w-[350px] h-[350px] lg:w-[450px] lg:h-[450px] rounded-full border border-primary-500/10 opacity-30" />
              </div>

              {/* Static glow effect */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-80 h-80 bg-primary-500/20 rounded-full blur-[100px] opacity-50" />
              </div>

              {/* Product Card with hover effects only */}
              <div className="relative mx-auto max-w-md">
                <HoverCard intensity={8} className="relative">
                <div className="relative bg-gradient-to-br from-dark-800/80 to-dark-900/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl
                              hover:border-primary-500/30 hover:shadow-primary-500/20 transition-all duration-300 group/card">
                  {/* Best Seller Badge - Static */}
                  <div className="absolute -top-4 -right-4 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-amber-500 rounded-2xl shadow-lg shadow-primary-500/30 flex items-center gap-2">
                    <FireIcon className="w-5 h-5 text-dark-900" />
                    <span className="font-bold text-dark-900">BEST SELLER</span>
                  </div>

                  {/* Product Image - No animation, just hover effect */}
                  <div className="relative h-72 flex items-center justify-center mb-6">
                    <img
                      src="/images/products/water-cooler-100ltr.png"
                      alt="Featured Product - Electric Water Cooler FE-100"
                      width={280}
                      height={280}
                      loading="eager"
                      className="max-h-full object-contain drop-shadow-2xl group-hover/card:scale-105 group-hover/card:drop-shadow-[0_25px_35px_rgba(244,180,44,0.25)] transition-all duration-300"
                      onError={(e) => {
                        e.currentTarget.src = 'https://fischerpk.com/wp-content/uploads/2022/06/electric-water-cooler-cooling-capacity-100-ltr-hr-800x800.png'
                      }}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="text-center space-y-4">
                    <div className="flex justify-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <StarSolidIcon key={i} className="w-5 h-5 text-primary-500" />
                      ))}
                      <span className="ml-2 text-dark-400 text-sm">(128 reviews)</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Electric Water Cooler FE-100</h2>
                    <p className="text-dark-400">100 Ltr/Hr Cooling Capacity</p>
                    <div className="flex items-center justify-center gap-4">
                      <span className="text-4xl font-black bg-gradient-to-r from-primary-400 to-amber-400 bg-clip-text text-transparent">
                        PKR 112,500
                      </span>
                    </div>
                    <Link
                      to="/shop"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 hover:scale-105 active:scale-[0.98] rounded-xl text-white font-medium transition-all duration-300"
                    >
                      View Details
                      <ArrowRightIcon className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
                </HoverCard>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator - Simple CSS animation */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in [animation-delay:500ms]">
          <span className="text-dark-400 text-sm font-medium animate-pulse">
            Scroll to explore
          </span>
          <div className="w-6 h-10 rounded-full border-2 border-dark-400/50 flex items-start justify-center p-1.5">
            <div className="w-1.5 h-3 bg-gradient-to-b from-primary-400 to-primary-600 rounded-full animate-scroll-bounce" />
          </div>
        </div>

        {/* Banner Navigation */}
        {banners.length > 1 && (
          <div className="absolute bottom-8 right-8 flex items-center gap-3">
            <button
              onClick={() => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-110"
              aria-label="Previous banner"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBanner(index)}
                  className={`h-2 rounded-full transition-all duration-300
                            ${index === currentBanner ? 'w-10 bg-primary-500' : 'w-2 bg-white/30 hover:bg-white/50'}`}
                  aria-label={`Go to banner ${index + 1}`}
                />
              ))}
            </div>
            <button
              onClick={() => setCurrentBanner((prev) => (prev + 1) % banners.length)}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-110"
              aria-label="Next banner"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </section>

      {/* ==========================================
          STATS BAR - Animated Section
          ========================================== */}
      {isSectionEnabled('stats') && (
      <AnimatedSection animation="fade-up" duration={1000} distance={60} threshold={0.15} easing="gentle">
        <section className="relative -mt-20 z-20">
          <div className="container-xl">
            <div className="bg-white dark:bg-dark-800 rounded-3xl shadow-2xl border border-dark-100 dark:border-dark-700 p-8 md:p-12 relative overflow-hidden">
            {/* Subtle background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-amber-500/5 pointer-events-none" />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 relative">
              {stats.map((stat) => {
                const Icon = getIcon(stat.icon)
                return (
                  <div
                    key={stat.label}
                    className="text-center group cursor-pointer hover:-translate-y-1 transition-transform duration-300"
                  >
                    <div className="inline-flex items-center justify-center w-14 h-14 mb-4 rounded-2xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className="text-4xl md:text-5xl font-black text-dark-900 dark:text-white mb-2 group-hover:text-primary-500 transition-colors duration-300">
                      <AnimatedCounter value={stat.value} />
                    </div>
                    <div className="text-dark-500 dark:text-dark-400 font-medium group-hover:text-dark-700 dark:group-hover:text-dark-300 transition-colors">
                      {stat.label}
                    </div>
                  </div>
                )
              })}
            </div>
            </div>
          </div>
        </section>
      </AnimatedSection>
      )}

      {/* ==========================================
          KITCHEN LINE ART - Interactive Product Showcase
          ========================================== */}
      <AnimatedSection animation="fade-up" duration={1200} threshold={0.05} easing="gentle">
        <KitchenLineArt />
      </AnimatedSection>

      {/* ==========================================
          FEATURES - Elegant Scroll Animation
          ========================================== */}
      {isSectionEnabled('features') && (
      <AnimatedSection animation="fade-up" duration={1100} threshold={0.08} easing="gentle">
        <section className="section bg-dark-50 dark:bg-dark-950 overflow-hidden">
          <div className="container-xl">
            <StaggeredChildren
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              staggerDelay={150}
              duration={900}
              animation="fade-up"
              easing="gentle"
              once
            >
              {features.map((feature) => {
                const Icon = getIcon(feature.icon)
                const colors = getColorClasses(feature.color)
                return (
                  <div
                    key={feature.title}
                    className="group relative p-8 rounded-3xl overflow-hidden h-full
                              bg-white dark:bg-dark-800/50 border border-dark-100 dark:border-dark-700/50
                              hover:border-primary-500/40 hover:shadow-2xl hover:shadow-primary-500/15
                              hover:-translate-y-2 transition-all duration-300"
                  >
                    {/* Gradient background on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-amber-500/0 group-hover:from-primary-500/5 group-hover:to-amber-500/5 transition-all duration-300" />

                    {/* Icon */}
                    <div
                      className={`relative w-16 h-16 ${colors.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-8 h-8" style={{ color: colors.text }} />
                    </div>

                    <h3 className="relative text-xl font-bold text-dark-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="relative text-dark-500 dark:text-dark-400 leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Border glow on hover */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-amber-400 to-primary-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left" />
                  </div>
                )
              })}
            </StaggeredChildren>
          </div>
        </section>
      </AnimatedSection>
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
        <AnimatedSection animation="fade-up" duration={1100} threshold={0.08} easing="gentle" lazy>
          <section className="section bg-white dark:bg-dark-900">
            <div className="container-xl">
              <AnimatedSection animation="fade-up" delay={150} duration={1000} easing="gentle">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                  <div>
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-600 dark:text-amber-400 text-sm font-semibold mb-4">
                      <GiftIcon className="w-4 h-4" />
                      Special Bundles
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-dark-900 dark:text-white">
                      Save More with{' '}
                      <span className="bg-gradient-to-r from-primary-500 via-amber-500 to-primary-400 bg-clip-text text-transparent">Bundles</span>
                    </h2>
                    <p className="text-xl text-dark-500 dark:text-dark-400 mt-4 max-w-xl">
                      Get the best value with our curated product bundles
                    </p>
                  </div>
                  <Link
                    to="/bundles"
                    className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-dark-900 dark:bg-white text-white dark:text-dark-900 font-semibold hover:bg-dark-800 dark:hover:bg-dark-100 transition-colors hover:shadow-lg"
                  >
                    View All Bundles
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </AnimatedSection>
              <AnimatedSection animation="fade-up" delay={300} duration={1000} easing="gentle">
                <BundleCarousel
                  bundles={homepageBundles.carousel}
                  onQuickView={setQuickViewBundle}
                  onAddToCart={handleAddBundleToCart}
                />
              </AnimatedSection>
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* ==========================================
          FULL WIDTH BANNER - Premium Series
          ========================================== */}
      <FullWidthBanner
        title="Discover Fischer Premium Series"
        subtitle="New Collection"
        description="Experience the perfect blend of innovation and elegance in modern kitchen appliances"
        image="/images/all-products.png"
        imageAlt="Fischer Premium Kitchen Appliances"
        ctaText="Explore Collection"
        ctaLink="/shop"
        textPosition="center"
        height="lg"
      />

      {/* ==========================================
          CATEGORIES - Showcase Grid
          ========================================== */}
      {isSectionEnabled('categories') && (
        <CategoryShowcase
          categories={categories.slice(0, 6).map(cat => ({
            name: cat.name,
            slug: cat.slug,
            image: cat.image,
            description: cat.description,
            productCount: cat.products_count,
          }))}
          title="Shop by Category"
          subtitle="Browse Products"
        />
      )}

      {/* ==========================================
          FEATURED PRODUCTS - Elegant Animated Grid
          ========================================== */}
      {isSectionEnabled('featured_products') && data?.featured_products && data.featured_products.length > 0 && (
        <AnimatedSection animation="fade-up" duration={1100} threshold={0.05} easing="gentle" lazy>
          <section className="section bg-dark-950 relative overflow-hidden">
            {/* Static Background Gradients */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-500/8 rounded-full blur-[120px]" />
              <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/8 rounded-full blur-[100px]" />
            </div>

            <div className="container-xl relative">
              {/* Section Header */}
              <AnimatedSection animation="fade-up" delay={150} duration={1000} easing="gentle">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                  <div>
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/20 text-primary-400 text-sm font-semibold mb-4">
                      <FireIcon className="w-4 h-4" />
                      Hand-picked for you
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-white">
                      Featured{' '}
                      <span className="bg-gradient-to-r from-primary-500 via-amber-500 to-primary-400 bg-clip-text text-transparent">Products</span>
                    </h2>
                    <p className="text-xl text-dark-400 mt-4 max-w-xl">
                      Our most popular appliances loved by customers across Pakistan
                    </p>
                  </div>
                  <Link
                    to="/shop?featured=1"
                    className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-white/20 text-white font-semibold hover:bg-white/10 hover:border-primary-500/50 hover:scale-105 active:scale-[0.98] transition-all duration-300"
                  >
                    View All Products
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </AnimatedSection>

              {/* Products Grid - Staggered Animation */}
              <StaggeredChildren
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                staggerDelay={80}
                duration={800}
                animation="fade-up"
                easing="gentle"
                once
              >
                {data.featured_products.slice(0, 10).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </StaggeredChildren>
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* ==========================================
          CTA BANNER - Become a Dealer
          ========================================== */}
      {isSectionEnabled('dealer_cta') && (
      <AnimatedSection animation="fade" duration={1200} threshold={0.1} easing="gentle">
        <section className="relative py-24 overflow-hidden">
          {/* Static Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-500 to-amber-500">
            {/* Static decorative orbs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-dark-900/15 rounded-full blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
          </div>

          <div className="relative container-xl">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Content */}
              <AnimatedSection animation="fade-right" delay={200} distance={60} duration={1100} easing="gentle">
                <div className="text-center lg:text-left">
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-dark-900/20 backdrop-blur-sm text-dark-900 text-sm font-bold mb-8">
                    <SparklesIcon className="w-5 h-5" />
                    Partnership Opportunity
                  </span>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-dark-900 leading-tight mb-8">
                    Become a Fischer
                    <span className="block text-white drop-shadow-lg">
                      Authorized Dealer
                    </span>
                  </h2>
                  <p className="text-xl text-dark-800 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                    Join our nationwide network of 500+ dealers and grow your business with
                    Pakistan's most trusted home appliance brand.
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                    <Link to="/become-dealer" className="group px-8 py-4 bg-dark-900 hover:bg-dark-800 hover:scale-105 active:scale-[0.98] rounded-2xl font-bold text-white text-lg transition-all duration-300 flex items-center gap-2 hover:shadow-xl">
                      Apply Now
                      <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link to="/contact" className="px-8 py-4 bg-white/20 hover:bg-white/30 hover:scale-105 active:scale-[0.98] backdrop-blur-sm rounded-2xl font-bold text-dark-900 text-lg transition-all duration-300">
                      Contact Sales
                    </Link>
                  </div>
                </div>
              </AnimatedSection>

              {/* Benefits Cards - Staggered grid */}
              <StaggeredChildren
                className="grid sm:grid-cols-2 gap-5"
                staggerDelay={150}
                duration={900}
                animation="fade-up"
                easing="gentle"
                once
              >
                {[
                  { title: 'Exclusive Margins', desc: 'Competitive dealer margins & incentives', icon: '💰' },
                  { title: 'Marketing Support', desc: 'Co-branded marketing materials', icon: '📢' },
                  { title: 'Training Programs', desc: 'Product & sales training', icon: '🎓' },
                  { title: 'Priority Support', desc: 'Dedicated dealer support line', icon: '🎯' },
                ].map((benefit) => (
                  <div
                    key={benefit.title}
                    className="p-6 rounded-3xl bg-dark-900/10 backdrop-blur-sm border border-dark-900/10
                             hover:bg-dark-900/20 hover:border-dark-900/20 hover:-translate-y-1 transition-all duration-300"
                  >
                    <span className="text-4xl mb-4 block">{benefit.icon}</span>
                    <h3 className="text-xl font-bold text-dark-900 mb-2">{benefit.title}</h3>
                    <p className="text-dark-800">{benefit.desc}</p>
                  </div>
                ))}
              </StaggeredChildren>
            </div>
          </div>
        </section>
      </AnimatedSection>
      )}

      {/* ==========================================
          NEW ARRIVALS - Elegant Animated Grid
          ========================================== */}
      {isSectionEnabled('new_arrivals') && data?.new_arrivals && data.new_arrivals.length > 0 && (
        <AnimatedSection animation="fade-up" duration={1100} threshold={0.08} easing="gentle" lazy>
          <section className="section bg-white dark:bg-dark-900 overflow-hidden">
            <div className="container-xl">
              <AnimatedSection animation="fade-up" delay={150} duration={1000} easing="gentle">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                  <div>
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-semibold mb-4">
                      <BoltIcon className="w-4 h-4" />
                      Just Arrived
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-dark-900 dark:text-white">
                      New{' '}
                      <span className="bg-gradient-to-r from-primary-500 via-amber-500 to-primary-400 bg-clip-text text-transparent">Arrivals</span>
                    </h2>
                    <p className="text-xl text-dark-500 dark:text-dark-400 mt-4">
                      Check out our latest additions to the catalog
                    </p>
                  </div>
                  <Link
                    to="/shop?new=1"
                    className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-dark-900 dark:bg-white text-white dark:text-dark-900 font-semibold hover:bg-dark-800 dark:hover:bg-dark-100 hover:scale-105 active:scale-[0.98] transition-all duration-300 hover:shadow-lg"
                  >
                    View All New
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </AnimatedSection>

              <StaggeredChildren
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                staggerDelay={100}
                duration={800}
                animation="fade-up"
                easing="gentle"
                once
              >
                {data.new_arrivals.slice(0, 5).map((product) => (
                  <ProductCard key={product.id} product={product} showNew />
                ))}
              </StaggeredChildren>
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* ==========================================
          TESTIMONIALS - Elegant Animated Slider
          ========================================== */}
      {isSectionEnabled('testimonials') && testimonials.length > 0 && (
      <AnimatedSection animation="fade-up" duration={1100} threshold={0.08} easing="gentle">
        <section className="section bg-dark-50 dark:bg-dark-950 relative overflow-hidden">
          {/* Static Background */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white dark:from-dark-900 to-transparent pointer-events-none" />

          <div className="container-xl relative">
            <AnimatedSection animation="fade-up" delay={150} duration={1000} easing="gentle">
              <div className="text-center mb-16">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-semibold mb-4">
                  <StarIcon className="w-4 h-4" />
                  {sections.testimonials?.title || 'Customer Reviews'}
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-dark-900 dark:text-white">
                  What Our{' '}
                  <span className="bg-gradient-to-r from-primary-500 via-amber-500 to-primary-400 bg-clip-text text-transparent">Customers</span>{' '}
                  Say
                </h2>
                <p className="text-xl text-dark-500 dark:text-dark-400 mt-4 max-w-2xl mx-auto">
                  {sections.testimonials?.subtitle || 'Trusted by thousands of Pakistani households and businesses'}
                </p>
              </div>
            </AnimatedSection>

          {/* Testimonials Slider - Simple CSS transitions */}
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {testimonials.map((testimonial, index) => {
                const initials = testimonial.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                return (
                  <div
                    key={testimonial.name}
                    className={`transition-opacity duration-500 ${
                      index === activeTestimonial
                        ? 'opacity-100'
                        : 'opacity-0 absolute inset-0 pointer-events-none'
                    }`}
                  >
                    <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] p-10 md:p-14 shadow-2xl border border-dark-100 dark:border-dark-700">
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
                )
              })}
            </div>

            {/* Navigation dots - Simple buttons */}
            <div className="flex justify-center gap-3 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`h-3 rounded-full transition-all duration-300
                            ${index === activeTestimonial ? 'w-10 bg-primary-500' : 'w-3 bg-dark-300 dark:bg-dark-600 hover:bg-primary-300'}`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
        </section>
      </AnimatedSection>
      )}

      {/* ==========================================
          WHY FISCHER - Elegant Animated Section
          ========================================== */}
      {isSectionEnabled('about') && (
      <AnimatedSection animation="fade-up" duration={1100} threshold={0.08} easing="gentle">
        <section className="section bg-white dark:bg-dark-900 overflow-hidden">
          <div className="container-xl">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left - Image */}
            <div className="relative">
              <div className="relative">
                {/* Background decoration - static */}
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
                      className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.currentTarget
                        if (!target.dataset.fallback) {
                          target.dataset.fallback = 'true'
                          target.src = '/images/about-fischer.jpg'
                        }
                      }}
                    />
                  </div>

                  {/* ISO Badge - static */}
                  <div className="absolute -bottom-8 -right-8 p-8 rounded-3xl bg-white dark:bg-dark-800 shadow-2xl border border-dark-100 dark:border-dark-700">
                    <div className="text-center">
                      <div className="text-5xl font-black bg-gradient-to-r from-primary-500 to-amber-500 bg-clip-text text-transparent">
                        ISO
                      </div>
                      <div className="text-lg font-bold text-dark-500 dark:text-dark-400">9001:2015</div>
                      <div className="text-sm text-dark-400 dark:text-dark-500">Certified</div>
                    </div>
                  </div>

                  {/* Years badge - static */}
                  <div className="absolute -top-6 -left-6 px-6 py-4 rounded-2xl bg-dark-900 text-white shadow-xl">
                    <span className="text-3xl font-black">35+</span>
                    <span className="block text-sm text-dark-300">Years</span>
                  </div>
                </div>
              </div>
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

              {/* Feature list - Simple */}
              <div className="grid sm:grid-cols-2 gap-6 mb-10">
                {[
                  'ISO 9001:2015 & PSQCA Certified',
                  'Made in Pakistan with premium materials',
                  'Nationwide service & support network',
                  'Dedicated R&D for continuous innovation',
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30
                                  flex items-center justify-center flex-shrink-0
                                  group-hover:bg-primary-500 transition-colors duration-300">
                      <CheckCircleIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-dark-700 dark:text-dark-200 font-medium">{item}</span>
                  </div>
                ))}
              </div>

              <Link to="/about" className="group inline-flex items-center gap-2 px-8 py-4 bg-dark-900 dark:bg-white hover:bg-dark-800 dark:hover:bg-dark-100 rounded-2xl font-bold text-white dark:text-dark-900 text-lg transition-colors">
                Learn More About Us
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
        </section>
      </AnimatedSection>
      )}

      {/* ==========================================
          NOTABLE CLIENTS - Trust Section
          ========================================== */}
      {notableClients.length > 0 && (
        <NotableClients clients={notableClients} speed="medium" />
      )}

      {/* ==========================================
          NEWSLETTER - Elegant Animated Section
          ========================================== */}
      {isSectionEnabled('newsletter') && (
      <AnimatedSection animation="fade-up" duration={1100} threshold={0.1} easing="gentle">
        <section className="relative py-24 overflow-hidden">
        {/* Static gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(244,180,44,0.12)_0%,transparent_70%)]" />
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
                         transition-colors duration-300 hover:border-white/20"
              />
              <button
                type="submit"
                className="px-8 py-5 bg-gradient-to-r from-primary-500 to-amber-500 hover:from-primary-400 hover:to-amber-400
                         rounded-2xl font-bold text-dark-900 text-lg transition-colors"
              >
                Subscribe
              </button>
            </form>

            <p className="text-sm text-dark-400 mt-6">
              No spam, unsubscribe anytime. Privacy policy applies.
            </p>
          </div>
        </div>
        </section>
      </AnimatedSection>
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
    </>
  )
}
