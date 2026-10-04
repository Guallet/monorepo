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
  parentId?: string | null;
};

export type UpdateCategoryRequest = {
  name: string;
  icon: string;
  colour: string;
  parentId?: string | null;
};
