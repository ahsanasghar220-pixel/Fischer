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
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import api from '@/lib/api'
import ProductCard from '@/components/products/ProductCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

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

// Category icons based on Fischer's product lines
const categoryIcons: Record<string, string> = {
  'water-coolers': '❄️',
  'geysers-heaters': '🔥',
  'cooking-ranges': '🍳',
  'hobs-hoods': '💨',
  'water-dispensers': '💧',
  'kitchen-appliances': '🏠',
}

// Statistics for the hero section
const stats = [
  { label: 'Years Experience', value: '35+' },
  { label: 'Happy Customers', value: '500K+' },
  { label: 'Dealers Nationwide', value: '500+' },
  { label: 'Products Sold', value: '1M+' },
]

// Features for the USP section
const features = [
  {
    icon: TruckIcon,
    title: 'Free Nationwide Delivery',
    description: 'Free shipping on orders above PKR 10,000 across Pakistan',
    color: 'bg-blue-500',
  },
  {
    icon: ShieldCheckIcon,
    title: '1 Year Warranty',
    description: 'Official warranty on all products with dedicated support',
    color: 'bg-emerald-500',
  },
  {
    icon: CreditCardIcon,
    title: 'Flexible Payment',
    description: 'Multiple payment options including COD & Easy Installments',
    color: 'bg-purple-500',
  },
  {
    icon: PhoneIcon,
    title: '24/7 Support',
    description: 'Round-the-clock customer service and technical support',
    color: 'bg-orange-500',
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
  },
  {
    name: 'Sara Malik',
    role: 'Restaurant Owner',
    content: 'We installed Fischer cooking ranges in our restaurant. The performance is outstanding and very fuel efficient.',
    rating: 5,
    avatar: 'SM',
  },
  {
    name: 'Usman Ali',
    role: 'Dealer, Karachi',
    content: 'Being a Fischer dealer for 10 years, I can vouch for their product quality and excellent dealer support program.',
    rating: 5,
    avatar: 'UA',
  },
]

