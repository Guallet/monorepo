import { GualletClient } from "./../GualletClient";
import { CategoryDto, CreateCategoryRequest } from "./categories.models";

const CATEGORIES_PATH = "categories";

export class CategoriesApi {
  constructor(private client: GualletClient) {}

  async getAll(): Promise<CategoryDto[]> {
    return await this.client.get<CategoryDto[]>(CATEGORIES_PATH);
  }

  async get(id: string): Promise<CategoryDto> {
    return await this.client.get<CategoryDto>(`${CATEGORIES_PATH}/${id}`);
  }

  async create(category: CreateCategoryRequest): Promise<CategoryDto> {
    return await this.client.post<CategoryDto, CreateCategoryRequest>(
      CATEGORIES_PATH,
      category
    );
  }
}
