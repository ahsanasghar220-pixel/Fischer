import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { motion } from 'framer-motion'
import Layout from './components/layout/Layout'
import LoadingSpinner from './components/ui/LoadingSpinner'
import ScrollToTop from './components/utils/ScrollToTop'

// Animated page loader for better UX during lazy loading
const PageLoader = () => (
  <motion.div
    className="min-h-screen flex items-center justify-center bg-dark-50 dark:bg-dark-900"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
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
const Page = lazy(() => import('./pages/Page'))
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

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="product/:slug" element={<ProductDetail />} />
          <Route path="category/:slug" element={<Category />} />
          <Route path="bundle/:slug" element={<BundleDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-success/:orderNumber" element={<OrderSuccess />} />

          {/* Auth routes */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />

          {/* Account routes */}
          <Route path="account" element={<Account />}>
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
          <Route path="page/:slug" element={<Page />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
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
          <Route path="bundles" element={<AdminBundles />} />
          <Route path="bundles/new" element={<AdminBundleForm />} />
          <Route path="bundles/:id" element={<AdminBundleForm />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
