import { useState, useEffect, useMemo, useCallback } from 'react'
import { browseProducts, getProductVariants } from '@/api/b2b'
import type { ProductSearchResult, ProductVariantOption, ProductVariantData } from '@/types/b2b'

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

function ProductImagePlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
      <svg className="w-8 h-8 text-gray-300 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

// ─── Variant Picker Panel ────────────────────────────────────────────────────

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

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
          aria-label="Back to product list"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 dark:text-gray-400">Select Variant</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{product.name}</p>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Product summary */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <ProductImagePlaceholder />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">{product.category_name}</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2">
              {product.name}
            </p>
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mt-0.5">
              {formatPrice(product.dealer_price ?? product.price)}
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* No variants found */}
        {!loading && (!variantData || variantData.variants.length === 0) && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-sm">No variants available for this product.</p>
            <button
              onClick={() =>
                onConfirm({
                  product,
                  displayName: product.name,
                  sku: product.sku,
                  price: product.dealer_price ?? product.price,
                })
              }
              className="mt-3 text-blue-600 dark:text-blue-400 text-sm font-medium underline"
            >
              Select product without variant
            </button>
          </div>
        )}

        {/* Attribute selectors */}
        {!loading && variantData && variantData.attributes.length > 0 && (
          <div className="space-y-5">
            {variantData.attributes.map((attr) => (
              <div key={attr.name}>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{attr.name}</p>
                <div className="flex flex-wrap gap-2">
                  {attr.values.map((val) => (
                    <button
                      key={val}
                      onClick={() => setSelected((prev) => ({ ...prev, [attr.name]: val }))}
                      className={[
                        'px-4 py-2 rounded-xl text-sm font-medium border-2 transition-colors',
                        selected[attr.name] === val
                          ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800',
                      ].join(' ')}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Resolved variant preview */}
            {resolvedVariant && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-3 space-y-0.5">
                <p className="text-xs font-medium text-green-700 dark:text-green-400">Variant selected</p>
                <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                  {resolvedVariant.name ||
                    resolvedVariant.attribute_values.map((av) => av.value).join(', ')}
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">SKU: {resolvedVariant.sku}</p>
                {(resolvedVariant.dealer_price ?? resolvedVariant.price) != null && (
                  <p className="text-sm font-bold text-green-800 dark:text-green-200">
                    {formatPrice(resolvedVariant.dealer_price ?? resolvedVariant.price)}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <button
          onClick={handleConfirm}
          disabled={!resolvedVariant}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3.5 text-base font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {resolvedVariant
            ? `Select: ${resolvedVariant.attribute_values.map((av) => av.value).join(', ')}`
            : 'Select all options above'}
        </button>
      </div>
    </div>
  )
}

// ─── Main Product Browser ────────────────────────────────────────────────────

export default function ProductPickerModal({ isOpen, onClose, onSelect, title = 'Select a Product' }: Props) {
  const [products, setProducts] = useState<ProductSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [variantProduct, setVariantProduct] = useState<ProductSearchResult | null>(null)

  // Load products when modal opens
  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    browseProducts()
      .then((data) => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
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
      onClose()
    },
    [onSelect, onClose],
  )

  const handleVariantConfirm = useCallback(
    (picked: PickedProduct) => {
      onSelect(picked)
      onClose()
    },
    [onSelect, onClose],
  )

  if (!isOpen) return null

  // Show variant panel on top when a product with variants is clicked
  if (variantProduct) {
    return (
      <VariantPanel
        product={variantProduct}
        onBack={() => setVariantProduct(null)}
        onClose={onClose}
        onConfirm={handleVariantConfirm}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Search bar */}
      <div className="px-4 pt-3 pb-1 flex-shrink-0">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-9 py-2.5 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Category tabs */}
      {categories.length > 0 && (
        <div className="flex gap-2 px-4 py-2 overflow-x-auto flex-shrink-0 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('all')}
            className={[
              'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors',
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700',
            ].join(' ')}
          >
            All ({products.length})
          </button>
          {categories.map((cat) => {
            const count = products.filter((p) => p.category_slug === cat.slug).length
            return (
              <button
                key={cat.slug}
                onClick={() => setSelectedCategory(cat.slug)}
                className={[
                  'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors',
                  selectedCategory === cat.slug
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700',
                ].join(' ')}
              >
                {cat.name} ({count})
              </button>
            )
          })}
        </div>
      )}

      {/* Product grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
            <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-base font-medium">No products found</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-sm text-blue-600 dark:text-blue-400 underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {!loading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              >
                {/* Product image */}
                <div className="aspect-square overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <ProductImagePlaceholder />
                  )}
                </div>

                {/* Product info */}
                <div className="p-2.5">
                  {product.category_name && (
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-0.5 truncate">
                      {product.category_name}
                    </p>
                  )}
                  <p className="text-xs font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2 min-h-[2.5rem]">
                    {product.name}
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mt-1.5">
                    {formatPrice(product.dealer_price ?? product.price)}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{product.sku}</p>
                    {product.has_variants && (
                      <span className="text-xs font-medium text-orange-500 dark:text-orange-400 flex-shrink-0 ml-1">
                        Variants ›
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
