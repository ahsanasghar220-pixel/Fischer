import { useState, useEffect } from 'react'
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
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon, CheckCircleIcon } from '@heroicons/react/24/solid'
import api from '@/lib/api'
import ProductCard from '@/components/products/ProductCard'
import CategoryIcon from '@/components/ui/CategoryIcon'

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

interface HomeData {
  banners: Banner[]
  categories: Category[]
  featured_products: Product[]
  new_arrivals: Product[]
  bestsellers: Product[]
}

// Statistics for the hero section
const stats = [
  { label: 'Years Experience', value: '35+', icon: StarIcon },
  { label: 'Happy Customers', value: '500K+', icon: CheckCircleIcon },
  { label: 'Dealers Nationwide', value: '500+', icon: CubeIcon },
  { label: 'Products Sold', value: '1M+', icon: FireIcon },
]

// Features for the USP section
const features = [
  {
    icon: TruckIcon,
    title: 'Free Nationwide Delivery',
    description: 'Free shipping on orders above PKR 10,000 across Pakistan',
    color: 'from-blue-500 to-cyan-400',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: ShieldCheckIcon,
    title: '1 Year Warranty',
    description: 'Official warranty on all products with dedicated support',
    color: 'from-emerald-500 to-teal-400',
    bgColor: 'bg-emerald-500/10',
  },
  {
    icon: CreditCardIcon,
    title: 'Flexible Payment',
    description: 'Multiple payment options including COD & Easy Installments',
    color: 'from-purple-500 to-pink-400',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: PhoneIcon,
    title: '24/7 Support',
    description: 'Round-the-clock customer service and technical support',
    color: 'from-orange-500 to-amber-400',
    bgColor: 'bg-orange-500/10',
  },
]

// Testimonials
const testimonials = [
  {
    name: 'Ahmed Khan',
    role: 'Homeowner, Lahore',
    content: 'Fischer water cooler has been serving our office for 3 years without any issues. Excellent build quality and after-sales service.',
    rating: 5,
    avatar: 'AK',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  },
  {
    name: 'Sara Malik',
    role: 'Restaurant Owner',
    content: 'We installed Fischer cooking ranges in our restaurant. The performance is outstanding and very fuel efficient.',
    rating: 5,
    avatar: 'SM',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
  },
  {
    name: 'Usman Ali',
    role: 'Dealer, Karachi',
    content: 'Being a Fischer dealer for 10 years, I can vouch for their product quality and excellent dealer support program.',
    rating: 5,
    avatar: 'UA',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  },
]

// Brands we work with
const trustedBrands = [
  'ISO 9001:2015', 'PSQCA Certified', 'Made in Pakistan', 'CE Approved', 'Eco Friendly'
]

