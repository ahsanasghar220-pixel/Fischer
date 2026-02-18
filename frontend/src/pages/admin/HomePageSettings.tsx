import { useState, useCallback } from 'react'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import { useHomepageData } from './homepage/hooks/useHomepageData'
import { useHomepageMutations } from './homepage/hooks/useHomepageMutations'
import SectionGrid from './homepage/components/SectionGrid'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { Section } from './homepage/types'

// Editor imports
import HeroEditor from './homepage/editors/HeroEditor'
import BrandStatementEditor from './homepage/editors/BrandStatementEditor'
import HeroProductsEditor from './homepage/editors/HeroProductsEditor'
import StatsEditor from './homepage/editors/StatsEditor'
import CategoriesEditor from './homepage/editors/CategoriesEditor'
import FeaturesEditor from './homepage/editors/FeaturesEditor'
import BestsellersEditor from './homepage/editors/BestsellersEditor'
import BundlesEditor from './homepage/editors/BundlesEditor'
import BannerCarouselEditor from './homepage/editors/BannerCarouselEditor'
import DealerCtaEditor from './homepage/editors/DealerCtaEditor'
import TestimonialsEditor from './homepage/editors/TestimonialsEditor'
import AboutEditor from './homepage/editors/AboutEditor'
import NotableClientsEditor from './homepage/editors/NotableClientsEditor'
import FeaturedProductsEditor from './homepage/editors/FeaturedProductsEditor'
import NewArrivalsEditor from './homepage/editors/NewArrivalsEditor'
import NewsletterEditor from './homepage/editors/NewsletterEditor'

