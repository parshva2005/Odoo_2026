import { clsx } from 'clsx';

export function Card({ children, className = '', hover = false }) {
  return (
    <div className={clsx('card', hover && 'card-hover', className)}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, iconBg = 'bg-primary/15 text-primary', trend, trendLabel }) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="stat-label">{label}</p>
          <p className="stat-value mt-1">{value}</p>
          {trendLabel && (
            <p className={clsx('text-xs mt-1', trend === 'up' ? 'text-success' : 'text-danger')}>
              {trend === 'up' ? '↑' : '↓'} {trendLabel}
            </p>
          )}
        </div>
        {Icon && (
          <div className={clsx('stat-icon', iconBg)}>
            <Icon size={18} />
          </div>
        )}
      </div>
    </div>
  );
}
