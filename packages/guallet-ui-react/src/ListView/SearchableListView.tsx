import { Paper, Space, Stack, Text } from '@mantine/core';
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
    if (!queryString.trim()) return items;
    return items.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(queryString.toLowerCase()),
    );
  }, [items, queryString]);

  return (
    <Stack gap={gap}>
      <SearchBoxInput
        placeholder={placeholder}
        query={queryString}
        onSearchQueryChanged={(query) => {
          setQueryString(query);
        }}
      />
      <Space h="sm" />
      <Paper withBorder shadow="sm" radius="lg">
        {filteredItems.length === 0 && (emptyView || <DefaultEmptyView />)}
        {filteredItems.map(itemTemplate)}
      </Paper>
    </Stack>
  );
}

function DefaultEmptyView() {
  return (
    <Stack>
      <Text>No items found</Text>
    </Stack>
  );
}
