import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon, GiftIcon } from '@heroicons/react/24/outline'
import AnimatedSection from '@/components/ui/AnimatedSection'
import type { Bundle, HomepageBundles } from '@/api/bundles.types'

const BundleCarousel = lazy(() => import('@/components/bundles').then((m) => ({ default: m.BundleCarousel })))
const BundleGrid = lazy(() => import('@/components/bundles').then((m) => ({ default: m.BundleGrid })))
const BundleBanner = lazy(() => import('@/components/bundles').then((m) => ({ default: m.BundleBanner })))

interface BundlesSectionProps {
  homepageBundles: HomepageBundles | undefined
  onQuickView: (bundle: Bundle) => void
  onAddToCart: (bundle: Bundle) => void
}

export default function BundlesSection({
  homepageBundles,
  onQuickView,
  onAddToCart,
}: BundlesSectionProps) {
  return (
    <div>
      {homepageBundles?.banner && homepageBundles.banner.length > 0 && (
        <section className="bg-dark-100 dark:bg-dark-950">
          <Suspense fallback={null}>
            <BundleBanner
              bundle={homepageBundles.banner[0]}
              onAddToCart={onAddToCart}
              variant="hero"
            />
          </Suspense>
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
                <Suspense fallback={null}>
                  <BundleCarousel
                    bundles={homepageBundles.carousel}
                    onQuickView={onQuickView}
                    onAddToCart={onAddToCart}
                  />
                </Suspense>
              </AnimatedSection>
            </div>
          </section>
        </AnimatedSection>
      )}

      {homepageBundles?.grid && homepageBundles.grid.length > 0 && (
        <Suspense fallback={null}>
          <BundleGrid
            bundles={homepageBundles.grid}
            title="More Bundle Deals"
            subtitle="Discover more ways to save with our bundle offers"
            columns={3}
            onQuickView={onQuickView}
            onAddToCart={onAddToCart}
          />
        </Suspense>
      )}
    </div>
  )
}
