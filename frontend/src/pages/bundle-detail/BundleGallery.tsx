import { motion } from 'framer-motion'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import ScrollReveal from '@/components/effects/ScrollReveal'

interface GalleryImage {
  src: string
  alt: string
}

interface BundleGalleryProps {
  images: GalleryImage[]
  selectedIndex: number
  onSelectIndex: (index: number) => void
  isVideoPlaying: boolean
  onPlayVideo: () => void
  onVideoEnded: () => void
  videoUrl?: string | null
  badgeLabel?: string | null
  badgeColor?: string | null
}

export default function BundleGallery({
  images,
  selectedIndex,
  onSelectIndex,
  isVideoPlaying,
  onPlayVideo,
  onVideoEnded,
  videoUrl,
  badgeLabel,
  badgeColor,
}: BundleGalleryProps) {
  return (
    <ScrollReveal animation="fadeUp">
      <div className="lg:sticky lg:top-24">
        {/* Main Image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-dark-800 mb-4">
          {isVideoPlaying && videoUrl ? (
            <video
              src={videoUrl}
              autoPlay
              controls
              className="w-full h-full object-cover"
              onEnded={onVideoEnded}
            />
          ) : (
            <motion.img
              key={selectedIndex}
              src={images[selectedIndex].src}
              alt={images[selectedIndex].alt}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}

          {/* Badge */}
          {badgeLabel && (
            <div className={`absolute top-4 left-4 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide text-white bg-gradient-to-r ${
              badgeColor === 'gold' ? 'from-primary-500 to-primary-400' :
              badgeColor === 'red' ? 'from-primary-500 to-primary-600' :
              badgeColor === 'blue' ? 'from-blue-500 to-cyan-400' :
              'from-green-500 to-emerald-400'
            } shadow-lg`}>
              <SparklesIcon className="w-4 h-4 inline mr-1.5" />
              {badgeLabel}
            </div>
          )}

          {/* Video Play Button */}
          {videoUrl && !isVideoPlaying && (
            <button
              onClick={onPlayVideo}
              className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-black/70 hover:bg-black/80 text-white rounded-full transition-colors"
            >
              <PlayIcon className="w-5 h-5" />
              Watch Video
            </button>
          )}

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => onSelectIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-dark-700/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-dark-600 transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => onSelectIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 dark:bg-dark-700/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-dark-600 transition-colors"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelectIndex(idx)
                }}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedIndex === idx
                    ? 'border-primary-500 ring-2 ring-primary-500/30'
                    : 'border-transparent hover:border-gray-300 dark:hover:border-dark-600'
                }`}
              >
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </ScrollReveal>
  )
}
