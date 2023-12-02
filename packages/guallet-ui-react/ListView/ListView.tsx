import { Stack } from "@mantine/core";
import React from "react";

interface IProps<T> {
  items: T[];
  itemTemplate: (item: T, index: number) => React.ReactNode;
}

export function ListView<T>({ items, itemTemplate }: IProps<T>) {
  return <Stack>{items.map(itemTemplate)}</Stack>;
}
