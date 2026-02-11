import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, useInView } from 'framer-motion'
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
import QuickViewModal from '@/components/products/QuickViewModal'
import FullWidthBanner from '@/components/ui/FullWidthBanner'
import AnimatedSection, { StaggeredChildren } from '@/components/ui/AnimatedSection'
import { BundleCarousel, BundleGrid, BundleBanner, BundleQuickView } from '@/components/bundles'
import { useHomepageBundles, useAddBundleToCart } from '@/api/bundles'
import type { Bundle } from '@/api/bundles'
import toast from 'react-hot-toast'
import LogoSplitIntro from '@/components/home/LogoSplitIntro'
import KitchenLineArt from '@/components/home/KitchenLineArt'
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
  primary: { gradient: 'from-primary-500 to-primary-400', bg: 'bg-primary-500/10', text: '#722F37' },
  red: { gradient: 'from-red-500 to-rose-400', bg: 'bg-red-500/10', text: '#ef4444' },
  green: { gradient: 'from-green-500 to-emerald-400', bg: 'bg-green-500/10', text: '#22c55e' },
  cyan: { gradient: 'from-cyan-500 to-blue-400', bg: 'bg-cyan-500/10', text: '#06b6d4' },
}

// Fallback categories with actual product images
const fallbackCategories: Category[] = [
  { id: 1, name: 'Water Coolers', slug: 'water-coolers', products_count: 12, image: '/images/products/water-coolers/fe-150-ss.png' },
  { id: 2, name: 'Cooking Ranges', slug: 'cooking-ranges', products_count: 8, image: '/images/products/cooking-ranges/fcr-5bb.png' },
  { id: 3, name: 'Geysers & Heaters', slug: 'geysers-heaters', products_count: 10, image: '/images/products/hybrid-geysers/fhg-65g.png' },
  { id: 4, name: 'Built-in Hobs', slug: 'hobs-hoods', products_count: 6, image: '/images/products/hob.png' },
  { id: 5, name: 'Water Dispensers', slug: 'water-dispensers', products_count: 5, image: '/images/products/water-dispensers/fwd-fountain.png' },
  { id: 6, name: 'Storage Coolers', slug: 'storage-coolers', products_count: 4, image: '/images/products/storage-coolers/fst-200.png' },
  { id: 7, name: 'Kitchen Hoods', slug: 'kitchen-hoods', products_count: 6, image: '/images/products/hood.png' },
  { id: 8, name: 'Oven Toasters', slug: 'oven-toasters', products_count: 3, image: '/images/products/oven-toasters/fot-2501c.jpg' },
  { id: 9, name: 'Air Fryers', slug: 'air-fryers', products_count: 3, image: '/images/products/air-fryer.png' },
  { id: 10, name: 'Instant Water Heaters', slug: 'instant-electric-water-heaters', products_count: 5, image: '/images/products/instant-electric-water-heaters/fiewhs-25l.png' },
  { id: 11, name: 'Gas Water Heaters', slug: 'gas-water-heaters', products_count: 7, image: '/images/products/gas-water-heaters/fgg-55g.png' },
  { id: 12, name: 'Electric Water Heaters', slug: 'fast-electric-water-heaters', products_count: 8, image: '/images/products/fast-electric-water-heaters/ffew-f50.jpg' },
]

