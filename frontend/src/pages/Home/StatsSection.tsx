import AnimatedSection from '@/components/ui/AnimatedSection'
import { AnimatedCounter } from './utils'

interface Stat {
  value: string
  label: string
}

interface StatsSectionProps {
  stats: Stat[]
}

export default function StatsSection({ stats }: StatsSectionProps) {
  return (
    <AnimatedSection animation="fade-up" duration={800} threshold={0.15} easing="gentle">
      <section className="section bg-white dark:bg-dark-950">
        <div className="container-xl">
          {/* Stats Grid - More whitespace */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12 lg:gap-16">
            {stats.map((stat) => {
              return (
                <div
                  key={stat.label}
                  className="text-center"
                >
                  {/* Value - Red Accent */}
                  <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-500 dark:text-primary-600 mb-3">
                    <AnimatedCounter value={stat.value} />
                  </div>

                  {/* Label */}
                  <div className="text-sm md:text-base text-dark-600 dark:text-dark-400 font-medium">
                    {stat.label}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </AnimatedSection>
  )
}
