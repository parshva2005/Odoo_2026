import { useState, useMemo } from 'react';
import { HiDownload, HiFilter } from 'react-icons/hi';
import { MOCK_AUDIT_LOGS } from '../constants/mockData';
import DataTable from '../components/common/DataTable';
import SearchBar from '../components/common/SearchBar';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import Pagination from '../components/common/Pagination';
import Badge from '../components/common/Badge';
import { useToast } from '../context/ToastContext';

const PAGE_SIZE = 10;

const ACTION_VARIANT = {
  'Asset Allocated':      'info',
  'Booking Created':      'success',
  'Maintenance Raised':   'warning',
  'Transfer Approved':    'success',
  'Asset Registered':     'info',
  'Employee Added':       'muted',
  'Department Updated':   'warning',
  'Maintenance Resolved': 'success',
  'Booking Cancelled':    'danger',
  'Asset Returned':       'muted',
};

const ACTION_TYPES = ['All Actions', ...new Set(MOCK_AUDIT_LOGS.map((l) => l.action))];

export default function AuditPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [page,   setPage]   = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return MOCK_AUDIT_LOGS.filter((log) => {
      const matchQ = !q || log.action.toLowerCase().includes(q) || log.entity.toLowerCase().includes(q) || log.user.toLowerCase().includes(q);
      const matchF = !filter || filter === 'All Actions' || log.action === filter;
      return matchQ && matchF;
    });
  }, [search, filter]);

  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const handleExport = () => {
    toast.info('Audit log export initiated. File will download shortly.');
    // Real implementation: GET /api/audit/export → Blob download
  };

  const columns = [
    { key: 'timestamp', label: 'Timestamp', render: (v) => <span className="font-mono text-xs text-content-muted">{v}</span> },
    { key: 'action',    label: 'Action',    render: (v) => <Badge variant={ACTION_VARIANT[v] || 'muted'}>{v}</Badge> },
    { key: 'entity',    label: 'Entity' },
    { key: 'user',      label: 'User',      render: (v) => <span className="text-primary text-xs">{v}</span> },
    { key: 'details',   label: 'Details',   render: (v) => <span className="text-xs text-content-secondary">{v}</span> },
  ];

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h2 className="page-title">Audit Log</h2>
          <p className="page-subtitle">Complete record of all system activities</p>
        </div>
        <Button variant="secondary" icon={HiDownload} onClick={handleExport}>
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          onClear={() => setSearch('')}
          placeholder="Search by action, entity, or user…"
        />
        <Select
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setPage(1); }}
          options={ACTION_TYPES.map((a) => ({ label: a, value: a }))}
          placeholder="All Actions"
          className="w-52"
        />
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <DataTable columns={columns} data={paged} keyField="id" emptyMessage="No audit records match your filters" />
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />
    </div>
  );
}
