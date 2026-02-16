import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy, Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import Layout from './components/layout/Layout'
import LoadingSpinner from './components/ui/LoadingSpinner'
import ScrollToTop from './components/utils/ScrollToTop'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

// Error Boundary component
interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-dark-50 dark:bg-dark-900">
          <div className="text-center p-8 max-w-md">
            <h1 className="text-2xl font-bold text-dark-900 dark:text-white mb-4">
              Something went wrong
            </h1>
            <p className="text-dark-500 dark:text-dark-400 mb-6">
              An unexpected error occurred. Please try reloading the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Fast page loader - shows immediately without animation delay
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-dark-50 dark:bg-dark-900">
    <div className="flex flex-col items-center gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-dark-500 dark:text-dark-400 text-sm animate-pulse">Loading...</p>
    </div>
  </div>
)

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'))
const Shop = lazy(() => import('./pages/Shop'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Category = lazy(() => import('./pages/Category'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const Account = lazy(() => import('./pages/Account'))
const Dashboard = lazy(() => import('./pages/account/Dashboard'))
const Orders = lazy(() => import('./pages/account/Orders'))
const OrderDetail = lazy(() => import('./pages/account/OrderDetail'))
const Wishlist = lazy(() => import('./pages/account/Wishlist'))
const Addresses = lazy(() => import('./pages/account/Addresses'))
const Settings = lazy(() => import('./pages/account/Settings'))
const LoyaltyPoints = lazy(() => import('./pages/account/LoyaltyPoints'))
const MyServiceRequests = lazy(() => import('./pages/account/MyServiceRequests'))
const ServiceRequest = lazy(() => import('./pages/ServiceRequest'))
const DealerRegister = lazy(() => import('./pages/DealerRegister'))
const FindDealer = lazy(() => import('./pages/FindDealer'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const Experience = lazy(() => import('./pages/Experience'))
const KitchenExperience = lazy(() => import('./pages/KitchenExperience'))
const Portfolio = lazy(() => import('./pages/Portfolio'))
const Page = lazy(() => import('./pages/Page'))
const Bundles = lazy(() => import('./pages/Bundles'))
const BundleDetail = lazy(() => import('./pages/BundleDetail'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Admin pages
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminProducts = lazy(() => import('./pages/admin/Products'))
const AdminOrders = lazy(() => import('./pages/admin/Orders'))
const AdminOrderDetail = lazy(() => import('./pages/admin/OrderDetail'))
const AdminCustomers = lazy(() => import('./pages/admin/Customers'))
const AdminCategories = lazy(() => import('./pages/admin/Categories'))
const AdminSettings = lazy(() => import('./pages/admin/Settings'))
const AdminProductEdit = lazy(() => import('./pages/admin/ProductEdit'))
const AdminDealers = lazy(() => import('./pages/admin/Dealers'))
const AdminServiceRequests = lazy(() => import('./pages/admin/ServiceRequests'))
const AdminPages = lazy(() => import('./pages/admin/Pages'))
const AdminAnalytics = lazy(() => import('./pages/admin/Analytics'))
const AdminRealTimeAnalytics = lazy(() => import('./pages/admin/RealTimeAnalytics'))
const AdminReports = lazy(() => import('./pages/admin/Reports'))
const AdminHomePageSettings = lazy(() => import('./pages/admin/HomePageSettings'))
const AdminBundles = lazy(() => import('./pages/admin/Bundles'))
const AdminBundleForm = lazy(() => import('./pages/admin/BundleForm'))
const AdminReviews = lazy(() => import('./pages/admin/Reviews'))
const AdminShipping = lazy(() => import('./pages/admin/Shipping'))
const AdminCoupons = lazy(() => import('./pages/admin/Coupons'))
const AdminPortfolioVideos = lazy(() => import('./pages/admin/PortfolioVideos'))
const AdminSales = lazy(() => import('./pages/admin/Sales'))
const AdminUsers = lazy(() => import('./pages/admin/Users'))
const Sale = lazy(() => import('./pages/Sale'))

function App() {
  return (
    <ErrorBoundary>
    <Suspense fallback={<PageLoader />}>
      <ScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="product/:slug" element={<ProductDetail />} />
          <Route path="category/:slug" element={<Category />} />
          <Route path="bundles" element={<Bundles />} />
          <Route path="bundle/:slug" element={<BundleDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-success/:orderNumber" element={<OrderSuccess />} />

          {/* Auth routes */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />

          {/* Account routes (protected) */}
          <Route path="account" element={<ProtectedRoute><Account /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:orderNumber" element={<OrderDetail />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="addresses" element={<Addresses />} />
            <Route path="loyalty" element={<LoyaltyPoints />} />
            <Route path="service-requests" element={<MyServiceRequests />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Service */}
          <Route path="service-request" element={<ServiceRequest />} />

          {/* Dealer */}
          <Route path="dealer/register" element={<DealerRegister />} />
          <Route path="become-dealer" element={<DealerRegister />} />
          <Route path="find-dealer" element={<FindDealer />} />

          {/* Static pages */}
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="experience" element={<Experience />} />
          <Route path="kitchen-experience" element={<KitchenExperience />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="sale/:slug" element={<Sale />} />
          <Route path="page/:slug" element={<Page />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin routes (protected) */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/:id" element={<AdminProductEdit />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:orderNumber" element={<AdminOrderDetail />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="dealers" element={<AdminDealers />} />
          <Route path="service-requests" element={<AdminServiceRequests />} />
          <Route path="pages" element={<AdminPages />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="analytics/realtime" element={<AdminRealTimeAnalytics />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="homepage" element={<AdminHomePageSettings />} />
          <Route path="portfolio" element={<AdminPortfolioVideos />} />
          <Route path="bundles" element={<AdminBundles />} />
          <Route path="bundles/new" element={<AdminBundleForm />} />
          <Route path="bundles/:id" element={<AdminBundleForm />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="shipping" element={<AdminShipping />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="sales" element={<AdminSales />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
    </ErrorBoundary>
  )
}

export default App
