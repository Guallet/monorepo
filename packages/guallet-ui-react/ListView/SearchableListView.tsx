import { Stack, Text } from "@mantine/core";
import { SearchBoxInput } from "../SearchBoxInput/SearchBoxInput";
import { useEffect, useState } from "react";

interface IProps<T> {
  items: T[];
  itemTemplate: (item: T, index: number) => React.ReactNode;
  emptyView?: React.ReactNode;
}

export function SearchableListView<T>({
  items,
  itemTemplate,
  emptyView,
}: IProps<T>) {
  const [filteredItems, setFilteredItems] = useState(items);

  useEffect(() => {
    setFilteredItems(items);
  }, [items]);

  return (
    <Stack>
      <SearchBoxInput
        placeholder="Search bank name..."
        onSearchQueryChanged={(query) => {
          setFilteredItems(
            items.filter((item) =>
              // TODO: Improve this hack of converting to JSON
              JSON.stringify(item).toLowerCase().includes(query)
            )
          );
        }}
      />
      {filteredItems.length === 0 && (emptyView || <DefaultEmptyView />)}
      {/* {filteredItems.map(itemTemplate)} */}
      {/* TODO: How to render this properly with the correct key? */}
      {filteredItems.map((item, index) => {
        return <div key={index}>{itemTemplate(item, index)}</div>;
      })}
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
