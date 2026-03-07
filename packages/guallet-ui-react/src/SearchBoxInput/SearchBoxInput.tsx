import { IconSearch, IconSquareRoundedXFilled } from '@tabler/icons-react';
import { useEffect, useId, useState } from 'react';

interface SearchBoxInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'defaultValue' | 'value'
> {
  label?: string;
  query: string;
  description?: string;
  placeholder?: string;
  debounceWait?: number;
  onSearchQueryChanged?: (newSearchQuery: string) => void;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SearchBoxInput({
  label,
  query,
  description,
  placeholder,
  onSearchQueryChanged,
  debounceWait = 200,
  onChange,
  className,
  style,
  id,
  ...inputProps
}: Readonly<SearchBoxInputProps>) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [filterValue, setFilterValue] = useState(query);

  useEffect(() => {
    setFilterValue(query);
  }, [query]);

  useEffect(() => {
    const timeout = globalThis.setTimeout(() => {
      onSearchQueryChanged?.(filterValue);
    }, debounceWait);

    return () => {
      globalThis.clearTimeout(timeout);
    };
  }, [debounceWait, filterValue, onSearchQueryChanged]);

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.375rem',
        width: '100%',
        ...style,
      }}
    >
      {label && (
        <label
          htmlFor={inputId}
          style={{ fontSize: '0.9rem', fontWeight: 600 }}
        >
          {label}
        </label>
      )}

      <div
        style={{
          alignItems: 'center',
          backgroundColor: 'var(--background, #ffffff)',
          border: '1px solid rgba(148, 163, 184, 0.45)',
          borderRadius: '0.5rem',
          display: 'flex',
          gap: '0.5rem',
          minHeight: '2.5rem',
          padding: '0 0.75rem',
        }}
      >
        <IconSearch size={16} style={{ opacity: 0.75 }} />
        <input
          id={inputId}
          {...inputProps}
          onChange={(event) => {
            setFilterValue(event.currentTarget.value);
            onChange?.(event);
          }}
          placeholder={placeholder ?? 'Search...'}
          style={{
            background: 'transparent',
            border: 0,
            color: 'inherit',
            flex: 1,
            fontSize: '0.95rem',
            minWidth: 0,
            outline: 'none',
          }}
          value={filterValue}
        />
        {filterValue !== '' && (
          <button
            aria-label="Clear search"
            onClick={() => {
              setFilterValue('');
            }}
            style={{
              alignItems: 'center',
              background: 'transparent',
              border: 0,
              color: 'inherit',
              cursor: 'pointer',
              display: 'inline-flex',
              opacity: 0.75,
              padding: 0,
            }}
            type="button"
          >
            <IconSquareRoundedXFilled size={18} />
          </button>
        )}
      </div>

      {description && (
        <small style={{ color: 'rgba(100, 116, 139, 0.95)' }}>
          {description}
        </small>
      )}
    </div>
  );
}
