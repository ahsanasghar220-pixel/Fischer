import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckIcon } from '@heroicons/react/24/solid'
import type { ProductConfigurator as ConfiguratorType, ConfiguratorVariant } from '@/types'

interface ProductConfiguratorProps {
  configurator: ConfiguratorType
  onVariantSelect: (variant: ConfiguratorVariant | null) => void
}

export default function ProductConfigurator({ configurator, onVariantSelect }: ProductConfiguratorProps) {
  const [selectedValues, setSelectedValues] = useState<Record<number, number>>({})

  const allSelected = configurator.attributes.every(attr => selectedValues[attr.id] !== undefined)
  const selectedCount = Object.keys(selectedValues).length

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

  const pendingAttributes = configurator.attributes.filter(a => selectedValues[a.id] === undefined)

  return (
    <div className="space-y-5 mb-6">
      {configurator.attributes.map((attr, attrIndex) => {
        const selectedValueLabel = attr.values.find(v => v.id === selectedValues[attr.id])?.value
        const isAttrDone = selectedValues[attr.id] !== undefined

        return (
          <motion.div
            key={attr.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: attrIndex * 0.07, duration: 0.3 }}
          >
            {/* Attribute header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                {/* Completion dot */}
                <motion.div
                  animate={isAttrDone ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.3 }}
                  className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-300 ${
                    isAttrDone ? 'bg-primary-500' : 'bg-dark-200 dark:bg-dark-600'
                  }`}
                />
                <span className="text-sm font-bold text-dark-900 dark:text-white tracking-wide">
                  {attr.name}
                </span>
                <AnimatePresence mode="wait">
                  {selectedValueLabel && (
                    <motion.span
                      key={selectedValueLabel}
                      initial={{ opacity: 0, x: -6, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 6, scale: 0.9 }}
                      transition={{ duration: 0.18 }}
                      className="text-sm font-medium text-dark-500 dark:text-dark-400"
                    >
                      — {selectedValueLabel}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* "Choose" prompt when nothing selected for this attr */}
              <AnimatePresence>
                {!isAttrDone && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs font-semibold text-primary-500 dark:text-primary-400 uppercase tracking-wider"
                  >
                    Choose
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* Options */}
            {attr.type === 'color' ? (
              <div className="flex flex-wrap gap-3">
                {attr.values.map((value) => {
                  const available = isValueAvailable(attr.id, value.id)
                  const inStock = isValueInStock(attr.id, value.id)
                  const isSelected = selectedValues[attr.id] === value.id

                  return (
                    <motion.button
                      key={value.id}
                      type="button"
                      title={value.value + (!inStock && available ? ' — Out of Stock' : !available ? ' — Unavailable' : '')}
                      onClick={() => available && handleSelect(attr.id, value.id)}
                      whileHover={available ? { scale: 1.12 } : {}}
                      whileTap={available ? { scale: 0.88 } : {}}
                      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                      className={`relative w-11 h-11 rounded-full transition-all duration-200 ${
                        isSelected
                          ? 'ring-2 ring-offset-3 ring-dark-900 dark:ring-white dark:ring-offset-dark-900 shadow-lg'
                          : available
                          ? 'ring-1 ring-dark-200 dark:ring-dark-600 hover:ring-2 hover:ring-dark-400 dark:hover:ring-dark-400'
                          : 'opacity-20 cursor-not-allowed'
                      }`}
                      style={{ backgroundColor: value.color_code || '#ccc' }}
                    >
                      {isSelected && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <CheckIcon className="w-5 h-5 text-white drop-shadow" />
                        </motion.span>
                      )}
                      {!inStock && available && !isSelected && (
                        <span className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="w-full h-px bg-white/60 rotate-45 block" />
                          </span>
                        </span>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {attr.values.map((value) => {
                  const available = isValueAvailable(attr.id, value.id)
                  const inStock = isValueInStock(attr.id, value.id)
                  const isSelected = selectedValues[attr.id] === value.id
                  const isOutOfStock = !inStock && available

                  return (
                    <motion.button
                      key={value.id}
                      type="button"
                      onClick={() => available && handleSelect(attr.id, value.id)}
                      whileHover={available ? { y: -2 } : {}}
                      whileTap={available ? { scale: 0.95 } : {}}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className={`
                        relative px-4 py-2 text-sm font-semibold rounded-xl border-2
                        transition-colors duration-200 overflow-hidden
                        ${isSelected
                          ? 'border-dark-900 dark:border-white bg-dark-900 dark:bg-white text-white dark:text-dark-900'
                          : !available
                          ? 'border-dark-100 dark:border-dark-800 text-dark-300 dark:text-dark-700 bg-dark-50 dark:bg-dark-850 cursor-not-allowed'
                          : isOutOfStock
                          ? 'border-dark-200 dark:border-dark-700 text-dark-400 dark:text-dark-500 bg-white dark:bg-dark-800'
                          : 'border-dark-200 dark:border-dark-600 text-dark-800 dark:text-dark-100 bg-white dark:bg-dark-800 hover:border-dark-900 dark:hover:border-white hover:shadow-sm'
                        }
                      `}
                    >
                      {/* Animated fill on selection */}
                      {isSelected && (
                        <motion.span
                          layoutId={`fill-${attr.id}`}
                          className="absolute inset-0 bg-dark-900 dark:bg-white -z-10 rounded-[10px]"
                          initial={false}
                        />
                      )}

                      {/* Strikethrough overlay for out-of-stock */}
                      {isOutOfStock && !isSelected && (
                        <span className="absolute inset-0 flex items-center pointer-events-none">
                          <span className="w-full h-px bg-dark-300 dark:bg-dark-600" />
                        </span>
                      )}

                      <span className="flex items-center gap-1.5">
                        {isSelected && (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.05 }}>
                            <CheckIcon className="w-3.5 h-3.5 text-white dark:text-dark-900 flex-shrink-0" />
                          </motion.span>
                        )}
                        <span>{value.value}</span>
                      </span>
                    </motion.button>
                  )
                })}
              </div>
            )}
          </motion.div>
        )
      })}

      {/* Selection progress / status footer */}
      <AnimatePresence mode="wait">
        {!allSelected && selectedCount === 0 && (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-dark-50 dark:bg-dark-800/60 border border-dark-100 dark:border-dark-700"
          >
            <div className="flex gap-1.5 flex-shrink-0">
              {configurator.attributes.map((attr) => (
                <div
                  key={attr.id}
                  className="w-2 h-2 rounded-full bg-dark-200 dark:bg-dark-600"
                />
              ))}
            </div>
            <span className="text-sm text-dark-500 dark:text-dark-400">
              Select {configurator.attributes.map(a => a.name).join(' and ')} to continue
            </span>
          </motion.div>
        )}

        {!allSelected && selectedCount > 0 && (
          <motion.div
            key="partial"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-dark-50 dark:bg-dark-800/60 border border-dark-100 dark:border-dark-700"
          >
            <div className="flex gap-1.5 flex-shrink-0">
              {configurator.attributes.map((attr) => (
                <motion.div
                  key={attr.id}
                  animate={selectedValues[attr.id] !== undefined ? { scale: [1, 1.4, 1] } : {}}
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                    selectedValues[attr.id] !== undefined ? 'bg-primary-500' : 'bg-dark-200 dark:bg-dark-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-dark-500 dark:text-dark-400">
              Now select{' '}
              <span className="font-semibold text-dark-900 dark:text-white">
                {pendingAttributes.map(a => a.name).join(' and ')}
              </span>
            </span>
          </motion.div>
        )}

        {allSelected && !resolvedVariant && (
          <motion.div
            key="unavailable"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50"
          >
            <span className="text-sm font-medium text-orange-700 dark:text-orange-400">
              This combination is not available. Try a different selection.
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
