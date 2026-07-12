import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { HiBell } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';
import notificationService from '../../services/notificationService';

// Human-readable page titles
const PAGE_TITLES = {
  '/':              'Dashboard',
  '/organization':  'Organization Setup',
  '/assets':        'Assets',
  '/allocation':    'Allocation & Transfer',
  '/booking':       'Resource Booking',
  '/maintenance':   'Maintenance',
  '/audit':         'Audit Log',
  '/reports':       'Reports',
  '/notifications': 'Notifications',
};

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'AssetFlow';

  // Load unread notification count from service (no hardcoded data)
  useEffect(() => {
    notificationService.getAll().then((notifications) => {
      setUnreadCount(notifications.filter((n) => !n.read).length);
    });
  }, [location.pathname]); // refresh count on every page navigation

  return (
    <div className="flex h-screen bg-surface-base overflow-hidden">
      {/* Sidebar */}
      <div className="relative">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          notifCount={unreadCount}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Top Bar */}
        <header className="flex items-center justify-between gap-4 px-6 py-3.5
                           bg-surface-secondary border-b border-surface-border shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-content-primary">{title}</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <Link
              to={ROUTES.NOTIFICATIONS}
              className="relative p-2 rounded-lg text-content-muted hover:text-content-primary
                         hover:bg-surface-hover transition-colors"
            >
              <HiBell size={19} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
              )}
            </Link>

            {/* Avatar */}
            <div className="flex items-center gap-2 pl-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30
                              flex items-center justify-center cursor-pointer">
                <span className="text-xs font-bold text-primary">
                  {user?.avatar || user?.name?.slice(0, 2).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-content-primary leading-tight">{user?.name}</p>
                <p className="text-xs text-content-muted leading-tight">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
