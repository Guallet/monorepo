export type CategoryPickerItem = {
  id: string;
  name: string;
  parentId: string | null;
  icon?: string | null;
  colour?: string | null;
};

export type CategoryPickerTree = {
  category: CategoryPickerItem;
  children: CategoryPickerItem[];
};

export function buildCategoryPickerTree(
  categories: readonly CategoryPickerItem[],
  query = '',
): CategoryPickerTree[] {
  const roots = categories.filter((category) => !category.parentId);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const childrenByParent = new Map<string, CategoryPickerItem[]>();

  for (const category of categories) {
    if (!category.parentId) continue;
    const siblings = childrenByParent.get(category.parentId) ?? [];
    siblings.push(category);
    childrenByParent.set(category.parentId, siblings);
  }

  return roots
    .map((category) => {
      const children = childrenByParent.get(category.id) ?? [];
      if (!normalizedQuery) return { category, children };

      if (category.name.toLocaleLowerCase().includes(normalizedQuery)) {
        return { category, children };
      }

      const matchingChildren = children.filter((child) =>
        child.name.toLocaleLowerCase().includes(normalizedQuery),
      );
      if (!matchingChildren.length) return null;
      return { category, children: matchingChildren };
    })
    .filter((tree): tree is CategoryPickerTree => tree !== null);
}

export function toggleCategorySelection(
  value: readonly string[],
  id: string,
): string[] {
  if (value.includes(id))
    return value.filter((selectedId) => selectedId !== id);
  return [...value, id];
}
