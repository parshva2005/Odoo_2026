import { forwardRef } from 'react';
import { clsx } from 'clsx';

/**
 * Reusable Input component
 */
const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    icon: Icon,
    iconRight: IconRight,
    className = '',
    inputClassName = '',
    required,
    ...props
  },
  ref
) {
  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none">
            <Icon size={15} />
          </span>
        )}
        <input
          ref={ref}
          className={clsx(
            'form-input',
            Icon && 'pl-9',
            IconRight && 'pr-9',
            error && 'border-danger/60 focus:border-danger focus:ring-danger/10',
            inputClassName
          )}
          {...props}
        />
        {IconRight && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted">
            <IconRight size={15} />
          </span>
        )}
      </div>
      {error && <p className="form-error">{error}</p>}
      {!error && hint && <p className="text-xs text-content-muted">{hint}</p>}
    </div>
  );
});

export default Input;