export default function Home() {
  const [currentBanner, setCurrentBanner] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-50 dark:bg-dark-950">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-dark-500 dark:text-dark-400 animate-pulse">Loading amazing products...</p>
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
    <div className="overflow-hidden">
      {/* ==========================================
          HERO SECTION - Stunning animated hero
          ========================================== */}
      <section ref={heroRef} className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
          {/* Pattern overlay */}
          <div className="absolute inset-0 bg-hero-pattern opacity-30" />

          {/* Floating orbs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl animate-blob animation-delay-200" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl animate-blob animation-delay-400" />
        </div>

        {/* Banner Images (Background) */}
        <div className="absolute inset-0">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-all duration-1000
                         ${index === currentBanner ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
            >
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&q=80'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-dark-900/95 via-dark-900/70 to-dark-900/40" />
            </div>
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative container-xl py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className={`space-y-8 transition-all duration-1000 delay-300
                           ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                            bg-primary-500/20 border border-primary-500/30 backdrop-blur-sm">
                <SparklesIcon className="w-4 h-4 text-primary-400" />
                <span className="text-sm font-medium text-primary-300">Since 1990 - Made in Pakistan</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold font-display text-white leading-tight">
                {banners[currentBanner]?.title || 'Quality Home Appliances'}
                <span className="block text-gradient mt-2">For Every Home</span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-dark-300 max-w-xl leading-relaxed">
                {banners[currentBanner]?.subtitle ||
                 'Discover our range of ISO certified water coolers, geysers, cooking ranges and more. Trusted by over 500,000 Pakistani households.'}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link
                  to={banners[currentBanner]?.button_link || '/shop'}
                  className="btn btn-primary btn-lg group"
                >
                  {banners[currentBanner]?.button_text || 'Shop Now'}
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/about"
                  className="btn btn-outline btn-lg border-white/30 text-white hover:bg-white hover:text-dark-900"
                >
                  <PlayIcon className="w-5 h-5" />
                  Watch Story
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-white/10">
                {stats.map((stat, index) => (
                  <div
                    key={stat.label}
                    className={`text-center transition-all duration-700
                              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{ transitionDelay: `${600 + index * 100}ms` }}
                  >
                    <div className="text-2xl md:text-3xl font-bold text-primary-400">{stat.value}</div>
                    <div className="text-sm text-dark-400 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Featured Product/Image */}
            <div className={`hidden lg:block relative transition-all duration-1000 delay-500
                           ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-primary-400/20 blur-3xl rounded-full" />

                {/* Product showcase card */}
                <div className="relative glass-card p-8 rounded-3xl">
                  <div className="absolute -top-4 -right-4 px-4 py-2 bg-primary-500 rounded-xl shadow-lg">
                    <span className="font-bold text-dark-900">BEST SELLER</span>
                  </div>
                  <img
                    src="/images/featured-product.png"
                    alt="Featured Product"
                    className="w-full h-80 object-contain animate-float"
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/400x400/27272a/f4b42c?text=Fischer'
                    }}
                  />
                  <div className="text-center mt-6">
                    <h3 className="text-xl font-bold text-white">Electric Water Cooler FE-100</h3>
                    <p className="text-dark-400 mt-1">100 Ltr/Hr Capacity</p>
                    <div className="mt-4 flex items-center justify-center gap-4">
                      <span className="text-3xl font-bold text-primary-400">PKR 112,500</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Banner Navigation */}
        {banners.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
            <button
              onClick={() => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBanner(index)}
                  className={`h-2 rounded-full transition-all duration-300
                            ${index === currentBanner ? 'w-8 bg-primary-500' : 'w-2 bg-white/30 hover:bg-white/50'}`}
                />
              ))}
            </div>
            <button
              onClick={() => setCurrentBanner((prev) => (prev + 1) % banners.length)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </section>

      {/* ==========================================
          FEATURES BAR - Trust indicators
          ========================================== */}
      <section className="relative z-10 -mt-16">
        <div className="container-xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="card p-6 flex items-start gap-4 hover:shadow-xl transition-all duration-300
                           animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-900 dark:text-white">{feature.title}</h3>
                    <p className="text-sm text-dark-500 dark:text-dark-400 mt-1 hidden md:block">
                      {feature.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ==========================================
          CATEGORIES - Browse by category
          ========================================== */}
      {data?.categories && data.categories.length > 0 && (
        <section className="section bg-white dark:bg-dark-900">
          <div className="container-xl">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <span className="text-primary-500 font-semibold text-sm uppercase tracking-wider">
                  Browse Products
                </span>
                <h2 className="section-title mt-2">Shop by Category</h2>
                <p className="section-subtitle mt-2">
                  Explore our wide range of home appliances
                </p>
              </div>
              <Link
                to="/categories"
                className="btn btn-outline btn-sm self-start md:self-auto"
              >
                View All Categories
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
              {data.categories.slice(0, 6).map((category, index) => (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  className="group relative p-6 rounded-2xl text-center
                           bg-dark-50 dark:bg-dark-800/50
                           hover:bg-primary-50 dark:hover:bg-primary-900/20
                           border border-dark-100 dark:border-dark-700
                           hover:border-primary-200 dark:hover:border-primary-800
                           transition-all duration-300 hover:-translate-y-1
                           animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Icon/Image */}
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl
                                bg-white dark:bg-dark-700
                                flex items-center justify-center
                                group-hover:scale-110 group-hover:shadow-lg
                                transition-all duration-300">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-12 h-12 object-contain"
                      />
                    ) : (
                      <span className="text-4xl">
                        {categoryIcons[category.slug] || '📦'}
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="font-semibold text-dark-900 dark:text-white
                               group-hover:text-primary-600 dark:group-hover:text-primary-400
                               transition-colors">
                    {category.name}
                  </h3>

                  {/* Count */}
                  <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
                    {category.products_count} Products
                  </p>

                  {/* Hover arrow */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100
                                translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    <ArrowRightIcon className="w-5 h-5 text-primary-500" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==========================================
          FEATURED PRODUCTS - Showcase bestsellers
          ========================================== */}
      {data?.featured_products && data.featured_products.length > 0 && (
        <section className="section bg-dark-50 dark:bg-dark-950">
          <div className="container-xl">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <span className="text-primary-500 font-semibold text-sm uppercase tracking-wider">
                  Hand-picked for you
                </span>
                <h2 className="section-title mt-2">Featured Products</h2>
                <p className="section-subtitle mt-2">
                  Our most popular appliances loved by customers
                </p>
              </div>
              <Link
                to="/shop?featured=1"
                className="btn btn-outline btn-sm self-start md:self-auto"
              >
                View All
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
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
          CTA BANNER - Become a dealer
          ========================================== */}
      <section className="relative py-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900 to-dark-800">
          <div className="absolute inset-0 bg-hero-pattern opacity-20" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-primary-500/10 blur-3xl" />
        </div>

        <div className="relative container-xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                            bg-primary-500/20 border border-primary-500/30 text-primary-300 text-sm font-medium">
                <SparklesIcon className="w-4 h-4" />
                Partnership Opportunity
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mt-6 mb-6">
                Become a Fischer
                <span className="text-primary-400"> Dealer</span>
              </h2>
              <p className="text-lg text-dark-300 mb-8 max-w-xl mx-auto lg:mx-0">
                Join our nationwide network of 500+ dealers and grow your business with
                Pakistan's trusted home appliance brand.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link to="/dealer/register" className="btn btn-primary btn-lg">
                  Apply Now
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
                <Link to="/contact" className="btn btn-ghost text-white btn-lg hover:bg-white/10">
                  Contact Sales
                </Link>
              </div>
            </div>

            {/* Benefits */}
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: 'Exclusive Margins', desc: 'Competitive dealer margins & incentives' },
                { title: 'Marketing Support', desc: 'Co-branded marketing materials' },
                { title: 'Training Programs', desc: 'Product & sales training' },
                { title: 'Priority Support', desc: 'Dedicated dealer support line' },
              ].map((benefit, index) => (
                <div
                  key={benefit.title}
                  className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10
                           hover:bg-white/10 transition-colors duration-300"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center mb-4">
                    <span className="text-primary-400 font-bold">{index + 1}</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">{benefit.title}</h3>
                  <p className="text-sm text-dark-400">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          NEW ARRIVALS
          ========================================== */}
      {data?.new_arrivals && data.new_arrivals.length > 0 && (
        <section className="section bg-white dark:bg-dark-900">
          <div className="container-xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <span className="text-primary-500 font-semibold text-sm uppercase tracking-wider">
                  Just Arrived
                </span>
                <h2 className="section-title mt-2">New Arrivals</h2>
                <p className="section-subtitle mt-2">
                  Check out our latest additions to the catalog
                </p>
              </div>
              <Link
                to="/shop?new=1"
                className="btn btn-outline btn-sm self-start md:self-auto"
              >
                View All New
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
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
          TESTIMONIALS
          ========================================== */}
      <section className="section bg-dark-50 dark:bg-dark-950">
        <div className="container-xl">
          <div className="text-center mb-12">
            <span className="text-primary-500 font-semibold text-sm uppercase tracking-wider">
              Customer Reviews
            </span>
            <h2 className="section-title mt-2">What Our Customers Say</h2>
            <p className="section-subtitle mt-2 mx-auto">
              Trusted by thousands of Pakistani households and businesses
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className="card p-8 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarSolidIcon
                      key={i}
                      className={`w-5 h-5 ${i < testimonial.rating ? 'text-primary-500' : 'text-dark-200 dark:text-dark-700'}`}
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-dark-600 dark:text-dark-300 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30
                                flex items-center justify-center">
                    <span className="font-bold text-primary-600 dark:text-primary-400">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-dark-900 dark:text-white">{testimonial.name}</p>
                    <p className="text-sm text-dark-500 dark:text-dark-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          WHY FISCHER - Company strengths
          ========================================== */}
      <section className="section bg-white dark:bg-dark-900">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Image */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/20 to-primary-400/10 rounded-3xl blur-2xl" />
              <div className="relative rounded-3xl overflow-hidden">
                <img
                  src="/images/about-fischer.jpg"
                  alt="Fischer Factory"
                  className="w-full aspect-[4/3] object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&q=80'
                  }}
                />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-6 -right-6 p-6 rounded-2xl bg-white dark:bg-dark-800 shadow-xl">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-500">ISO</div>
                  <div className="text-sm text-dark-500 dark:text-dark-400">9001:2015</div>
                  <div className="text-xs text-dark-400 dark:text-dark-500">Certified</div>
                </div>
              </div>
            </div>

            {/* Right - Content */}
            <div>
              <span className="text-primary-500 font-semibold text-sm uppercase tracking-wider">
                About Fischer
              </span>
              <h2 className="section-title mt-2 mb-6">
                Pakistan's Trusted Home Appliance Brand
              </h2>
              <p className="text-dark-600 dark:text-dark-300 mb-8 leading-relaxed">
                Established in 1990, Fischer (Fatima Engineering Works) has been at the
                forefront of manufacturing high-quality home and commercial appliances.
                With over three decades of excellence, we've become a household name
                trusted by millions across Pakistan.
              </p>

              {/* Features list */}
              <div className="space-y-4 mb-8">
                {[
                  'ISO 9001:2015 & PSQCA Certified',
                  'Made in Pakistan with premium materials',
                  'Nationwide service & support network',
                  'Dedicated R&D for continuous innovation',
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30
                                  flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-dark-700 dark:text-dark-200">{item}</span>
                  </div>
                ))}
              </div>

              <Link to="/about" className="btn btn-primary">
                Learn More About Us
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          NEWSLETTER - Email signup
          ========================================== */}
      <section className="relative py-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 gradient-animated" />

        <div className="relative container-xl">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-900 mb-4">
              Stay Updated
            </h2>
            <p className="text-dark-700 mb-8">
              Subscribe to get exclusive offers, new product announcements, and tips for your home appliances.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-xl border-2 border-dark-900/10
                         bg-white/80 backdrop-blur-sm text-dark-900
                         placeholder:text-dark-500
                         focus:outline-none focus:ring-2 focus:ring-dark-900 focus:border-transparent"
              />
              <button type="submit" className="btn bg-dark-900 text-white hover:bg-dark-800 px-8 py-4">
                Subscribe
              </button>
            </form>
            <p className="text-sm text-dark-600 mt-4">
              No spam, unsubscribe anytime. Privacy policy applies.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
