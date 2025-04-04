import { GualletClientImpl } from "./../GualletClient";
import {
  CategoryDto,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "./categories.models";

const CATEGORIES_PATH = "categories";

export class CategoriesApi {
  constructor(private readonly client: GualletClientImpl) {}

  async getAll(): Promise<CategoryDto[]> {
    return await this.client.get<CategoryDto[]>({ path: CATEGORIES_PATH });
  }

  async get(id: string): Promise<CategoryDto> {
    return await this.client.get<CategoryDto>({
      path: `${CATEGORIES_PATH}/${id}`,
    });
  }

  async create(category: CreateCategoryRequest): Promise<CategoryDto> {
    return await this.client.post<CategoryDto, CreateCategoryRequest>({
      path: CATEGORIES_PATH,
      payload: category,
    });
  }

  async update({
    id,
    dto,
  }: {
    id: string;
    dto: UpdateCategoryRequest;
  }): Promise<CategoryDto> {
    return await this.client.patch<CategoryDto, UpdateCategoryRequest>({
      path: `${CATEGORIES_PATH}/${id}`,
      payload: dto,
    });
  }

  async delete(id: string): Promise<void> {
    await this.client.fetch_delete<CategoryDto>({
      path: `${CATEGORIES_PATH}/${id}`,
    });
  }
}
