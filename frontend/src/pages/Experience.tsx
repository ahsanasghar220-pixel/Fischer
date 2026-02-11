import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import {
  BuildingStorefrontIcon,
  SparklesIcon,
  UserGroupIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'

export default function Experience() {
  const features = [
    {
      icon: BuildingStorefrontIcon,
      title: 'Modern Showrooms',
      description: 'Visit our state-of-the-art showrooms featuring the complete Fischer product range in elegant, interactive displays.',
    },
    {
      icon: SparklesIcon,
      title: 'Live Demonstrations',
      description: 'Experience our products in action with live cooking demonstrations and product testing opportunities.',
    },
    {
      icon: UserGroupIcon,
      title: 'Expert Consultations',
      description: 'Get personalized guidance from our product experts to find the perfect appliances for your needs.',
    },
    {
      icon: MapPinIcon,
      title: 'Nationwide Presence',
      description: 'Find Fischer experience centers across Pakistan, bringing premium appliances closer to you.',
    },
  ]

  const locations = [
    {
      city: 'Lahore',
      address: 'Peco Road, Lahore',
      phone: '+92 321 1146642',
      hours: 'Mon-Sat: 9:00 AM - 6:00 PM',
    },
  ]

  return (
    <>
      <Helmet>
        <title>Fischer Experience Centers | Visit Our Showrooms</title>
        <meta
          name="description"
          content="Visit Fischer's modern experience centers across Pakistan. Explore our complete range of kitchen and home appliances with live demonstrations and expert consultations."
        />
      </Helmet>

      <div className="min-h-screen bg-white dark:bg-dark-900">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-800/20 rounded-full blur-3xl" />

          <div className="relative container-xl py-20 lg:py-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h1 className="text-4xl lg:text-6xl font-bold font-display mb-6">
                Experience Fischer
              </h1>
              <p className="text-xl lg:text-2xl text-white/90 mb-8">
                Visit our showrooms and discover why thousands of Pakistani families trust Fischer for their home appliances
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="#locations"
                  className="px-8 py-4 bg-white text-primary-700 rounded-xl font-semibold
                           hover:bg-primary-50 transition-all duration-200 inline-flex items-center gap-2"
                >
                  <MapPinIcon className="w-5 h-5" />
                  Find a Showroom
                </a>
                <a
                  href="tel:+923211146642"
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold
                           hover:bg-white/20 transition-all duration-200 inline-flex items-center gap-2 border border-white/20"
                >
                  <BuildingStorefrontIcon className="w-5 h-5" />
                  Schedule a Visit
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 lg:py-24 bg-gray-50 dark:bg-dark-800">
          <div className="container-xl">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-dark-900 dark:text-white font-display mb-4">
                What to Expect
              </h2>
              <p className="text-lg text-dark-600 dark:text-dark-400 max-w-2xl mx-auto">
                Our experience centers offer more than just products – they provide a complete journey into the world of Fischer quality
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white dark:bg-dark-900 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-6">
                    <feature.icon className="w-7 h-7 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-dark-600 dark:text-dark-400">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Section - Placeholder for future images */}
        <section className="py-16 lg:py-24">
          <div className="container-xl">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-dark-900 dark:text-white font-display mb-4">
                Our Showrooms
              </h2>
              <p className="text-lg text-dark-600 dark:text-dark-400 max-w-2xl mx-auto">
                Step into our elegantly designed spaces where innovation meets tradition
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-800 dark:to-dark-700
                           rounded-2xl overflow-hidden group cursor-pointer"
                >
                  <div className="w-full h-full flex items-center justify-center text-dark-400 dark:text-dark-500">
                    <BuildingStorefrontIcon className="w-20 h-20 opacity-50 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-dark-600 dark:text-dark-400 text-sm">
                Gallery images coming soon. Visit our showrooms to see the complete Fischer experience.
              </p>
            </div>
          </div>
        </section>

        {/* Locations Section */}
        <section id="locations" className="py-16 lg:py-24 bg-gray-50 dark:bg-dark-800">
          <div className="container-xl">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-dark-900 dark:text-white font-display mb-4">
                Visit Us
              </h2>
              <p className="text-lg text-dark-600 dark:text-dark-400 max-w-2xl mx-auto">
                Find a Fischer experience center near you
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {locations.map((location, index) => (
                <motion.div
                  key={location.city}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white dark:bg-dark-900 rounded-2xl p-8 shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                      <MapPinIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-dark-900 dark:text-white">
                      {location.city}
                    </h3>
                  </div>

                  <div className="space-y-4 text-dark-600 dark:text-dark-400">
                    <div>
                      <div className="font-semibold text-dark-800 dark:text-dark-200 mb-1">Address</div>
                      <p>{location.address}</p>
                    </div>
                    <div>
                      <div className="font-semibold text-dark-800 dark:text-dark-200 mb-1">Phone</div>
                      <a href={`tel:${location.phone}`} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                        {location.phone}
                      </a>
                    </div>
                    <div>
                      <div className="font-semibold text-dark-800 dark:text-dark-200 mb-1">Hours</div>
                      <p>{location.hours}</p>
                    </div>
                  </div>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 w-full px-6 py-3 bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700
                             text-white font-semibold rounded-xl transition-all duration-200 inline-flex items-center justify-center gap-2"
                  >
                    <MapPinIcon className="w-5 h-5" />
                    Get Directions
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
          <div className="container-xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-3xl lg:text-4xl font-bold font-display mb-6">
                Ready to Experience Fischer?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Visit our showroom or contact us to schedule a personalized consultation with our appliance experts
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="tel:+923211146642"
                  className="px-8 py-4 bg-white text-primary-700 rounded-xl font-semibold
                           hover:bg-primary-50 transition-all duration-200"
                >
                  Call Us Now
                </a>
                <a
                  href="https://wa.me/923211146642?text=Hello%20Fischer%2C%20I%20need%20assistance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold
                           hover:bg-white/20 transition-all duration-200 border border-white/20"
                >
                  WhatsApp Us
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  )
}
