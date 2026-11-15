export type CategoryDto = {
  id: string;
  name: string;
  icon: string;
  colour: string;
  parentId: string | null;
};

export type CreateCategoryRequest = {
  name: string;
  icon: string;
  colour: string;
  parentId?: string;
};

export type UpdateCategoryRequest = {
  name: string;
  icon: string;
  colour: string;
  /** Omit to preserve; null removes the parent. */
  parentId?: string | null;
};
