import React from 'react';

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
    return <div>{emptyView || <DefaultEmptyView />}</div>;
  }

  return <div>{items.map((item, index) => itemTemplate(item, index))}</div>;
}

function DefaultEmptyView() {
  return (
    <div>
      <p>No items found</p>
    </div>
  );
}