// Category-specific features based on client requirements
const categoryFeatures: Record<string, string[]> = {
  'kitchen-hoods': [
    'Premium Quality',
    'BLDC copper motor',
    '1 Year Warranty',
    'Energy Efficient',
    'Heat + Auto clean',
    'Gesture and Touch Control',
    'Inverter Technology A+++ rated',
    'Low noise level',
  ],
  'hobs-hoods': [
    'Complete Brass Burners',
    'Sabaf Burners',
    'EPS Burners',
    'Tempered Glass',
    'Flame Failure Device',
    'Stainless steel finish',
    '5KW powerful burners',
    'Immediate Auto Ignition',
  ],
  'built-in-hobs': [
    'Complete Brass Burners',
    'Sabaf Burners',
    'EPS Burners',
    'Tempered Glass',
    'Flame Failure Device',
    'Stainless steel finish',
    '5KW powerful burners',
    'Immediate Auto Ignition',
  ],
  'geysers-heaters': [
    'Overheating Protection',
    'Wattage Control',
    'Fully Insulated',
    'Accurate Volume Capacity',
    'Incoloy 840 heating element',
    'Imported Brass safety Valves',
  ],
  'hybrid-geysers': [
    'Overheating Protection',
    'Wattage Control',
    'Fully Insulated',
    'Accurate Volume Capacity',
    'Incoloy 840 heating element',
    'Imported Brass safety Valves',
  ],
  'gas-water-heaters': [
    'Overheating Protection',
    'Wattage Control',
    'Fully Insulated',
    'Accurate Volume Capacity',
    'Incoloy 840 heating element',
    'Imported Brass safety Valves',
  ],
  'instant-electric-water-heaters': [
    'Overheating Protection',
    'Wattage Control',
    'Fully Insulated',
    'Accurate Volume Capacity',
    'Incoloy 840 heating element',
    'Imported Brass safety Valves',
  ],
  'fast-electric-water-heaters': [
    'Overheating Protection',
    'Wattage Control',
    'Fully Insulated',
    'Accurate Volume Capacity',
    'Incoloy 840 heating element',
    'Imported Brass safety Valves',
  ],
  'oven-toasters': [
    'Double Layered Glass door',
    'Inner lamp',
    'Rotisserie Function',
    'Convection Function',
    'Stainless steel elements',
  ],
  'water-dispensers': [
    'Food-grade stainless steel tanks',
    'Eco-friendly refrigerants',
    '100% copper coiling',
  ],
  'air-fryers': [
    'Digital Touch panel',
    'Wide Temperature Control',
    'Injection molding texture',
    'Non-stick coating',
    'Bottom heater for Even temperature control',
  ],
  'water-coolers': [
    'Adjustable Thermostat',
    'Food Grade Non Magnetic stainless steel',
    'High back pressure compressor',
    'Spring loaded push button',
  ],
  'storage-coolers': [
    'Adjustable Thermostat',
    'Food Grade Non Magnetic stainless steel',
    'High back pressure compressor',
    'Spring loaded push button',
  ],
  'cooking-ranges': [
    'Complete Brass Burners',
    'Tempered Glass',
    'Flame Failure Device',
    'Stainless steel finish',
    '5KW powerful burners',
    'Auto Ignition',
  ],
  'blenders-processors': [
    'Multi-Function Food processing',
    'Precision stainless steel blades & Discs',
    'Pulse & Speed control',
    'Generous Capacity',
  ],
}

// Get features for a category by slug
const getCategoryFeatures = (slug: string): string[] => {
  return categoryFeatures[slug] || ['Premium Quality', 'Energy Efficient', '1 Year Warranty', 'Latest Technology']
}

// Fotile-Inspired Category Showcase - Clean Split-Screen Layout
interface CategoryShowcaseProps {
  category: Category
  index: number
}

