import { Fragment, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Popover, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import CategoryIcon from '@/components/ui/CategoryIcon'
import api from '@/lib/api'
import { formatPrice } from '@/lib/utils'

interface Category {
  id?: number
  name: string
  slug: string
  href?: string
  image?: string
  parent_id?: number | null
  subcategories?: Category[]
  children?: Category[]
}

// Menu category with required href (always generated from slug)
interface MenuCategory {
  name: string
  slug: string
  href: string
  image?: string
  subcategories?: Array<{
    name: string
    href: string
  }>
}

interface ProductsMegaMenuProps {
  isHomePage?: boolean
  isScrolled?: boolean
}

interface Product {
  id: number
  name: string
  slug: string
  price: number
  compare_price?: number | null
  primary_image?: string | null
}

export default function ProductsMegaMenu({ isHomePage, isScrolled }: ProductsMegaMenuProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [categoryProducts, setCategoryProducts] = useState<Record<string, Product[]>>({})
  const [loadingProducts, setLoadingProducts] = useState(false)

  // Fetch categories from API
  const { data: categoriesData } = useQuery({
    queryKey: ['megamenu-categories'],
    queryFn: async () => {
      const response = await api.get('/categories')
      return response.data.data
    },
  })

  // Transform API categories to match component structure
  const categories: MenuCategory[] = categoriesData
    ? categoriesData
        .filter((cat: Category) => !cat.parent_id) // Only parent categories
        .map((cat: Category) => ({
          name: cat.name,
          slug: cat.slug,
          href: `/category/${cat.slug}`,
          image: cat.image,
          subcategories: categoriesData
            .filter((sub: Category) => sub.parent_id === cat.id)
            .map((sub: Category) => ({
              name: sub.name,
              href: `/category/${sub.slug}`,
            })),
        }))
    : []

  // Fetch products when hovering over a category
  useEffect(() => {
    if (!hoveredCategory || categoryProducts[hoveredCategory]) return

    const fetchCategoryProducts = async () => {
      setLoadingProducts(true)
      try {
        const response = await api.get(`/products?category=${hoveredCategory}&per_page=4`)
        setCategoryProducts(prev => ({
          ...prev,
          [hoveredCategory]: response.data.data.slice(0, 4)
        }))
      } catch (error) {
        console.error('Failed to fetch category products:', error)
      } finally {
        setLoadingProducts(false)
      }
    }

    fetchCategoryProducts()
  }, [hoveredCategory, categoryProducts])

  return (
    <Popover className="relative">
      {({ open, close }: { open: boolean; close: () => void }) => (
        <>
          <Popover.Button
            className={`flex items-center gap-x-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              open
                ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                : isHomePage && !isScrolled
                ? 'text-white hover:text-white/80 hover:bg-white/10'
                : 'text-dark-700 dark:text-dark-300 hover:text-dark-900 dark:hover:text-white hover:bg-dark-100 dark:hover:bg-dark-800'
            }`}
          >
            Products
            <ChevronDownIcon
              className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            />
          </Popover.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-2"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-2"
          >
            <Popover.Panel className="absolute left-0 top-full mt-3 w-screen max-w-6xl bg-white dark:bg-dark-800 rounded-2xl shadow-2xl ring-1 ring-dark-100 dark:ring-dark-700 overflow-hidden z-50">
              <div className="flex">
                {/* Left side: Categories */}
                <div className="flex-1 p-6 border-r border-dark-100 dark:border-dark-700">
                  {/* Header */}
                  <div className="mb-5">
                    <h3 className="text-base font-bold text-dark-900 dark:text-white mb-1">
                      Our Products
                    </h3>
                    <p className="text-xs text-dark-600 dark:text-dark-400">
                      Explore our complete range of premium appliances
                    </p>
                  </div>

                  {/* Categories Grid - Responsive: 2 cols on mobile, 3 on tablet, 5 on desktop */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {categories.map((category, index) => (
                    <motion.div
                      key={category.slug}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03, duration: 0.2 }}
                      className="group"
                      onMouseEnter={() => setHoveredCategory(category.slug)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    >
                      <Link
                        to={category.href}
                        onClick={() => close()}
                        className="block"
                      >
                        {/* Category Image/Icon */}
                        <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-700 dark:to-dark-600 rounded-xl overflow-hidden mb-2 relative flex items-center justify-center">
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                // Fallback to icon if image fails
                                const target = e.currentTarget
                                const parent = target.parentElement
                                target.style.display = 'none'
                                if (parent) {
                                  parent.classList.add('p-8')
                                }
                              }}
                            />
                          ) : (
                            // Use CategoryIcon as fallback for categories without images
                            <div className="p-8">
                              <CategoryIcon slug={category.slug} className="w-full h-full" />
                            </div>
                          )}
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-primary-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>

                        {/* Category Name */}
                        <h4 className="text-xs font-semibold text-dark-900 dark:text-white text-center group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-tight">
                          {category.name}
                        </h4>
                      </Link>

                      {/* Subcategories - outside the main link to avoid nested <a> tags */}
                      {category.subcategories && (
                        <ul className="mt-1.5 space-y-0.5">
                          {category.subcategories.slice(0, 3).map((sub) => (
                            <li key={sub.href}>
                              <Link
                                to={sub.href}
                                onClick={() => close()}
                                className="text-[10px] text-dark-500 dark:text-dark-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors block text-center line-clamp-1"
                              >
                                {sub.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </motion.div>
                  ))}
                  </div>

                  {/* Footer CTA */}
                  <div className="mt-5 pt-4 border-t border-dark-200 dark:border-dark-700 flex items-center justify-between">
                    <p className="text-xs text-dark-600 dark:text-dark-400">
                      Can't find what you're looking for?
                    </p>
                    <Link
                      to="/shop"
                      onClick={() => close()}
                      className="px-5 py-2 bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 text-white text-xs font-semibold rounded-lg transition-all duration-200 hover:shadow-lg"
                    >
                      Browse All Products
                    </Link>
                  </div>
                </div>

                {/* Right side: Product Preview - Desktop only */}
                <div className="hidden lg:block w-80 p-6 bg-dark-50 dark:bg-dark-900/50">
                  <AnimatePresence mode="wait">
                    {hoveredCategory ? (
                      <motion.div
                        key={hoveredCategory}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h4 className="text-sm font-bold text-dark-900 dark:text-white mb-4 capitalize">
                          {categories.find(c => c.slug === hoveredCategory)?.name || 'Products'}
                        </h4>

                        {loadingProducts && !categoryProducts[hoveredCategory] ? (
                          <div className="space-y-3">
                            {[1, 2, 3, 4].map((i) => (
                              <div key={i} className="animate-pulse flex gap-3">
                                <div className="w-16 h-16 bg-dark-200 dark:bg-dark-700 rounded-lg" />
                                <div className="flex-1 space-y-2">
                                  <div className="h-3 bg-dark-200 dark:bg-dark-700 rounded w-3/4" />
                                  <div className="h-3 bg-dark-200 dark:bg-dark-700 rounded w-1/2" />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : categoryProducts[hoveredCategory]?.length > 0 ? (
                          <div className="space-y-3">
                            {categoryProducts[hoveredCategory].map((product, index) => (
                              <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                              >
                                <Link
                                  to={`/product/${product.slug}`}
                                  onClick={() => close()}
                                  className="flex gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-dark-800 transition-colors group"
                                >
                                  <div className="w-16 h-16 flex-shrink-0 bg-white dark:bg-dark-800 rounded-lg overflow-hidden">
                                    {product.primary_image ? (
                                      <img
                                        src={product.primary_image}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-2xl">
                                        📦
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="text-xs font-medium text-dark-900 dark:text-white line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                      {product.name}
                                    </h5>
                                    <p className="text-sm font-bold text-primary-600 dark:text-primary-400 mt-1">
                                      {formatPrice(product.price)}
                                    </p>
                                  </div>
                                </Link>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-dark-500 dark:text-dark-400 text-center py-8">
                            No products available
                          </p>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center h-full text-center py-12"
                      >
                        <div className="text-6xl mb-4">👈</div>
                        <p className="text-sm text-dark-600 dark:text-dark-400">
                          Hover over a category to see products
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
}
