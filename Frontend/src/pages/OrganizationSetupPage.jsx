import { useState, useEffect } from 'react';
import {
  HiOfficeBuilding, HiTag, HiUsers, HiPlus, HiPencil, HiTrash,
} from 'react-icons/hi';
import { clsx } from 'clsx';
import {
  INITIAL_DEPARTMENTS, INITIAL_CATEGORIES, INITIAL_EMPLOYEES,
} from '../data/dummyData';
import DataTable from '../components/common/DataTable';
import Badge, { statusVariant } from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import { useToast } from '../context/ToastContext';

const TABS = [
  { key: 'departments', label: 'Departments', icon: HiOfficeBuilding },
  { key: 'categories',  label: 'Categories',  icon: HiTag },
  { key: 'employees',   label: 'Employee',     icon: HiUsers },
];

/* ---------- Departments Sub-Page ---------- */
function DepartmentsTab({ addTrigger }) {
  const { toast } = useToast();
  const [data,       setData]    = useState(INITIAL_DEPARTMENTS);
  const [showModal,  setModal]   = useState(false);
  const [editing,    setEditing] = useState(null);
  const [form,       setForm]    = useState({ name: '', head: '', parentDept: '', status: 'Active' });

  const openAdd  = ()      => { setEditing(null); setForm({ name:'', head:'', parentDept:'', status:'Active' }); setModal(true); };

  useEffect(() => {
    if (addTrigger > 0) openAdd();
  }, [addTrigger]);
  const openEdit = (row)   => { setEditing(row);  setForm({ name: row.name, head: row.head, parentDept: row.parentDept || '', status: row.status }); setModal(true); };
  const save = () => {
    if (editing) {
      setData((d) => d.map((r) => r.id === editing.id ? { ...r, ...form } : r));
      toast.success('Department updated.');
    } else {
      setData((d) => [...d, { id: Date.now(), ...form, parentDept: form.parentDept || null }]);
      toast.success('Department added.');
    }
    setModal(false);
  };
  const del = (row) => {
    setData((d) => d.filter((r) => r.id !== row.id));
    toast.info(`"${row.name}" removed.`);
  };

  const columns = [
    { key: 'name',       label: 'Department' },
    { key: 'head',       label: 'Head' },
    { key: 'parentDept', label: 'Parent Dept', render: (v) => v || '—' },
    { key: 'status',     label: 'Status', render: (v) => <Badge variant={statusVariant(v)} dot>{v}</Badge> },
    { key: '_actions', label: '', render: (_, row) => (
      <div className="flex gap-1 justify-end">
        <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg text-content-muted hover:text-primary hover:bg-primary/10 transition-colors"><HiPencil size={14} /></button>
        <button onClick={() => del(row)}      className="p-1.5 rounded-lg text-content-muted hover:text-danger hover:bg-danger/10 transition-colors"><HiTrash size={14} /></button>
      </div>
    )},
  ];

  return (
    <>
      <p className="text-xs text-content-muted mb-4 italic">
        Editing a department here also drives the picklist in Assets &amp; Allocation screens.
      </p>
      <DataTable columns={columns} data={data} keyField="id" />

      <Modal isOpen={showModal} onClose={() => setModal(false)} title={editing ? 'Edit Department' : 'Add Department'}
        footer={<><Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button><Button onClick={save}>Save</Button></>}
      >
        <div className="space-y-4">
          <Input label="Department Name" value={form.name}       onChange={(e) => setForm({ ...form, name: e.target.value })}       required />
          <Input label="Head"            value={form.head}       onChange={(e) => setForm({ ...form, head: e.target.value })}       required />
          <Input label="Parent Dept"     value={form.parentDept} onChange={(e) => setForm({ ...form, parentDept: e.target.value })} placeholder="Leave empty if top-level" />
          <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={['Active', 'Inactive']} />
        </div>
      </Modal>
    </>
  );
}

/* ---------- Categories Sub-Page ---------- */
function CategoriesTab({ addTrigger }) {
  const { toast } = useToast();
  const [data,      setData]   = useState(INITIAL_CATEGORIES);
  const [showModal, setModal]  = useState(false);
  const [editing,   setEditing]= useState(null);
  const [form,      setForm]   = useState({ name: '', description: '', status: 'Active' });

  const openAdd  = ()    => { setEditing(null); setForm({ name:'', description:'', status:'Active' }); setModal(true); };

  useEffect(() => {
    if (addTrigger > 0) openAdd();
  }, [addTrigger]);
  const openEdit = (row) => { setEditing(row);  setForm({ name: row.name, description: row.description, status: row.status }); setModal(true); };
  const save = () => {
    if (editing) {
      setData((d) => d.map((r) => r.id === editing.id ? { ...r, ...form } : r));
      toast.success('Category updated.');
    } else {
      setData((d) => [...d, { id: Date.now(), ...form, assetCount: 0 }]);
      toast.success('Category added.');
    }
    setModal(false);
  };

  const columns = [
    { key: 'name',        label: 'Category' },
    { key: 'description', label: 'Description' },
    { key: 'assetCount',  label: 'Assets', render: (v) => <span className="text-primary font-semibold">{v}</span> },
    { key: 'status',      label: 'Status', render: (v) => <Badge variant={statusVariant(v)} dot>{v}</Badge> },
    { key: '_actions', label: '', render: (_, row) => (
      <div className="flex gap-1 justify-end">
        <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg text-content-muted hover:text-primary hover:bg-primary/10 transition-colors"><HiPencil size={14} /></button>
      </div>
    )},
  ];

  return (
    <>
      <DataTable columns={columns} data={data} keyField="id" />
      <Modal isOpen={showModal} onClose={() => setModal(false)} title={editing ? 'Edit Category' : 'Add Category'}
        footer={<><Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button><Button onClick={save}>Save</Button></>}
      >
        <div className="space-y-4">
          <Input label="Category Name"  value={form.name}        onChange={(e) => setForm({ ...form, name: e.target.value })}        required />
          <Input label="Description"    value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={['Active', 'Inactive']} />
        </div>
      </Modal>
    </>
  );
}

