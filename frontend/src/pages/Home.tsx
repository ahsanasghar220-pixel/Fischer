import { useState, useEffect, lazy, Suspense, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import {
  ArrowRightIcon,
  SparklesIcon,
  StarIcon,
  BoltIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { getCategoryProductImage } from '@/lib/categoryImages'
import api from '@/lib/api'
import AnimatedSection, { StaggeredChildren } from '@/components/ui/AnimatedSection'
import { useHomepageBundles, useAddBundleToCart } from '@/api/bundles'
import type { Bundle } from '@/api/bundles.types'
import type { BannerSlide } from '@/components/ui/BannerCarousel'
import toast from 'react-hot-toast'
import type { Product } from '@/types'

// LogoSplitIntro must be eagerly imported — it's the splash screen and must
// render synchronously on first paint to cover the hero (no Suspense gap).
import LogoSplitIntro from '@/components/home/LogoSplitIntro'

// Home sub-components
import BrandStatement from './Home/BrandStatement'
import StatsSection from './Home/StatsSection'
import FeaturesSection from './Home/FeaturesSection'
import CategoriesSection from './Home/CategoriesSection'
import TestimonialsSection from './Home/TestimonialsSection'
import BundlesSection from './Home/BundlesSection'
import { defaultStats, defaultFeatures, defaultTestimonials, defaultCategoryVideos } from './Home/defaults'
import type { HomeData } from './Home/types'

// Lazy-load below-the-fold components to reduce initial bundle size
const ProductCard = lazy(() => import('@/components/products/ProductCard'))
const ProductCarousel = lazy(() => import('@/components/products/ProductCarousel'))
const QuickViewModal = lazy(() => import('@/components/products/QuickViewModal'))
const BannerCarousel = lazy(() => import('@/components/ui/BannerCarousel'))
const BundleQuickView = lazy(() => import('@/components/bundles').then(m => ({ default: m.BundleQuickView })))
const NotableClients = lazy(() => import('@/components/home/NotableClients'))
const HeroProductBanner = lazy(() => import('@/components/home/HeroProductBanner'))

export default function Home() {
  const [quickViewBundle, setQuickViewBundle] = useState<Bundle | null>(null)
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  // Synchronously check sessionStorage so repeat visitors skip the splash
  // entirely — no Suspense gap, no flash of hero content before overlay.
  const [introComplete, setIntroComplete] = useState(() => {
    try { return !!sessionStorage.getItem('fischer-intro-seen') } catch { return false }
  })
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [videoSrcReady, setVideoSrcReady] = useState(false)

  // On mobile, skip the video entirely — use the preloaded poster image as LCP
  const isMobile = useMemo(() => typeof window !== 'undefined' && window.innerWidth < 768, [])

  const { data } = useQuery<HomeData>({
    queryKey: ['home'],
    queryFn: async () => {
      const response = await api.get('/api/home')
      return response.data.data
    },
  })

  // Defer hero video loading until after initial paint to avoid blocking LCP
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(() => setVideoSrcReady(true))
      return () => cancelIdleCallback(id)
    } else {
      const timer = setTimeout(() => setVideoSrcReady(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

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
  const heroVideoUrl = sections.hero?.settings?.video_url || '/videos/hero-video.mp4?v=6'
  // Admin toggle: play video on mobile (default false = show poster for LCP)
  const heroMobileVideoEnabled: boolean = sections.hero?.settings?.mobile_video_enabled ?? false

  // Brand statement from section data
  const brandTitle = sections.brand_statement?.title || 'Premium Appliances'
  const brandSubtitle = sections.brand_statement?.subtitle || 'Crafted for Pakistan Since 1990'

  // Category videos from section settings
  const categoryVideos: Record<string, string> = sections.categories?.settings?.category_videos || defaultCategoryVideos
  // Admin toggle: play category videos on mobile (default false)
  const categoryMobileVideosEnabled: boolean = sections.categories?.settings?.mobile_videos_enabled ?? false

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
  const aboutContent = aboutSettings.content || "Established in 1990, Fischer (Fatima Engineering Works) has been at the forefront of manufacturing high-quality home and commercial appliances. With over three decades of excellence, we've become a household name trusted by millions across Pakistan."
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

  // ========== SECTION REGISTRY ==========
  // Maps section keys to their render functions for dynamic ordering
  const sectionRegistry: Record<string, () => React.ReactNode> = {
    brand_statement: () => (
      <BrandStatement key="brand_statement" title={brandTitle} subtitle={brandSubtitle} />
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
      <StatsSection key="stats" stats={stats} />
    ),

    categories: () => (
      <CategoriesSection
        key="categories"
        categories={categories}
        videoCategories={data?.video_categories}
        categoryVideos={categoryVideos}
        isMobile={isMobile && !categoryMobileVideosEnabled}
        title={sections.categories?.title}
        subtitle={sections.categories?.subtitle}
      />
    ),

    features: () => (
      <FeaturesSection
        key="features"
        title={sections.features?.title}
        features={features}
      />
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

    featured_products: () => data?.featured_products && data.featured_products.length > 0 ? (
      <AnimatedSection key="featured_products" animation="fade-up" duration={1100} threshold={0.05} easing="gentle" lazy>
        <section className="section bg-white dark:bg-dark-900 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-purple-500/6 rounded-full blur-[120px]" />
            <div className="absolute top-0 right-1/4 w-[350px] h-[350px] bg-primary-500/6 rounded-full blur-[100px]" />
          </div>
          <div className="container-xl relative">
            <AnimatedSection animation="fade-up" delay={150} duration={1000} easing="gentle">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/25 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 text-sm font-semibold mb-4">
                    <SparklesIcon className="w-4 h-4" />
                    Hand Picked
                  </span>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-dark-900 dark:text-white">
                    Featured <span className="text-primary-600 dark:text-primary-500">Products</span>
                  </h2>
                  <p className="text-xl text-dark-600 dark:text-dark-400 mt-4 max-w-xl">
                    Curated selection of our finest appliances
                  </p>
                </div>
                <Link
                  to="/shop?featured=1"
                  className="group inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-primary-500 dark:bg-primary-600 text-white font-semibold text-sm sm:text-base hover:bg-primary-600 dark:hover:bg-primary-700 hover:shadow-lg hover:-translate-y-0.5 hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  View All Featured
                  <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </AnimatedSection>
          </div>
          <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw]">
            <AnimatedSection animation="fade-up" delay={300} duration={1000} easing="gentle">
              <ProductCarousel speed={90} fadeClass="from-white dark:from-dark-900">
                {data.featured_products.slice(0, 12).map((product) => (
                  <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />
                ))}
              </ProductCarousel>
            </AnimatedSection>
          </div>
        </section>
      </AnimatedSection>
    ) : null,

    new_arrivals: () => data?.new_arrivals && data.new_arrivals.length > 0 ? (
      <AnimatedSection key="new_arrivals" animation="fade-up" duration={1100} threshold={0.05} easing="gentle" lazy>
        <section className="section bg-white dark:bg-dark-900 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-emerald-500/6 rounded-full blur-[120px]" />
            <div className="absolute top-0 right-1/4 w-[350px] h-[350px] bg-primary-500/6 rounded-full blur-[100px]" />
          </div>
          <div className="container-xl relative">
            <AnimatedSection animation="fade-up" delay={150} duration={1000} easing="gentle">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/25 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 text-sm font-semibold mb-4">
                    <BoltIcon className="w-4 h-4" />
                    Just Arrived
                  </span>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-dark-900 dark:text-white">
                    New <span className="text-primary-600 dark:text-primary-500">Arrivals</span>
                  </h2>
                  <p className="text-xl text-dark-600 dark:text-dark-400 mt-4 max-w-xl">
                    The latest additions to our product lineup
                  </p>
                </div>
                <Link
                  to="/shop?sort=latest"
                  className="group inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-primary-500 dark:bg-primary-600 text-white font-semibold text-sm sm:text-base hover:bg-primary-600 dark:hover:bg-primary-700 hover:shadow-lg hover:-translate-y-0.5 hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  View All New Arrivals
                  <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </AnimatedSection>
          </div>
          <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw]">
            <AnimatedSection animation="fade-up" delay={300} duration={1000} easing="gentle">
              <ProductCarousel speed={90} fadeClass="from-white dark:from-dark-900">
                {data.new_arrivals.slice(0, 12).map((product) => (
                  <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />
                ))}
              </ProductCarousel>
            </AnimatedSection>
          </div>
        </section>
      </AnimatedSection>
    ) : null,

    bundles: () => (
      <BundlesSection
        key="bundles"
        homepageBundles={homepageBundles}
        onQuickView={setQuickViewBundle}
        onAddToCart={handleAddBundleToCart}
      />
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
                    {sections.dealer_cta?.subtitle || "Join our nationwide network of 500+ dealers and grow your business with Pakistan's most trusted appliance brand."}
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

    testimonials: () => (
      <TestimonialsSection
        key="testimonials"
        testimonials={testimonials}
        title={sections.testimonials?.title}
        subtitle={sections.testimonials?.subtitle}
      />
    ),

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
                  {sections.about?.title || "Pakistan's Most Trusted Appliance Brand"}
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
    'bestsellers', 'featured_products', 'new_arrivals', 'bundles', 'banner_carousel',
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
          {(isMobile && !heroMobileVideoEnabled) ? (
            /* Mobile: static poster image — video is LCP killer on mobile */
            <img
              src="/images/hero-poster.webp"
              alt=""
              fetchPriority="high"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          ) : (
            <>
              <div className={`absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-950 to-primary-950/30 transition-opacity duration-700 ${videoLoaded ? 'opacity-0' : 'opacity-100'}`}>
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer-gpu" />
                </div>
              </div>
              {videoError && (
                <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-primary-950/40 to-dark-950" />
              )}
              {!videoError && <video
                className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${videoLoaded ? 'opacity-100' : 'opacity-0'} object-contain sm:object-cover object-center`}
                style={{ objectPosition: 'center center' }}
                autoPlay loop muted playsInline preload="none"
                poster="/images/hero-poster.webp"
                onCanPlayThrough={() => setVideoLoaded(true)}
                onLoadedData={() => setVideoLoaded(true)}
                onError={() => { setVideoError(true); setVideoLoaded(true) }}
              >
                {videoSrcReady && <source src={heroVideoUrl} type="video/mp4" />}
              </video>}
            </>
          )}
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
        <Suspense fallback={null}>
          {sortedSectionKeys.map((key) => {
            // Skip hero (rendered above) and sections without a renderer
            if (key === 'hero' || !sectionRegistry[key]) return null
            // Check if section is enabled (default to enabled if not in sections data)
            if (!isSectionEnabled(key)) return null
            return sectionRegistry[key]()
          })}
        </Suspense>

        {/* Modals */}
        <Suspense fallback={null}>
          <BundleQuickView bundle={quickViewBundle} isOpen={!!quickViewBundle} onClose={() => setQuickViewBundle(null)} />
          {quickViewProduct && (
            <QuickViewModal isOpen={!!quickViewProduct} onClose={() => setQuickViewProduct(null)} product={quickViewProduct} />
          )}
        </Suspense>
      </div>
    </>
  )
}
