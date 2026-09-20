import type { CategoryIconName } from '@guallet/theme';

export type CategoryDto = {
  id: string;
  name: string;
  icon: string;
  colour: string;
  parentId: string | null;
};

export type CreateCategoryRequest = {
  name: string;
  icon: CategoryIconName;
  colour: string;
  parentId?: string;
};

export type UpdateCategoryRequest = {
  name: string;
  icon: CategoryIconName;
  colour: string;
  parentId?: string | null;
};
