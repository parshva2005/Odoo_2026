import { forwardRef } from 'react';
import { clsx } from 'clsx';

const Select = forwardRef(function Select(
  { label, error, options = [], placeholder = 'Select...', className = '', required, ...props },
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
      <select
        ref={ref}
        className={clsx(
          'form-input appearance-none cursor-pointer',
          error && 'border-danger/60'
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option
            key={typeof opt === 'object' ? opt.value : opt}
            value={typeof opt === 'object' ? opt.value : opt}
          >
            {typeof opt === 'object' ? opt.label : opt}
          </option>
        ))}
      </select>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
});

export default Select;
