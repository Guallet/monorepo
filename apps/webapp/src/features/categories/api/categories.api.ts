import { get } from "../../../core/api/fetchHelper";
import { Category } from "../models/Category";

export async function loadCategories(): Promise<Category[]> {
  return await get<Category[]>("categories");
}
