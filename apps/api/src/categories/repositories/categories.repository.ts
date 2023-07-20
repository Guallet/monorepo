import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoriesRepository {
  private readonly logger = new Logger(CategoriesRepository.name);

  constructor(
    @InjectRepository(Category)
    private repository: Repository<Category>,
  ) {}

  async findByUserId(userId: string): Promise<Category[]> {
    const allCategories = await this.repository.find({
      where: {
        user_id: userId,
      },
    });

    return allCategories;
  }

  async findNestedCategoriesByUserId(userId: string): Promise<Category[]> {
    const allCategories = await this.repository.find({
      relations: {
        children: true,
      },
      where: {
        user_id: userId,
        parent: IsNull(),
      },
    });

    return allCategories;
  }

  async save(entity: Category): Promise<Category> {
    return await this.repository.save(entity);
  }

  async findById(id: string): Promise<Category> {
    return await this.repository.findOne({
      where: {
        id: id,
      },
    });
  }

  async remove(category: Category): Promise<Category> {
    return await this.repository.remove(category);
  }
}
