import type { CategoryDto } from '@guallet/api-client';

export type CategoryForm = {
  name: string;
  parentId: string | null;
  icon: string;
  colour: string;
};

export function categoryForm(
  category: Pick<CategoryDto, 'name' | 'parentId'> & {
    icon: string | null;
    colour: string | null;
  },
): CategoryForm {
  return {
    name: category.name,
    parentId: category.parentId ?? null,
    icon: category.icon ?? '',
    colour: category.colour ?? '',
  };
}

export function eligibleCategoryParents(
  categories: readonly CategoryDto[],
  categoryId?: string,
): CategoryDto[] {
  const hasChildren = categories.some(
    (category) => category.parentId === categoryId,
  );
  if (categoryId && hasChildren) return [];
  return categories.filter(
    (category) => !category.parentId && category.id !== categoryId,
  );
}

export function categoryFormChanged(
  form: CategoryForm,
  initial: CategoryForm,
): boolean {
  return (
    form.name.trim() !== initial.name.trim() ||
    form.parentId !== initial.parentId ||
    form.icon !== initial.icon ||
    form.colour !== initial.colour
  );
}
