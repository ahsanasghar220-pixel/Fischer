import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-900 flex items-center justify-center py-12 px-4 transition-colors">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-500">404</h1>
        <h2 className="text-3xl font-bold text-dark-900 dark:text-white mt-4 mb-2">Page Not Found</h2>
        <p className="text-dark-500 dark:text-dark-400 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/" className="btn btn-primary px-8">
            Go Home
          </Link>
          <Link to="/shop" className="btn btn-outline px-8">
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  )
}
