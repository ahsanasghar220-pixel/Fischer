import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  MagnifyingGlassPlusIcon,
} from '@heroicons/react/24/outline'
import type { ProductImage } from '@/types'

interface ImageGalleryProps {
  images: ProductImage[]
  productName: string
}

export default function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  // Reset selected image when images change (product navigation)
  useEffect(() => {
    setSelectedImage(0)
    setLightboxOpen(false)
  }, [images])

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen || !images?.length) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowRight') setSelectedImage((prev) => (prev >= images.length - 1 ? 0 : prev + 1))
      if (e.key === 'ArrowLeft') setSelectedImage((prev) => (prev <= 0 ? images.length - 1 : prev - 1))
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxOpen, images?.length])

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.15, duration: 0.5 }}
    >
      {/* Main Image with Arrows */}
      <div className="relative aspect-square bg-dark-100 dark:bg-dark-800 rounded-xl overflow-hidden mb-4 group">
        <AnimatePresence mode="wait">
          {images && images.length > 0 ? (
            <motion.img
              key={selectedImage}
              src={images[selectedImage]?.image}
              alt={images[selectedImage]?.alt_text || productName}
              width={600}
              height={600}
              className="w-full h-full object-cover cursor-zoom-in"
              onClick={() => setLightboxOpen(true)}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-dark-400">
              No image available
            </div>
          )}
        </AnimatePresence>

        {/* Arrow Navigation */}
        {images && images.length > 1 && (
          <>
            <button
              onClick={() => setSelectedImage((prev) => (prev <= 0 ? images.length - 1 : prev - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm text-dark-700 dark:text-dark-200 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-dark-700 shadow-lg"
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSelectedImage((prev) => (prev >= images.length - 1 ? 0 : prev + 1))}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm text-dark-700 dark:text-dark-200 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-dark-700 shadow-lg"
              aria-label="Next image"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Zoom Button */}
        {images && images.length > 0 && (
          <button
            onClick={() => setLightboxOpen(true)}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm text-dark-600 dark:text-dark-300 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-dark-700 shadow-lg"
            aria-label="View full size"
          >
            <MagnifyingGlassPlusIcon className="w-5 h-5" />
          </button>
        )}

        {/* Image Counter */}
        {images && images.length > 1 && (
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/50 text-white text-xs font-medium backdrop-blur-sm">
            {selectedImage + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images && images.length > 1 && (
        <motion.div
          className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedImage(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all hover:scale-110 active:scale-95 ${
                selectedImage === index ? 'border-primary-500 shadow-md' : 'border-transparent hover:border-dark-300 dark:hover:border-dark-500'
              }`}
            >
              <img
                src={image.image}
                alt={image.alt_text || `${productName} ${index + 1}`}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </motion.div>
      )}

      {/* Fullscreen Lightbox */}
      <AnimatePresence>
        {lightboxOpen && images && images.length > 0 && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            {/* Counter */}
            {images.length > 1 && (
              <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium backdrop-blur-sm">
                {selectedImage + 1} / {images.length}
              </div>
            )}

            {/* Image */}
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImage}
                src={images[selectedImage]?.image}
                alt={images[selectedImage]?.alt_text || productName}
                className="max-w-[90vw] max-h-[85vh] object-contain select-none"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                draggable={false}
              />
            </AnimatePresence>

            {/* Lightbox Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedImage((prev) => (prev <= 0 ? images.length - 1 : prev - 1)) }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedImage((prev) => (prev >= images.length - 1 ? 0 : prev + 1)) }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRightIcon className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Lightbox Thumbnails */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-4 py-2">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={(e) => { e.stopPropagation(); setSelectedImage(index) }}
                    className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-white opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
                    }`}
                  >
                    <img src={image.image} alt="" className="w-full h-full object-cover" draggable={false} />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
