import { clsx } from 'clsx';

/**
 * Reusable Button component
 * variant: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline-primary'
 * size: 'sm' | 'md' | 'lg'
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  iconRight: IconRight,
  className = '',
  disabled,
  ...props
}) {
  const variantClass = {
    primary:         'btn-primary',
    secondary:       'btn-secondary',
    danger:          'btn-danger',
    ghost:           'btn-ghost',
    'outline-primary': 'btn-outline-primary',
  }[variant] || 'btn-primary';

  const sizeClass = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  }[size] || '';

  return (
    <button
      className={clsx('btn', variantClass, sizeClass, className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        Icon && <Icon size={size === 'sm' ? 13 : 15} />
      )}
      {children}
      {!loading && IconRight && <IconRight size={14} />}
    </button>
  );
}
