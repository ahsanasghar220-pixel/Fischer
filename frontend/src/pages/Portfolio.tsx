import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { PlayCircleIcon } from '@heroicons/react/24/solid'
import { StaggerContainer, StaggerItem } from '@/components/effects/ScrollReveal'
import api from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface Video {
  id: number
  title: string
  description: string
  video_url: string
  thumbnail?: string
  category: string
}

function VideoCard({ video }: { video: Video }) {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-dark-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow"
    >
      <div className="relative aspect-video bg-gray-900">
        {!isPlaying ? (
          <>
            {video.thumbnail ? (
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <span className="text-white/40 text-sm">Video Preview</span>
              </div>
            )}
            <button
              onClick={() => setIsPlaying(true)}
              className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/30 transition-colors group"
              aria-label={`Play ${video.title}`}
            >
              <PlayCircleIcon className="w-20 h-20 text-white group-hover:scale-110 transition-transform" />
            </button>
          </>
        ) : (
          <video
            src={video.video_url}
            controls
            autoPlay
            className="w-full h-full"
            onEnded={() => setIsPlaying(false)}
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>

      <div className="p-6">
        {video.category && (
          <span className="inline-block px-3 py-1 text-xs font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full mb-3">
            {video.category}
          </span>
        )}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {video.title}
        </h3>
        {video.description && (
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {video.description}
          </p>
        )}
      </div>
    </motion.div>
  )
}

export default function Portfolio() {
  const { data: videos, isLoading } = useQuery<Video[]>({
    queryKey: ['portfolio-videos'],
    queryFn: async () => {
      const response = await api.get('/api/portfolio/videos')
      return response.data.data
    },
  })

  return (
    <>
      <Helmet>
        <title>Portfolio - Fischer Pakistan</title>
        <meta
          name="description"
          content="Explore Fischer Pakistan's marketing portfolio featuring product showcases, brand stories, and promotional content."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 text-white py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Our Portfolio
              </h1>
              <p className="text-xl text-white/90">
                Showcasing Fischer Pakistan's marketing excellence and brand story through engaging visual content
              </p>
            </motion.div>
          </div>
        </section>

        {/* Video Gallery */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : videos && videos.length > 0 ? (
              <StaggerContainer>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {videos.map((video) => (
                    <StaggerItem key={video.id}>
                      <VideoCard video={video} />
                    </StaggerItem>
                  ))}
                </div>
              </StaggerContainer>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                  Coming Soon
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Stay tuned for exciting content including product showcases, brand stories, and promotional videos
                </p>
              </motion.div>
            )}
          </div>
        </section>
      </div>
    </>
  )
}
