import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { MainLayout } from './layout';

const LoginPage      = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage   = lazy(() => import('./pages/auth/RegisterPage'));
const DashboardPage  = lazy(() => import('./pages/dashboard/DashboardPage'));
const AccountsPage   = lazy(() => import('./pages/accounts/AccountsPage'));
const TransactionsPage = lazy(() => import('./pages/transactions/TransactionsPage'));
const BudgetsPage    = lazy(() => import('./pages/budgets/BudgetsPage'));
const AnalyticsPage  = lazy(() => import('./pages/analytics/AnalyticsPage'));
const SettingsPage   = lazy(() => import('./pages/settings/SettingsPage'));

const PageLoader = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
    <CircularProgress />
  </Box>
);

const App = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard"    element={<DashboardPage />} />
        <Route path="/accounts"     element={<AccountsPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/budgets"      element={<BudgetsPage />} />
        <Route path="/analytics"    element={<AnalyticsPage />} />
        <Route path="/settings"     element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </Suspense>
);

export default App;
