import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { Popover, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import CategoryIcon from '@/components/ui/CategoryIcon'

interface Category {
  name: string
  slug: string
  href: string
  image?: string
  subcategories?: Array<{
    name: string
    href: string
  }>
}

const categories: Category[] = [
  {
    name: 'Built-in Hoods',
    slug: 'built-in-hoods',
    href: '/category/built-in-hoods',
    image: '/images/products/hood.png',
  },
  {
    name: 'Built-in Hobs',
    slug: 'built-in-hobs',
    href: '/category/built-in-hobs',
    image: '/images/products/hob.png',
  },
  {
    name: 'Oven Toasters',
    slug: 'oven-toasters',
    href: '/category/oven-toasters',
    image: '/images/products/oven-toasters/fot-2501c.jpg',
  },
  {
    name: 'Air Fryers',
    slug: 'air-fryers',
    href: '/category/air-fryers',
    image: '/images/products/air-fryer.png',
  },
  {
    name: 'Water Coolers',
    slug: 'water-coolers',
    href: '/category/water-coolers',
    image: '/images/products/water-cooler-100ltr.png',
  },
  {
    name: 'Water Dispensers',
    slug: 'water-dispensers',
    href: '/category/water-dispensers',
    image: '/images/products/water-dispensers/fwd-1150.jpeg',
  },
  {
    name: 'Geysers & Heaters',
    slug: 'geysers-heaters',
    href: '/category/geysers-heaters',
    image: '/images/products/gas-water-heaters/fgg-100g-hd.png',
    subcategories: [
      { name: 'Gas Water Heaters', href: '/category/gas-water-heaters' },
      { name: 'Electric + Gas Geysers', href: '/category/hybrid-geysers' },
      { name: 'Fast Electric Heaters', href: '/category/fast-electric-water-heaters' },
      { name: 'Instant Electric Heaters', href: '/category/instant-electric-water-heaters' },
    ],
  },
  {
    name: 'Cooking Ranges',
    slug: 'cooking-ranges',
    href: '/category/cooking-ranges',
    image: '/images/products/cooking-range-5-brass.png',
  },
  {
    name: 'Room Coolers',
    slug: 'room-coolers',
    href: '/category/room-coolers',
    image: '/images/products/storage-coolers/fst-100.png',
  },
  {
    name: 'Blenders & Processors',
    slug: 'blenders-processors',
    href: '/category/blenders-processors',
    // No image available, will use icon fallback
  },
]

interface ProductsMegaMenuProps {
  isHomePage?: boolean
  isScrolled?: boolean
}

export default function ProductsMegaMenu({ isHomePage, isScrolled }: ProductsMegaMenuProps) {
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
            <Popover.Panel className="absolute left-0 top-full mt-3 w-screen max-w-5xl bg-white dark:bg-dark-800 rounded-2xl shadow-2xl ring-1 ring-dark-100 dark:ring-dark-700 overflow-hidden z-50">
              <div className="p-6">
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
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
}
