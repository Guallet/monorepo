import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { defaultCategories } from './defaulCategories';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create({
    user_id,
    dto,
  }: {
    user_id: string;
    dto: CreateCategoryDto;
  }): Promise<Category> {
    const entity = this.categoryRepository.create({
      user_id: user_id,
      name: dto.name,
      icon: dto.icon,
      colour: dto.colour,
      parentId: dto.parentId ?? undefined,
    });
    return await this.categoryRepository.save(entity);
  }

  async createDefaultCategoriesForUser(userId: string): Promise<Category[]> {
    const newCategories: Category[] = [];
    for (const category of defaultCategories) {
      const entity = this.categoryRepository.create({
        user_id: userId,
        name: category.name,
        icon: category.icon,
        colour: category.color,
      });
      const dbEntity = await this.categoryRepository.save(entity);
      newCategories.push(dbEntity);
      for (const subcategory of category.subcategories) {
        const subCategoryEntity = {
          user_id: userId,
          name: subcategory.name,
          icon: subcategory.icon,
          colour: subcategory.color,
          parentId: dbEntity.id,
        };
        const subcategoriesDbEntity = await this.categoryRepository.save(
          subCategoryEntity,
        );
        newCategories.push(subcategoriesDbEntity);
      }
    }

    return newCategories;
  }

  async findAll() {
    return await this.categoryRepository.find();
  }

  async findAllUserCategories(user_id: string) {
    return await this.categoryRepository.find({
      where: {
        user_id: user_id,
      },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string) {
    return await this.categoryRepository.findOneBy({ id: id });
  }

  async findUserCategory(args: { user_id: string; id: string }) {
    const { user_id, id } = args;

    return await this.categoryRepository.findOne({
      where: {
        id: id,
        user_id: user_id,
      },
    });
  }

  async update(args: {
    user_id: string;
    category_id: string;
    dto: UpdateCategoryDto;
  }) {
    const { user_id, category_id, dto } = args;
    const dbEntity = await this.categoryRepository.findOne({
      where: {
        id: category_id,
        user_id: user_id,
      },
    });

    if (!dbEntity) {
      throw new NotFoundException();
    }

    const updatedEntity = {
      ...dbEntity,
      name: dto.name ?? dbEntity.name,
      icon: dto.icon ?? dbEntity.icon,
      colour: dto.colour ?? dbEntity.colour,
      parentId: dto.parentId ?? dbEntity.parentId,
    };
    return await this.categoryRepository.save(updatedEntity);
  }

  async remove(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id: id },
    });

    if (category) {
      const result = await this.categoryRepository.remove(category);
      return result;
    }

    throw new NotFoundException();
  }

  async removeUserCategory(args: {
    user_id: string;
    category_id: string;
  }): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: {
        id: args.category_id,
        user_id: args.user_id,
      },
    });

    if (!category) {
      throw new NotFoundException();
    }

    const result = await this.categoryRepository.remove(category);
    return result;
  }
}
