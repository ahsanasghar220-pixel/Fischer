import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import ScrollReveal, { StaggerContainer, StaggerItem } from '@/components/effects/ScrollReveal'

export default function About() {
  const milestones = [
    { year: '1990', title: 'Company Founded', description: 'Fischer Pakistan (Fatima Engineering Works) established with a vision to provide quality home appliances' },
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
    <motion.div
      className="min-h-screen bg-white dark:bg-dark-900 transition-colors"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Hero */}
      <section className="bg-dark-900 dark:bg-dark-800 text-white py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <motion.h1
              className="text-2xl md:text-4xl lg:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              About Fischer Pakistan
            </motion.h1>
            <motion.p
              className="text-base md:text-xl text-dark-300 dark:text-dark-400 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              For over 35 years, Fischer has been a trusted name in Pakistani households,
              providing quality home appliances that make everyday life easier and more comfortable.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <ScrollReveal animation="fadeUp">
        <section className="py-16 bg-white dark:bg-dark-900">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-dark-900 dark:text-white mb-4 sm:mb-6">Our Story</h2>
                <div className="space-y-4 text-dark-600 dark:text-dark-400">
                  <p>
                    Founded in 1990, Fischer Pakistan (Fatima Engineering Works) was built on one
                    mission: to bring reliable, high-quality home appliances to Pakistani families
                    at prices they can afford. What started as a modest operation has grown into
                    one of Pakistan's most recognized and trusted appliance brands.
                  </p>
                  <p>
                    Over three decades, we have stayed true to our roots — continuous innovation,
                    uncompromising quality, and a genuine understanding of what Pakistani households
                    need. Today, Fischer appliances are present in millions of homes across the country.
                  </p>
                  <p>
                    Our ISO 9001:2015 certification is a mark of that commitment — ensuring every
                    product that leaves our facility meets the highest quality and safety standards.
                  </p>
                </div>
              </motion.div>
              <motion.div
                className="relative"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <motion.img
                  src="/images/about-fischer.webp"
                  alt="Fischer Pakistan"
                  width={600}
                  height={400}
                  className="rounded-xl shadow-2xl w-full h-auto"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/600x400/313131/f4b42c?text=Fischer+Factory'
                  }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                />
                <motion.div
                  className="absolute -bottom-6 -left-6 bg-primary-500 text-dark-900 p-6 rounded-xl shadow-lg"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                >
                  <span className="text-4xl font-bold">35+</span>
                  <span className="block text-sm">Years of Excellence</span>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Stats */}
      <section className="bg-dark-50 dark:bg-dark-800 py-16 transition-colors overflow-hidden">
        <div className="container mx-auto px-4">
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8" staggerDelay={0.1}>
            {[
              { value: '500+', label: 'Dealers Nationwide' },
              { value: '1M+', label: 'Happy Customers' },
              { value: '50+', label: 'Products' },
              { value: '100+', label: 'Service Centers' },
            ].map((stat) => (
              <StaggerItem key={stat.label}>
                <motion.div
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.span
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-500 block"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    {stat.value}
                  </motion.span>
                  <span className="block text-dark-600 dark:text-dark-400 mt-2">{stat.label}</span>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Timeline */}
      <ScrollReveal animation="fadeUp">
        <section className="py-16 bg-white dark:bg-dark-900 transition-colors">
          <div className="container mx-auto px-4">
            <motion.h2
              className="text-2xl sm:text-3xl font-bold text-dark-900 dark:text-white text-center mb-8 sm:mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Our Journey
            </motion.h2>
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Line */}
                <motion.div
                  className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-dark-200 dark:bg-dark-700"
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1 }}
                  style={{ originY: 0 }}
                />

                {milestones.map((milestone, index) => (
                  <motion.div
                    key={milestone.year}
                    className={`relative flex items-center mb-8 ${
                      index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                    }`}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'} pl-12 md:pl-0`}>
                      <motion.div
                        className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-sm border border-dark-100 dark:border-dark-700"
                        whileHover={{ scale: 1.02, y: -4 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <span className="text-primary-500 font-bold">{milestone.year}</span>
                        <h3 className="text-lg font-semibold text-dark-900 dark:text-white mt-1">{milestone.title}</h3>
                        <p className="text-dark-500 dark:text-dark-400 text-sm mt-2">{milestone.description}</p>
                      </motion.div>
                    </div>
                    <motion.div
                      className="absolute left-4 md:left-1/2 w-8 h-8 -translate-x-1/2 bg-primary-500 rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.2, type: 'spring', stiffness: 300 }}
                    >
                      <div className="w-3 h-3 bg-white rounded-full" />
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Values */}
      <section className="bg-dark-900 dark:bg-dark-800 text-white py-16 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Our Values
          </motion.h2>
          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.08}>
            {values.map((value) => (
              <StaggerItem key={value.title}>
                <motion.div
                  className="bg-dark-800 dark:bg-dark-700 p-6 rounded-xl h-full"
                  whileHover={{ scale: 1.03, y: -4 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <CheckCircleIcon className="w-10 h-10 text-primary-500 mb-4" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-dark-300 dark:text-dark-400">{value.description}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Certifications */}
      <ScrollReveal animation="fadeUp">
        <section className="py-16 bg-white dark:bg-dark-900 transition-colors">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-dark-900 dark:text-white mb-4">Quality Certifications</h2>
              <p className="text-dark-500 dark:text-dark-400 max-w-2xl mx-auto">
                Our commitment to quality is backed by international certifications and standards
              </p>
            </motion.div>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {[
                { name: 'ISO', sub: '9001:2015' },
                { name: 'CE', sub: 'Certified' },
                { name: 'PSQCA', sub: 'Approved' },
              ].map((cert, index) => (
                <motion.div
                  key={cert.name}
                  className="w-32 h-32 bg-dark-100 dark:bg-dark-800 rounded-xl flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                  whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, type: 'spring', stiffness: 200 }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <div className="text-center">
                    <span className="text-2xl font-bold text-dark-900 dark:text-white">{cert.name}</span>
                    <span className="block text-sm text-dark-500 dark:text-dark-400">{cert.sub}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* CTA */}
      <section className="bg-primary-500 py-16 overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            className="text-3xl font-bold text-dark-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Ready to Experience Fischer Quality?
          </motion.h2>
          <motion.p
            className="text-dark-700 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Browse our collection of home appliances and discover why millions trust Fischer
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/shop" className="btn bg-dark-900 text-white hover:bg-dark-800 px-8">
                Shop Now
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/contact" className="btn bg-white text-dark-900 hover:bg-dark-50 px-8">
                Contact Us
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}
