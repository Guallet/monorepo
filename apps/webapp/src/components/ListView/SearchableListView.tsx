import { Stack } from "@mantine/core";

interface IProps<T> {
  items: T[];
  itemTemplate: (item: T, index: number) => React.ReactNode;
}

export function SearchableListView<T>({ items, itemTemplate }: IProps<T>) {
  return (
    <Stack>
      {/* Search Input */}
      {/* items    */}
      {items.map(itemTemplate)}
    </Stack>
  );
}
