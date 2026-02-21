import { useState, useRef } from 'react'
import { PlusIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon, XMarkIcon, ArrowUpTrayIcon, LinkIcon } from '@heroicons/react/24/outline'
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
  onUploadImage: (file: File) => Promise<{ path: string }>
  isPending: boolean
}

export default function HeroProductsEditor({ section, open, onClose, onSave, onUploadImage, isPending }: HeroProductsEditorProps) {
  const [title, setTitle] = useState(section.title || '')
  const [subtitle, setSubtitle] = useState(section.subtitle || '')
  const [badgeText, setBadgeText] = useState(section.settings?.badge_text || '')
  const [products, setProducts] = useState<HeroProduct[]>(section.settings?.products || [])
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null)
  const [urlInputVisible, setUrlInputVisible] = useState<number | null>(null)
  const [urlInputValue, setUrlInputValue] = useState('')
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({})

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, productIdx: number) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingIdx(productIdx)
    try {
      const result = await onUploadImage(file)
      const updated = [...products]
      updated[productIdx] = {
        ...updated[productIdx],
        images: [...(updated[productIdx].images || []), result.path],
      }
      setProducts(updated)
    } catch {
      // Error toast is handled by the mutation
    } finally {
      // Reset file input so same file can be re-selected
      if (fileInputRefs.current[productIdx]) {
        fileInputRefs.current[productIdx]!.value = ''
      }
      setUploadingIdx(null)
    }
  }

  const removeImage = (productIdx: number, imageIdx: number) => {
    const updated = [...products]
    updated[productIdx] = {
      ...updated[productIdx],
      images: updated[productIdx].images.filter((_, i) => i !== imageIdx),
    }
    setProducts(updated)
  }

  const addImageUrl = (productIdx: number) => {
    const url = urlInputValue.trim()
    if (!url) return
    const updated = [...products]
    updated[productIdx] = {
      ...updated[productIdx],
      images: [...(updated[productIdx].images || []), url],
    }
    setProducts(updated)
    setUrlInputValue('')
    setUrlInputVisible(null)
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

                {/* Images section */}
                <FormField label="Images" tooltip="Upload images for this product. First image is the primary display.">
                  <div className="space-y-3">
                    {/* Image thumbnail grid */}
                    {(product.images || []).length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {product.images.map((img, imgIdx) => (
                          <div
                            key={imgIdx}
                            className="relative group aspect-square rounded-lg border border-dark-200 dark:border-dark-600 overflow-hidden bg-white dark:bg-dark-700 cursor-pointer"
                            onClick={() => setPreviewImage(img)}
                          >
                            <img
                              src={img}
                              alt={`${product.name || 'Product'} image ${imgIdx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {imgIdx === 0 && (
                              <span className="absolute bottom-0 left-0 right-0 bg-primary-600/90 text-white text-[10px] font-medium text-center py-0.5">
                                Primary
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeImage(idx, imgIdx)
                              }}
                              className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <XMarkIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload dropzone */}
                    <div
                      onClick={() => {
                        if (uploadingIdx !== idx) {
                          fileInputRefs.current[idx]?.click()
                        }
                      }}
                      className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                        uploadingIdx === idx
                          ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-dark-300 dark:border-dark-600 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-dark-50 dark:hover:bg-dark-800 cursor-pointer'
                      }`}
                    >
                      <input
                        ref={(el) => { fileInputRefs.current[idx] = el }}
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                        disabled={uploadingIdx === idx}
                        onChange={e => handleImageUpload(e, idx)}
                      />
                      {uploadingIdx === idx ? (
                        <div className="flex flex-col items-center gap-2">
                          <LoadingSpinner size="sm" />
                          <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">Uploading...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1.5">
                          <ArrowUpTrayIcon className="w-6 h-6 text-dark-400 dark:text-dark-500" />
                          <span className="text-xs text-dark-500 dark:text-dark-400 font-medium">Click to upload image</span>
                          <span className="text-[10px] text-dark-400 dark:text-dark-500">JPEG, PNG, GIF, WebP (max 5MB)</span>
                        </div>
                      )}
                    </div>

                    {/* Paste URL fallback */}
                    {urlInputVisible === idx ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={urlInputValue}
                          onChange={e => setUrlInputValue(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') addImageUrl(idx) }}
                          placeholder="https://example.com/image.jpg"
                          className="flex-1 px-3 py-1.5 border border-dark-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-dark-900 dark:text-white text-sm font-mono"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => addImageUrl(idx)}
                          disabled={!urlInputValue.trim()}
                          className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => { setUrlInputVisible(null); setUrlInputValue('') }}
                          className="px-2 py-1.5 text-sm text-dark-500 hover:text-dark-700 dark:text-dark-400 dark:hover:text-dark-200"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setUrlInputVisible(idx); setUrlInputValue('') }}
                        className="flex items-center gap-1 text-xs text-dark-400 dark:text-dark-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        Or paste image URL
                      </button>
                    )}
                  </div>
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

      {/* Image preview modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-2xl max-h-[80vh]" onClick={e => e.stopPropagation()}>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -top-3 -right-3 p-1.5 bg-white dark:bg-dark-700 text-dark-700 dark:text-dark-200 rounded-full shadow-lg hover:bg-dark-100 dark:hover:bg-dark-600 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </EditorPanel>
  )
}