export default function Home() {
  const [currentBanner, setCurrentBanner] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  const { data, isLoading } = useQuery<HomeData>({
    queryKey: ['home'],
    queryFn: async () => {
      const response = await api.get('/home')
      return response.data.data
    },
  })

  // Animation on mount
  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Auto-slide banners
  useEffect(() => {
    if (!data?.banners?.length) return
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % data.banners.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [data?.banners?.length])

  // Auto-slide testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-50 dark:bg-dark-950">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary-500/30 rounded-full animate-spin border-t-primary-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <SparklesIcon className="w-8 h-8 text-primary-500 animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-dark-500 dark:text-dark-400 animate-pulse font-medium">Loading amazing products...</p>
        </div>
      </div>
    )
  }

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

  return (
    <div className="overflow-hidden bg-white dark:bg-dark-950 transition-colors">
      {/* ==========================================
          HERO SECTION - Ultra Modern Animated Hero
          ========================================== */}
      <section className="relative min-h-[100vh] flex items-center overflow-hidden">
        {/* Animated Mesh Gradient Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950" />

          {/* Animated gradient orbs - static positions for faster initial paint */}
          <div
            className="absolute w-[800px] h-[800px] rounded-full opacity-30 blur-[120px]"
            style={{
              background: 'radial-gradient(circle, rgba(244,180,44,0.4) 0%, transparent 70%)',
              left: '20%',
              top: '10%',
              transform: 'translate(-50%, -50%)',
              willChange: 'transform',
            }}
          />
          <div
            className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[100px]"
            style={{
              background: 'radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 70%)',
              right: '10%',
              bottom: '20%',
              willChange: 'transform',
            }}
          />
          <div
            className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-[80px]"
            style={{
              background: 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)',
              left: '60%',
              top: '60%',
              transform: 'translate(-50%, -50%)',
            }}
          />

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(244,180,44,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(244,180,44,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />

          {/* Noise texture */}
          <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
        </div>

        {/* Floating Particles - Deferred to not block initial paint */}
        {isVisible && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-primary-500/40 rounded-full animate-float"
                style={{
                  left: `${10 + (i * 7) % 80}%`,
                  top: `${5 + (i * 11) % 90}%`,
                  animationDelay: `${i * 0.4}s`,
                  animationDuration: `${6 + (i % 4) * 2}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Hero Content */}
        <div className="relative container-xl py-20 lg:py-32 z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className={`space-y-8 transition-all duration-1000 delay-300
                           ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {/* Animated Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full
                            bg-gradient-to-r from-primary-500/20 to-primary-400/10
                            border border-primary-500/30 backdrop-blur-sm
                            animate-pulse-slow">
                <div className="relative">
                  <SparklesIcon className="w-5 h-5 text-primary-400" />
                  <div className="absolute inset-0 animate-ping">
                    <SparklesIcon className="w-5 h-5 text-primary-400 opacity-50" />
                  </div>
                </div>
                <span className="text-sm font-semibold text-primary-300 tracking-wide">
                  35+ Years of Excellence
                </span>
              </div>

              {/* Main Title with Gradient */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black font-display leading-[0.9] tracking-tight">
                <span className="block text-white">
                  {banners[currentBanner]?.title?.split(' ')[0] || 'Premium'}
                </span>
                <span className="block mt-2 bg-gradient-to-r from-primary-400 via-primary-500 to-amber-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                  {banners[currentBanner]?.title?.split(' ').slice(1).join(' ') || 'Home Appliances'}
                </span>
              </h1>

              {/* Animated Subtitle */}
              <p className="text-xl md:text-2xl text-dark-300 max-w-xl leading-relaxed font-light">
                {banners[currentBanner]?.subtitle ||
                 'Experience the perfect blend of innovation and reliability with Pakistan\'s most trusted appliance brand.'}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  to={banners[currentBanner]?.button_link || '/shop'}
                  className="group relative px-8 py-4 bg-gradient-to-r from-primary-500 to-amber-500 rounded-2xl font-bold text-dark-900 text-lg
                           overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-glow-lg"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {banners[currentBanner]?.button_text || 'Explore Products'}
                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-primary-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
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
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-3 pt-6">
                {trustedBrands.map((brand, index) => (
                  <span
                    key={brand}
                    className="px-4 py-2 rounded-full text-sm font-medium
                             bg-white/5 border border-white/10 text-dark-300
                             animate-fade-in-up"
                    style={{ animationDelay: `${800 + index * 100}ms` }}
                  >
                    {brand}
                  </span>
                ))}
              </div>
            </div>

            {/* Right - 3D Product Showcase */}
            <div className={`relative transition-all duration-1000 delay-500
                           ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              {/* Rotating Ring */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[400px] h-[400px] lg:w-[500px] lg:h-[500px] rounded-full border border-primary-500/20 animate-spin-slow" />
                <div className="absolute w-[350px] h-[350px] lg:w-[450px] lg:h-[450px] rounded-full border border-primary-500/10 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '20s' }} />
              </div>

              {/* Glow effect */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-80 h-80 bg-primary-500/20 rounded-full blur-[100px] animate-pulse-slow" />
              </div>

              {/* Product Card */}
              <div className="relative mx-auto max-w-md">
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
                      fetchPriority="high"
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
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-dark-400 text-sm font-medium">Scroll to explore</span>
          <div className="w-6 h-10 rounded-full border-2 border-dark-400 flex items-start justify-center p-1">
            <div className="w-1.5 h-3 bg-primary-500 rounded-full animate-slide-up" />
          </div>
        </div>

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
      <section className="relative -mt-20 z-20">
        <div className="container-xl">
          <div className="bg-white dark:bg-dark-800 rounded-3xl shadow-2xl border border-dark-100 dark:border-dark-700 p-8 md:p-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div
                    key={stat.label}
                    className="text-center group animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="inline-flex items-center justify-center w-14 h-14 mb-4 rounded-2xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className="text-4xl md:text-5xl font-black text-dark-900 dark:text-white mb-2">
                      {stat.value}
                    </div>
                    <div className="text-dark-500 dark:text-dark-400 font-medium">
                      {stat.label}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          FEATURES - Bento Grid Style
          ========================================== */}
      <section className="section bg-dark-50 dark:bg-dark-950">
        <div className="container-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className={`group relative p-8 rounded-3xl overflow-hidden
                            bg-white dark:bg-dark-800/50 border border-dark-100 dark:border-dark-700/50
                            hover:border-transparent hover:shadow-2xl
                            transition-all duration-500 hover:-translate-y-2
                            animate-fade-in-up`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                  {/* Icon */}
                  <div className={`relative w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className={`w-8 h-8 bg-gradient-to-r ${feature.color} bg-clip-text`} style={{ color: 'transparent', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} />
                    <Icon className={`w-8 h-8 absolute`} style={{ background: `linear-gradient(to right, var(--tw-gradient-stops))`, WebkitBackgroundClip: 'text' }} />
                  </div>

                  <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-dark-500 dark:text-dark-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ==========================================
          CATEGORIES - Modern Cards with Hover Effects
          ========================================== */}
      {data?.categories && data.categories.length > 0 && (
        <section className="section bg-white dark:bg-dark-900">
          <div className="container-xl">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-semibold mb-4">
                  <CubeIcon className="w-4 h-4" />
                  Browse Products
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-dark-900 dark:text-white">
                  Shop by <span className="text-gradient">Category</span>
                </h2>
                <p className="text-xl text-dark-500 dark:text-dark-400 mt-4 max-w-xl">
                  Explore our complete range of home and commercial appliances
                </p>
              </div>
              <Link
                to="/categories"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-dark-900 dark:bg-white text-white dark:text-dark-900 font-semibold hover:bg-dark-800 dark:hover:bg-dark-100 transition-colors"
              >
                View All
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {data.categories.slice(0, 6).map((category, index) => (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  className="group relative animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-dark-100 to-dark-50 dark:from-dark-800 dark:to-dark-900 p-6
                                border-2 border-transparent hover:border-primary-500
                                transition-all duration-500 hover:shadow-2xl hover:shadow-primary-500/20">
                    {/* Background Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-500/0 group-hover:from-primary-500/10 group-hover:to-amber-500/10 transition-all duration-500" />

                    {/* Icon/Image */}
                    <div className="relative h-full flex flex-col items-center justify-center">
                      <div className="group-hover:scale-125 transition-transform duration-500">
                        <CategoryIcon slug={category.slug} className="w-20 h-20" />
                      </div>
                    </div>

                    {/* Overlay with info */}
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-dark-900/90 via-dark-900/50 to-transparent translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <h3 className="font-bold text-white text-center truncate">{category.name}</h3>
                      <p className="text-sm text-dark-300 text-center">{category.products_count} Products</p>
                    </div>
                  </div>

                  {/* Category Name (visible by default) */}
                  <div className="mt-4 text-center group-hover:opacity-0 transition-opacity duration-300">
                    <h3 className="font-bold text-dark-900 dark:text-white truncate">{category.name}</h3>
                    <p className="text-sm text-dark-500 dark:text-dark-400">{category.products_count} Products</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==========================================
          FEATURED PRODUCTS - Premium Showcase
          ========================================== */}
      {data?.featured_products && data.featured_products.length > 0 && (
        <section className="section bg-dark-950 relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[150px]" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px]" />
          </div>

          <div className="container-xl relative">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/20 text-primary-400 text-sm font-semibold mb-4">
                  <FireIcon className="w-4 h-4" />
                  Hand-picked for you
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-white">
                  Featured <span className="text-gradient">Products</span>
                </h2>
                <p className="text-xl text-dark-400 mt-4 max-w-xl">
                  Our most popular appliances loved by customers across Pakistan
                </p>
              </div>
              <Link
                to="/shop?featured=1"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-white/20 text-white font-semibold hover:bg-white/10 transition-colors"
              >
                View All Products
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {data.featured_products.slice(0, 10).map((product, index) => (
                <div
                  key={product.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==========================================
          CTA BANNER - Become a Dealer (Stunning)
          ========================================== */}
      <section className="relative py-32 overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-500 to-amber-500">
          {/* Animated shapes */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-dark-900/20 rounded-full blur-3xl animate-blob animation-delay-200" />

          {/* Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        </div>

        <div className="relative container-xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full
                            bg-dark-900/20 backdrop-blur-sm text-dark-900 text-sm font-bold mb-8">
                <SparklesIcon className="w-5 h-5" />
                Partnership Opportunity
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-dark-900 leading-tight mb-8">
                Become a Fischer
                <span className="block text-white drop-shadow-lg">Authorized Dealer</span>
              </h2>
              <p className="text-xl text-dark-800 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Join our nationwide network of 500+ dealers and grow your business with
                Pakistan's most trusted home appliance brand.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link to="/become-dealer" className="group px-8 py-4 bg-dark-900 hover:bg-dark-800 rounded-2xl font-bold text-white text-lg transition-all hover:scale-105 hover:shadow-2xl flex items-center gap-2">
                  Apply Now
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/contact" className="px-8 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl font-bold text-dark-900 text-lg transition-all">
                  Contact Sales
                </Link>
              </div>
            </div>

            {/* Benefits Cards */}
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                { title: 'Exclusive Margins', desc: 'Competitive dealer margins & incentives', icon: '💰' },
                { title: 'Marketing Support', desc: 'Co-branded marketing materials', icon: '📢' },
                { title: 'Training Programs', desc: 'Product & sales training', icon: '🎓' },
                { title: 'Priority Support', desc: 'Dedicated dealer support line', icon: '🎯' },
              ].map((benefit, index) => (
                <div
                  key={benefit.title}
                  className="p-6 rounded-3xl bg-dark-900/10 backdrop-blur-sm border border-dark-900/10
                           hover:bg-dark-900/20 transition-all duration-300 hover:-translate-y-1
                           animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="text-4xl mb-4 block">{benefit.icon}</span>
                  <h3 className="text-xl font-bold text-dark-900 mb-2">{benefit.title}</h3>
                  <p className="text-dark-800">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          NEW ARRIVALS - Horizontal Scroll
          ========================================== */}
      {data?.new_arrivals && data.new_arrivals.length > 0 && (
        <section className="section bg-white dark:bg-dark-900">
          <div className="container-xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-semibold mb-4">
                  <BoltIcon className="w-4 h-4" />
                  Just Arrived
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-dark-900 dark:text-white">
                  New <span className="text-gradient">Arrivals</span>
                </h2>
                <p className="text-xl text-dark-500 dark:text-dark-400 mt-4">
                  Check out our latest additions to the catalog
                </p>
              </div>
              <Link
                to="/shop?new=1"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-dark-900 dark:bg-white text-white dark:text-dark-900 font-semibold hover:bg-dark-800 dark:hover:bg-dark-100 transition-colors"
              >
                View All New
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {data.new_arrivals.slice(0, 5).map((product, index) => (
                <div
                  key={product.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProductCard product={product} showNew />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==========================================
          TESTIMONIALS - Modern Slider
          ========================================== */}
      <section className="section bg-dark-50 dark:bg-dark-950 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white dark:from-dark-900 to-transparent" />

        <div className="container-xl relative">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-semibold mb-4">
              <StarIcon className="w-4 h-4" />
              Customer Reviews
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-dark-900 dark:text-white">
              What Our <span className="text-gradient">Customers</span> Say
            </h2>
            <p className="text-xl text-dark-500 dark:text-dark-400 mt-4 max-w-2xl mx-auto">
              Trusted by thousands of Pakistani households and businesses
            </p>
          </div>

          {/* Testimonials Slider */}
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.name}
                  className={`transition-all duration-700 ${
                    index === activeTestimonial
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-8 absolute inset-0 pointer-events-none'
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
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-2xl object-cover ring-4 ring-primary-100 dark:ring-primary-900/30"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                      <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 hidden items-center justify-center">
                        <span className="text-xl font-bold text-primary-600 dark:text-primary-400">{testimonial.avatar}</span>
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
              ))}
            </div>

            {/* Navigation dots */}
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

      {/* ==========================================
          WHY FISCHER - Premium Section
          ========================================== */}
      <section className="section bg-white dark:bg-dark-900 overflow-hidden">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left - Image with effects */}
            <div className="relative">
              {/* Background decoration */}
              <div className="absolute -inset-10 bg-gradient-to-r from-primary-500/20 to-amber-500/20 rounded-[4rem] blur-3xl opacity-50" />

              <div className="relative">
                <div className="rounded-[2.5rem] overflow-hidden shadow-2xl">
                  <img
                    src="/images/about-fischer.jpg"
                    alt="Fischer Factory - Manufacturing Facility"
                    width={600}
                    height={450}
                    className="w-full aspect-[4/3] object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&q=80'
                    }}
                  />
                </div>

                {/* Floating ISO Badge */}
                <div className="absolute -bottom-8 -right-8 p-8 rounded-3xl bg-white dark:bg-dark-800 shadow-2xl border border-dark-100 dark:border-dark-700
                              animate-float">
                  <div className="text-center">
                    <div className="text-5xl font-black bg-gradient-to-r from-primary-500 to-amber-500 bg-clip-text text-transparent">
                      ISO
                    </div>
                    <div className="text-lg font-bold text-dark-500 dark:text-dark-400">9001:2015</div>
                    <div className="text-sm text-dark-400 dark:text-dark-500">Certified</div>
                  </div>
                </div>

                {/* Years badge */}
                <div className="absolute -top-6 -left-6 px-6 py-4 rounded-2xl bg-dark-900 text-white shadow-xl">
                  <span className="text-3xl font-black">35+</span>
                  <span className="block text-sm text-dark-300">Years</span>
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
                Pakistan's Most <span className="text-gradient">Trusted</span> Appliance Brand
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
                    <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30
                                  flex items-center justify-center flex-shrink-0
                                  group-hover:bg-primary-500 transition-colors">
                      <CheckCircleIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-dark-700 dark:text-dark-200 font-medium">{item}</span>
                  </div>
                ))}
              </div>

              <Link to="/about" className="group inline-flex items-center gap-2 px-8 py-4 bg-dark-900 dark:bg-white hover:bg-dark-800 dark:hover:bg-dark-100 rounded-2xl font-bold text-white dark:text-dark-900 text-lg transition-all hover:scale-105">
                Learn More About Us
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          NEWSLETTER - Eye-catching Design
          ========================================== */}
      <section className="relative py-24 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(244,180,44,0.15)_0%,transparent_70%)]" />
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(244,180,44,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(244,180,44,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />
        </div>

        <div className="relative container-xl">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full
                          bg-primary-500/20 border border-primary-500/30 text-primary-400 text-sm font-semibold mb-8">
              <BoltIcon className="w-5 h-5" />
              Stay Updated
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
              Get Exclusive <span className="text-gradient">Offers</span>
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
                         transition-all duration-300"
              />
              <button
                type="submit"
                className="px-8 py-5 bg-gradient-to-r from-primary-500 to-amber-500 hover:from-primary-400 hover:to-amber-400
                         rounded-2xl font-bold text-dark-900 text-lg
                         transition-all duration-300 hover:scale-105 hover:shadow-glow"
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
    </div>
  )
}
