import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Layout from './components/layout/Layout'
import LoadingSpinner from './components/ui/LoadingSpinner'
import ScrollToTop from './components/utils/ScrollToTop'

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
const Wishlist = lazy(() => import('./pages/account/Wishlist'))
const Addresses = lazy(() => import('./pages/account/Addresses'))
const Settings = lazy(() => import('./pages/account/Settings'))
const ServiceRequest = lazy(() => import('./pages/ServiceRequest'))
const DealerRegister = lazy(() => import('./pages/DealerRegister'))
const FindDealer = lazy(() => import('./pages/FindDealer'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const Page = lazy(() => import('./pages/Page'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Admin pages
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminProducts = lazy(() => import('./pages/admin/Products'))
const AdminOrders = lazy(() => import('./pages/admin/Orders'))
const AdminCustomers = lazy(() => import('./pages/admin/Customers'))
const AdminCategories = lazy(() => import('./pages/admin/Categories'))
const AdminSettings = lazy(() => import('./pages/admin/Settings'))
const AdminProductEdit = lazy(() => import('./pages/admin/ProductEdit'))
const AdminDealers = lazy(() => import('./pages/admin/Dealers'))
const AdminServiceRequests = lazy(() => import('./pages/admin/ServiceRequests'))
const AdminPages = lazy(() => import('./pages/admin/Pages'))
const AdminAnalytics = lazy(() => import('./pages/admin/Analytics'))
const AdminReports = lazy(() => import('./pages/admin/Reports'))
const AdminHomePageSettings = lazy(() => import('./pages/admin/HomePageSettings'))

function App() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <ScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="product/:slug" element={<ProductDetail />} />
          <Route path="category/:slug" element={<Category />} />
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
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="addresses" element={<Addresses />} />
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
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="dealers" element={<AdminDealers />} />
          <Route path="service-requests" element={<AdminServiceRequests />} />
          <Route path="pages" element={<AdminPages />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="homepage" element={<AdminHomePageSettings />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
