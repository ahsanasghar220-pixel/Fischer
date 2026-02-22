import { lazy, Suspense } from 'react'
import { StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import AnimatedSection from '@/components/ui/AnimatedSection'
import type { Testimonial } from './types'

const ProductCarousel = lazy(() => import('@/components/products/ProductCarousel'))

interface TestimonialsSectionProps {
  testimonials: Testimonial[]
  title?: string
  subtitle?: string
}

export default function TestimonialsSection({
  testimonials,
  title = 'Customer Reviews',
  subtitle = 'Trusted by thousands of Pakistani households and businesses',
}: TestimonialsSectionProps) {
  if (testimonials.length === 0) return null

  return (
    <AnimatedSection animation="fade-up" duration={1100} threshold={0.08} easing="gentle">
      <section className="section bg-dark-50 dark:bg-dark-950 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white dark:from-dark-900 to-transparent pointer-events-none" />
        <div className="container-xl relative">
          <AnimatedSection animation="fade-up" delay={150} duration={1000} easing="gentle">
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/20 dark:bg-primary-900/30 text-primary-800 dark:text-primary-400 text-sm font-semibold mb-4">
                <StarIcon className="w-4 h-4" />
                {title}
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-dark-900 dark:text-white">
                What Our <span className="text-primary-600 dark:text-primary-400">Customers</span> Say
              </h2>
              <p className="text-xl text-dark-500 dark:text-dark-400 mt-4 max-w-2xl mx-auto">{subtitle}</p>
            </div>
          </AnimatedSection>
        </div>
        <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw]">
          <Suspense fallback={null}>
            <ProductCarousel speed={70} gap={24} fixedCardWidth={400} fadeClass="from-dark-50 dark:from-dark-950">
              {testimonials.map((testimonial) => {
                const initials = testimonial.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()
                return (
                  <div
                    key={testimonial.name}
                    className="bg-white dark:bg-dark-800 rounded-2xl p-6 sm:p-8 shadow-lg border border-dark-100 dark:border-dark-700 h-full"
                  >
                    <div className="flex gap-0.5 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <StarSolidIcon
                          key={i}
                          className={`w-5 h-5 ${
                            i < testimonial.rating ? 'text-primary-500' : 'text-dark-200 dark:text-dark-700'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-base sm:text-lg text-dark-700 dark:text-dark-200 leading-relaxed mb-6 line-clamp-4">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center gap-3 mt-auto">
                      {testimonial.image ? (
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          width={40}
                          height={40}
                          loading="lazy"
                          decoding="async"
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-primary-100 dark:ring-primary-900/30"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement
                            if (fallback) fallback.classList.remove('hidden')
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 ${
                          testimonial.image ? 'hidden' : 'flex'
                        } items-center justify-center`}
                      >
                        <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{initials}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-dark-900 dark:text-white text-sm">{testimonial.name}</p>
                        <p className="text-xs text-dark-500 dark:text-dark-400">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </ProductCarousel>
          </Suspense>
        </div>
      </section>
    </AnimatedSection>
  )
}
