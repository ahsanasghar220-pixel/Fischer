import AnimatedSection, { StaggeredChildren } from '@/components/ui/AnimatedSection'
import { StarIcon } from '@heroicons/react/24/outline'
import { iconMap, colorMap } from './utils'

interface Feature {
  icon?: string
  title: string
  description: string
  color?: string
}

interface FeaturesSectionProps {
  title?: string
  features: Feature[]
}

export default function FeaturesSection({ title = 'Why Choose Fischer', features }: FeaturesSectionProps) {
  const getIcon = (iconName?: string) => {
    if (!iconName) return StarIcon
    return iconMap[iconName] || StarIcon
  }

  const getColorClasses = (colorName?: string) => {
    return colorMap[colorName || 'primary'] || colorMap.primary
  }

  return (
    <AnimatedSection animation="fade-up" duration={800} threshold={0.08} easing="gentle">
      <section className="section bg-dark-50 dark:bg-dark-950">
        <div className="container-xl">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-dark-900 dark:text-white mb-4">
              {title}
            </h2>
          </div>

          <StaggeredChildren
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
            staggerDelay={100}
            duration={600}
            animation="fade-up"
            easing="gentle"
            once
          >
            {features.map((feature) => {
              const Icon = getIcon(feature.icon)
              const colors = getColorClasses(feature.color)
              return (
                <div
                  key={feature.title}
                  className="text-center p-4 sm:p-6 hover-lift"
                >
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 ${colors.bg} rounded-2xl mb-4`}>
                    <Icon className="w-6 h-6 md:w-8 md:h-8" style={{ color: colors.text }} />
                  </div>

                  <h3 className="text-lg font-bold text-dark-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-dark-600 dark:text-dark-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </StaggeredChildren>
        </div>
      </section>
    </AnimatedSection>
  )
}
