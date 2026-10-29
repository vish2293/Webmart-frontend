import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../layout/AppLayout';
import { RequireAdmin, RequireAuth } from './routeGuards';
import { RouteErrorPage } from './RouteErrorPage';

// Route-level code splitting: each page is its own chunk.
const HomePage = lazy(() => import('@/features/products/pages/HomePage'));
const ProductListPage = lazy(() => import('@/features/products/pages/ProductListPage'));
const ProductDetailPage = lazy(() => import('@/features/products/pages/ProductDetailPage'));
const CartPage = lazy(() => import('@/features/cart/pages/CartPage'));
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const ProfilePage = lazy(() => import('@/features/auth/pages/ProfilePage'));
const ShippingPage = lazy(() => import('@/features/checkout/pages/ShippingPage'));
const PaymentPage = lazy(() => import('@/features/checkout/pages/PaymentPage'));
const PlaceOrderPage = lazy(() => import('@/features/checkout/pages/PlaceOrderPage'));
const OrderHistoryPage = lazy(() => import('@/features/orders/pages/OrderHistoryPage'));
const OrderDetailPage = lazy(() => import('@/features/orders/pages/OrderDetailPage'));
const AdminDashboardPage = lazy(() => import('@/features/admin/pages/AdminDashboardPage'));
const ManageProductsPage = lazy(() => import('@/features/admin/pages/ManageProductsPage'));
const ManageUsersPage = lazy(() => import('@/features/admin/pages/ManageUsersPage'));
const AdminOrdersPage = lazy(() => import('@/features/admin/pages/AdminOrdersPage'));
const SalesReportsPage = lazy(() => import('@/features/admin/pages/SalesReportsPage'));
const PolicyPage = lazy(() => import('@/features/policies/pages/PolicyPage'));
const ContactPage = lazy(() => import('@/features/policies/pages/ContactPage'));
const NotFoundPage = lazy(() => import('./NotFoundPage'));

export const router = createBrowserRouter(
  [
    {
      element: <AppLayout />,
      errorElement: <RouteErrorPage />,
      children: [
        { index: true, element: <HomePage /> },
        { path: 'products', element: <ProductListPage /> },
        { path: 'products/:productId', element: <ProductDetailPage /> },
        { path: 'cart', element: <CartPage /> },
        { path: 'login', element: <LoginPage /> },
        { path: 'register', element: <RegisterPage /> },
        { path: 'policies/:slug', element: <PolicyPage /> },
        { path: 'contact', element: <ContactPage /> },
        {
          element: <RequireAuth />,
          children: [
            { path: 'profile', element: <ProfilePage /> },
            { path: 'checkout/shipping', element: <ShippingPage /> },
            { path: 'checkout/payment', element: <PaymentPage /> },
            { path: 'checkout/review', element: <PlaceOrderPage /> },
            { path: 'orders', element: <OrderHistoryPage /> },
            { path: 'orders/:orderId', element: <OrderDetailPage /> },
          ],
        },
        {
          path: 'admin',
          element: <RequireAdmin />,
          children: [
            { index: true, element: <AdminDashboardPage /> },
            { path: 'products', element: <ManageProductsPage /> },
            { path: 'users', element: <ManageUsersPage /> },
            { path: 'orders', element: <AdminOrdersPage /> },
            { path: 'reports', element: <SalesReportsPage /> },
          ],
        },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ],
  {
    future: { v7_relativeSplatPath: true },
  },
);
