import AnimatedSection from '@/components/ui/AnimatedSection'

interface BrandStatementProps {
  title: string
  subtitle: string
}

export default function BrandStatement({ title, subtitle }: BrandStatementProps) {
  return (
    <AnimatedSection animation="fade-up" duration={800} threshold={0.1} easing="gentle">
      <section className="section bg-white dark:bg-dark-900">
        <div className="container-xl text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-dark-900 dark:text-white mb-6">
            {title}
          </h2>
          <p className="text-xl md:text-2xl text-dark-600 dark:text-dark-400 max-w-3xl mx-auto">
            {subtitle}
          </p>
        </div>
      </section>
    </AnimatedSection>
  )
}
