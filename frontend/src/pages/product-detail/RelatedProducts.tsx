import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ProductCard from '@/components/products/ProductCard'
import QuickViewModal from '@/components/products/QuickViewModal'
import ScrollReveal, { StaggerContainer, StaggerItem, HoverCard } from '@/components/effects/ScrollReveal'
import type { Product } from '@/types'

// Simplified product type for QuickView modal — mirrors what QuickViewModal expects
interface QuickViewProduct {
  id: number
  name: string
  slug: string
  price: number
  compare_price?: number | null
  description?: string
  short_description?: string
  primary_image?: string | null
  images?: { id: number; image_path?: string; image?: string; is_primary: boolean }[]
  stock_status: string
  stock?: number
  is_new?: boolean
  is_bestseller?: boolean
  average_rating?: number
  review_count?: number
  category?: { name: string; slug: string }
  brand?: { name: string; slug: string }
}

interface RelatedProductsProps {
  products: Product[]
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  const [quickViewProduct, setQuickViewProduct] = useState<QuickViewProduct | null>(null)

  if (!products || products.length === 0) return null

  return (
    <ScrollReveal animation="fadeUp">
      <section className="py-12">
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-2xl font-bold text-dark-900 dark:text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Related Products
          </motion.h2>
          <StaggerContainer
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 md:gap-6"
            staggerDelay={0.08}
          >
            {products.slice(0, 5).map((relatedProduct) => (
              <StaggerItem key={relatedProduct.id}>
                <HoverCard intensity={8}>
                  <ProductCard product={relatedProduct} onQuickView={setQuickViewProduct} />
                </HoverCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewProduct && (
          <QuickViewModal
            isOpen={!!quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
            product={quickViewProduct}
          />
        )}
      </AnimatePresence>
    </ScrollReveal>
  )
}