function CategoryShowcase({ category, index }: CategoryShowcaseProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const isEven = index % 2 === 0

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
      {/* Image Side - Clean, no crazy animations */}
      <div className={`relative ${!isEven ? 'lg:order-2' : ''}`}>
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-dark-800">
          {category.image ? (
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-contain p-4 transition-transform duration-700 hover:scale-105"
              onError={(e) => {
                const target = e.currentTarget
                target.style.display = 'none'
                const fallback = target.nextElementSibling as HTMLElement
                if (fallback) fallback.classList.remove('hidden')
              }}
            />
          ) : null}
          <div className={`${category.image ? 'hidden' : 'flex'} absolute inset-0 w-full h-full bg-gradient-to-br from-primary-50 to-primary-100
                        dark:from-primary-900/20 dark:to-primary-800/10
                        items-center justify-center`}>
            <div className="w-48 h-48 text-primary-600 dark:text-primary-400">
              {getCategoryIcon(category.name)}
            </div>
          </div>
        </div>
      </div>

      {/* Content Side */}
      <div className={`${!isEven ? 'lg:order-1' : ''}`}>
        <div className="space-y-6">
          {/* Category name */}
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark-900 dark:text-white">
            {category.name}
          </h3>

          {/* Features list - Category-specific bullet points only */}
          <div className="grid sm:grid-cols-2 gap-3">
            {getCategoryFeatures(category.slug).slice(0, 6).map(
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

          {/* CTA Button - Simple hover */}
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
}

// Get category icon based on name - Enhanced with better icons
const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase()

  // Water Coolers - Water drop icon
  if (name.includes('water') && name.includes('cooler')) {
    return (
      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.25c-2.313 0-4.5 1.35-6 3.75-1.5 2.4-2.25 5.25-2.25 7.5 0 4.556 3.694 8.25 8.25 8.25s8.25-3.694 8.25-8.25c0-2.25-.75-5.1-2.25-7.5-1.5-2.4-3.687-3.75-6-3.75zm0 16.5c-3.308 0-6-2.692-6-6 0-1.8.6-4.2 1.8-6.15C9 4.65 10.5 3.75 12 3.75s3 .9 4.2 2.85c1.2 1.95 1.8 4.35 1.8 6.15 0 3.308-2.692 6-6 6z" />
        <path d="M12 8.25c-.621 0-1.125.504-1.125 1.125v4.125c0 .621.504 1.125 1.125 1.125s1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125z" />
      </svg>
    )
  }

  // Geysers - Flame/Hot Water icon
  if (name.includes('geyser') || name.includes('heater')) {
    return (
      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 011.925-3.545 3.75 3.75 0 013.255 3.717z" clipRule="evenodd" />
      </svg>
    )
  }

  // Cooking Ranges - Stove/Fire icon
  if (name.includes('cooking') || name.includes('range')) {
    return (
      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 3h18a1 1 0 011 1v3a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1zm0 6h18a1 1 0 011 1v10a2 2 0 01-2 2H4a2 2 0 01-2-2V10a1 1 0 011-1zm3 3a2 2 0 100 4 2 2 0 000-4zm6 0a2 2 0 100 4 2 2 0 000-4zm6 0a2 2 0 100 4 2 2 0 000-4z" />
      </svg>
    )
  }

  // Hobs - Grid/Burner icon
  if (name.includes('hob')) {
    return (
      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6 3a3 3 0 00-3 3v12a3 3 0 003 3h12a3 3 0 003-3V6a3 3 0 00-3-3H6zm1 3a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4zM7 14a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z" />
      </svg>
    )
  }

  // Kitchen Hoods - Wind/Ventilation icon
  if (name.includes('hood')) {
    return (
      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
      </svg>
    )
  }

  // Water Dispensers - Dispenser icon
  if (name.includes('dispenser')) {
    return (
      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 3a1 1 0 011-1h4a1 1 0 011 1v1h3a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h3V3zm3 8a2 2 0 100 4 2 2 0 000-4z" />
        <path d="M11 16a1 1 0 011-1h.01a1 1 0 110 2H12a1 1 0 01-1-1z" />
      </svg>
    )
  }

  // Deep Freezers - Snowflake icon
  if (name.includes('freezer') || name.includes('freeze')) {
    return (
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m0-18l-3 3m3-3l3 3M3 12h18m-3-3l-3 3m6 0l-3 3M9 9L6 12m3 3l-3 3m3-3l3 3m0 0l3-3" />
      </svg>
    )
  }

  // Default icon - Grid of squares
  return (
    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 3a3 3 0 00-3 3v2.25a3 3 0 003 3h2.25a3 3 0 003-3V6a3 3 0 00-3-3H6zM15.75 3a3 3 0 00-3 3v2.25a3 3 0 003 3H18a3 3 0 003-3V6a3 3 0 00-3-3h-2.25zM6 12.75a3 3 0 00-3 3V18a3 3 0 003 3h2.25a3 3 0 003-3v-2.25a3 3 0 00-3-3H6zM15.75 12.75a3 3 0 00-3 3V18a3 3 0 003 3H18a3 3 0 003-3v-2.25a3 3 0 00-3-3h-2.25z" />
    </svg>
  )
}

export default function Home() {
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [quickViewBundle, setQuickViewBundle] = useState<Bundle | null>(null)
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [introComplete, setIntroComplete] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)

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

  // Auto-slide testimonials
  useEffect(() => {
    if (!testimonials.length) return
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [testimonials.length])

  // Merge API categories with fallback images to ensure real product images
  const categories = data?.categories?.length
    ? data.categories.map(cat => {
        // Find matching fallback category to get the image (flexible matching)
        const catSlug = cat.slug?.toLowerCase() || ''
        const catName = cat.name?.toLowerCase() || ''
        const fallback = fallbackCategories.find(fc => {
          const fcSlug = fc.slug.toLowerCase()
          const fcName = fc.name.toLowerCase()
          // Match by exact slug, name, or partial match
          return fcSlug === catSlug ||
                 fcName === catName ||
                 catSlug.includes(fcSlug) ||
                 fcSlug.includes(catSlug) ||
                 catName.includes(fcName.split(' ')[0]) ||
                 fcName.includes(catName.split(' ')[0])
        })
        return {
          ...cat,
          // Always prefer fallback image for consistency with real product photos
          image: fallback?.image || cat.image || undefined
        }
      })
    : fallbackCategories

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
            SECTION 1: VIDEO HERO SECTION - MINIMAL
            ========================================== */}
        <section className="relative h-[45vh] min-h-[400px] sm:h-[65vh] md:h-[75vh] lg:h-[85vh] xl:h-screen w-full overflow-hidden bg-dark-950">
          {/* Loading placeholder - shows gradient while video loads */}
          <div
            className={`absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-950 to-primary-950/30 transition-opacity duration-700 ${
              videoLoaded ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {/* Animated gradient shimmer while loading */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
          </div>

          {/* Video Background - with smooth fade-in and mobile-optimized positioning */}
          <video
            className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${
              videoLoaded ? 'opacity-100' : 'opacity-0'
            } object-cover object-center`}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            onCanPlayThrough={() => setVideoLoaded(true)}
            onLoadedData={() => setVideoLoaded(true)}
            onError={() => {
              console.error('Video failed to load')
              setVideoLoaded(true)
            }}
          >
            <source src="/videos/hero-video.mp4?v=2" type="video/mp4" />
          </video>

          {/* Subtle overlay for visual depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-dark-950/30 via-transparent to-dark-950/60" />

          {/* Scroll Indicator - Hidden on mobile to save space */}
          <div className="hidden sm:flex absolute bottom-12 left-1/2 -translate-x-1/2 z-10">
            <div className="flex flex-col items-center gap-2 text-white">
              <span className="text-sm font-medium tracking-wider opacity-80">Scroll</span>
              <svg
                className="w-6 h-6 animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </section>

        {/* ==========================================
            SECTION 2: BRAND STATEMENT - NEW
            ========================================== */}
        <AnimatedSection animation="fade-up" duration={800} threshold={0.1} easing="gentle">
          <section className="section bg-white dark:bg-dark-900">
            <div className="container-xl text-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-dark-900 dark:text-white mb-6">
                Premium Appliances
              </h2>
              <p className="text-xl md:text-2xl text-dark-600 dark:text-dark-400 max-w-3xl mx-auto">
                Crafted for Pakistan Since 1990
              </p>
            </div>
          </section>
        </AnimatedSection>

        {/* ==========================================
            SECTION 2.5: HERO PRODUCT BANNER
            ========================================== */}
        <HeroProductBanner />

        {/* ==========================================
            SECTION 3: CATEGORIES GRID - FOTILE STYLE
            ========================================== */}
        {isSectionEnabled('categories') && (
          <AnimatedSection animation="fade-up" duration={800} threshold={0.08} easing="gentle">
            <section className="section bg-dark-50 dark:bg-dark-900">
              <div className="container-xl">
                {/* Section Header */}
                <div className="text-center mb-8 sm:mb-10 md:mb-12">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-dark-900 dark:text-white mb-4">
                    Shop by Category
                  </h2>
                  <p className="text-lg text-dark-600 dark:text-dark-400 max-w-2xl mx-auto">
                    Discover our comprehensive range of premium appliances
                  </p>
                </div>

                {/* Categories Grid - Dark Card Style */}
                <StaggeredChildren
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
                  staggerDelay={100}
                  duration={600}
                  animation="fade-up"
                  easing="gentle"
                  once
                >
                  {categories.slice(0, 6).map((category) => (
                    <Link
                      key={category.id}
                      to={`/category/${category.slug}`}
                      className="group block"
                    >
                      <div className="relative bg-white dark:bg-[#141414] rounded-2xl overflow-hidden
                                    border border-dark-200 dark:border-transparent
                                    shadow-md dark:shadow-none
                                    hover:shadow-xl hover-lift
                                    hover:scale-[1.02]
                                    transition-all duration-300">
                        {/* Category Image */}
                        <div className="aspect-[4/3] overflow-hidden bg-dark-100 dark:bg-dark-800 relative">
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-full h-full object-contain bg-white dark:bg-dark-800 group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                // Hide the image and show fallback icon
                                e.currentTarget.style.display = 'none'
                                const fallbackDiv = e.currentTarget.nextElementSibling as HTMLElement
                                if (fallbackDiv) fallbackDiv.style.display = 'flex'
                              }}
                            />
                          ) : null}
                          {/* Fallback icon - shown when no image or image fails */}
                          <div
                            className={`w-full h-full bg-gradient-to-br from-dark-100 to-dark-200 dark:from-dark-700 dark:to-dark-800 items-center justify-center absolute inset-0 ${category.image ? 'hidden' : 'flex'}`}
                          >
                            <div className="w-32 h-32 text-dark-400 dark:text-dark-600">
                              {getCategoryIcon(category.name)}
                            </div>
                          </div>

                          {/* Minimal overlay on hover */}
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>

                        {/* Content - Minimal */}
                        <div className="p-5">
                          <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">
                            {category.name}
                          </h3>
                          <p className="text-dark-500 dark:text-dark-400 text-sm">
                            {category.products_count} Products
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </StaggeredChildren>

                {/* View All Link */}
                <div className="text-center mt-10">
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                             bg-primary-500 dark:bg-primary-600
                             text-white
                             font-semibold
                             hover:bg-primary-600 dark:hover:bg-primary-700
                             hover:shadow-lg hover:-translate-y-0.5
                             transition-all duration-300"
                  >
                    View All Products
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </section>
          </AnimatedSection>
        )}

        {/* ==========================================
            SECTION 4: STATS SECTION - CLEAN PROFESSIONAL
            ========================================== */}
        {isSectionEnabled('stats') && (
          <AnimatedSection animation="fade-up" duration={800} threshold={0.15} easing="gentle">
            <section className="section bg-white dark:bg-dark-950">
              <div className="container-xl">
                {/* Stats Grid - More whitespace */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12 lg:gap-16">
                  {stats.map((stat) => {
                    return (
                      <div
                        key={stat.label}
                        className="text-center"
                      >
                        {/* Value - Red Accent */}
                        <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary-500 dark:text-primary-600 mb-3">
                          <AnimatedCounter value={stat.value} />
                        </div>

                        {/* Label */}
                        <div className="text-sm md:text-base text-dark-600 dark:text-dark-400 font-medium">
                          {stat.label}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>
          </AnimatedSection>
        )}

        {/* ==========================================
            SECTION 6: CATEGORY SHOWCASE - FOTILE SPLIT SCREEN
            ========================================== */}
        {categories.length > 0 && (
          <section className="section bg-white dark:bg-dark-900">
            <div className="container-xl">
              {/* Section Header */}
              <AnimatedSection animation="fade-up" duration={800} easing="gentle">
                <div className="text-center mb-10 sm:mb-12 md:mb-16">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-dark-900 dark:text-white mb-4">
                    Explore Our Collections
                  </h2>
                  <p className="text-lg text-dark-600 dark:text-dark-400 max-w-2xl mx-auto">
                    Each category carefully curated with premium quality and innovative designs
                  </p>
                </div>
              </AnimatedSection>

              {/* Categories Detail - Split Screen Alternating */}
              <div className="space-y-24 overflow-hidden">
                {categories.slice(0, 4).map((category, index) => (
                  <CategoryShowcase key={category.id} category={category} index={index} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ==========================================
            KITCHEN LINE ART - Interactive Product Showcase
            ========================================== */}
        <AnimatedSection animation="fade-up" duration={1200} threshold={0.05} easing="gentle">
          <KitchenLineArt />
        </AnimatedSection>

        {/* ==========================================
            SECTION 7: WHY CHOOSE FISCHER - CLEAN 4-COLUMN
            ========================================== */}
        {isSectionEnabled('features') && (
          <AnimatedSection animation="fade-up" duration={800} threshold={0.08} easing="gentle">
            <section className="section bg-dark-50 dark:bg-dark-950">
              <div className="container-xl">
                {/* Section Header */}
                <div className="text-center mb-8 sm:mb-10 md:mb-12">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-dark-900 dark:text-white mb-4">
                    Why Choose Fischer
                  </h2>
                </div>

                <StaggeredChildren
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
                  staggerDelay={100}
                  duration={600}
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
                        className="text-center p-4 sm:p-6 hover-lift"
                      >
                        {/* Icon */}
                        <div className={`inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 ${colors.bg} rounded-2xl mb-4`}>
                          <Icon className="w-6 h-6 md:w-8 md:h-8" style={{ color: colors.text }} />
                        </div>

                        <h3 className="text-lg font-bold text-dark-900 dark:text-white mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-dark-600 dark:text-dark-400 leading-relaxed">
                          {feature.description}
                        </p>
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
          <section className="bg-dark-100 dark:bg-dark-950">
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
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                                     bg-gradient-to-r from-primary-100 to-primary-50
                                     dark:from-primary-900/30 dark:to-primary-800/30
                                     text-primary-700 dark:text-primary-400 text-sm font-semibold mb-4">
                        <GiftIcon className="w-4 h-4" />
                        Special Bundles
                      </span>
                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-dark-900 dark:text-white">
                        Save More with{' '}
                        <span className="text-primary-600 dark:text-primary-400">Bundles</span>
                      </h2>
                      <p className="text-xl text-dark-500 dark:text-dark-400 mt-4 max-w-xl">
                        Get the best value with our curated product bundles
                      </p>
                    </div>
                    <Link
                      to="/bundles"
                      className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl
                               bg-primary-500 dark:bg-primary-600
                               text-white font-semibold
                               hover:bg-primary-600 dark:hover:bg-primary-700
                               hover:shadow-lg hover:-translate-y-0.5
                               transition-all duration-300"
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
          description="Experience the perfect blend of innovation and elegance in modern appliances"
          image="/images/all-products.png"
          imageAlt="Fischer Premium Appliances"
          ctaText="Explore Collection"
          ctaLink="/shop"
          textPosition="center"
          height="lg"
        />

        {/* ==========================================
            FEATURED PRODUCTS - Elegant Animated Grid
            ========================================== */}
        {isSectionEnabled('featured_products') && data?.featured_products && data.featured_products.length > 0 && (
          <AnimatedSection animation="fade-up" duration={1100} threshold={0.05} easing="gentle" lazy>
            <section className="section bg-dark-100 dark:bg-dark-950 relative overflow-hidden">
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
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                                     bg-primary-500/20 text-primary-600 dark:text-primary-400
                                     text-sm font-semibold mb-4">
                        <FireIcon className="w-4 h-4" />
                        Hand-picked for you
                      </span>
                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-dark-900 dark:text-white">
                        Featured{' '}
                        <span className="text-primary-600 dark:text-primary-400">Products</span>
                      </h2>
                      <p className="text-xl text-dark-500 dark:text-dark-400 mt-4 max-w-xl">
                        Our most popular appliances loved by customers across Pakistan
                      </p>
                    </div>
                    <Link
                      to="/shop?featured=1"
                      className="group inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl
                               bg-primary-500 dark:bg-primary-600
                               text-white font-semibold text-sm sm:text-base
                               hover:bg-primary-600 dark:hover:bg-primary-700
                               hover:shadow-lg hover:-translate-y-0.5 hover:scale-105
                               active:scale-95 transition-all duration-300"
                    >
                      View All Products
                      <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </AnimatedSection>

                {/* Products Grid - Staggered Animation */}
                <StaggeredChildren
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6"
                  staggerDelay={80}
                  duration={800}
                  animation="fade-up"
                  easing="gentle"
                  once
                >
                  {data.featured_products.slice(0, 10).map((product) => (
                    <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />
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
              {/* Muted, sophisticated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-dark-800 via-dark-900 to-dark-950">
                {/* Subtle accent orbs */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary-600/8 rounded-full blur-3xl" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
              </div>

              <div className="relative container-xl">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                  {/* Content */}
                  <AnimatedSection animation="fade-right" delay={200} distance={60} duration={1100} easing="gentle">
                    <div className="text-center lg:text-left">
                      <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full
                                     bg-primary-500/20 backdrop-blur-sm text-primary-400
                                     text-sm font-bold mb-8">
                        <SparklesIcon className="w-5 h-5" />
                        Partnership Opportunity
                      </span>
                      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 sm:mb-8">
                        Become a Fischer
                        <span className="block text-primary-400">
                          Authorized Dealer
                        </span>
                      </h2>
                      <p className="text-xl text-dark-300 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                        Join our nationwide network of 500+ dealers and grow your business with
                        Pakistan's most trusted appliance brand.
                      </p>
                      <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                        <Link
                          to="/become-dealer"
                          className="group px-8 py-4 bg-primary-500 hover:bg-primary-600
                                   hover:-translate-y-0.5 active:scale-[0.98] rounded-xl font-semibold
                                   text-white transition-all duration-300
                                   flex items-center gap-2 hover:shadow-lg"
                        >
                          Apply Now
                          <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                          to="/contact"
                          className="px-8 py-4 bg-white/10 hover:bg-white/20 hover:-translate-y-0.5
                                   active:scale-[0.98] backdrop-blur-sm rounded-xl font-semibold
                                   text-white transition-all duration-300
                                   border border-white/20"
                        >
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
                        className="p-6 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/10
                                 hover:bg-white/15 hover:border-white/20 hover:-translate-y-1
                                 transition-all duration-300"
                      >
                        <span className="text-4xl mb-4 block">{benefit.icon}</span>
                        <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                        <p className="text-dark-300">{benefit.desc}</p>
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
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                                     bg-emerald-100 dark:bg-emerald-900/30
                                     text-emerald-600 dark:text-emerald-400
                                     text-sm font-semibold mb-4">
                        <BoltIcon className="w-4 h-4" />
                        Just Arrived
                      </span>
                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-dark-900 dark:text-white">
                        New{' '}
                        <span className="text-primary-600 dark:text-primary-400">Arrivals</span>
                      </h2>
                      <p className="text-xl text-dark-500 dark:text-dark-400 mt-4">
                        Check out our latest additions to the catalog
                      </p>
                    </div>
                    <Link
                      to="/shop?new=1"
                      className="group inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl
                               bg-primary-500 dark:bg-primary-600
                               text-white font-semibold text-sm sm:text-base
                               hover:bg-primary-600 dark:hover:bg-primary-700
                               hover:shadow-lg hover:-translate-y-0.5 hover:scale-105
                               active:scale-95 transition-all duration-300"
                    >
                      View All New
                      <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </AnimatedSection>

                <StaggeredChildren
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6"
                  staggerDelay={100}
                  duration={800}
                  animation="fade-up"
                  easing="gentle"
                  once
                >
                  {data.new_arrivals.slice(0, 5).map((product) => (
                    <ProductCard key={product.id} product={product} showNew onQuickView={setQuickViewProduct} />
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
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                                   bg-primary-100 dark:bg-primary-900/30
                                   text-primary-600 dark:text-primary-400
                                   text-sm font-semibold mb-4">
                      <StarIcon className="w-4 h-4" />
                      {sections.testimonials?.title || 'Customer Reviews'}
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-dark-900 dark:text-white">
                      What Our{' '}
                      <span className="text-primary-600 dark:text-primary-400">Customers</span>{' '}
                      Say
                    </h2>
                    <p className="text-xl text-dark-500 dark:text-dark-400 mt-4 max-w-2xl mx-auto">
                      {sections.testimonials?.subtitle || 'Trusted by thousands of Pakistani households and businesses'}
                    </p>
                  </div>
                </AnimatedSection>

                {/* Testimonials Slider */}
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
                          <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] p-10 md:p-14
                                        shadow-2xl border border-dark-100 dark:border-dark-700">
                            {/* Quote icon */}
                            <div className="text-6xl text-primary-500/20 mb-6">"</div>

                            {/* Content */}
                            <p className="text-2xl md:text-3xl text-dark-700 dark:text-dark-200
                                        leading-relaxed mb-10 font-light">
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
                                  className="w-16 h-16 rounded-2xl object-cover
                                           ring-4 ring-primary-100 dark:ring-primary-900/30"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                    const fallback = e.currentTarget.nextElementSibling as HTMLElement
                                    if (fallback) fallback.classList.remove('hidden')
                                  }}
                                />
                              ) : null}
                              <div className={`w-16 h-16 rounded-2xl
                                             bg-primary-100 dark:bg-primary-900/30
                                             ${testimonial.image ? 'hidden' : 'flex'}
                                             items-center justify-center`}>
                                <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                                  {initials}
                                </span>
                              </div>
                              <div>
                                <p className="text-xl font-bold text-dark-900 dark:text-white">
                                  {testimonial.name}
                                </p>
                                <p className="text-dark-500 dark:text-dark-400">
                                  {testimonial.role}
                                </p>
                              </div>
                              <div className="ml-auto flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <StarSolidIcon
                                    key={i}
                                    className={`w-6 h-6 ${
                                      i < testimonial.rating
                                        ? 'text-primary-500'
                                        : 'text-dark-200 dark:text-dark-700'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Navigation dots */}
                  <div className="flex justify-center gap-3 mt-8">
                    {testimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveTestimonial(index)}
                        className={`h-3 rounded-full transition-all duration-300
                                  ${index === activeTestimonial
                                    ? 'w-10 bg-primary-500'
                                    : 'w-3 bg-dark-300 dark:bg-dark-600 hover:bg-primary-300'}`}
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
                      {/* Background decoration */}
                      <div className="absolute -inset-10 pointer-events-none">
                        <div className="w-full h-full bg-gradient-to-r from-primary-500/20 to-primary-500/20
                                      rounded-[4rem] blur-3xl opacity-50" />
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

                        {/* ISO Badge */}
                        <div className="absolute -bottom-8 -right-8 p-8 rounded-3xl
                                      bg-white dark:bg-dark-800 shadow-2xl
                                      border border-dark-100 dark:border-dark-700">
                          <div className="text-center">
                            <div className="text-5xl font-black text-primary-600 dark:text-primary-400">
                              ISO
                            </div>
                            <div className="text-lg font-bold text-dark-500 dark:text-dark-400">
                              9001:2015
                            </div>
                            <div className="text-sm text-dark-400 dark:text-dark-500">Certified</div>
                          </div>
                        </div>

                        {/* Years badge */}
                        <div className="absolute -top-6 -left-6 px-6 py-4 rounded-2xl
                                      bg-dark-900 text-white shadow-xl">
                          <span className="text-3xl font-black">35+</span>
                          <span className="block text-sm text-dark-300">Years</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right - Content */}
                  <div>
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                                   bg-primary-100 dark:bg-primary-900/30
                                   text-primary-600 dark:text-primary-400
                                   text-sm font-semibold mb-6">
                      <SparklesIcon className="w-4 h-4" />
                      About Fischer
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-dark-900 dark:text-white mb-6 sm:mb-8 leading-tight">
                      Pakistan's Most{' '}
                      <span className="text-primary-600 dark:text-primary-400">Trusted</span>{' '}
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
                        <div key={index} className="flex items-center gap-4 group">
                          <div className="w-10 h-10 rounded-xl
                                        bg-primary-100 dark:bg-primary-900/30
                                        flex items-center justify-center flex-shrink-0
                                        group-hover:bg-primary-500 transition-colors duration-300">
                            <CheckCircleIcon className="w-5 h-5 text-primary-600 dark:text-primary-400
                                                      group-hover:text-white transition-colors" />
                          </div>
                          <span className="text-dark-700 dark:text-dark-200 font-medium">{item}</span>
                        </div>
                      ))}
                    </div>

                    <Link
                      to="/about"
                      className="group inline-flex items-center gap-2 px-6 py-3
                               bg-primary-500 dark:bg-primary-600 hover:bg-primary-600 dark:hover:bg-primary-700
                               rounded-xl font-semibold text-white
                               hover:shadow-lg hover:-translate-y-0.5
                               transition-all duration-300"
                    >
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
          <NotableClients clients={notableClients} speed="fast" />
        )}

        {/* ==========================================
            SECTION 9: NEWSLETTER - RED CTA
            ========================================== */}
        {isSectionEnabled('newsletter') && (
          <AnimatedSection animation="fade-up" duration={800} threshold={0.1} easing="gentle">
            <section className="section bg-dark-900 dark:bg-[#0A0A0A]">
              <div className="container-xl">
                <div className="max-w-2xl mx-auto text-center">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                    Get Exclusive Offers
                  </h2>
                  <p className="text-lg text-dark-300 mb-8">
                    Subscribe to get exclusive offers, new product announcements, and tips for your home appliances.
                  </p>

                  <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      className="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-white/20
                               text-white placeholder:text-dark-400
                               focus:outline-none focus:border-primary-500
                               transition-colors duration-300"
                    />
                    <button
                      type="submit"
                      className="px-6 py-4 bg-primary-500 hover:bg-primary-600
                               rounded-xl font-semibold text-white transition-colors"
                    >
                      Subscribe
                    </button>
                  </form>

                  <p className="text-sm text-dark-500 mt-4">
                    No spam, unsubscribe anytime.
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

        {/* Product Quick View Modal */}
        {quickViewProduct && (
          <QuickViewModal
            isOpen={!!quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
            product={quickViewProduct}
          />
        )}
      </div>
    </>
  )
}
