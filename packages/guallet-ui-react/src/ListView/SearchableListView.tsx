import { SearchBoxInput } from '../SearchBoxInput/SearchBoxInput';
import { useMemo, useState } from 'react';

interface SearchableListViewProps<T> {
  items: T[];
  itemTemplate: (item: T, index: number) => React.ReactNode;
  emptyView?: React.ReactNode;
  placeholder?: string;
  gap?: number | string;
}

export function SearchableListView<T>({
  items,
  itemTemplate,
  emptyView,
  placeholder,
  gap = 'md',
}: Readonly<SearchableListViewProps<T>>) {
  const [queryString, setQueryString] = useState('');

  const filteredItems = useMemo(() => {
    if (!queryString.trim()) {
      return items;
    }

    return items.filter((item) =>
      // This generic fallback compares against a serialized representation.
      JSON.stringify(item).toLowerCase().includes(queryString.toLowerCase()),
    );
  }, [items, queryString]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: resolveGap(gap),
      }}
    >
      <SearchBoxInput
        placeholder={placeholder}
        query={queryString}
        onSearchQueryChanged={(query) => {
          setQueryString(query);
        }}
      />
      <div style={{ height: '0.5rem' }} />
      <div
        style={{
          border: '1px solid rgba(148, 163, 184, 0.35)',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
          padding: '0.5rem',
        }}
      >
        {filteredItems.length === 0 && (emptyView || <DefaultEmptyView />)}
        {filteredItems.map((item, index) => itemTemplate(item, index))}
      </div>
    </div>
  );
}

function DefaultEmptyView() {
  return (
    <div>
      <p>No items found</p>
    </div>
  );
}

function resolveGap(gap: number | string): string {
  if (typeof gap === 'number') {
    return `${gap}px`;
  }

  switch (gap) {
    case 'xs':
      return '0.25rem';
    case 'sm':
      return '0.5rem';
    case 'md':
      return '1rem';
    case 'lg':
      return '1.5rem';
    case 'xl':
      return '2rem';
    default:
      return gap;
  }
}
