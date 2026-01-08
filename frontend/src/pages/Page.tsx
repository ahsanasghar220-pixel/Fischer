import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
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
      const response = await api.get(`/pages/${slug}`)
      return response.data.data
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-50 dark:bg-dark-900 transition-colors">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-50 dark:bg-dark-900 transition-colors">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white mb-2">Page not found</h1>
          <p className="text-dark-500 dark:text-dark-400 mb-4">The page you're looking for doesn't exist.</p>
          <Link to="/" className="btn btn-primary">Go Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900 transition-colors">
      {/* Header */}
      <div className="bg-dark-900 dark:bg-dark-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-dark-400 mb-4">
            <Link to="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-white">{page.title}</span>
          </div>
          <h1 className="text-4xl font-bold">{page.title}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div
            className="prose prose-lg dark:prose-invert max-w-none text-dark-700 dark:text-dark-300"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      </div>
    </div>
  )
}
