import { GualletClient } from "./../GualletClient";
<<<<<<< HEAD
import {
  CategoryDto,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "./categories.models";
=======
import { CategoryDto, CreateCategoryRequest } from "./categories.models";
>>>>>>> ba84897 (Develop into Main (#19))

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
<<<<<<< HEAD

  async update({
    id,
    dto,
  }: {
    id: string;
    dto: UpdateCategoryRequest;
  }): Promise<CategoryDto> {
    return await this.client.patch<CategoryDto, UpdateCategoryRequest>(
      `${CATEGORIES_PATH}/${id}`,
      dto
    );
  }

  async delete(id: string): Promise<void> {
    await this.client.fetch_delete<CategoryDto>(`${CATEGORIES_PATH}/${id}`);
  }
=======
>>>>>>> ba84897 (Develop into Main (#19))
}
