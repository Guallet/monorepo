import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryRequestDto } from './dto/create-category-request.dto';
import { UpdateCategoryRequestDto } from './dto/update-category-request.dto';
import { Category } from './entities/category.entity';
import { CategoriesRepository } from './repositories/categories.repository';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private categoriesRepository: CategoriesRepository) {}

  async create(dto: CreateCategoryRequestDto): Promise<Category> {
    const category = new Category();
    category.name = dto.name;
    category.icon = dto.icon;
    category.colour = dto.colour;
    category.parentId = dto.parentId;
    return await this.categoriesRepository.save(category);
  }

  async findAll(userId: string): Promise<Category[]> {
    return this.categoriesRepository.findByUserId(userId);
  }

  async findOne(userId: string, id: string): Promise<Category> {
    const category = await this.categoriesRepository.findById(id);
    if (category == null) {
      throw new NotFoundException();
    }
    if (category.user_id !== userId) {
      throw new ForbiddenException();
    }

    return category;
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateCategoryRequestDto,
  ): Promise<Category> {
    const category = await this.categoriesRepository.findById(id);
    if (category == null) {
      throw new NotFoundException();
    }
    if (category.user_id !== userId) {
      throw new ForbiddenException();
    }

    category.colour = dto.colour ?? category.colour;
    category.name = dto.name ?? category.name;
    category.icon = dto.icon ?? category.icon;
    return await this.categoriesRepository.save(category);
  }

  async remove(userId: string, id: string): Promise<Category> {
    const category = await this.categoriesRepository.findById(id);
    if (category == null) {
      throw new NotFoundException();
    }
    if (category.user_id !== userId) {
      throw new ForbiddenException();
    }

    return await this.categoriesRepository.remove(category);
  }
}
