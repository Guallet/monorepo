import { Stack, Text } from "@mantine/core";
import React from "react";

interface IProps<T> {
  items: T[];
  itemTemplate: (item: T, index: number) => React.ReactNode;
  emptyView?: React.ReactNode;
}

export function ListView<T>({
  items,
  itemTemplate,
  emptyView,
}: Readonly<IProps<T>>) {
  if (items.length === 0) {
    return <Stack>{emptyView || <DefaultEmptyView />}</Stack>;
  }

  return <Stack>{items.map(itemTemplate)}</Stack>;
}

function DefaultEmptyView() {
  return (
    <Stack>
      <Text>No items found</Text>
    </Stack>
  );
}
