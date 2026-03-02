import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { browseProducts, getProductVariants } from '@/api/b2b'
import type { ProductSearchResult, ProductVariantOption, ProductVariantData } from '@/types/b2b'
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  TagIcon,
} from '@heroicons/react/24/outline'

export interface PickedProduct {
  product: ProductSearchResult
  variant?: ProductVariantOption
  /** Final display name: product name + variant label */
  displayName: string
  /** Final SKU to store */
  sku: string
  /** Final unit price */
  price: string | number
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onSelect: (picked: PickedProduct) => void
  title?: string
}

function formatPrice(price: string | number | null | undefined): string {
  if (price == null || price === '') return ''
  const num = typeof price === 'string' ? parseFloat(price) : price
  if (isNaN(num)) return ''
  return `Rs. ${num.toLocaleString()}`
}

function ProductImagePlaceholder({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const iconSizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-10 h-10' }
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
      <svg
        className={`${iconSizes[size]} text-gray-300 dark:text-gray-500`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  )
}

// ─── Stock status badge ───────────────────────────────────────────────────────

function StockBadge({ status }: { status: string }) {
  if (status === 'in_stock') return null
  return (
    <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide">
      Out of Stock
    </span>
  )
}

// ─── Variant Configurator Panel ───────────────────────────────────────────────

interface VariantPanelProps {
  product: ProductSearchResult
  onBack: () => void
  onClose: () => void
  onConfirm: (picked: PickedProduct) => void
}

function VariantPanel({ product, onBack, onClose, onConfirm }: VariantPanelProps) {
  const [variantData, setVariantData] = useState<ProductVariantData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Record<string, string>>({})

  useEffect(() => {
    setLoading(true)
    setVariantData(null)
    setSelected({})
    getProductVariants(product.id)
      .then((data) => setVariantData(data))
      .catch(() => setVariantData(null))
      .finally(() => setLoading(false))
  }, [product.id])

  // Determine which values are valid for a given attribute given current selections
  const getAvailableValues = useCallback(
    (attrName: string): Set<string> => {
      if (!variantData) return new Set()
      const otherSelections = Object.entries(selected).filter(([k]) => k !== attrName)
      const validVariants = variantData.variants.filter((v) =>
        otherSelections.every(([k, val]) =>
          v.attribute_values.some((av) => av.attribute === k && av.value === val),
        ),
      )
      const available = new Set<string>()
      for (const v of validVariants) {
        for (const av of v.attribute_values) {
          if (av.attribute === attrName) available.add(av.value)
        }
      }
      return available
    },
    [variantData, selected],
  )

  const resolvedVariant = useMemo((): ProductVariantOption | null => {
    if (!variantData || variantData.attributes.length === 0) return null
    if (Object.keys(selected).length < variantData.attributes.length) return null
    return (
      variantData.variants.find((v) =>
        variantData.attributes.every((attr) =>
          v.attribute_values.some((av) => av.attribute === attr.name && av.value === selected[attr.name]),
        ),
      ) ?? null
    )
  }, [variantData, selected])

  const handleConfirm = () => {
    if (!resolvedVariant) return
    const variantLabel = resolvedVariant.attribute_values.map((av) => av.value).join(', ')
    const displayName = variantLabel
      ? `${product.name} — ${variantLabel}`
      : (resolvedVariant.name ?? product.name)
    onConfirm({
      product,
      variant: resolvedVariant,
      displayName,
      sku: resolvedVariant.sku,
      price: resolvedVariant.dealer_price ?? resolvedVariant.price ?? product.dealer_price ?? product.price,
    })
  }

  const handleSelectNoVariant = () => {
    onConfirm({
      product,
      displayName: product.name,
      sku: product.sku,
      price: product.dealer_price ?? product.price,
    })
  }

  const allAttributesSelected = variantData
    ? Object.keys(selected).length >= variantData.attributes.length
    : false

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-900">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Back to product list"
        >
          <ArrowLeftIcon className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
            Configure Variant
          </p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">
            {product.name}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Product summary strip */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
          <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-600">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <ProductImagePlaceholder size="sm" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            {product.category_name && (
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-0.5">
                {product.category_name}
              </p>
            )}
            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2">
              {product.name}
            </p>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading options...</p>
            </div>
          )}

          {/* No variants found */}
          {!loading && (!variantData || variantData.variants.length === 0) && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                <TagIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No variants for this product</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">
                This product will be added as-is
              </p>
              <button
                onClick={handleSelectNoVariant}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Add this product
              </button>
            </div>
          )}

          {/* Attribute selectors */}
          {!loading && variantData && variantData.attributes.length > 0 && (
            <div className="space-y-6">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">
                Select Options
              </p>

              {variantData.attributes.map((attr, attrIdx) => {
                const availableValues = getAvailableValues(attr.name)
                const previousAttr = attrIdx > 0 ? variantData.attributes[attrIdx - 1] : null
                const isLocked = previousAttr != null && !selected[previousAttr.name]

                return (
                  <div key={attr.name} className={isLocked ? 'opacity-40 pointer-events-none' : ''}>
                    <div className="flex items-center gap-2 mb-3">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{attr.name}</p>
                      {selected[attr.name] && (
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                          {selected[attr.name]}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {attr.values.map((val) => {
                        const isSelected = selected[attr.name] === val
                        const isAvailable = availableValues.size === 0 || availableValues.has(val)

                        return (
                          <button
                            key={val}
                            disabled={!isAvailable}
                            onClick={() => {
                              if (!isAvailable) return
                              setSelected((prev) => {
                                const next = { ...prev, [attr.name]: val }
                                // Clear downstream selections when an earlier attr changes
                                const idx = variantData.attributes.findIndex((a) => a.name === attr.name)
                                variantData.attributes.slice(idx + 1).forEach((a) => {
                                  delete next[a.name]
                                })
                                return next
                              })
                            }}
                            className={[
                              'px-3.5 py-2 rounded-xl text-sm font-medium border-2 transition-all select-none',
                              isSelected
                                ? 'border-blue-500 dark:border-blue-400 bg-blue-600 dark:bg-blue-700 text-white shadow-sm'
                                : isAvailable
                                  ? 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'
                                  : 'border-gray-100 dark:border-gray-700 text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed line-through',
                            ].join(' ')}
                          >
                            {val}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {/* Resolved variant preview */}
              {resolvedVariant && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide">
                      Variant Ready
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-green-900 dark:text-green-100 leading-snug">
                    {resolvedVariant.name ||
                      resolvedVariant.attribute_values.map((av) => av.value).join(', ')}
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-400 font-mono">
                    SKU: {resolvedVariant.sku}
                  </p>
                  {(resolvedVariant.dealer_price ?? resolvedVariant.price) != null && (
                    <p className="text-base font-bold text-green-800 dark:text-green-200 pt-0.5">
                      {formatPrice(resolvedVariant.dealer_price ?? resolvedVariant.price)}
                    </p>
                  )}
                </div>
              )}

              {/* Prompt if not all selected */}
              {!resolvedVariant && !allAttributesSelected && (
                <div className="bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-4 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Select all options above to continue
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <button
          onClick={handleConfirm}
          disabled={!resolvedVariant}
          className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-2xl py-4 text-base font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
        >
          {resolvedVariant
            ? `Add: ${resolvedVariant.attribute_values.map((av) => av.value).join(' · ')}`
            : 'Select all options to continue'}
        </button>
      </div>
    </div>
  )
}

// ─── Product Grid Card ────────────────────────────────────────────────────────

function ProductCard({
  product,
  onClick,
}: {
  product: ProductSearchResult
  onClick: (p: ProductSearchResult) => void
}) {
  const isOutOfStock = product.stock_status === 'out_of_stock'

  return (
    <button
      onClick={() => onClick(product)}
      className={[
        'group relative text-left bg-white dark:bg-gray-800 border rounded-2xl overflow-hidden',
        'transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400',
        'hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg active:scale-[0.97]',
        isOutOfStock
          ? 'border-gray-200 dark:border-gray-700 opacity-70'
          : 'border-gray-200 dark:border-gray-700',
      ].join(' ')}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-700">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <ProductImagePlaceholder />
        )}
        <StockBadge status={product.stock_status} />
        {product.has_variants && (
          <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-1">
            Options
            <ChevronRightIcon className="w-2.5 h-2.5" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5 space-y-1">
        {product.category_name && (
          <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide truncate">
            {product.category_name}
          </p>
        )}
        <p className="text-xs font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </p>
        {product.has_variants && product.price_min != null ? (
          <div>
            <p className="text-[9px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide leading-none mb-0.5">
              From
            </p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {formatPrice(product.price_min)}
              {product.price_max != null &&
                Number(product.price_max) !== Number(product.price_min) &&
                ` – ${formatPrice(product.price_max)}`}
            </p>
          </div>
        ) : (
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            {formatPrice(product.dealer_price ?? product.price)}
          </p>
        )}
        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono truncate">{product.sku}</p>
      </div>
    </button>
  )
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function ProductSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200 dark:bg-gray-700" />
      <div className="p-2.5 space-y-2">
        <div className="h-2.5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mt-1" />
      </div>
    </div>
  )
}

// ─── Main Product Browser ─────────────────────────────────────────────────────

export default function ProductPickerModal({
  isOpen,
  onClose,
  onSelect,
  title = 'Select a Product',
}: Props) {
  const [products, setProducts] = useState<ProductSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [variantProduct, setVariantProduct] = useState<ProductSearchResult | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // Load all products when modal opens
  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    browseProducts()
      .then((data) => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [isOpen])

  // Auto-focus search on open
  useEffect(() => {
    if (isOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Reset UI when modal closes
  useEffect(() => {
    if (!isOpen) {
      setVariantProduct(null)
      setSearchQuery('')
      setSelectedCategory('all')
    }
  }, [isOpen])

  // Distinct categories from product list
  const categories = useMemo(() => {
    const seen = new Map<string, string>()
    for (const p of products) {
      if (p.category_slug && p.category_name && !seen.has(p.category_slug)) {
        seen.set(p.category_slug, p.category_name)
      }
    }
    return Array.from(seen.entries()).map(([slug, name]) => ({ slug, name }))
  }, [products])

  // Client-side filtered products
  const filteredProducts = useMemo(() => {
    let list = products
    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category_slug === selectedCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
      )
    }
    return list
  }, [products, selectedCategory, searchQuery])

  const handleProductClick = useCallback(
    (product: ProductSearchResult) => {
      if (product.has_variants) {
        setVariantProduct(product)
        return
      }
      onSelect({
        product,
        displayName: product.name,
        sku: product.sku,
        price: product.dealer_price ?? product.price,
      })
    },
    [onSelect],
  )

  const handleVariantConfirm = useCallback(
    (picked: PickedProduct) => {
      onSelect(picked)
    },
    [onSelect],
  )

  if (!isOpen) return null

  const categoryCount = (slug: string) => products.filter((p) => p.category_slug === slug).length

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900" role="dialog" aria-modal="true">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-900">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
          {!loading && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              {searchQuery ? ` matching "${searchQuery}"` : selectedCategory !== 'all' ? ' in category' : ''}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
          aria-label="Close picker"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* ── Search bar ─────────────────────────────────── */}
      <div className="px-4 pt-3 pb-2 flex-shrink-0">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or SKU..."
            className="w-full pl-9 pr-9 py-2.5 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              aria-label="Clear search"
            >
              <XMarkIcon className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* ── Category filter chips ───────────────────────── */}
      {categories.length > 0 && (
        <div className="flex gap-2 px-4 pb-2 overflow-x-auto flex-shrink-0 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('all')}
            className={[
              'px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all',
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700',
            ].join(' ')}
          >
            All ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={[
                'px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all',
                selectedCategory === cat.slug
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700',
              ].join(' ')}
            >
              {cat.name} ({categoryCount(cat.slug)})
            </button>
          ))}
        </div>
      )}

      {/* ── Product Grid ────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {loading && (
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <MagnifyingGlassIcon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-base font-semibold text-gray-700 dark:text-gray-300">No products found</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {searchQuery
                ? `No results for "${searchQuery}"`
                : 'No products in this category'}
            </p>
            <div className="flex gap-2 mt-4">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-medium"
                >
                  Clear search
                </button>
              )}
              {selectedCategory !== 'all' && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl text-sm font-medium"
                >
                  Show all categories
                </button>
              )}
            </div>
          </div>
        )}

        {!loading && filteredProducts.length > 0 && (
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onClick={handleProductClick} />
            ))}
          </div>
        )}
      </div>

      {/* Variant panel — absolute over the entire modal (not just the scrollable grid) */}
      {variantProduct && (
        <VariantPanel
          product={variantProduct}
          onBack={() => setVariantProduct(null)}
          onClose={onClose}
          onConfirm={handleVariantConfirm}
        />
      )}
    </div>
  )
}
