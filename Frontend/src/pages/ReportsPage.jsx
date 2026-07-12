import { useState, useEffect } from 'react';
import { HiDownload, HiChartBar, HiChartPie, HiTrendingUp } from 'react-icons/hi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts';
import reportService from '../services/reportService';
import Button from '../components/common/Button';
import { StatCard } from '../components/common/Card';
import { useToast } from '../context/ToastContext';
import {
  HiArchive, HiCog, HiCalendar,
} from 'react-icons/hi';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card px-3 py-2.5 text-xs">
      <p className="font-semibold text-content-primary mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mt-0.5">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-content-secondary capitalize">{p.name}:</span>
          <span className="text-content-primary font-medium">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// Utilization Rate Mock Data
const UTILIZATION_DATA = [
  { dept: 'Engineering', rate: 88 },
  { dept: 'Facilities',  rate: 72 },
  { dept: 'HR',          rate: 61 },
  { dept: 'Procurement', rate: 78 },
  { dept: 'Field Ops',   rate: 55 },
];

export default function ReportsPage() {
  const { toast } = useToast();
  const [summaryStats,     setSummaryStats]    = useState([]);
  const [assetUsage,       setAssetUsage]      = useState([]);
  const [maintenanceChart, setMaintenanceChart] = useState([]);

  // Fetch all report data from service on mount
  useEffect(() => {
    reportService.getSummaryStats().then((s) => {
      setSummaryStats([
        { label: 'Total Assets',      value: s.availableAssets + s.allocatedAssets + s.maintenanceAssets, icon: HiArchive,     iconBg: 'bg-info/15 text-info' },
        { label: 'Utilization Rate',  value: '70%',   icon: HiTrendingUp, iconBg: 'bg-success/15 text-success' },
        { label: 'Maintenance Costs', value: '₹1.2L', icon: HiCog,        iconBg: 'bg-warning/15 text-warning' },
        { label: 'Active Bookings',   value: s.activeBookings, icon: HiCalendar, iconBg: 'bg-primary/15 text-primary' },
      ]);
    });
    reportService.getAssetUsage().then(setAssetUsage);
    reportService.getMaintenanceChart().then(setMaintenanceChart);
  }, []);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h2 className="page-title">Reports</h2>
          <p className="page-subtitle">Asset usage, maintenance, and utilization analytics</p>
        </div>
        <Button
          variant="secondary"
          icon={HiDownload}
          onClick={() => toast.info('Report export initiated.')}
        >
          Export Report
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryStats.map((stat) => <StatCard key={stat.label} {...stat} />)}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Asset Usage Trend */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-content-primary flex items-center gap-2 mb-4">
            <HiChartBar size={15} className="text-primary" /> Asset Status Trend (6 months)
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={assetUsage} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8', paddingTop: '8px' }} />
              <Bar dataKey="allocated"   fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="available"   fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="maintenance" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Maintenance Breakdown */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-content-primary flex items-center gap-2 mb-4">
            <HiChartPie size={15} className="text-warning" /> Maintenance Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={maintenanceChart}
                cx="50%" cy="50%"
                innerRadius={45} outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {maintenanceChart.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {maintenanceChart.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: item.color }} />
                  <span className="text-content-secondary">{item.name}</span>
                </div>
                <span className="text-content-primary font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Utilization */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-content-primary flex items-center gap-2 mb-4">
          <HiTrendingUp size={15} className="text-success" /> Department Asset Utilization Rate (%)
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={UTILIZATION_DATA} layout="vertical" margin={{ top: 0, right: 20, left: 60, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} />
            <YAxis type="category" dataKey="dept" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="rate" fill="#10b981" radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#94a3b8', fontSize: 10, formatter: (v) => `${v}%` }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
