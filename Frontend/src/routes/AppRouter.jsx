import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import ProtectedRoute from './ProtectedRoute';

// Layouts
import AuthLayout   from '../layouts/AuthLayout';
import MainLayout   from '../layouts/MainLayout';

// Auth Pages
import LoginPage    from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// App Pages
import DashboardPage         from '../pages/DashboardPage';
import OrganizationSetupPage from '../pages/OrganizationSetupPage';
import AssetsPage            from '../pages/AssetsPage';
import AllocationPage        from '../pages/AllocationPage';
import ResourceBookingPage   from '../pages/ResourceBookingPage';
import MaintenancePage       from '../pages/MaintenancePage';
import AuditPage             from '../pages/AuditPage';
import ReportsPage           from '../pages/ReportsPage';
import NotificationsPage     from '../pages/NotificationsPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Auth Routes ────────────────────────────── */}
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.LOGIN}    element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        </Route>

        {/* ── Protected App Routes ───────────────────── */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.DASHBOARD}     element={<DashboardPage />} />
          <Route path={ROUTES.ORG_SETUP}     element={<ProtectedRoute adminOnly><OrganizationSetupPage /></ProtectedRoute>} />
          <Route path={ROUTES.ASSETS}        element={<AssetsPage />} />
          <Route path={ROUTES.ALLOCATION}    element={<AllocationPage />} />
          <Route path={ROUTES.BOOKING}       element={<ResourceBookingPage />} />
          <Route path={ROUTES.MAINTENANCE}   element={<MaintenancePage />} />
          <Route path={ROUTES.AUDIT}         element={<ProtectedRoute adminOnly><AuditPage /></ProtectedRoute>} />
          <Route path={ROUTES.REPORTS}       element={<ReportsPage />} />
          <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
        </Route>

        {/* ── Fallback ───────────────────────────────── */}
        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
