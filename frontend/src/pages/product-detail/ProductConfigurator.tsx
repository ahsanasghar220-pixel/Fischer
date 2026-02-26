import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ProductConfigurator as ConfiguratorType, ConfiguratorVariant } from '@/types'

interface ProductConfiguratorProps {
  configurator: ConfiguratorType
  onVariantSelect: (variant: ConfiguratorVariant | null) => void
}

export default function ProductConfigurator({ configurator, onVariantSelect }: ProductConfiguratorProps) {
  const [selectedValues, setSelectedValues] = useState<Record<number, number>>({})

  const allSelected = configurator.attributes.every(attr => selectedValues[attr.id] !== undefined)

  const resolvedVariant = useMemo<ConfiguratorVariant | null>(() => {
    if (!allSelected) return null
    const key = Object.values(selectedValues).sort((a, b) => a - b).join(',')
    return configurator.variant_map[key] ?? null
  }, [selectedValues, allSelected, configurator.variant_map])

  // A value is "available" if it can lead to at least one variant given other current selections
  const isValueAvailable = (attrId: number, valueId: number): boolean => {
    const otherSelections = Object.entries(selectedValues)
      .filter(([aId]) => Number(aId) !== attrId)
      .map(([, vId]) => vId)

    return Object.keys(configurator.variant_map).some(key => {
      const ids = key.split(',').map(Number)
      return ids.includes(valueId) && otherSelections.every(vId => ids.includes(vId))
    })
  }

  // A value is "in stock" if at least one reachable variant has stock > 0
  const isValueInStock = (attrId: number, valueId: number): boolean => {
    const otherSelections = Object.entries(selectedValues)
      .filter(([aId]) => Number(aId) !== attrId)
      .map(([, vId]) => vId)

    return Object.entries(configurator.variant_map).some(([key, variant]) => {
      const ids = key.split(',').map(Number)
      return ids.includes(valueId) && otherSelections.every(vId => ids.includes(vId)) && variant.stock > 0
    })
  }

  const handleSelect = (attrId: number, valueId: number) => {
    const newValues = { ...selectedValues, [attrId]: valueId }
    setSelectedValues(newValues)

    const isComplete = configurator.attributes.every(attr => newValues[attr.id] !== undefined)
    if (isComplete) {
      const key = Object.values(newValues).sort((a, b) => a - b).join(',')
      onVariantSelect(configurator.variant_map[key] ?? null)
    } else {
      onVariantSelect(null)
    }
  }

  return (
    <div className="space-y-5 mb-6">
      {configurator.attributes.map((attr, attrIndex) => {
        const selectedValueLabel = attr.values.find(v => v.id === selectedValues[attr.id])?.value

        return (
          <motion.div
            key={attr.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: attrIndex * 0.06 }}
          >
            {/* Attribute label row */}
            <div className="flex items-center gap-1.5 mb-2.5">
              <span className="text-sm font-semibold text-dark-900 dark:text-white">{attr.name}</span>
              <AnimatePresence mode="wait">
                {selectedValueLabel && (
                  <motion.span
                    key={selectedValueLabel}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 4 }}
                    className="text-sm text-dark-500 dark:text-dark-400"
                  >
                    — {selectedValueLabel}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* Value pills */}
            <div className="flex flex-wrap gap-2">
              {attr.values.map((value) => {
                const available = isValueAvailable(attr.id, value.id)
                const inStock = isValueInStock(attr.id, value.id)
                const isSelected = selectedValues[attr.id] === value.id

                if (attr.type === 'color') {
                  return (
                    <motion.button
                      key={value.id}
                      type="button"
                      title={value.value + (!inStock && available ? ' (Out of Stock)' : '')}
                      onClick={() => available && handleSelect(attr.id, value.id)}
                      whileHover={available ? { scale: 1.15 } : {}}
                      whileTap={available ? { scale: 0.9 } : {}}
                      className={`relative w-9 h-9 rounded-full transition-all duration-150 ${
                        isSelected
                          ? 'ring-2 ring-offset-2 ring-primary-500 dark:ring-offset-dark-900'
                          : 'ring-1 ring-dark-200 dark:ring-dark-600'
                      } ${!available ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer'}`}
                      style={{ backgroundColor: value.color_code || '#ccc' }}
                    >
                      {!inStock && available && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="w-0.5 h-full bg-white/70 rotate-45 absolute" />
                        </span>
                      )}
                    </motion.button>
                  )
                }

                return (
                  <motion.button
                    key={value.id}
                    type="button"
                    onClick={() => available && handleSelect(attr.id, value.id)}
                    whileHover={available ? { scale: 1.04 } : {}}
                    whileTap={available ? { scale: 0.96 } : {}}
                    className={`px-3.5 py-1.5 text-sm font-medium border rounded-lg transition-all duration-150 ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm'
                        : !available
                        ? 'border-dark-200 dark:border-dark-700 text-dark-300 dark:text-dark-600 cursor-not-allowed line-through'
                        : !inStock
                        ? 'border-dark-200 dark:border-dark-600 text-dark-400 dark:text-dark-500 hover:border-dark-300'
                        : 'border-dark-200 dark:border-dark-600 text-dark-700 dark:text-dark-300 hover:border-primary-400 dark:hover:border-primary-500'
                    }`}
                  >
                    {value.value}
                    {!inStock && available && (
                      <span className="ml-1 text-xs opacity-70">(Out of Stock)</span>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )
      })}

      {/* Resolved variant info */}
      <AnimatePresence>
        {allSelected && !resolvedVariant && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-orange-600 dark:text-orange-400"
          >
            This combination is not available.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
