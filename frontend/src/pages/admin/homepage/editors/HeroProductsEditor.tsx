import { useState } from 'react'
import { PlusIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import EditorPanel from '../components/EditorPanel'
import FormField from '../components/FormField'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { Section } from '../types'
import { SECTION_META } from '../types'

interface HeroProduct {
  name: string
  category: string
  description: string
  href: string
  images: string[]
}

interface HeroProductsEditorProps {
  section: Section
  open: boolean
  onClose: () => void
  onSave: (key: string, data: { title: string; subtitle: string; settings: Record<string, any> }) => void
  isPending: boolean
}

export default function HeroProductsEditor({ section, open, onClose, onSave, isPending }: HeroProductsEditorProps) {
  const [title, setTitle] = useState(section.title || '')
  const [subtitle, setSubtitle] = useState(section.subtitle || '')
  const [badgeText, setBadgeText] = useState(section.settings?.badge_text || '')
  const [products, setProducts] = useState<HeroProduct[]>(section.settings?.products || [])

  const handleSave = () => {
    onSave(section.key, {
      title,
      subtitle,
      settings: { ...section.settings, badge_text: badgeText, products },
    })
  }

  const updateProduct = (index: number, field: keyof HeroProduct, value: any) => {
    const updated = [...products]
    updated[index] = { ...updated[index], [field]: value }
    setProducts(updated)
  }

  const moveProduct = (from: number, to: number) => {
    if (to < 0 || to >= products.length) return
    const updated = [...products]
    const [moved] = updated.splice(from, 1)
    updated.splice(to, 0, moved)
    setProducts(updated)
  }

  const addProduct = () => {
    setProducts([...products, { name: '', category: '', description: '', href: '', images: [] }])
  }

  return (
    <EditorPanel
      open={open}
      onClose={onClose}
      title={SECTION_META.hero_products.label}
      description={SECTION_META.hero_products.editorDescription}
      sectionKey={section.key}
      footer={
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium border border-dark-200 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700">Cancel</button>
          <button onClick={handleSave} disabled={isPending} className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
            {isPending && <LoadingSpinner size="sm" />}
            Save Changes
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        <FormField label="Badge Text" tooltip="Small label displayed above the product showcase." helpText="Example: 'Our Bestsellers'">
          <input type="text" value={badgeText} onChange={e => setBadgeText(e.target.value)} placeholder="Our Bestsellers" className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white" />
        </FormField>

        <FormField label="Section Title" tooltip="The heading for the hero products section.">
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Featured Products" className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white" />
        </FormField>

        <FormField label="Section Subtitle" tooltip="Supporting text below the heading.">
          <textarea value={subtitle} onChange={e => setSubtitle(e.target.value)} rows={2} placeholder="Discover our most popular appliances" className="w-full px-4 py-2 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white" />
        </FormField>

        {/* Product cards */}
        <div className="border-t border-dark-200 dark:border-dark-700 pt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-dark-900 dark:text-white">Products ({products.length}/5)</h3>
            <button
              onClick={addProduct}
              disabled={products.length >= 5}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              <PlusIcon className="w-4 h-4" /> Add Product
            </button>
          </div>

          <div className="space-y-4">
            {products.map((product, idx) => (
              <div key={idx} className="p-4 border border-dark-200 dark:border-dark-700 rounded-lg bg-dark-50 dark:bg-dark-900/50 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-dark-500 dark:text-dark-400">Product #{idx + 1}</span>
                  <div className="flex gap-1">
                    {idx > 0 && (
                      <button type="button" onClick={() => moveProduct(idx, idx - 1)} className="p-1 text-dark-400 hover:text-dark-600"><ChevronUpIcon className="w-3.5 h-3.5" /></button>
                    )}
                    {idx < products.length - 1 && (
                      <button type="button" onClick={() => moveProduct(idx, idx + 1)} className="p-1 text-dark-400 hover:text-dark-600"><ChevronDownIcon className="w-3.5 h-3.5" /></button>
                    )}
                    <button type="button" onClick={() => setProducts(products.filter((_, i) => i !== idx))} className="p-1 text-red-500 hover:text-red-600"><TrashIcon className="w-3.5 h-3.5" /></button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Product Name" tooltip="Name displayed on the card.">
                    <input type="text" value={product.name} onChange={e => updateProduct(idx, 'name', e.target.value)} placeholder="Kitchen Hood Pro" className="w-full px-3 py-1.5 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white text-sm" />
                  </FormField>
                  <FormField label="Category Label" tooltip="Category label shown on the card.">
                    <input type="text" value={product.category} onChange={e => updateProduct(idx, 'category', e.target.value)} placeholder="Kitchen Hoods" className="w-full px-3 py-1.5 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white text-sm" />
                  </FormField>
                </div>

                <FormField label="Description" tooltip="Short description text for this product card.">
                  <input type="text" value={product.description} onChange={e => updateProduct(idx, 'description', e.target.value)} placeholder="Professional-grade kitchen ventilation" className="w-full px-3 py-1.5 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white text-sm" />
                </FormField>

                <FormField label="Link" tooltip="Where clicking on the product card navigates to." helpText="Example: /category/kitchen-hoods">
                  <input type="text" value={product.href} onChange={e => updateProduct(idx, 'href', e.target.value)} placeholder="/category/kitchen-hoods" className="w-full px-3 py-1.5 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white text-sm" />
                </FormField>

                <FormField label="Images" tooltip="Image paths for this product, one per line. First image is the primary display." helpText="Enter one image path per line.">
                  <textarea
                    value={(product.images || []).join('\n')}
                    onChange={e => updateProduct(idx, 'images', e.target.value.split('\n').filter(Boolean))}
                    rows={3}
                    placeholder={"/images/products/hood-1.webp\n/images/products/hood-2.webp"}
                    className="w-full px-3 py-1.5 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white text-sm font-mono"
                  />
                </FormField>
              </div>
            ))}

            {products.length === 0 && (
              <p className="text-center py-8 text-sm text-dark-400 border border-dashed border-dark-300 dark:border-dark-600 rounded-lg">
                No products configured. Add up to 5 products for the showcase.
              </p>
            )}
          </div>
        </div>
      </div>
    </EditorPanel>
  )
}
