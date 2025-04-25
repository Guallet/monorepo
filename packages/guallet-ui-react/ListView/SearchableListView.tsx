import { Stack, Text } from "@mantine/core";
import { SearchBoxInput } from "../SearchBoxInput/SearchBoxInput";
import { useEffect, useState } from "react";

interface SearchableListViewProps<T> {
  items: T[];
  itemTemplate: (item: T, index: number) => React.ReactNode;
  emptyView?: React.ReactNode;
  placeholder?: string;
}

export function SearchableListView<T>({
  items,
  itemTemplate,
  emptyView,
  placeholder,
}: Readonly<SearchableListViewProps<T>>) {
  const [filteredItems, setFilteredItems] = useState([] as T[]);
  const [queryString, setQueryString] = useState("");

  useEffect(() => {
    if (items !== null || items !== undefined) {
      setFilteredItems(items);
    }
  }, [items]);

  return (
    <Stack>
      <SearchBoxInput
        placeholder={placeholder}
        query={queryString}
        onSearchQueryChanged={(query) => {
          setQueryString(query);
          const queryItems = items.filter((item) =>
            // TODO: Improve this hack of converting to JSON
            JSON.stringify(item).toLowerCase().includes(query.toLowerCase())
          );
          setFilteredItems(queryItems);
        }}
      />
      {filteredItems.length === 0 && (emptyView || <DefaultEmptyView />)}
      {filteredItems.map(itemTemplate)}
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
