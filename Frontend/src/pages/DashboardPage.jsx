import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  HiArchive, HiSwitchHorizontal, HiCalendar, HiCog,
  HiExclamationCircle, HiPlusCircle, HiClipboardCheck,
  HiTrendingUp, HiRefresh, HiX, HiArrowRight,
} from 'react-icons/hi';
import { StatCard } from '../components/common/Card';
import {
  MOCK_DASHBOARD_STATS,
  MOCK_RECENT_ACTIVITY,
  MOCK_ASSET_USAGE,
} from '../constants/mockData';
import { ROUTES } from '../constants/routes';
import Button from '../components/common/Button';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { clsx } from 'clsx';

const activityIcons = {
  allocation:  { icon: HiSwitchHorizontal, color: 'text-info bg-info/10' },
  booking:     { icon: HiCalendar,         color: 'text-primary bg-primary/10' },
  maintenance: { icon: HiCog,            color: 'text-warning bg-warning/10' },
  transfer:    { icon: HiRefresh,          color: 'text-info bg-info/10' },
  asset:       { icon: HiArchive,          color: 'text-success bg-success/10' },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card px-3 py-2.5 text-xs">
      <p className="font-semibold text-content-primary mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-content-secondary capitalize">{p.name}:</span>
          <span className="text-content-primary font-medium">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const s = MOCK_DASHBOARD_STATS;

  const stats = [
    { label: 'Available Assets',  value: s.availableAssets,  icon: HiArchive,         iconBg: 'bg-success/15 text-success' },
    { label: 'Allocated Assets',  value: s.allocatedAssets,  icon: HiClipboardCheck,  iconBg: 'bg-info/15 text-info' },
    { label: 'In Maintenance',    value: s.maintenanceAssets,icon: HiCog,           iconBg: 'bg-warning/15 text-warning' },
    { label: 'Active Bookings',   value: s.activeBookings,   icon: HiCalendar,        iconBg: 'bg-primary/15 text-primary' },
    { label: 'Pending Transfers', value: s.pendingTransfers, icon: HiSwitchHorizontal,iconBg: 'bg-purple-500/15 text-purple-400' },
    { label: 'Upcoming Returns',  value: s.upcomingReturns,  icon: HiRefresh,         iconBg: 'bg-orange-500/15 text-orange-400' },
  ];

  const [alertDismissed, setAlertDismissed] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Today's Overview</h2>
          <p className="page-subtitle">Real-time asset and resource summary</p>
        </div>
        <div className="text-xs text-content-muted">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Overdue Alert — dismissible */}
      {s.overdueAssets > 0 && !alertDismissed && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg
                        bg-danger/10 border border-danger/25 text-danger text-sm
                        animate-slide-in-up">
          <div className="flex items-center gap-2">
            <HiExclamationCircle size={18} className="shrink-0" />
            <span>
              <strong>{s.overdueAssets} assets overdue for return</strong>
              {' '}— flagged for follow-up
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to={ROUTES.ASSETS}
              className="flex items-center gap-1 text-xs font-semibold text-danger
                         underline underline-offset-2 hover:text-red-400 transition-colors"
            >
              View Overdue <HiArrowRight size={12} />
            </Link>
            <button
              onClick={() => setAlertDismissed(true)}
              title="Dismiss alert"
              className="p-1 rounded-lg hover:bg-danger/20 transition-colors"
            >
              <HiX size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="primary"
          icon={HiPlusCircle}
          onClick={() => navigate(ROUTES.ASSETS)}
        >
          + Register Asset
        </Button>
        <Button
          variant="secondary"
          icon={HiCalendar}
          onClick={() => navigate(ROUTES.BOOKING)}
        >
          Book Resource
        </Button>
        <Button
          variant="secondary"
          icon={HiSwitchHorizontal}
          onClick={() => navigate(ROUTES.ALLOCATION)}
        >
          Raise Request
        </Button>
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset Usage Chart */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-content-primary flex items-center gap-2">
              <HiTrendingUp size={16} className="text-primary" />
              Asset Utilization (Last 6 months)
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MOCK_ASSET_USAGE} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAlloc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorAvail" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8', paddingTop: '8px' }} />
              <Area type="monotone" dataKey="allocated"  stroke="#10b981" fill="url(#colorAlloc)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="available"  stroke="#3b82f6" fill="url(#colorAvail)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="maintenance" stroke="#f59e0b" fill="none"           strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-content-primary mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {MOCK_RECENT_ACTIVITY.map((item) => {
              const cfg = activityIcons[item.type] || activityIcons.asset;
              const Icon = cfg.icon;
              return (
                <div key={item.id} className="flex gap-3 group">
                  <div className={clsx('w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5', cfg.color)}>
                    <Icon size={13} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-content-primary leading-snug">{item.message}</p>
                    <p className="text-xs text-content-muted mt-0.5">{item.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
