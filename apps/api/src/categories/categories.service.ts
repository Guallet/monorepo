import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './models/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(args: { user_id: string; dto: CreateCategoryDto }) {
    const { user_id, dto } = args;

    const entity = {
      user_id: user_id,
      name: dto.name,
      icon: dto.icon,
      colour: dto.colour,
      parentId: dto.parentId,
    };
    return await this.categoryRepository.save(entity);
  }

  async findAll() {
    return await this.categoryRepository.find();
  }

  async findAllUserCategories(user_id: string) {
    return await this.categoryRepository.find({
      where: {
        user_id: user_id,
      },
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