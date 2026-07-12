import { NavLink, useNavigate } from 'react-router-dom';
import {
  HiViewGridAdd, HiOfficeBuilding, HiArchive, HiSwitchHorizontal,
  HiCalendar, HiCog, HiClipboardList, HiChartBar,
  HiBell, HiLogout, HiChevronLeft, HiChevronRight,
} from 'react-icons/hi';
import { clsx } from 'clsx';
import { useState } from 'react';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../common/Modal';
import Button from '../common/Button';

const NAV_ITEMS = [
  { label: 'Dashboard',            icon: HiViewGridAdd,       to: ROUTES.DASHBOARD  },
  { label: 'Organization Setup',   icon: HiOfficeBuilding,    to: ROUTES.ORG_SETUP, adminOnly: true },
  { label: 'Assets',               icon: HiArchive,           to: ROUTES.ASSETS     },
  { label: 'Allocation & Transfer',icon: HiSwitchHorizontal,  to: ROUTES.ALLOCATION },
  { label: 'Resource Booking',     icon: HiCalendar,          to: ROUTES.BOOKING    },
  { label: 'Maintenance',          icon: HiCog,               to: ROUTES.MAINTENANCE },
  { label: 'Audit',                icon: HiClipboardList,     to: ROUTES.AUDIT, adminOnly: true },
  { label: 'Reports',              icon: HiChartBar,          to: ROUTES.REPORTS    },
  { label: 'Notifications',        icon: HiBell,              to: ROUTES.NOTIFICATIONS },
];

export default function Sidebar({ collapsed, onToggle, notifCount = 0 }) {
  const { user, logout, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const confirmLogout = async () => {
    await logout();
    setShowLogoutModal(false);
    toast.info('You have been logged out.');
    navigate('/login');
  };

  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside
      className={clsx(
        'flex flex-col h-screen bg-surface-secondary border-r border-surface-border',
        'transition-all duration-300 ease-in-out shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-surface-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">AF</span>
        </div>
        {!collapsed && (
          <span className="text-lg font-bold text-gradient whitespace-nowrap">AssetFlow</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto no-scrollbar">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              clsx(
                'sidebar-nav-item group relative',
                isActive && 'active',
                collapsed && 'justify-center px-2'
              )
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={18} className="shrink-0" />
            {!collapsed && (
              <span className="truncate">{item.label}</span>
            )}
            {!collapsed && item.label === 'Notifications' && notifCount > 0 && (
              <span className="ml-auto text-xs bg-danger text-white rounded-full px-1.5 py-0.5 font-bold min-w-[20px] text-center">
                {notifCount}
              </span>
            )}
            {collapsed && item.label === 'Notifications' && notifCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      <div className="border-t border-surface-border p-3">
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1 rounded-lg hover:bg-surface-hover transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary">
                {user?.avatar || user?.name?.slice(0, 2).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-content-primary truncate">{user?.name}</p>
              <p className="text-xs text-content-muted truncate">{user?.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setShowLogoutModal(true)}
          title="Logout"
          className={clsx(
            'sidebar-nav-item w-full text-danger/80 hover:text-danger hover:bg-danger/10',
            collapsed && 'justify-center px-2'
          )}
        >
          <HiLogout size={17} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full
                   bg-surface-elevated border border-surface-border
                   flex items-center justify-center text-content-muted
                   hover:text-content-primary hover:border-primary/30 transition-all z-10
                   shadow-card"
      >
        {collapsed ? <HiChevronRight size={16} /> : <HiChevronLeft size={16} />}
      </button>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirm Logout"
        size="sm"
        footer={
          <>
            <Button variant="primary" onClick={confirmLogout} className="bg-danger hover:bg-danger/90">
              Logout
            </Button>
            <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
              Cancel
            </Button>
          </>
        }
      >
        <p className="text-sm text-content-secondary">
          Are you sure you want to log out of AssetFlow?
        </p>
      </Modal>
    </aside>
  );
}
