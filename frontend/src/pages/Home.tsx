import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRightIcon, TruckIcon, ShieldCheckIcon, PhoneIcon, CreditCardIcon } from '@heroicons/react/24/outline'
import api from '@/lib/api'
import ProductCard from '@/components/products/ProductCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface Category {
  id: number
  name: string
  slug: string
  image?: string
  products_count: number
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

interface Banner {
  id: number
  title: string
  subtitle?: string
  image: string
  button_text?: string
  button_link?: string
}

interface HomeData {
  banners: Banner[]
  categories: Category[]
  featured_products: Product[]
  new_arrivals: Product[]
  bestsellers: Product[]
}

export default function Home() {
  const { data, isLoading } = useQuery<HomeData>({
    queryKey: ['home'],
    queryFn: async () => {
      const response = await api.get('/home')
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

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative bg-dark-900">
        {data?.banners && data.banners.length > 0 ? (
          <div className="relative h-[500px] md:h-[600px]">
            <img
              src={data.banners[0].image}
              alt={data.banners[0].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-dark-900/80 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4">
                <div className="max-w-xl">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                    {data.banners[0].title}
                  </h1>
                  {data.banners[0].subtitle && (
                    <p className="text-lg md:text-xl text-dark-200 mb-8">
                      {data.banners[0].subtitle}
                    </p>
                  )}
                  {data.banners[0].button_link && (
                    <Link
                      to={data.banners[0].button_link}
                      className="btn btn-primary text-lg px-8 py-3"
                    >
                      {data.banners[0].button_text || 'Shop Now'}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[500px] md:h-[600px] flex items-center justify-center bg-gradient-to-r from-dark-900 to-dark-800">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                Quality Home Appliances
              </h1>
              <p className="text-lg md:text-xl text-dark-200 mb-8">
                ISO Certified Products with Nationwide Delivery
              </p>
              <Link to="/shop" className="btn btn-primary text-lg px-8 py-3">
                Shop Now
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Features */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <TruckIcon className="w-10 h-10 text-primary-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-dark-900">Free Shipping</h3>
                <p className="text-sm text-dark-500">On orders over PKR 10,000</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheckIcon className="w-10 h-10 text-primary-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-dark-900">Warranty</h3>
                <p className="text-sm text-dark-500">1 Year Official Warranty</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CreditCardIcon className="w-10 h-10 text-primary-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-dark-900">Secure Payment</h3>
                <p className="text-sm text-dark-500">Multiple Payment Options</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <PhoneIcon className="w-10 h-10 text-primary-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-dark-900">24/7 Support</h3>
                <p className="text-sm text-dark-500">Dedicated Support Team</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {data?.categories && data.categories.length > 0 && (
        <section className="py-16 bg-dark-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-dark-900">
                Shop by Category
              </h2>
              <Link
                to="/categories"
                className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              >
                View All <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {data.categories.slice(0, 6).map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  className="group bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-20 h-20 mx-auto mb-3 bg-dark-100 rounded-full flex items-center justify-center overflow-hidden">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl text-dark-400">📦</span>
                    )}
                  </div>
                  <h3 className="font-medium text-dark-900 group-hover:text-primary-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-dark-500">{category.products_count} Products</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {data?.featured_products && data.featured_products.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-dark-900">
                Featured Products
              </h2>
              <Link
                to="/shop?featured=1"
                className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              >
                View All <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {data.featured_products.slice(0, 10).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Promo Banner */}
      <section className="py-16 bg-primary-500">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-dark-900 mb-2">
                Become a Dealer
              </h2>
              <p className="text-dark-700 text-lg">
                Partner with Fischer and grow your business with exclusive dealer benefits
              </p>
            </div>
            <Link
              to="/dealer/register"
              className="btn bg-dark-900 text-white hover:bg-dark-800 px-8 py-3 text-lg"
            >
              Apply Now
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      {data?.new_arrivals && data.new_arrivals.length > 0 && (
        <section className="py-16 bg-dark-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-dark-900">
                New Arrivals
              </h2>
              <Link
                to="/shop?new=1"
                className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              >
                View All <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {data.new_arrivals.slice(0, 5).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bestsellers */}
      {data?.bestsellers && data.bestsellers.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-dark-900">
                Bestsellers
              </h2>
              <Link
                to="/shop?bestseller=1"
                className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              >
                View All <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {data.bestsellers.slice(0, 5).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      <section className="py-16 bg-dark-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why Choose Fischer?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-dark-900">ISO</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">ISO 9001:2015 Certified</h3>
                    <p className="text-dark-300">
                      Our products meet international quality standards
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-dark-900">25+</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Years of Excellence</h3>
                    <p className="text-dark-300">
                      Trusted by millions of Pakistani households
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-dark-900">500+</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Dealers Nationwide</h3>
                    <p className="text-dark-300">
                      Available across Pakistan through our dealer network
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="/images/about-fischer.jpg"
                alt="Fischer Quality"
                className="rounded-xl shadow-2xl"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/600x400/313131/f4b42c?text=Fischer+Quality'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-dark-100">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-dark-900 mb-4">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-dark-600 mb-6">
              Get updates on new products, exclusive offers, and tips for your home appliances
            </p>
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button type="submit" className="btn btn-primary px-8 py-3">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
