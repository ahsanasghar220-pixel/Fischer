import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import api from '@/lib/api'
import { getCategoryProductImage } from '@/lib/categoryImages'

interface Category {
  id: number
  name: string
  slug: string
  description?: string
  image?: string
  is_active: boolean
  sort_order?: number
}

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['all-categories'],
    queryFn: async () => {
      const res = await api.get('/api/categories')
      return (res.data.data as Category[]).filter(c => c.is_active)
    },
  })

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-900">
      {/* Hero header */}
      <div className="relative overflow-hidden bg-white dark:bg-dark-900 border-b border-dark-100 dark:border-dark-800">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-primary-500/5 dark:from-primary-600/10 dark:to-primary-600/5 pointer-events-none" />
        <div className="container-xl py-12 md:py-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-3 py-1 bg-primary-500/10 dark:bg-primary-500/20 text-primary-700 dark:text-primary-400 text-xs font-semibold rounded-full uppercase tracking-wider mb-4">
              All Categories
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark-900 dark:text-white font-display mb-3">
              Our Product Range
            </h1>
            <p className="text-dark-500 dark:text-dark-400 text-base md:text-lg max-w-xl">
              Designed Appliances for Modern Living — explore every category Fischer has to offer.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Category grid */}
      <div className="container-xl py-10 md:py-14">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-dark-200 dark:bg-dark-800 animate-pulse aspect-[3/4]" />
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {categories.map((category) => {
              const img = getCategoryProductImage(category.slug, category.image)
              return (
                <motion.div key={category.id} variants={cardVariants}>
                  <Link
                    to={`/category/${category.slug}`}
                    className="group flex flex-col bg-white dark:bg-dark-800 rounded-2xl overflow-hidden
                               border border-dark-100 dark:border-dark-700
                               shadow-sm hover:shadow-xl hover:shadow-primary-500/10
                               hover:border-primary-200 dark:hover:border-primary-700
                               [@media(hover:hover)]:hover:-translate-y-1
                               transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="relative aspect-square bg-gray-50 dark:bg-dark-700 overflow-hidden">
                      {img ? (
                        <img
                          src={img}
                          alt={category.name}
                          className="w-full h-full object-contain p-3 md:p-4
                                     group-hover:scale-105 transition-transform duration-500 ease-out"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-dark-300 dark:text-dark-600 text-4xl">
                          📦
                        </div>
                      )}
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-primary-600/20 via-transparent to-transparent
                                      opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Info */}
                    <div className="p-3 md:p-4 flex flex-col flex-1">
                      <h2 className="text-xs sm:text-sm md:text-base font-semibold text-dark-900 dark:text-white
                                     group-hover:text-primary-600 dark:group-hover:text-primary-400
                                     transition-colors duration-200 leading-snug mb-1">
                        {category.name}
                      </h2>
                      {category.description && (
                        <p className="hidden sm:block text-xs text-dark-400 dark:text-dark-500 leading-relaxed line-clamp-2 flex-1">
                          {category.description}
                        </p>
                      )}
                      <div className="flex items-center gap-1 text-primary-600 dark:text-primary-400 text-xs font-semibold mt-2 sm:mt-3">
                        Explore
                        <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-200" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* Bottom CTA */}
        {!isLoading && categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-12"
          >
            <p className="text-dark-500 dark:text-dark-400 text-sm mb-4">
              Can't find what you're looking for?
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600
                         text-white font-semibold rounded-xl transition-all duration-200
                         hover:shadow-lg hover:-translate-y-0.5 text-sm"
            >
              Browse All Products
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}
