import { useState, useCallback } from 'react'
import SectionCard from './SectionCard'
import type { Section } from '../types'

interface SectionGridProps {
  sections: Section[]
  onToggle: (key: string, enabled: boolean) => void
  onEdit: (section: Section) => void
  onReorder: (sections: Section[]) => void
}

export default function SectionGrid({ sections, onToggle, onEdit, onReorder }: SectionGridProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleDragStart = useCallback((index: number) => (e: React.DragEvent) => {
    setDragIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    // Use a transparent pixel so the default drag image doesn't interfere
    const el = e.currentTarget as HTMLElement
    e.dataTransfer.setDragImage(el, el.offsetWidth / 2, 20)
  }, [])

  const handleDragEnd = useCallback(() => {
    if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
      const newSections = [...sections]
      const [moved] = newSections.splice(dragIndex, 1)
      newSections.splice(dragOverIndex, 0, moved)
      // Update sort_order
      const reordered = newSections.map((s, i) => ({ ...s, sort_order: i }))
      onReorder(reordered)
    }
    setDragIndex(null)
    setDragOverIndex(null)
  }, [dragIndex, dragOverIndex, sections, onReorder])

  const handleDragOver = useCallback((index: number) => (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }, [])

  const handleDrop = useCallback((index: number) => (e: React.DragEvent) => {
    e.preventDefault()
    setDragOverIndex(index)
  }, [])

  const moveSection = useCallback((fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= sections.length) return
    const newSections = [...sections]
    const [moved] = newSections.splice(fromIndex, 1)
    newSections.splice(toIndex, 0, moved)
    const reordered = newSections.map((s, i) => ({ ...s, sort_order: i }))
    onReorder(reordered)
  }, [sections, onReorder])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {sections.map((section, index) => (
        <div
          key={section.key}
          className={dragOverIndex === index && dragIndex !== index ? 'ring-2 ring-primary-400 rounded-xl' : ''}
        >
          <SectionCard
            section={section}
            position={index + 1}
            totalSections={sections.length}
            onToggle={onToggle}
            onEdit={onEdit}
            onMoveUp={() => moveSection(index, index - 1)}
            onMoveDown={() => moveSection(index, index + 1)}
            isDragging={dragIndex === index}
            dragHandleProps={{
              onDragStart: handleDragStart(index),
              onDragEnd: handleDragEnd,
              onDragOver: handleDragOver(index),
              onDrop: handleDrop(index),
            }}
          />
        </div>
      ))}
    </div>
  )
}
