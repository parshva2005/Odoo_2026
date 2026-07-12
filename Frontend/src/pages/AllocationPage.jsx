import { useState } from 'react';
import { HiExclamationCircle, HiSwitchHorizontal, HiClock } from 'react-icons/hi';
import { MOCK_ASSETS, MOCK_EMPLOYEES, MOCK_ALLOCATION_HISTORY } from '../constants/mockData';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import { useToast } from '../context/ToastContext';
import { clsx } from 'clsx';
import Badge, { statusVariant } from '../components/common/Badge';

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function AllocationPage() {
  const { toast } = useToast();

  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [toEmployeeId,    setToEmployee]       = useState('');
  const [reason,          setReason]           = useState('');
  const [loading,         setLoading]          = useState(false);
  const [history,         setHistory]          = useState(MOCK_ALLOCATION_HISTORY);

  const selectedAsset  = MOCK_ASSETS.find((a) => String(a.id) === selectedAssetId);
  const isAllocated    = selectedAsset?.status === 'Allocated';
  const isMaintenance  = selectedAsset?.status === 'Maintenance';

  const assetOptions   = MOCK_ASSETS.map((a) => ({ value: String(a.id), label: `${a.tag} – ${a.name}` }));
  const employeeOptions= MOCK_EMPLOYEES.map((e) => ({ value: String(e.id), label: e.name }));

  const currentHolder  = selectedAsset?.assignedTo || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAsset || !toEmployeeId || !reason.trim()) {
      toast.error('Please fill all fields.');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800)); // Simulate API
    const toEmp = MOCK_EMPLOYEES.find((e) => String(e.id) === toEmployeeId);
    const newEntry = {
      id:         Date.now(),
      assetTag:   selectedAsset.tag,
      action:     isAllocated ? 'Transfer Requested' : 'Allocated',
      person:     toEmp?.name,
      department: toEmp?.department,
      date:       new Date().toISOString().slice(0, 10),
      condition:  'Good',
    };
    setHistory((h) => [newEntry, ...h]);
    toast.success(isAllocated ? 'Transfer request submitted for approval.' : 'Asset allocated successfully!');
    setReason('');
    setToEmployee('');
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="page-header">
        <div>
          <h2 className="page-title">Allocation & Transfer</h2>
          <p className="page-subtitle">Allocate assets or raise transfer requests</p>
        </div>
      </div>

      <div className="card p-6 space-y-5">
        {/* Asset Selector */}
        <Select
          label="Asset"
          value={selectedAssetId}
          onChange={(e) => { setSelectedAssetId(e.target.value); setToEmployee(''); }}
          options={assetOptions}
          placeholder="Select an asset…"
          required
        />

        {/* Status Info */}
        {selectedAsset && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-content-muted">Status:</span>
            <Badge variant={statusVariant(selectedAsset.status)} dot>{selectedAsset.status}</Badge>
            {selectedAsset.location && (
              <span className="text-content-muted">· {selectedAsset.location}</span>
            )}
          </div>
        )}

        {/* Double-Allocation Warning */}
        {isAllocated && (
          <div className="alert-danger">
            <HiExclamationCircle size={18} className="shrink-0" />
            <div>
              <p className="font-semibold">Already Allocated to {currentHolder}</p>
              <p className="text-xs mt-0.5 text-danger/80">
                Direct re-allocation is blocked — submit a transfer request below
              </p>
            </div>
          </div>
        )}

        {isMaintenance && (
          <div className="alert-warning">
            <HiExclamationCircle size={18} className="shrink-0" />
            <p>This asset is currently <strong>under maintenance</strong> and cannot be allocated.</p>
          </div>
        )}

        {/* Transfer Request / Allocation Form */}
        {selectedAsset && !isMaintenance && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {isAllocated && (
              <h3 className="text-sm font-semibold text-content-primary flex items-center gap-2">
                <HiSwitchHorizontal size={15} className="text-primary" />
                Transfer Request
              </h3>
            )}

            {isAllocated && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">From</label>
                  <div className="form-input bg-surface-base cursor-not-allowed text-content-muted">
                    {currentHolder}
                  </div>
                </div>
                <Select
                  label="To"
                  value={toEmployeeId}
                  onChange={(e) => setToEmployee(e.target.value)}
                  options={employeeOptions}
                  placeholder="Select Employee…"
                  required
                />
              </div>
            )}

            {!isAllocated && (
              <Select
                label="Allocate To"
                value={toEmployeeId}
                onChange={(e) => setToEmployee(e.target.value)}
                options={employeeOptions}
                placeholder="Select Employee…"
                required
              />
            )}

            <div>
              <label className="form-label">Reason <span className="text-danger">*</span></label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                placeholder="Explain why this allocation or transfer is needed…"
                className="form-input resize-none"
                required
              />
            </div>

            <Button type="submit" loading={loading} icon={HiSwitchHorizontal}>
              {isAllocated ? 'Submit Request' : 'Allocate Asset'}
            </Button>
          </form>
        )}
      </div>

      {/* Allocation History */}
      {history.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-content-primary flex items-center gap-2 mb-4">
            <HiClock size={15} className="text-primary" />
            Allocation History
          </h3>
          <div className="space-y-0">
            {history.map((item) => (
              <div key={item.id} className="flex gap-3 py-3 border-b border-surface-border/40 last:border-0">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <div>
                  <p className="text-xs text-content-primary">
                    <strong>{formatDate(item.date)}</strong>
                    {' – '}
                    {item.action} to <span className="text-primary">{item.person}</span>
                    {item.department && <span className="text-content-muted"> – {item.department}</span>}
                  </p>
                  {item.condition && (
                    <p className="text-xs text-content-muted mt-0.5">Condition: {item.condition}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
