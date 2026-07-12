import { useState, useMemo } from 'react';
import { HiPlus, HiEye, HiPencil, HiTrash, HiQrcode } from 'react-icons/hi';
import { MOCK_ASSETS, MOCK_CATEGORIES, MOCK_DEPARTMENTS } from '../constants/mockData';
import DataTable from '../components/common/DataTable';
import Badge, { statusVariant } from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import SearchBar from '../components/common/SearchBar';
import Pagination from '../components/common/Pagination';
import { useToast } from '../context/ToastContext';

const PAGE_SIZE = 8;

const STATUS_OPTIONS = ['Available', 'Allocated', 'Maintenance'];

function AssetDetailModal({ asset, onClose }) {
  if (!asset) return null;
  const rows = [
    ['Tag',         asset.tag],
    ['Name',        asset.name],
    ['Category',    asset.category],
    ['Status',      asset.status],
    ['Location',    asset.location],
    ['Department',  asset.department || '—'],
    ['Assigned To', asset.assignedTo || '—'],
    ['Purchase Date', asset.purchaseDate],
    ['Value (₹)',   asset.value?.toLocaleString('en-IN')],
  ];
  return (
    <Modal isOpen={!!asset} onClose={onClose} title={`Asset: ${asset.tag}`} size="md">
      <div className="space-y-0">
        {rows.map(([label, val]) => (
          <div key={label} className="flex justify-between py-2.5 border-b border-surface-border/50 last:border-0">
            <span className="text-xs text-content-muted">{label}</span>
            <span className="text-xs text-content-primary font-medium">{val}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

function RegisterAssetModal({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState({
    name: '', category: '', location: '', department: '', purchaseDate: '', value: '',
  });

  const handleSave = () => {
    onSave({ ...form, tag: `AF-${String(Math.floor(Math.random()*9000)+1000)}`, status: 'Available', assignedTo: null });
    onClose();
    setForm({ name:'', category:'', location:'', department:'', purchaseDate:'', value:'' });
  };

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const catOptions = MOCK_CATEGORIES.map((c) => ({ label: c.name, value: c.name }));
  const deptOptions = MOCK_DEPARTMENTS.map((d) => ({ label: d.name, value: d.name }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register New Asset" size="md"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={handleSave}>Register Asset</Button></>}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input className="sm:col-span-2" label="Asset Name" value={form.name}         onChange={set('name')}         required />
        <Select label="Category"    value={form.category}   onChange={set('category')}   options={catOptions}  placeholder="Select category" required />
        <Input  label="Location"    value={form.location}   onChange={set('location')}   placeholder="e.g. HQ Floor 2" />
        <Select label="Department"  value={form.department} onChange={set('department')} options={deptOptions} placeholder="Select department" />
        <Input  label="Purchase Date" type="date" value={form.purchaseDate} onChange={set('purchaseDate')} />
        <Input  label="Value (₹)"  type="number" value={form.value} onChange={set('value')} placeholder="0" />
      </div>
    </Modal>
  );
}

export default function AssetsPage() {
  const { toast } = useToast();
  const [assets,      setAssets]   = useState(MOCK_ASSETS);
  const [search,      setSearch]   = useState('');
  const [filterCat,   setFilterCat]= useState('');
  const [filterStatus,setFilterStatus] = useState('');
  const [filterDept,  setFilterDept]   = useState('');
  const [page,        setPage]     = useState(1);
  const [selected,    setSelected] = useState(null);
  const [showRegister,setRegister] = useState(false);

  const catOptions  = [{ label: 'All Categories',  value: '' }, ...MOCK_CATEGORIES.map((c)  => ({ label: c.name,  value: c.name  }))];
  const deptOptions = [{ label: 'All Departments', value: '' }, ...MOCK_DEPARTMENTS.map((d) => ({ label: d.name,  value: d.name  }))];
  const statusOptions = [{ label: 'All Statuses', value: '' }, ...STATUS_OPTIONS.map((s) => ({ label: s, value: s }))];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return assets.filter((a) => {
      const matchQ      = !q || a.tag.toLowerCase().includes(q) || a.name.toLowerCase().includes(q);
      const matchCat    = !filterCat    || a.category   === filterCat;
      const matchStatus = !filterStatus || a.status     === filterStatus;
      const matchDept   = !filterDept   || a.department === filterDept;
      return matchQ && matchCat && matchStatus && matchDept;
    });
  }, [assets, search, filterCat, filterStatus, filterDept]);

  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const handleRegister = (newAsset) => {
    setAssets((prev) => [{ id: Date.now(), ...newAsset }, ...prev]);
    toast.success(`Asset ${newAsset.tag} registered!`);
  };

  const columns = [
    { key: 'tag',      label: 'Tag',      render: (v) => <span className="font-mono text-primary text-xs font-semibold">{v}</span> },
    { key: 'name',     label: 'Name' },
    { key: 'category', label: 'Category' },
    { key: 'status',   label: 'Status',   render: (v) => <Badge variant={statusVariant(v)} dot>{v}</Badge> },
    { key: 'location', label: 'Location' },
    { key: '_actions', label: '', render: (_, row) => (
      <div className="flex gap-1 justify-end">
        <button onClick={() => setSelected(row)} className="p-1.5 rounded-lg text-content-muted hover:text-info hover:bg-info/10 transition-colors"><HiEye size={14} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h2 className="page-title">Assets</h2>
          <p className="page-subtitle">{assets.length} total assets in directory</p>
        </div>
        <Button icon={HiPlus} onClick={() => setRegister(true)}>+ Register Asset</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          onClear={() => setSearch('')}
          placeholder="Search by tag, serial, or QR code..."
        />
        <Select value={filterCat}    onChange={(e) => { setFilterCat(e.target.value);    setPage(1); }} options={catOptions}    placeholder="Category" className="w-40" />
        <Select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} options={statusOptions} placeholder="Status"   className="w-36" />
        <Select value={filterDept}   onChange={(e) => { setFilterDept(e.target.value);   setPage(1); }} options={deptOptions}   placeholder="Department" className="w-44" />
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <DataTable columns={columns} data={paged} keyField="id" />
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />

      {/* Modals */}
      <AssetDetailModal   asset={selected}    onClose={() => setSelected(null)} />
      <RegisterAssetModal isOpen={showRegister} onClose={() => setRegister(false)} onSave={handleRegister} />
    </div>
  );
}
