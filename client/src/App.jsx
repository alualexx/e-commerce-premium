import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import useThemeStore from './store/useThemeStore';
import useAuthStore from './store/useAuthStore';
import { Toaster } from 'react-hot-toast';
import LoadingScreen from './components/common/LoadingScreen';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages - Lazy Loaded
const HomePage = lazy(() => import('./pages/HomePage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'));
const PaymentProcessPage = lazy(() => import('./pages/PaymentProcessPage'));
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Admin - Lazy Loaded
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const ManageProductsPage = lazy(() => import('./pages/admin/ManageProductsPage'));
const ManageOrdersPage = lazy(() => import('./pages/admin/ManageOrdersPage'));
const ManageUsersPage = lazy(() => import('./pages/admin/ManageUsersPage'));
const FinancePage = lazy(() => import('./pages/admin/FinancePage'));

// Delivery Portal - Lazy Loaded
const DeliveryLayout = lazy(() => import('./pages/delivery/DeliveryLayout'));
const DeliveryDashboard = lazy(() => import('./pages/delivery/DeliveryDashboard'));
const DeliveryCompletePage = lazy(() => import('./pages/delivery/DeliveryCompletePage'));

// Store Keeper Portal - Lazy Loaded
const StoreLayout = lazy(() => import('./pages/store/StoreLayout'));
const StoreDashboard = lazy(() => import('./pages/store/StoreDashboard'));
const StoreInventory = lazy(() => import('./pages/store/StoreInventory'));

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Layout wrapper for public pages
const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <main className="min-h-screen">{children}</main>
    <Footer />
  </>
);

// Theme Manager Component to handle reactive updates based on location
const ThemeManager = () => {
  const { theme } = useThemeStore();
  const { pathname } = useLocation();

  useEffect(() => {
    const isAuthPage = pathname === '/login' || pathname === '/register';
    if (!isAuthPage) {
      document.documentElement.setAttribute('data-theme', theme);
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [theme, pathname]);

  return null;
};

function App() {
  const { loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <Router>
      <ThemeManager />
      <Toaster position="top-right" reverseOrder={false} />
      <ScrollToTop />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path="/shop" element={<PublicLayout><ShopPage /></PublicLayout>} />
          <Route path="/product/:slug" element={<PublicLayout><ProductDetailPage /></PublicLayout>} />
          <Route path="/cart" element={<PublicLayout><CartPage /></PublicLayout>} />
          <Route path="/checkout" element={<PublicLayout><CheckoutPage /></PublicLayout>} />
          <Route path="/orders" element={<PublicLayout><OrdersPage /></PublicLayout>} />
          <Route path="/order/:id" element={<PublicLayout><OrderDetailPage /></PublicLayout>} />
          <Route path="/track" element={<PublicLayout><TrackOrderPage /></PublicLayout>} />
          <Route path="/wishlist" element={<PublicLayout><WishlistPage /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
          <Route path="/profile" element={<PublicLayout><ProfilePage /></PublicLayout>} />
          <Route path="/settings" element={<PublicLayout><SettingsPage /></PublicLayout>} />
          <Route path="/payment/success" element={<PublicLayout><PaymentSuccessPage /></PublicLayout>} />
          <Route path="/payment/process" element={<PaymentProcessPage />} />

          {/* Auth Routes (no footer) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Delivery Portal */}
          <Route path="/delivery" element={<DeliveryLayout />}>
            <Route index element={<DeliveryDashboard />} />
            <Route path="complete" element={<DeliveryCompletePage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<ManageProductsPage />} />
            <Route path="orders" element={<ManageOrdersPage />} />
            <Route path="users" element={<ManageUsersPage />} />
            <Route path="finance" element={<FinancePage />} />
          </Route>

          {/* Store Keeper Portal */}
          <Route path="/store" element={<StoreLayout />}>
            <Route index element={<StoreDashboard />} />
            <Route path="inventory" element={<StoreInventory />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
