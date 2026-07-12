import { createPortal } from 'react-dom';
import { HiX, HiCheckCircle, HiExclamationCircle, HiInformationCircle, HiExclamation } from 'react-icons/hi';
import { clsx } from 'clsx';
import { useToast } from '../../context/ToastContext';

const icons = {
  success: HiCheckCircle,
  danger:  HiExclamationCircle,
  warning: HiExclamation,
  info:    HiInformationCircle,
};

const colors = {
  success: 'border-success/30 bg-success/10 text-success',
  danger:  'border-danger/30 bg-danger/10 text-danger',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  info:    'border-info/30 bg-info/10 text-info',
};

function ToastItem({ toast, onClose }) {
  const Icon = icons[toast.type] || HiInformationCircle;
  return (
    <div
      className={clsx(
        'flex items-start gap-3 px-4 py-3.5 rounded-xl border shadow-modal',
        'bg-surface-card animate-slide-in-up min-w-[280px] max-w-[380px]',
        colors[toast.type]
      )}
    >
      <Icon size={20} className="shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-semibold text-content-primary">{toast.title}</p>
        )}
        <p className="text-xs text-content-secondary mt-0.5 leading-relaxed">{toast.message}</p>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="shrink-0 text-content-muted hover:text-content-primary transition-colors"
      >
        <HiX size={15} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return createPortal(
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onClose={removeToast} />
        </div>
      ))}
    </div>,
    document.body
  );
}
