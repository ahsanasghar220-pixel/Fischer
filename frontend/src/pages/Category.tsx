import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'
import ProductCard from '@/components/products/ProductCard'
import QuickViewModal from '@/components/products/QuickViewModal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import CategoryIcon from '@/components/ui/CategoryIcon'
import { StaggerContainer, StaggerItem, HoverCard } from '@/components/effects/ScrollReveal'

interface Category {
  id: number
  name: string
  slug: string
  description?: string
  features?: string[]
  image?: string
  parent?: Category
  children?: Category[]
}

// Category-specific features based on client requirements
const categoryFeatures: Record<string, string[]> = {
  'kitchen-hoods': [
    'Premium Quality',
    'BLDC copper motor',
    '1 Year Warranty',
    'Energy Efficient',
    'Heat + Auto clean',
    'Gesture and Touch Control',
    'Inverter Technology A+++ rated',
    'Low noise level',
  ],
  'hobs-hoods': [
    'Complete Brass Burners',
    'Sabaf Burners',
    'EPS Burners',
    'Tempered Glass',
    'Flame Failure Device',
    'Stainless steel finish',
    '5KW powerful burners',
    'Immediate Auto Ignition',
  ],
  'built-in-hobs': [
    'Complete Brass Burners',
    'Sabaf Burners',
    'EPS Burners',
    'Tempered Glass',
    'Flame Failure Device',
    'Stainless steel finish',
    '5KW powerful burners',
    'Immediate Auto Ignition',
  ],
  'geysers-heaters': [
    'Overheating Protection',
    'Wattage Control',
    'Fully Insulated',
    'Accurate Volume Capacity',
    'Incoloy 840 heating element',
    'Imported Brass safety Valves',
  ],
  'hybrid-geysers': [
    'Overheating Protection',
    'Wattage Control',
    'Fully Insulated',
    'Accurate Volume Capacity',
    'Incoloy 840 heating element',
    'Imported Brass safety Valves',
  ],
  'gas-water-heaters': [
    'Overheating Protection',
    'Wattage Control',
    'Fully Insulated',
    'Accurate Volume Capacity',
    'Incoloy 840 heating element',
    'Imported Brass safety Valves',
  ],
  'instant-electric-water-heaters': [
    'Overheating Protection',
    'Wattage Control',
    'Fully Insulated',
    'Accurate Volume Capacity',
    'Incoloy 840 heating element',
    'Imported Brass safety Valves',
  ],
  'fast-electric-water-heaters': [
    'Overheating Protection',
    'Wattage Control',
    'Fully Insulated',
    'Accurate Volume Capacity',
    'Incoloy 840 heating element',
    'Imported Brass safety Valves',
  ],
  'oven-toasters': [
    'Double Layered Glass door',
    'Inner lamp',
    'Rotisserie Function',
    'Convection Function',
    'Stainless steel elements',
  ],
  'water-dispensers': [
    'Food-grade stainless steel tanks',
    'Eco-friendly refrigerants',
    '100% copper coiling',
  ],
  'air-fryers': [
    'Digital Touch panel',
    'Wide Temperature Control',
    'Injection molding texture',
    'Non-stick coating',
    'Bottom heater for Even temperature control',
  ],
  'water-coolers': [
    'Adjustable Thermostat',
    'Food Grade Non Magnetic stainless steel',
    'High back pressure compressor',
    'Spring loaded push button',
  ],
  'storage-coolers': [
    'Adjustable Thermostat',
    'Food Grade Non Magnetic stainless steel',
    'High back pressure compressor',
    'Spring loaded push button',
  ],
  'cooking-ranges': [
    'Complete Brass Burners',
    'Tempered Glass',
    'Flame Failure Device',
    'Stainless steel finish',
    '5KW powerful burners',
    'Auto Ignition',
  ],
  'blenders-processors': [
    'Multi-Function Food processing',
    'Precision stainless steel blades & Discs',
    'Pulse & Speed control',
    'Generous Capacity',
  ],
  'room-coolers': [
    'High Air Delivery',
    'Large Water Tank',
    'Honeycomb Cooling Pads',
    'Inverter Compatible',
    'Low Power Consumption',
  ],
}

// Get features for a category by slug
const getCategoryFeatures = (slug: string): string[] => {
  return categoryFeatures[slug] || ['Premium Quality', 'Energy Efficient', '1 Year Warranty', 'Latest Technology']
}

interface Product {
  id: number
  name: string
  slug: string
  price: number
  compare_price?: number | null
  primary_image?: string | null
  stock_status: string
  is_new?: boolean
  is_bestseller?: boolean
  average_rating?: number
  review_count?: number
  category?: {
    name: string
    slug: string
  }
}

