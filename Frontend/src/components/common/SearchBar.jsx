import { HiSearch, HiX } from 'react-icons/hi';

export default function SearchBar({ value, onChange, onClear, placeholder = 'Search...' }) {
  return (
    <div className="relative flex-1 min-w-0">
      <HiSearch
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="form-input pl-9 pr-9"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-primary transition-colors"
        >
          <HiX size={15} />
        </button>
      )}
    </div>
  );
}
