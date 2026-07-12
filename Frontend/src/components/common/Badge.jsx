import { clsx } from 'clsx';

/**
 * Badge component for status indicators
 * variant: 'success' | 'danger' | 'warning' | 'info' | 'muted'
 */
export default function Badge({ children, variant = 'muted', dot = false, className = '' }) {
  const variantClass = {
    success: 'badge-success',
    danger:  'badge-danger',
    warning: 'badge-warning',
    info:    'badge-info',
    muted:   'badge-muted',
  }[variant] || 'badge-muted';

  const dotColor = {
    success: 'bg-success',
    danger:  'bg-danger',
    warning: 'bg-warning',
    info:    'bg-info',
    muted:   'bg-content-muted',
  }[variant] || 'bg-content-muted';

  return (
    <span className={clsx('badge', variantClass, className)}>
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', dotColor)} />}
      {children}
    </span>
  );
}

/**
 * Helper: map status string → Badge variant
 */
export function statusVariant(status) {
  const map = {
    Active:       'success',
    Available:    'success',
    Confirmed:    'success',
    Resolved:     'success',
    Approved:     'info',
    Allocated:    'info',
    Pending:      'warning',
    'In Progress':'warning',
    'Technician Assigned': 'info',
    Inactive:     'danger',
    Maintenance:  'danger',
    Cancelled:    'danger',
    Rejected:     'danger',
  };
  return map[status] || 'muted';
}
