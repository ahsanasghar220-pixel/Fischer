import { useState, useEffect } from 'react'
import { XMarkIcon, ChevronUpIcon, ChevronDownIcon, PhotoIcon } from '@heroicons/react/24/outline'
import EditorPanel from '../components/EditorPanel'
import FormField from '../components/FormField'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { Section, HomepageData } from '../types'
import { SECTION_META } from '../types'

interface FeaturedProductsEditorProps {
  section: Section
  data: HomepageData
  open: boolean
  onClose: () => void
  onSaveSection: (key: string, data: { title: string; subtitle: string; settings?: Record<string, any> }) => void
  onSaveProducts: (section: string, productIds: number[]) => void
  isSectionPending: boolean
  isProductsPending: boolean
}

export default function FeaturedProductsEditor({
  section,
  data,
  open,
  onClose,
  onSaveSection,
  onSaveProducts,
  isSectionPending,
  isProductsPending,
}: FeaturedProductsEditorProps) {
  const [title, setTitle] = useState(section.title || '')
  const [subtitle, setSubtitle] = useState(section.subtitle || '')
  const [source, setSource] = useState(section.settings?.source || 'manual')
  const [displayCount, setDisplayCount] = useState(section.settings?.display_count || 10)
  const [selected, setSelected] = useState<number[]>([])

  useEffect(() => {
    // The seeder stores these with section = 'featured'
    const featuredProducts = data?.homepage_products
      ?.filter(hp => hp.section === 'featured')
      .map(hp => hp.product_id) || []
    setSelected(featuredProducts)
  }, [data?.homepage_products])

  const allProducts = data?.all_products || []

  const toggleProduct = (id: number) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const moveProduct = (from: number, to: number) => {
    if (to < 0 || to >= selected.length) return
    const updated = [...selected]
    const [moved] = updated.splice(from, 1)
    updated.splice(to, 0, moved)
    setSelected(updated)
  }

  const getProductImage = (product: { primary_image?: string; images?: { image: string }[] }) => {
    return product.primary_image || product.images?.[0]?.image
  }

  const handleSaveAll = () => {
    onSaveSection(section.key, {
      title,
      subtitle,
      settings: { ...section.settings, source, display_count: displayCount },
    })
    onSaveProducts('featured', selected)
  }

  return (
    <EditorPanel
      open={open}
      onClose={onClose}
      title={SECTION_META.featured_products.label}
      description={SECTION_META.featured_products.editorDescription}
      sectionKey={section.key}
      footer={
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium border border-dark-200 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAll}
            disabled={isSectionPending || isProductsPending}
            className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
          >
            {(isSectionPending || isProductsPending) && <LoadingSpinner size="sm" />}
            Save Changes
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        <FormField label="Section Title" tooltip="The heading for the Featured Products section.">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Featured Products"
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
          />
        </FormField>

        <FormField label="Section Subtitle" tooltip="Supporting text below the heading.">
          <textarea
            value={subtitle}
            onChange={e => setSubtitle(e.target.value)}
            rows={2}
            placeholder="Our most popular appliances loved by customers across Pakistan"
            className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Source" tooltip="Choose 'Manual' to hand-pick products, or 'Automatic' to show by popularity.">
            <select
              value={source}
              onChange={e => setSource(e.target.value)}
              className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
            >
              <option value="manual">Manual Selection</option>
              <option value="auto">Automatic (by popularity)</option>
            </select>
          </FormField>
          <FormField label="Display Count" tooltip="Maximum number of products to show." helpText="Default: 10">
            <input
              type="number"
              value={displayCount}
              onChange={e => setDisplayCount(parseInt(e.target.value) || 10)}
              min={1}
              max={20}
              className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white"
            />
          </FormField>
        </div>

        {/* Product selection */}
        <div className="border-t border-dark-200 dark:border-dark-700 pt-5">
          <h3 className="text-sm font-semibold text-dark-900 dark:text-white mb-1">Product Selection</h3>
          <p className="text-xs text-dark-500 dark:text-dark-400 mb-3">
            {source === 'auto'
              ? 'Source is set to "Automatic". Selected products below will be used as fallback if auto-selection returns no results.'
              : 'Select the products to display in the Featured Products section. Use the arrows to reorder.'}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Available */}
            <div>
              <p className="text-xs font-medium text-dark-500 dark:text-dark-400 mb-2">Available ({allProducts.length})</p>
              <div className="border border-dark-200 dark:border-dark-700 rounded-lg max-h-72 overflow-y-auto">
                {allProducts.map(product => (
                  <label
                    key={product.id}
                    className={`flex items-center gap-2.5 p-2 cursor-pointer hover:bg-dark-50 dark:hover:bg-dark-700 border-b border-dark-100 dark:border-dark-700 last:border-b-0 ${
                      selected.includes(product.id) ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(product.id)}
                      onChange={() => toggleProduct(product.id)}
                      className="w-4 h-4 rounded text-primary-600 flex-shrink-0"
                    />
                    <div className="w-8 h-8 bg-dark-100 dark:bg-dark-700 rounded overflow-hidden flex-shrink-0">
                      {getProductImage(product) ? (
                        <img src={getProductImage(product)} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <PhotoIcon className="w-4 h-4 text-dark-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-dark-900 dark:text-white block truncate">{product.name}</span>
                      <span className="text-[10px] text-dark-500 dark:text-dark-400">PKR {product.price?.toLocaleString()}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Selected */}
            <div>
              <p className="text-xs font-medium text-dark-500 dark:text-dark-400 mb-2">Selected ({selected.length})</p>
              <div className="border border-dark-200 dark:border-dark-700 rounded-lg">
                {selected.length > 0 ? (
                  selected.map((productId, idx) => {
                    const product = allProducts.find(p => p.id === productId)
                    return product ? (
                      <div key={productId} className="flex items-center gap-2 p-2 border-b border-dark-100 dark:border-dark-700 last:border-b-0">
                        <span className="w-5 h-5 flex items-center justify-center bg-dark-100 dark:bg-dark-700 rounded text-[10px] font-medium text-dark-500">
                          {idx + 1}
                        </span>
                        <div className="w-8 h-8 bg-dark-100 dark:bg-dark-700 rounded overflow-hidden flex-shrink-0">
                          {getProductImage(product) ? (
                            <img src={getProductImage(product)} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <PhotoIcon className="w-4 h-4 text-dark-400" />
                            </div>
                          )}
                        </div>
                        <span className="flex-1 text-xs font-medium text-dark-900 dark:text-white truncate">{product.name}</span>
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={() => moveProduct(idx, idx - 1)}
                            disabled={idx === 0}
                            className="p-0.5 text-dark-400 hover:text-dark-600 disabled:opacity-30"
                          >
                            <ChevronUpIcon className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveProduct(idx, idx + 1)}
                            disabled={idx === selected.length - 1}
                            className="p-0.5 text-dark-400 hover:text-dark-600 disabled:opacity-30"
                          >
                            <ChevronDownIcon className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleProduct(productId)}
                            className="p-0.5 text-dark-400 hover:text-red-600"
                          >
                            <XMarkIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : null
                  })
                ) : (
                  <p className="p-4 text-center text-xs text-dark-400">
                    {source === 'auto' ? 'No manual selection (using automatic)' : 'No products selected'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </EditorPanel>
  )
}
