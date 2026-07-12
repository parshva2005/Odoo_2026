import { useState } from 'react';
import {
  HiCheckCircle, HiExclamationCircle, HiInformationCircle,
  HiExclamation, HiBell, HiCheck,
} from 'react-icons/hi';
import { MOCK_NOTIFICATIONS } from '../constants/mockData';
import { clsx } from 'clsx';
import Button from '../components/common/Button';
import { useToast } from '../context/ToastContext';

const TYPE_CONFIG = {
  danger:  { icon: HiExclamationCircle, color: 'text-danger',  bg: 'bg-danger/10',  border: 'border-danger/20' },
  success: { icon: HiCheckCircle,       color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' },
  warning: { icon: HiExclamation,       color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20' },
  info:    { icon: HiInformationCircle, color: 'text-info',    bg: 'bg-info/10',    border: 'border-info/20' },
};

export default function NotificationsPage() {
  const { toast } = useToast();
  const [notifs, setNotifs] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState('all'); // all | unread | read

  const markRead = (id) => {
    setNotifs((n) => n.map((item) => item.id === id ? { ...item, read: true } : item));
  };

  const markAll = () => {
    setNotifs((n) => n.map((item) => ({ ...item, read: true })));
    toast.success('All notifications marked as read.');
  };

  const dismiss = (id) => {
    setNotifs((n) => n.filter((item) => item.id !== id));
  };

  const filtered = notifs.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read')   return n.read;
    return true;
  });

  const unreadCount = notifs.filter((n) => !n.read).length;

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="page-header">
        <div>
          <h2 className="page-title">Notifications</h2>
          <p className="page-subtitle">
            {unreadCount > 0 ? `${unreadCount} unread alerts` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" icon={HiCheck} onClick={markAll} size="sm">
            Mark All Read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="tab-list w-fit">
        {['all', 'unread', 'read'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={clsx('tab-item capitalize', filter === tab && 'active')}
          >
            {tab}
            {tab === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 bg-danger text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="card p-0 overflow-hidden divide-y divide-surface-border/50">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-content-muted">
            <HiBell size={32} className="mb-3 opacity-30" />
            <p className="text-sm">No notifications here.</p>
          </div>
        ) : (
          filtered.map((notif) => {
            const cfg  = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info;
            const Icon = cfg.icon;
            return (
              <div
                key={notif.id}
                className={clsx(
                  'flex gap-4 px-5 py-4 transition-colors hover:bg-surface-hover/40',
                  !notif.read && 'bg-primary/[0.03]'
                )}
              >
                {/* Icon */}
                <div className={clsx('w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border', cfg.bg, cfg.border)}>
                  <Icon size={16} className={cfg.color} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={clsx('text-sm font-semibold', notif.read ? 'text-content-secondary' : 'text-content-primary')}>
                      {notif.title}
                      {!notif.read && (
                        <span className="ml-2 w-2 h-2 rounded-full bg-primary inline-block align-middle" />
                      )}
                    </p>
                    <span className="text-xs text-content-muted whitespace-nowrap">{notif.time}</span>
                  </div>
                  <p className="text-xs text-content-secondary mt-0.5 leading-relaxed">{notif.message}</p>

                  {/* Actions */}
                  <div className="flex gap-3 mt-2">
                    {!notif.read && (
                      <button
                        onClick={() => markRead(notif.id)}
                        className="text-xs text-primary hover:underline"
                      >
                        Mark as read
                      </button>
                    )}
                    <button
                      onClick={() => dismiss(notif.id)}
                      className="text-xs text-content-muted hover:text-danger transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
