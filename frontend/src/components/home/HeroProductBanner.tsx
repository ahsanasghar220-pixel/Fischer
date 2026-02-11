import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

interface ProductHighlight {
  name: string
  category: string
  image: string
  href: string
  description: string
}

const products: ProductHighlight[] = [
  {
    name: 'Built-in Hood',
    category: 'Kitchen Ventilation',
    image: '/images/products/hood.png',
    href: '/category/built-in-hoods',
    description: 'Powerful airflow up to 1500 m³/h',
  },
  {
    name: 'Built-in Hob',
    category: 'Cooking Solutions',
    image: '/images/products/hob.png',
    href: '/category/built-in-hobs',
    description: 'Premium brass burners with auto ignition',
  },
  {
    name: 'Oven Toaster',
    category: 'Baking Excellence',
    image: '/images/products/oven-toasters/fot-2501c.jpg',
    href: '/category/oven-toasters',
    description: 'Convection technology, 35L-48L capacity',
  },
  {
    name: 'Air Fryer',
    category: 'Healthy Cooking',
    image: '/images/products/air-fryer.png',
    href: '/category/air-fryers',
    description: 'Oil-free frying with digital controls',
  },
  {
    name: 'Water Dispenser',
    category: 'Water Solutions',
    image: '/images/products/water-dispensers/fwd-1150.jpeg',
    href: '/category/water-dispensers',
    description: 'Hot & cold, food-grade stainless steel',
  },
]

export default function HeroProductBanner() {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-dark-50 via-white to-primary-50/30 dark:from-dark-900 dark:via-dark-900 dark:to-dark-800">
      <div className="container-xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 lg:mb-16"
        >
          <span className="inline-block px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm font-semibold mb-4">
            Our Bestsellers
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-dark-900 dark:text-white font-display mb-4">
            Discover Fischer Essentials
          </h2>
          <p className="text-lg text-dark-600 dark:text-dark-400 max-w-2xl mx-auto">
            Premium appliances trusted by thousands of Pakistani families
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4">
          {products.map((product, index) => (
            <motion.div
              key={product.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <Link
                to={product.href}
                className="block bg-white dark:bg-dark-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                {/* Image Container */}
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-700 dark:to-dark-600 p-6 relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%239ca3af"%3EImage%3C/text%3E%3C/svg%3E'
                    }}
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2">
                    {product.category}
                  </div>
                  <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-dark-600 dark:text-dark-400 mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold text-sm">
                    Explore
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700
                     text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
          >
            View All Products
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
