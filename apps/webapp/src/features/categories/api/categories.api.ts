import { fetch_delete, get, patch, post } from "../../../core/api/fetchHelper";
import { CategoryFormData } from "../CategoryDetailsModal";
import { Category } from "../models/Category";

export async function loadCategories(): Promise<Category[]> {
  return await get<Category[]>("categories");
}

export async function createCategory(
  data: CategoryFormData
): Promise<Category> {
  return await post<Category, CategoryRequest>("categories", {
    name: data.name,
    icon: data.icon,
    colour: data.colour,
    parentId: data.parentId,
  });
}

export async function updateCategory(
  id: string,
  data: CategoryFormData
): Promise<Category> {
  return await patch<Category, CategoryRequest>(`categories/${id}`, {
    name: data.name,
    icon: data.icon,
    colour: data.colour,
  });
}

export async function deleteCategory(id: string): Promise<Category[]> {
  return await fetch_delete<Category[]>(`categories/${id}`);
}

type CategoryRequest = {
  name: string;
  icon: string;
  colour: string;
  parentId?: string | null;
};
