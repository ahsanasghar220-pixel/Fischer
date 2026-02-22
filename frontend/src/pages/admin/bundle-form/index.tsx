import { useState } from 'react'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useBundleForm } from './useBundleForm'
import BasicInfoTab from './BasicInfoTab'
import ProductsTab from './ProductsTab'
import PricingTab from './PricingTab'
import DisplayTab from './DisplayTab'
import MediaTab from './MediaTab'
import SeoTab from './SeoTab'
import type { Tab } from './types'

const TABS: { id: Tab; label: string }[] = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'products', label: 'Products' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'display', label: 'Display' },
  { id: 'media', label: 'Media' },
  { id: 'seo', label: 'SEO' },
]

export default function BundleFormPage() {
  const [activeTab, setActiveTab] = useState<Tab>('basic')

  const {
    isEditing,
    navigate,
    formData,
    setFormData,
    items,
    setItems,
    slots,
    setSlots,
    productSearch,
    setProductSearch,
    showProductSearch,
    setShowProductSearch,
    setSelectedSlotIndex,
    bundle,
    loadingBundle,
    searchResults,
    loadingProducts,
    createBundle,
    updateBundle,
    uploadImages,
    handleSubmit,
    handleAddProduct,
    handleRemoveProduct,
    handleAddSlot,
    handleRemoveSlot,
    handleRemoveSlotProduct,
    handleImageUpload,
    handleDeleteImage,
    originalPrice,
    discountedPrice,
    savings,
  } = useBundleForm()

  if (loadingBundle && isEditing) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/bundles')}
          className="p-2 text-dark-400 hover:text-dark-600 dark:hover:text-dark-200 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">
            {isEditing ? 'Edit Bundle' : 'Create Bundle'}
          </h1>
          <p className="text-dark-500 dark:text-dark-400">
            {isEditing ? `Editing: ${bundle?.name}` : 'Create a new product bundle'}
          </p>
        </div>
      </div>

      {/* Tab container */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm">
        {/* Tab navigation */}
        <div className="border-b border-dark-200 dark:border-dark-700">
          <nav className="flex gap-4 px-6 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {activeTab === 'basic' && (
            <BasicInfoTab
              formData={formData}
              setFormData={setFormData}
              isEditing={isEditing}
            />
          )}

          {activeTab === 'products' && (
            <ProductsTab
              formData={formData}
              items={items}
              setItems={setItems}
              slots={slots}
              setSlots={setSlots}
              productSearch={productSearch}
              setProductSearch={setProductSearch}
              showProductSearch={showProductSearch}
              setShowProductSearch={setShowProductSearch}
              setSelectedSlotIndex={setSelectedSlotIndex}
              searchResults={searchResults}
              loadingProducts={loadingProducts}
              onAddProduct={handleAddProduct}
              onRemoveProduct={handleRemoveProduct}
              onAddSlot={handleAddSlot}
              onRemoveSlot={handleRemoveSlot}
              onRemoveSlotProduct={handleRemoveSlotProduct}
            />
          )}

          {activeTab === 'pricing' && (
            <PricingTab
              formData={formData}
              setFormData={setFormData}
              items={items}
              originalPrice={originalPrice}
              discountedPrice={discountedPrice}
              savings={savings}
            />
          )}

          {activeTab === 'display' && (
            <DisplayTab
              formData={formData}
              setFormData={setFormData}
            />
          )}

          {activeTab === 'media' && (
            <MediaTab
              formData={formData}
              setFormData={setFormData}
              isEditing={isEditing}
              bundle={bundle}
              uploadImages={uploadImages}
              onImageUpload={handleImageUpload}
              onDeleteImage={handleDeleteImage}
            />
          )}

          {activeTab === 'seo' && (
            <SeoTab
              formData={formData}
              setFormData={setFormData}
            />
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-dark-200 dark:border-dark-700">
            <button
              type="button"
              onClick={() => navigate('/admin/bundles')}
              className="px-6 py-2 border border-dark-200 dark:border-dark-600 rounded-lg text-dark-700 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createBundle.isPending || updateBundle.isPending}
              className="btn btn-primary px-6 py-2 disabled:opacity-50"
            >
              {createBundle.isPending || updateBundle.isPending ? (
                <LoadingSpinner size="sm" />
              ) : isEditing ? (
                'Update Bundle'
              ) : (
                'Create Bundle'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