interface CategoryData {
  category: Category
  products: Product[]
}

export default function Category() {
  const { slug } = useParams<{ slug: string }>()
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)

  const { data, isLoading, error } = useQuery<CategoryData>({
    queryKey: ['category', slug],
    queryFn: async () => {
      const response = await api.get(`/api/categories/${slug}`)
      // API returns: { success, data: { category }, products: [...] }
      return {
        category: response.data.data.category,
        products: response.data.products || []
      }
    },
  })

  if (isLoading) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center bg-dark-50 dark:bg-dark-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <LoadingSpinner size="lg" />
      </motion.div>
    )
  }

  if (error || !data) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center bg-dark-50 dark:bg-dark-900"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center">
          <motion.h1
            className="text-2xl font-bold text-dark-900 dark:text-white mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Category not found
          </motion.h1>
          <motion.p
            className="text-dark-500 dark:text-dark-400 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            The category you're looking for doesn't exist.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link to="/shop" className="btn btn-primary">Browse All Products</Link>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  const { category, products } = data

  return (
    <motion.div
      className="min-h-screen bg-dark-50 dark:bg-dark-900 transition-colors duration-300"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 border-b border-dark-200 dark:border-dark-700">
        <div className="container mx-auto px-4 py-4 md:py-8">
          <motion.div
            className="flex items-center gap-2 text-xs md:text-sm text-dark-500 dark:text-dark-400 mb-3 md:mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Shop</Link>
            {category.parent && (
              <>
                <span>/</span>
                <Link to={`/category/${category.parent.slug}`} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  {category.parent.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-dark-900 dark:text-white">{category.name}</span>
          </motion.div>

          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            <motion.div
              className="w-20 h-20 md:w-24 md:h-24 bg-dark-100 dark:bg-dark-700 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <CategoryIcon slug={category.slug} className="w-14 h-14 md:w-16 md:h-16" />
            </motion.div>
            <div className="flex-1">
              <motion.h1
                className="text-2xl md:text-3xl font-bold text-dark-900 dark:text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {category.name}
              </motion.h1>
              <motion.p
                className="text-sm md:text-base text-dark-500 dark:text-dark-400 mt-1 mb-3 md:mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                {products?.length || 0} Products
              </motion.p>
              {/* Features as bullet points - Always show with fallback */}
              <motion.div
                className="flex flex-wrap gap-1.5 md:gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {(category.features && category.features.length > 0
                  ? category.features
                  : getCategoryFeatures(category.slug)
                ).map((feature, index) => (
                  <motion.span
                    key={index}
                    className="inline-flex items-center gap-1 md:gap-1.5 px-2 py-1 md:px-3 md:py-1.5 bg-dark-100 dark:bg-dark-700 rounded-full text-xs md:text-sm text-dark-700 dark:text-dark-300"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                  >
                    <svg className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </motion.span>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Subcategories */}
      {category.children && category.children.length > 0 && (
        <motion.div
          className="bg-white dark:bg-dark-800 border-b border-dark-200 dark:border-dark-700"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3 overflow-x-auto">
              <span className="text-dark-500 dark:text-dark-400 flex-shrink-0">Subcategories:</span>
              {category.children.map((child, index) => (
                <motion.div
                  key={child.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + index * 0.05 }}
                >
                  <Link
                    to={`/category/${child.slug}`}
                    className="px-4 py-2 bg-dark-100 dark:bg-dark-700 rounded-full text-sm font-medium text-dark-600 dark:text-dark-300 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-700 dark:hover:text-primary-400 flex-shrink-0 transition-all duration-300 hover:scale-105"
                  >
                    {child.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Products */}
      <div className="container mx-auto px-4 py-4 md:py-8">
        {products && products.length > 0 ? (
          <StaggerContainer
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4 lg:gap-6"
            staggerDelay={0.05}
          >
            {products.map((product) => (
              <StaggerItem key={product.id}>
                <HoverCard intensity={8}>
                  <ProductCard product={product} onQuickView={setQuickViewProduct} />
                </HoverCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <motion.div
            className="bg-white dark:bg-dark-800 rounded-xl p-12 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div
              className="text-6xl mb-4"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              📦
            </motion.div>
            <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">No products found</h3>
            <p className="text-dark-500 dark:text-dark-400 mb-6">
              There are no products in this category yet.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/shop" className="btn btn-primary">Browse All Products</Link>
            </motion.div>
          </motion.div>
        )}
      </div>

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
    </motion.div>
  )
}
