import { Link } from 'react-router-dom'
import { CheckCircleIcon } from '@heroicons/react/24/solid'

export default function About() {
  const milestones = [
    { year: '1995', title: 'Company Founded', description: 'Fischer Pakistan established with a vision to provide quality home appliances' },
    { year: '2000', title: 'First Factory', description: 'Opened our first manufacturing facility in Lahore' },
    { year: '2008', title: 'ISO Certification', description: 'Achieved ISO 9001:2008 certification for quality management' },
    { year: '2015', title: 'National Expansion', description: 'Expanded dealer network to all major cities in Pakistan' },
    { year: '2020', title: 'Digital Transformation', description: 'Launched online store and digital service platforms' },
    { year: '2024', title: 'Innovation Lab', description: 'Established R&D center for new product development' },
  ]

  const values = [
    { title: 'Quality First', description: 'Every product meets strict quality standards before reaching customers' },
    { title: 'Customer Focus', description: 'We prioritize customer satisfaction in everything we do' },
    { title: 'Innovation', description: 'Continuously improving our products with latest technology' },
    { title: 'Integrity', description: 'Honest and transparent business practices' },
    { title: 'Sustainability', description: 'Committed to environmentally responsible manufacturing' },
    { title: 'Community', description: 'Supporting local communities and creating employment' },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900 transition-colors">
      {/* Hero */}
      <section className="bg-dark-900 dark:bg-dark-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About Fischer Pakistan
            </h1>
            <p className="text-xl text-dark-300 dark:text-dark-400 leading-relaxed">
              For over 25 years, Fischer has been a trusted name in Pakistani households,
              providing quality home appliances that make everyday life easier and more comfortable.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white dark:bg-dark-900">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-dark-900 dark:text-white mb-6">Our Story</h2>
              <div className="space-y-4 text-dark-600 dark:text-dark-400">
                <p>
                  Founded in 1995, Fischer Pakistan started with a simple mission: to provide
                  high-quality, affordable home appliances to Pakistani families. What began
                  as a small operation has grown into one of the country's most trusted
                  appliance brands.
                </p>
                <p>
                  Our journey has been marked by continuous innovation, unwavering commitment
                  to quality, and deep understanding of Pakistani households' needs. Today,
                  Fischer products can be found in millions of homes across the country.
                </p>
                <p>
                  We take pride in our ISO 9001:2015 certification, which reflects our
                  dedication to maintaining the highest quality standards in every product
                  we manufacture.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="/images/about-factory.jpg"
                alt="Fischer Factory"
                className="rounded-xl shadow-2xl"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/600x400/313131/f4b42c?text=Fischer+Factory'
                }}
              />
              <div className="absolute -bottom-6 -left-6 bg-primary-500 text-dark-900 p-6 rounded-xl shadow-lg">
                <span className="text-4xl font-bold">25+</span>
                <span className="block text-sm">Years of Excellence</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-dark-50 dark:bg-dark-800 py-16 transition-colors">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <span className="text-4xl md:text-5xl font-bold text-primary-500">500+</span>
              <span className="block text-dark-600 dark:text-dark-400 mt-2">Dealers Nationwide</span>
            </div>
            <div className="text-center">
              <span className="text-4xl md:text-5xl font-bold text-primary-500">1M+</span>
              <span className="block text-dark-600 dark:text-dark-400 mt-2">Happy Customers</span>
            </div>
            <div className="text-center">
              <span className="text-4xl md:text-5xl font-bold text-primary-500">50+</span>
              <span className="block text-dark-600 dark:text-dark-400 mt-2">Products</span>
            </div>
            <div className="text-center">
              <span className="text-4xl md:text-5xl font-bold text-primary-500">100+</span>
              <span className="block text-dark-600 dark:text-dark-400 mt-2">Service Centers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-white dark:bg-dark-900 transition-colors">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-dark-900 dark:text-white text-center mb-12">Our Journey</h2>
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-dark-200 dark:bg-dark-700" />

              {milestones.map((milestone, index) => (
                <div
                  key={milestone.year}
                  className={`relative flex items-center mb-8 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'} pl-12 md:pl-0`}>
                    <div className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-sm border border-dark-100 dark:border-dark-700">
                      <span className="text-primary-500 font-bold">{milestone.year}</span>
                      <h3 className="text-lg font-semibold text-dark-900 dark:text-white mt-1">{milestone.title}</h3>
                      <p className="text-dark-500 dark:text-dark-400 text-sm mt-2">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="absolute left-4 md:left-1/2 w-8 h-8 -translate-x-1/2 bg-primary-500 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-dark-900 dark:bg-dark-800 text-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value) => (
              <div key={value.title} className="bg-dark-800 dark:bg-dark-700 p-6 rounded-xl">
                <CheckCircleIcon className="w-10 h-10 text-primary-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-dark-300 dark:text-dark-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 bg-white dark:bg-dark-900 transition-colors">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-dark-900 dark:text-white mb-4">Quality Certifications</h2>
            <p className="text-dark-500 dark:text-dark-400 max-w-2xl mx-auto">
              Our commitment to quality is backed by international certifications and standards
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="w-32 h-32 bg-dark-100 dark:bg-dark-800 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <span className="text-2xl font-bold text-dark-900 dark:text-white">ISO</span>
                <span className="block text-sm text-dark-500 dark:text-dark-400">9001:2015</span>
              </div>
            </div>
            <div className="w-32 h-32 bg-dark-100 dark:bg-dark-800 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <span className="text-2xl font-bold text-dark-900 dark:text-white">CE</span>
                <span className="block text-sm text-dark-500 dark:text-dark-400">Certified</span>
              </div>
            </div>
            <div className="w-32 h-32 bg-dark-100 dark:bg-dark-800 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <span className="text-2xl font-bold text-dark-900 dark:text-white">PSQCA</span>
                <span className="block text-sm text-dark-500 dark:text-dark-400">Approved</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-500 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-dark-900 mb-4">
            Ready to Experience Fischer Quality?
          </h2>
          <p className="text-dark-700 mb-8 max-w-2xl mx-auto">
            Browse our collection of home appliances and discover why millions trust Fischer
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/shop" className="btn bg-dark-900 text-white hover:bg-dark-800 px-8">
              Shop Now
            </Link>
            <Link to="/contact" className="btn bg-white text-dark-900 hover:bg-dark-50 px-8">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
