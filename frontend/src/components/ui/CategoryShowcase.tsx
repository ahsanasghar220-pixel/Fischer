import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

// Category icon mapping based on common category names
const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase()

  if (name.includes('water') && name.includes('cooler')) {
    return (
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  }
  if (name.includes('geyser') || name.includes('heater')) {
    return (
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
      </svg>
    )
  }
  if (name.includes('cooking') || name.includes('range')) {
    return (
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  }
  if (name.includes('hob') || name.includes('hood') || name.includes('ventilation')) {
    return (
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    )
  }
  if (name.includes('dispenser')) {
    return (
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    )
  }
  if (name.includes('kitchen') || name.includes('appliance')) {
    return (
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    )
  }

  // Default icon for other categories
  return (
    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z" />
    </svg>
  )
}

interface Category {
  name: string
  slug: string
  image?: string
  description?: string
  productCount?: number
}

interface CategoryShowcaseProps {
  categories: Category[]
  title?: string
  subtitle?: string
}

export default function CategoryShowcase({ categories, title, subtitle }: CategoryShowcaseProps) {
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {subtitle && (
              <p className="text-primary-500 font-semibold text-sm md:text-base tracking-wider uppercase mb-2">
                {subtitle}
              </p>
            )}
            {title && (
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark-900 dark:text-white">
                {title}
              </h2>
            )}
          </div>
        )}

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {categories.map((category, index) => {
            // Define icon gradient colors for each category
            const iconGradients = [
              'from-blue-500 to-cyan-500',
              'from-orange-500 to-red-500',
              'from-purple-500 to-pink-500',
              'from-emerald-500 to-teal-500',
              'from-amber-500 to-yellow-500',
              'from-indigo-500 to-purple-500',
            ]
            const iconGradient = iconGradients[index % iconGradients.length]

            return (
              <Link
                key={category.slug}
                to={`/category/${category.slug}`}
                className="group relative bg-white dark:bg-dark-800 rounded-3xl overflow-hidden
                         transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:shadow-primary-500/20
                         border-2 border-dark-100 dark:border-dark-700 hover:border-primary-500/30"
              >
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-dark-50/50 to-transparent dark:from-dark-900/50 dark:to-transparent" />

                {/* Content */}
                <div className="relative p-8 md:p-10">
                  {/* Icon Badge */}
                  <div className="mb-6">
                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${iconGradient} p-4 shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110 flex items-center justify-center text-white`}>
                      {getCategoryIcon(category.name)}
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="space-y-3">
                    <h3 className="text-2xl md:text-3xl font-bold text-dark-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {category.name}
                    </h3>

                    {category.description && (
                      <p className="text-sm md:text-base text-dark-600 dark:text-dark-400 line-clamp-2 leading-relaxed">
                        {category.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-4">
                      {category.productCount !== undefined && (
                        <p className="text-sm md:text-base text-dark-500 dark:text-dark-400 font-semibold">
                          {category.productCount} Products
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-sm md:text-base
                                   transform transition-all duration-500 group-hover:gap-3 group-hover:translate-x-1">
                        <span>Explore</span>
                        <ArrowRightIcon className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom highlight bar on hover */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-amber-400 to-primary-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-left" />

                {/* Shine effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