/* ---------- Employees Sub-Page ---------- */
function EmployeesTab({ addTrigger }) {
  const { toast } = useToast();
  const [data,      setData]    = useState(INITIAL_EMPLOYEES);
  const [showModal, setModal]   = useState(false);
  const [editing,   setEditing] = useState(null);
  const [form,      setForm]    = useState({ name:'', email:'', department:'', role:'Employee', status:'Active' });

  const openAdd  = ()    => { setEditing(null); setForm({ name:'',email:'',department:'',role:'Employee',status:'Active' }); setModal(true); };

  useEffect(() => {
    if (addTrigger > 0) openAdd();
  }, [addTrigger]);
  const openEdit = (row) => { setEditing(row);  setForm({ name:row.name,email:row.email,department:row.department,role:row.role,status:row.status }); setModal(true); };
  const save = () => {
    if (editing) {
      setData((d) => d.map((r) => r.id === editing.id ? { ...r, ...form } : r));
      toast.success('Employee updated.');
    } else {
      setData((d) => [...d, { id: Date.now(), ...form }]);
      toast.success('Employee added.');
    }
    setModal(false);
  };

  const columns = [
    { key: 'name',       label: 'Name' },
    { key: 'email',      label: 'Email', render: (v) => <span className="text-content-muted text-xs">{v}</span> },
    { key: 'department', label: 'Department' },
    { key: 'role',       label: 'Role',
      render: (v) => <Badge variant={v === 'Admin' ? 'danger' : v === 'Manager' ? 'warning' : 'info'}>{v}</Badge> },
    { key: 'status', label: 'Status', render: (v) => <Badge variant={statusVariant(v)} dot>{v}</Badge> },
    { key: '_actions', label: '', render: (_, row) => (
      <div className="flex gap-1 justify-end">
        <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg text-content-muted hover:text-primary hover:bg-primary/10 transition-colors"><HiPencil size={14} /></button>
      </div>
    )},
  ];

  return (
    <>
      <DataTable columns={columns} data={data} keyField="id" />
      <Modal isOpen={showModal} onClose={() => setModal(false)} title={editing ? 'Edit Employee' : 'Add Employee'}
        footer={<><Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button><Button onClick={save}>Save</Button></>}
      >
        <div className="space-y-4">
          <Input label="Full Name"   value={form.name}       onChange={(e) => setForm({ ...form, name: e.target.value })}       required />
          <Input label="Email"       value={form.email}      onChange={(e) => setForm({ ...form, email: e.target.value })}      required />
          <Input label="Department"  value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          <Select label="Role" value={form.role}   onChange={(e) => setForm({ ...form, role: e.target.value })}
            options={['Employee', 'Admin', 'Manager', 'Technician']} />
          <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={['Active', 'Inactive']} />
        </div>
      </Modal>
    </>
  );
}

/* ==================== Main Page ==================== */
export default function OrganizationSetupPage() {
  const [activeTab, setActiveTab] = useState('departments');
  const [addTrigger, setAddTrigger] = useState(0);

  const tabMap = {
    departments: { component: DepartmentsTab, addLabel: 'Add Department' },
    categories:  { component: CategoriesTab,  addLabel: 'Add Category'   },
    employees:   { component: EmployeesTab,   addLabel: 'Add Employee'   },
  };

  const ActiveComponent = tabMap[activeTab].component;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h2 className="page-title">Organization Setup</h2>
          <p className="page-subtitle text-warning text-xs font-medium">Admin access only</p>
        </div>
      </div>

      {/* Tab Bar + Add Button */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="tab-list">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setAddTrigger(0); }}
              className={clsx('tab-item flex items-center gap-2', activeTab === tab.key && 'active')}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
        <Button icon={HiPlus} variant="primary" onClick={() => setAddTrigger((t) => t + 1)}>
          {tabMap[activeTab].addLabel}
        </Button>
      </div>

      {/* Content */}
      <div className="card p-5 animate-fade-in">
        <ActiveComponent addTrigger={addTrigger} />
      </div>
    </div>
  );
}
