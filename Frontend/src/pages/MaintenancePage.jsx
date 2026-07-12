import { useState } from 'react';
import { HiPlus, HiUser } from 'react-icons/hi';
import { clsx } from 'clsx';
import { MOCK_MAINTENANCE } from '../constants/mockData';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Badge from '../components/common/Badge';
import { useToast } from '../context/ToastContext';
import { MOCK_ASSETS, MOCK_EMPLOYEES } from '../constants/mockData';

const STAGES = ['Pending', 'Approved', 'Technician Assigned', 'In Progress', 'Resolved'];

const STAGE_STYLES = {
  'Pending':             { header: 'border-warning/30 text-warning   bg-warning/5',  card: 'border-surface-border' },
  'Approved':            { header: 'border-info/30    text-info       bg-info/5',     card: 'border-info/20' },
  'Technician Assigned': { header: 'border-purple-400/30 text-purple-400 bg-purple-400/5', card: 'border-purple-400/20' },
  'In Progress':         { header: 'border-primary/30 text-primary    bg-primary/5',  card: 'border-primary/20' },
  'Resolved':            { header: 'border-success/30 text-success    bg-success/5',  card: 'border-success/20 bg-success/5' },
};

const PRIORITY_BADGE = {
  Critical: 'danger',
  High:     'danger',
  Medium:   'warning',
  Low:      'muted',
};

function TicketCard({ ticket, onMove, stages, currentStage }) {
  const nextStage = stages[stages.indexOf(currentStage) + 1];
  const prevStage = stages[stages.indexOf(currentStage) - 1];
  const isResolved = currentStage === 'Resolved';

  return (
    <div className={clsx('kanban-card', isResolved && 'resolved', STAGE_STYLES[currentStage]?.card)}>
      {/* Tag + Priority */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-mono text-primary text-xs font-bold">{ticket.tag}</span>
        {ticket.priority && (
          <Badge variant={PRIORITY_BADGE[ticket.priority]} className="text-[10px] px-1.5 py-0.5">
            {ticket.priority}
          </Badge>
        )}
      </div>

      {/* Asset name */}
      <p className="text-xs font-semibold text-content-primary mb-1">{ticket.name}</p>

      {/* Issue */}
      <p className="text-xs text-content-secondary leading-snug mb-2">{ticket.issue}</p>

      {/* Reported by */}
      <p className="text-xs text-content-muted mb-2">
        By: {ticket.reportedBy}
      </p>

      {/* Tech assigned */}
      {ticket.tech && (
        <p className="text-xs text-primary mb-2 flex items-center gap-1">
          <HiUser size={11} /> Tech: {ticket.tech}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-1 mt-2 flex-wrap">
        {nextStage && (
          <button
            onClick={() => onMove(ticket, currentStage, nextStage)}
            className="text-[10px] px-2 py-1 rounded bg-primary/15 text-primary hover:bg-primary/25 transition-colors font-semibold"
          >
            → {nextStage === 'Technician Assigned' ? 'Assign' : nextStage}
          </button>
        )}
        {prevStage && !isResolved && (
          <button
            onClick={() => onMove(ticket, currentStage, prevStage)}
            className="text-[10px] px-2 py-1 rounded bg-surface-hover text-content-muted hover:text-content-primary transition-colors"
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}

function RaiseTicketModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({ assetTag: '', issue: '', priority: 'Medium' });

  const assetOptions = MOCK_ASSETS.map((a) => ({ value: a.tag, label: `${a.tag} – ${a.name}` }));

  const handleSubmit = () => {
    if (!form.assetTag || !form.issue.trim()) return;
    onSubmit(form);
    onClose();
    setForm({ assetTag: '', issue: '', priority: 'Medium' });
  };

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Raise Maintenance Ticket" size="md"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={handleSubmit}>Submit Ticket</Button></>}
    >
      <div className="space-y-4">
        <Select label="Asset" value={form.assetTag} onChange={set('assetTag')} options={assetOptions} placeholder="Select asset…" required />
        <div>
          <label className="form-label">Issue Description <span className="text-danger">*</span></label>
          <textarea
            value={form.issue}
            onChange={set('issue')}
            rows={4}
            className="form-input resize-none"
            placeholder="Describe the problem in detail…"
          />
        </div>
        <Select label="Priority" value={form.priority} onChange={set('priority')}
          options={['Low', 'Medium', 'High', 'Critical']} />
      </div>
    </Modal>
  );
}

export default function MaintenancePage() {
  const { toast } = useToast();
  const [board,      setBoard]   = useState(MOCK_MAINTENANCE);
  const [showModal,  setModal]   = useState(false);

  const moveCard = (ticket, from, to) => {
    setBoard((b) => {
      const updated = { ...b };
      updated[from] = updated[from].filter((t) => t.id !== ticket.id);
      updated[to]   = [...(updated[to] || []), { ...ticket }];
      return updated;
    });
    const msg = to === 'Resolved'
      ? `${ticket.tag} resolved — asset returned to Available`
      : `${ticket.tag} moved to "${to}"`;
    toast.success(msg);
  };

  const handleNewTicket = (form) => {
    const asset = MOCK_ASSETS.find((a) => a.tag === form.assetTag);
    const ticket = {
      id:         Date.now(),
      tag:        form.assetTag,
      name:       asset?.name || form.assetTag,
      issue:      form.issue,
      reportedBy: 'You',
      date:       new Date().toISOString().slice(0, 10),
      priority:   form.priority,
    };
    setBoard((b) => ({ ...b, Pending: [ticket, ...(b.Pending || [])] }));
    toast.success('Maintenance ticket submitted!');
  };

  const totalTickets = Object.values(board).reduce((acc, col) => acc + col.length, 0);

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h2 className="page-title">Maintenance Management</h2>
          <p className="page-subtitle">{totalTickets} active tickets · Approval workflow (Kanban)</p>
        </div>
        <Button icon={HiPlus} onClick={() => setModal(true)}>Raise Ticket</Button>
      </div>

      {/* Hint */}
      <p className="text-xs text-content-muted italic">
        Approving a card moves the asset to "Under Maintenance" · Resolving returns it to "Available"
      </p>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {STAGES.map((stage) => {
          const cards = board[stage] || [];
          return (
            <div key={stage} className="kanban-column">
              {/* Column header */}
              <div className={clsx('kanban-column-header', STAGE_STYLES[stage]?.header)}>
                {stage}
                <span className="ml-1.5 text-xs opacity-70">({cards.length})</span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2.5 flex-1 min-h-[120px]">
                {cards.length === 0 ? (
                  <div className="flex-1 rounded-xl border border-dashed border-surface-border
                                  flex items-center justify-center text-xs text-content-muted p-4 text-center">
                    No tickets
                  </div>
                ) : (
                  cards.map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      currentStage={stage}
                      stages={STAGES}
                      onMove={moveCard}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <RaiseTicketModal
        isOpen={showModal}
        onClose={() => setModal(false)}
        onSubmit={handleNewTicket}
      />
    </div>
  );
}
