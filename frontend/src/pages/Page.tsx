import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import api from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface PageData {
  id: number
  title: string
  slug: string
  content: string
  meta_title?: string
  meta_description?: string
}

export default function Page() {
  const { slug } = useParams<{ slug: string }>()

  const { data: page, isLoading, error } = useQuery<PageData>({
    queryKey: ['page', slug],
    queryFn: async () => {
      const response = await api.get(`/api/pages/${slug}`)
      return response.data.data
    },
  })

  if (isLoading) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center bg-dark-50 dark:bg-dark-900 transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        >
          <LoadingSpinner size="lg" />
        </motion.div>
      </motion.div>
    )
  }

  if (error || !page) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center bg-dark-50 dark:bg-dark-900 transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="text-center"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <motion.h1
            className="text-2xl font-bold text-dark-900 dark:text-white mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Page not found
          </motion.h1>
          <motion.p
            className="text-dark-500 dark:text-dark-400 mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            The page you're looking for doesn't exist.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/" className="btn btn-primary">Go Home</Link>
          </motion.div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="min-h-screen bg-white dark:bg-dark-900 transition-colors"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <motion.div
        className="bg-dark-900 dark:bg-dark-800 text-white py-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            className="flex items-center gap-2 text-sm text-dark-400 mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white">{page.title}</span>
          </motion.div>
          <motion.h1
            className="text-4xl font-bold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {page.title}
          </motion.h1>
        </div>
      </motion.div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <motion.div
            className="prose prose-lg dark:prose-invert max-w-none text-dark-700 dark:text-dark-300"
            dangerouslySetInnerHTML={{ __html: page.content }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}
