import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import {
  GiftIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { useBundles } from '@/api/bundles'
import type { Bundle } from '@/api/bundles'
import BundleCard from '@/components/bundles/BundleCard'
import { BundleQuickView } from '@/components/bundles'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { StaggerContainer, StaggerItem } from '@/components/effects/ScrollReveal'

export default function Bundles() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'fixed' | 'configurable'>('all')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [quickViewBundle, setQuickViewBundle] = useState<Bundle | null>(null)

  const { data, isLoading, error } = useBundles({
    search: search || undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    sort_by: sortBy,
    per_page: 20,
  })

  const bundles = data?.data || []

  return (
    <>
      <Helmet>
        <title>Bundle Offers | Fischer Pakistan</title>
        <meta
          name="description"
          content="Save more with Fischer bundle deals. Get the best value with our curated product bundles for home appliances."
        />
      </Helmet>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 py-16 lg:py-24 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/20 text-primary-400 text-sm font-semibold mb-6">
              <GiftIcon className="w-4 h-4" />
              Special Offers
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
              Bundle{' '}
              <span className="bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent">
                Deals
              </span>
            </h1>
            <p className="text-xl text-dark-300 max-w-2xl mx-auto">
              Save more when you buy together. Explore our curated bundles featuring the best
              Fischer appliances at unbeatable prices.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters and Content */}
      <section className="py-12 bg-white dark:bg-dark-900">
        <div className="container mx-auto px-4">
          {/* Filters Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-8 p-4 bg-dark-50 dark:bg-dark-800 rounded-2xl"
          >
            {/* Search */}
            <div className="relative flex-1 max-w-md w-full">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                placeholder="Search bundles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-dark-700 border border-dark-200 dark:border-dark-600 text-dark-900 dark:text-white placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Type Filter */}
              <div className="flex items-center gap-2">
                <FunnelIcon className="w-5 h-5 text-dark-400" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
                  className="px-4 py-2.5 rounded-xl bg-white dark:bg-dark-700 border border-dark-200 dark:border-dark-600 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Bundles</option>
                  <option value="fixed">Fixed Bundles</option>
                  <option value="configurable">Build Your Own</option>
                </select>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-dark-700 border border-dark-200 dark:border-dark-600 text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="newest">Newest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="savings">Best Savings</option>
              </select>

              {/* View Mode */}
              <div className="flex items-center gap-1 p-1 bg-white dark:bg-dark-700 rounded-xl border border-dark-200 dark:border-dark-600">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-primary-500 text-white'
                      : 'text-dark-500 hover:text-dark-700 dark:hover:text-dark-300'
                  }`}
                  aria-label="Grid view"
                >
                  <Squares2X2Icon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-primary-500 text-white'
                      : 'text-dark-500 hover:text-dark-700 dark:hover:text-dark-300'
                  }`}
                  aria-label="List view"
                >
                  <ListBulletIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-20">
              <p className="text-red-500 mb-4">Failed to load bundles</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && bundles.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <GiftIcon className="w-16 h-16 text-dark-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
                No bundles found
              </h3>
              <p className="text-dark-500 dark:text-dark-400 mb-6">
                {search
                  ? `No bundles match "${search}"`
                  : 'Check back soon for new bundle offers!'}
              </p>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Clear Search
                </button>
              )}
            </motion.div>
          )}

          {/* Bundles Grid */}
          {!isLoading && !error && bundles.length > 0 && (
            <StaggerContainer
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'flex flex-col gap-4'
              }
              staggerDelay={0.1}
            >
              {bundles.map((bundle: Bundle) => (
                <StaggerItem key={bundle.id}>
                  {viewMode === 'grid' ? (
                    <BundleCard
                      bundle={bundle}
                      onQuickView={setQuickViewBundle}
                    />
                  ) : (
                    <Link
                      to={`/bundle/${bundle.slug}`}
                      className="flex items-center gap-6 p-4 bg-white dark:bg-dark-800 rounded-2xl border border-dark-100 dark:border-dark-700 hover:border-primary-500 hover:shadow-lg transition-all"
                    >
                      <img
                        src={bundle.featured_image || '/images/all-products.webp'}
                        alt={bundle.name}
                        className="w-32 h-32 object-cover rounded-xl"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded ${
                              bundle.bundle_type === 'fixed'
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                            }`}
                          >
                            {bundle.bundle_type === 'fixed' ? 'Fixed Bundle' : 'Build Your Own'}
                          </span>
                          {bundle.badge_label && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                              {bundle.badge_label}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-dark-900 dark:text-white mb-1">
                          {bundle.name}
                        </h3>
                        {bundle.short_description && (
                          <p className="text-sm text-dark-500 dark:text-dark-400 line-clamp-1 mb-2">
                            {bundle.short_description}
                          </p>
                        )}
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold text-dark-900 dark:text-white">
                            PKR {bundle.discounted_price?.toLocaleString()}
                          </span>
                          {bundle.savings > 0 && (
                            <>
                              <span className="text-sm text-dark-400 line-through">
                                PKR {bundle.original_price?.toLocaleString()}
                              </span>
                              <span className="text-sm font-semibold text-green-600">
                                Save PKR {bundle.savings?.toLocaleString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  )}
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}

          {/* Results Count */}
          {!isLoading && bundles.length > 0 && (
            <div className="mt-8 text-center text-dark-500 dark:text-dark-400">
              Showing {bundles.length} bundle{bundles.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </section>

      {/* Quick View Modal */}
      <BundleQuickView
        bundle={quickViewBundle}
        isOpen={!!quickViewBundle}
        onClose={() => setQuickViewBundle(null)}
      />
    </>
  )
}
