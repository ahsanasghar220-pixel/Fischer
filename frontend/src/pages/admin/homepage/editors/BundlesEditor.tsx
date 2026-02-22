import { useState, useMemo } from 'react'
import {
  ArrowTopRightOnSquareIcon,
  PlusIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  CubeIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  EyeSlashIcon,
  GiftIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import EditorPanel from '../components/EditorPanel'
import FormField from '../components/FormField'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { Section } from '../types'
import { SECTION_META } from '../types'
import { useAdminBundles, useUpdateBundle } from '@/api/bundles.admin'
import type { Bundle } from '@/api/bundles.types'

interface BundlesEditorProps {
  section: Section
  open: boolean
  onClose: () => void
  onSave: (key: string, data: { title: string; subtitle: string }) => void
  isPending: boolean
}

export default function BundlesEditor({ section, open, onClose, onSave, isPending }: BundlesEditorProps) {
  const [title, setTitle] = useState(section.title || '')
  const [subtitle, setSubtitle] = useState(section.subtitle || '')

  // Fetch all bundles (large per_page to get them all)
  const { data: bundlesData, isLoading: bundlesLoading } = useAdminBundles({ per_page: 50, sort_by: 'display_order', sort_order: 'asc' })
  const updateBundle = useUpdateBundle()

  // Extract bundles array from paginated response
  const bundles: Bundle[] = useMemo(() => {
    if (!bundlesData) return []
    // The admin endpoint returns paginated data
    return bundlesData.data || []
  }, [bundlesData])

  // Summary stats
  const summary = useMemo(() => {
    const total = bundles.length
    const onHomepage = bundles.filter(b => b.show_on_homepage).length
    const inCarousel = bundles.filter(b => b.show_on_homepage && b.homepage_position === 'carousel').length
    const inGrid = bundles.filter(b => b.show_on_homepage && b.homepage_position === 'grid').length
    const inBanner = bundles.filter(b => b.show_on_homepage && b.homepage_position === 'banner').length
    const active = bundles.filter(b => b.is_active).length
    return { total, onHomepage, inCarousel, inGrid, inBanner, active }
  }, [bundles])

  // Sorted bundles: homepage bundles first (sorted by display_order), then non-homepage
  const sortedBundles = useMemo(() => {
    const homepageBundles = bundles
      .filter(b => b.show_on_homepage)
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    const otherBundles = bundles
      .filter(b => !b.show_on_homepage)
      .sort((a, b) => a.name.localeCompare(b.name))
    return [...homepageBundles, ...otherBundles]
  }, [bundles])

  // Toggle show_on_homepage
  const handleToggleHomepage = (bundle: Bundle) => {
    const newValue = !bundle.show_on_homepage
    updateBundle.mutate(
      {
        id: bundle.id,
        show_on_homepage: newValue,
        homepage_position: newValue ? (bundle.homepage_position || 'grid') : bundle.homepage_position,
      },
      {
        onSuccess: () => toast.success(`${bundle.name} ${newValue ? 'added to' : 'removed from'} homepage`),
        onError: () => toast.error(`Failed to update ${bundle.name}`),
      }
    )
  }

  // Change homepage position
  const handlePositionChange = (bundle: Bundle, position: 'carousel' | 'grid' | 'banner') => {
    updateBundle.mutate(
      { id: bundle.id, homepage_position: position },
      {
        onSuccess: () => toast.success(`${bundle.name} moved to ${position}`),
        onError: () => toast.error(`Failed to update position for ${bundle.name}`),
      }
    )
  }

  // Change display order
  const handleOrderChange = (bundle: Bundle, newOrder: number) => {
    updateBundle.mutate(
      { id: bundle.id, display_order: newOrder },
      {
        onSuccess: () => toast.success(`Display order updated for ${bundle.name}`),
        onError: () => toast.error(`Failed to update order for ${bundle.name}`),
      }
    )
  }

  // Move bundle up/down in order
  const handleMoveBundle = (bundle: Bundle, direction: 'up' | 'down') => {
    const homepageBundles = sortedBundles.filter(b => b.show_on_homepage)
    const currentIndex = homepageBundles.findIndex(b => b.id === bundle.id)
    if (currentIndex === -1) return

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= homepageBundles.length) return

    const targetBundle = homepageBundles[targetIndex]
    const currentOrder = bundle.display_order ?? currentIndex
    const targetOrder = targetBundle.display_order ?? targetIndex

    // Swap display orders
    updateBundle.mutate(
      { id: bundle.id, display_order: targetOrder },
      {
        onSuccess: () => {
          updateBundle.mutate(
            { id: targetBundle.id, display_order: currentOrder },
            {
              onSuccess: () => toast.success('Order updated'),
              onError: () => toast.error('Failed to update order'),
            }
          )
        },
        onError: () => toast.error('Failed to update order'),
      }
    )
  }

  // Count products in a bundle
  const getProductCount = (bundle: Bundle) => {
    if (bundle.bundle_type === 'fixed') {
      return bundle.items?.length || 0
    }
    // Configurable: count unique products across all slots
    const productIds = new Set<number>()
    bundle.slots?.forEach(slot => {
      slot.products?.forEach(sp => productIds.add(sp.product_id))
    })
    return productIds.size || bundle.products_preview?.length || 0
  }

  return (
    <EditorPanel
      open={open}
      onClose={onClose}
      title={SECTION_META.bundles.label}
      description={SECTION_META.bundles.editorDescription}
      sectionKey={section.key}
      footer={
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium border border-dark-200 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700">Cancel</button>
          <button onClick={() => onSave(section.key, { title, subtitle })} disabled={isPending} className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
            {isPending && <LoadingSpinner size="sm" />}
            Save Section Settings
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Section title & subtitle */}
        <FormField label="Section Title" tooltip="The heading for the bundles section on the homepage.">
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Bundle Deals" className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white" />
        </FormField>

        <FormField label="Section Subtitle" tooltip="Supporting text below the heading.">
          <textarea value={subtitle} onChange={e => setSubtitle(e.target.value)} rows={2} placeholder="Save more with our curated product bundles" className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white" />
        </FormField>

        {/* Summary stats */}
        <div className="border-t border-dark-200 dark:border-dark-700 pt-5">
          <h3 className="text-sm font-semibold text-dark-900 dark:text-white mb-3">Summary</h3>
          {bundlesLoading ? (
            <div className="flex items-center justify-center py-4">
              <LoadingSpinner size="sm" />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-dark-50 dark:bg-dark-900/50 border border-dark-200 dark:border-dark-700 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-dark-900 dark:text-white">{summary.total}</p>
                <p className="text-xs text-dark-500 dark:text-dark-400">Total Bundles</p>
              </div>
              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-primary-700 dark:text-primary-300">{summary.onHomepage}</p>
                <p className="text-xs text-primary-600 dark:text-primary-400">On Homepage</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-green-700 dark:text-green-300">{summary.active}</p>
                <p className="text-xs text-green-600 dark:text-green-400">Active</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{summary.inCarousel}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">In Carousel</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{summary.inGrid}</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">In Grid</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-amber-700 dark:text-amber-300">{summary.inBanner}</p>
                <p className="text-xs text-amber-600 dark:text-amber-400">In Banner</p>
              </div>
            </div>
          )}
        </div>

        {/* Bundle list */}
        <div className="border-t border-dark-200 dark:border-dark-700 pt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-dark-900 dark:text-white">
              All Bundles {!bundlesLoading && `(${bundles.length})`}
            </h3>
          </div>

          {bundlesLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="md" />
            </div>
          ) : bundles.length === 0 ? (
            <div className="border border-dashed border-dark-300 dark:border-dark-600 rounded-lg p-8 text-center">
              <GiftIcon className="w-10 h-10 mx-auto text-dark-300 dark:text-dark-600 mb-3" />
              <p className="text-sm font-medium text-dark-500 dark:text-dark-400 mb-1">No bundles created yet</p>
              <p className="text-xs text-dark-400 dark:text-dark-500 mb-4">Create bundles from the Bundles management page to display them on the homepage.</p>
              <a
                href="/admin/bundles/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                Create First Bundle
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedBundles.map((bundle) => {
                const homepageBundles = sortedBundles.filter(b => b.show_on_homepage)
                const homepageIndex = homepageBundles.findIndex(b => b.id === bundle.id)
                const isFirst = homepageIndex === 0
                const isLast = homepageIndex === homepageBundles.length - 1
                const productCount = getProductCount(bundle)

                return (
                  <div
                    key={bundle.id}
                    className={`border rounded-lg p-4 transition-colors ${
                      bundle.show_on_homepage
                        ? 'border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10'
                        : 'border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-800'
                    }`}
                  >
                    {/* Row 1: Name, type badge, active indicator, homepage toggle */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {/* Bundle featured image or icon */}
                        <div className="w-9 h-9 rounded-lg bg-dark-100 dark:bg-dark-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {bundle.featured_image ? (
                            <img src={bundle.featured_image} alt={bundle.name} className="w-full h-full object-cover" />
                          ) : (
                            <GiftIcon className="w-5 h-5 text-dark-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-dark-900 dark:text-white truncate">{bundle.name}</span>
                            {/* Type badge */}
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-full flex-shrink-0 ${
                              bundle.bundle_type === 'fixed'
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                            }`}>
                              {bundle.bundle_type === 'fixed' ? (
                                <CubeIcon className="w-3 h-3" />
                              ) : (
                                <AdjustmentsHorizontalIcon className="w-3 h-3" />
                              )}
                              {bundle.bundle_type === 'fixed' ? 'Fixed' : 'Config'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {/* Active indicator */}
                            <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${
                              bundle.is_active
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-dark-400 dark:text-dark-500'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                bundle.is_active ? 'bg-green-500' : 'bg-dark-300 dark:bg-dark-600'
                              }`} />
                              {bundle.is_active ? 'Active' : 'Inactive'}
                            </span>
                            {/* Product count */}
                            <span className="text-[10px] text-dark-400 dark:text-dark-500">
                              {productCount} product{productCount !== 1 ? 's' : ''}
                            </span>
                            {/* Savings */}
                            {bundle.savings_percentage > 0 && (
                              <span className="text-[10px] font-medium text-green-600 dark:text-green-400">
                                -{bundle.savings_percentage}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Homepage toggle */}
                      <button
                        onClick={() => handleToggleHomepage(bundle)}
                        disabled={updateBundle.isPending}
                        className={`relative flex-shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-dark-800 ${
                          bundle.show_on_homepage
                            ? 'bg-primary-600'
                            : 'bg-dark-200 dark:bg-dark-600'
                        }`}
                        title={bundle.show_on_homepage ? 'Remove from homepage' : 'Add to homepage'}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                          bundle.show_on_homepage ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    {/* Row 2: Homepage settings (only when show_on_homepage is true) */}
                    {bundle.show_on_homepage && (
                      <div className="flex items-center gap-3 pt-3 border-t border-dark-100 dark:border-dark-700">
                        {/* Position dropdown */}
                        <div className="flex-1">
                          <label className="block text-[10px] font-medium text-dark-500 dark:text-dark-400 mb-1 uppercase tracking-wider">Position</label>
                          <select
                            value={bundle.homepage_position || 'grid'}
                            onChange={e => handlePositionChange(bundle, e.target.value as 'carousel' | 'grid' | 'banner')}
                            disabled={updateBundle.isPending}
                            className="w-full px-2.5 py-1.5 text-xs border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white disabled:opacity-50"
                          >
                            <option value="carousel">Carousel</option>
                            <option value="grid">Grid</option>
                            <option value="banner">Banner</option>
                          </select>
                        </div>

                        {/* Display order */}
                        <div className="w-24">
                          <label className="block text-[10px] font-medium text-dark-500 dark:text-dark-400 mb-1 uppercase tracking-wider">Order</label>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={bundle.display_order ?? 0}
                              onChange={e => handleOrderChange(bundle, parseInt(e.target.value) || 0)}
                              disabled={updateBundle.isPending}
                              min={0}
                              className="w-full px-2 py-1.5 text-xs border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white text-center disabled:opacity-50"
                            />
                          </div>
                        </div>

                        {/* Up/down arrows */}
                        <div className="flex flex-col gap-0.5 pt-3.5">
                          <button
                            onClick={() => handleMoveBundle(bundle, 'up')}
                            disabled={isFirst || updateBundle.isPending}
                            className="p-0.5 text-dark-400 hover:text-dark-600 dark:hover:text-dark-200 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move up"
                          >
                            <ChevronUpIcon className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveBundle(bundle, 'down')}
                            disabled={isLast || !bundle.show_on_homepage || updateBundle.isPending}
                            className="p-0.5 text-dark-400 hover:text-dark-600 dark:hover:text-dark-200 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move down"
                          >
                            <ChevronDownIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Visibility indicator */}
                        <div className="pt-3.5">
                          {bundle.is_active ? (
                            <EyeIcon className="w-4 h-4 text-green-500" title="Visible on homepage" />
                          ) : (
                            <EyeSlashIcon className="w-4 h-4 text-dark-400" title="Bundle is inactive - will not show on homepage" />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Warning if on homepage but inactive */}
                    {bundle.show_on_homepage && !bundle.is_active && (
                      <p className="mt-2 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded px-2 py-1">
                        This bundle is inactive and will not appear on the homepage until activated.
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="border-t border-dark-200 dark:border-dark-700 pt-5">
          <h3 className="text-sm font-semibold text-dark-900 dark:text-white mb-3">Quick Links</h3>
          <div className="flex flex-wrap gap-2">
            <a
              href="/admin/bundles"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              Manage All Bundles
            </a>
            <a
              href="/admin/bundles/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-dark-200 dark:border-dark-600 text-dark-700 dark:text-dark-300 rounded-lg hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Create New Bundle
            </a>
          </div>
        </div>
      </div>
    </EditorPanel>
  )
}