export default function HomePageSettings() {
  const { data, isLoading, error } = useHomepageData()
  const mutations = useHomepageMutations()
  const [activeEditor, setActiveEditor] = useState<string | null>(null)
  const [editingSection, setEditingSection] = useState<Section | null>(null)

  const sections = data?.sections || []

  const handleToggle = useCallback((key: string, enabled: boolean) => {
    mutations.updateSection.mutate({ key, data: { is_enabled: enabled } })
  }, [mutations.updateSection])

  const handleEdit = useCallback((section: Section) => {
    setEditingSection(section)
    setActiveEditor(section.key)
  }, [])

  const handleReorder = useCallback((reordered: Section[]) => {
    // Save each section's new sort_order
    reordered.forEach((s, i) => {
      const original = sections.find(os => os.key === s.key)
      if (original && original.sort_order !== i) {
        mutations.updateSection.mutate({ key: s.key, data: { sort_order: i } })
      }
    })
  }, [sections, mutations.updateSection])

  const handleSaveSection = useCallback((key: string, sectionData: { title: string; subtitle: string; settings?: Record<string, any> }) => {
    mutations.updateSection.mutate({ key, data: sectionData }, {
      onSuccess: () => setActiveEditor(null),
    })
  }, [mutations.updateSection])

  const closeEditor = useCallback(() => {
    setActiveEditor(null)
    setEditingSection(null)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
        Failed to load homepage settings. Please try again.
      </div>
    )
  }

  // Build site URL for preview
  const siteUrl = window.location.origin.replace(/:\d+$/, '')
  const homepageUrl = siteUrl.includes('localhost') ? 'http://localhost:5173' : siteUrl

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Homepage Settings</h1>
          <p className="text-dark-500 dark:text-dark-400">Manage all sections of your homepage. Toggle visibility, reorder by dragging, and customize each section.</p>
        </div>
        <a
          href={homepageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <ArrowTopRightOnSquareIcon className="w-4 h-4" />
          Preview Homepage
        </a>
      </div>

      {/* Section card grid */}
      <SectionGrid
        sections={sections}
        onToggle={handleToggle}
        onEdit={handleEdit}
        onReorder={handleReorder}
      />

      {/* Editors — only the active one renders */}
      {editingSection && activeEditor === 'hero' && (
        <HeroEditor
          section={editingSection}
          open
          onClose={closeEditor}
          onSave={handleSaveSection}
          isPending={mutations.updateSection.isPending}
        />
      )}

      {editingSection && activeEditor === 'brand_statement' && (
        <BrandStatementEditor
          section={editingSection}
          open
          onClose={closeEditor}
          onSave={handleSaveSection}
          isPending={mutations.updateSection.isPending}
        />
      )}

      {editingSection && activeEditor === 'hero_products' && (
        <HeroProductsEditor
          section={editingSection}
          open
          onClose={closeEditor}
          onSave={handleSaveSection}
          isPending={mutations.updateSection.isPending}
        />
      )}

      {editingSection && activeEditor === 'stats' && data && (
        <StatsEditor
          data={data}
          open
          onClose={closeEditor}
          onSave={(stats) => { mutations.updateStats.mutate(stats); closeEditor() }}
          isPending={mutations.updateStats.isPending}
        />
      )}

      {editingSection && activeEditor === 'categories' && data && (
        <CategoriesEditor
          section={editingSection}
          data={data}
          open
          onClose={closeEditor}
          onSaveSection={(key, sectionData) => mutations.updateSection.mutate({ key, data: sectionData })}
          onSaveCategories={(ids) => { mutations.updateCategories.mutate(ids); closeEditor() }}
          isSectionPending={mutations.updateSection.isPending}
          isCategoriesPending={mutations.updateCategories.isPending}
        />
      )}

      {editingSection && activeEditor === 'features' && data && (
        <FeaturesEditor
          data={data}
          open
          onClose={closeEditor}
          onSave={(features) => { mutations.updateFeatures.mutate(features); closeEditor() }}
          isPending={mutations.updateFeatures.isPending}
        />
      )}

      {editingSection && activeEditor === 'bestsellers' && data && (
        <BestsellersEditor
          section={editingSection}
          data={data}
          open
          onClose={closeEditor}
          onSaveSection={(key, sectionData) => mutations.updateSection.mutate({ key, data: sectionData })}
          onSaveProducts={(section, ids) => { mutations.updateProducts.mutate({ section, productIds: ids }); closeEditor() }}
          isSectionPending={mutations.updateSection.isPending}
          isProductsPending={mutations.updateProducts.isPending}
        />
      )}

      {editingSection && activeEditor === 'bundles' && (
        <BundlesEditor
          section={editingSection}
          open
          onClose={closeEditor}
          onSave={handleSaveSection}
          isPending={mutations.updateSection.isPending}
        />
      )}

      {editingSection && activeEditor === 'banner_carousel' && data && (
        <BannerCarouselEditor
          data={data}
          open
          onClose={closeEditor}
          onCreateBanner={(banner) => mutations.createBanner.mutate(banner)}
          onUpdateBanner={(id, bannerData) => mutations.updateBanner.mutate({ id, data: bannerData })}
          onDeleteBanner={(id) => mutations.deleteBanner.mutate(id)}
          isCreatePending={mutations.createBanner.isPending}
          isUpdatePending={mutations.updateBanner.isPending}
        />
      )}

      {editingSection && activeEditor === 'dealer_cta' && (
        <DealerCtaEditor
          section={editingSection}
          open
          onClose={closeEditor}
          onSave={handleSaveSection}
          isPending={mutations.updateSection.isPending}
        />
      )}

      {editingSection && activeEditor === 'testimonials' && data && (
        <TestimonialsEditor
          data={data}
          open
          onClose={closeEditor}
          onCreateTestimonial={(t) => mutations.createTestimonial.mutate(t)}
          onUpdateTestimonial={(id, tData) => mutations.updateTestimonial.mutate({ id, data: tData })}
          onDeleteTestimonial={(id) => mutations.deleteTestimonial.mutate(id)}
          isCreatePending={mutations.createTestimonial.isPending}
          isUpdatePending={mutations.updateTestimonial.isPending}
        />
      )}

      {editingSection && activeEditor === 'about' && (
        <AboutEditor
          section={editingSection}
          open
          onClose={closeEditor}
          onSave={handleSaveSection}
          isPending={mutations.updateSection.isPending}
        />
      )}

      {editingSection && activeEditor === 'notable_clients' && data && (
        <NotableClientsEditor
          data={data}
          open
          onClose={closeEditor}
          onSave={(clients) => { mutations.updateNotableClients.mutate(clients); closeEditor() }}
          onUploadLogo={(file) => mutations.uploadClientLogo.mutateAsync(file)}
          isPending={mutations.updateNotableClients.isPending}
        />
      )}

      {editingSection && activeEditor === 'featured_products' && data && (
        <FeaturedProductsEditor
          section={editingSection}
          data={data}
          open
          onClose={closeEditor}
          onSaveSection={(key, sectionData) => mutations.updateSection.mutate({ key, data: sectionData })}
          onSaveProducts={(section, ids) => { mutations.updateProducts.mutate({ section, productIds: ids }); closeEditor() }}
          isSectionPending={mutations.updateSection.isPending}
          isProductsPending={mutations.updateProducts.isPending}
        />
      )}

      {editingSection && activeEditor === 'new_arrivals' && data && (
        <NewArrivalsEditor
          section={editingSection}
          data={data}
          open
          onClose={closeEditor}
          onSaveSection={(key, sectionData) => mutations.updateSection.mutate({ key, data: sectionData })}
          onSaveProducts={(section, ids) => { mutations.updateProducts.mutate({ section, productIds: ids }); closeEditor() }}
          isSectionPending={mutations.updateSection.isPending}
          isProductsPending={mutations.updateProducts.isPending}
        />
      )}

      {editingSection && activeEditor === 'newsletter' && (
        <NewsletterEditor
          section={editingSection}
          open
          onClose={closeEditor}
          onSave={handleSaveSection}
          isPending={mutations.updateSection.isPending}
        />
      )}
    </div>
  )
}
