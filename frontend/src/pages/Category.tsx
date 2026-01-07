import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import ProductCard from '@/components/products/ProductCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface Category {
  id: number
  name: string
  slug: string
  description?: string
  image?: string
  parent?: Category
  children?: Category[]
}

interface Product {
  id: number
  name: string
  slug: string
  price: number
  compare_price?: number | null
  primary_image?: string | null
  stock_status: string
  is_new?: boolean
  is_bestseller?: boolean
  average_rating?: number
  review_count?: number
  category?: {
    name: string
    slug: string
  }
}

interface CategoryData {
  category: Category
  products: Product[]
}

export default function Category() {
  const { slug } = useParams<{ slug: string }>()

  const { data, isLoading, error } = useQuery<CategoryData>({
    queryKey: ['category', slug],
    queryFn: async () => {
      const response = await api.get(`/categories/${slug}`)
      return response.data.data
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark-900 mb-2">Category not found</h1>
          <p className="text-dark-500 mb-4">The category you're looking for doesn't exist.</p>
          <Link to="/shop" className="btn btn-primary">Browse All Products</Link>
        </div>
      </div>
    )
  }

  const { category, products } = data

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-2 text-sm text-dark-500 mb-4">
            <Link to="/" className="hover:text-primary-600">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-primary-600">Shop</Link>
            {category.parent && (
              <>
                <span>/</span>
                <Link to={`/category/${category.parent.slug}`} className="hover:text-primary-600">
                  {category.parent.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-dark-900">{category.name}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {category.image && (
              <div className="w-24 h-24 bg-dark-100 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-dark-900">{category.name}</h1>
              {category.description && (
                <p className="text-dark-500 mt-2">{category.description}</p>
              )}
              <p className="text-dark-500 mt-1">{products.length} Products</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subcategories */}
      {category.children && category.children.length > 0 && (
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3 overflow-x-auto">
              <span className="text-dark-500 flex-shrink-0">Subcategories:</span>
              {category.children.map((child) => (
                <Link
                  key={child.id}
                  to={`/category/${child.slug}`}
                  className="px-4 py-2 bg-dark-100 rounded-full text-sm font-medium text-dark-600 hover:bg-primary-100 hover:text-primary-700 flex-shrink-0"
                >
                  {child.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Products */}
      <div className="container mx-auto px-4 py-8">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-dark-900 mb-2">No products found</h3>
            <p className="text-dark-500 mb-6">
              There are no products in this category yet.
            </p>
            <Link to="/shop" className="btn btn-primary">Browse All Products</Link>
          </div>
        )}
      </div>
    </div>
  )
}
