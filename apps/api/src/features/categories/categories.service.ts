import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Budget } from '../budgets/entities/budget.entity';
import { CategorizationRule } from '../rules/entities/categorization-rule.entity';
import { defaultCategories } from './defaultCategories';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create({
    user_id,
    dto,
  }: {
    user_id: string;
    dto: CreateCategoryDto;
  }): Promise<Category> {
    return this.withUserMutation(user_id, async (manager, repository) => {
      await this.validateParent(repository, user_id, dto.parentId);
      const entity = repository.create({
        user_id,
        name: this.categoryName(dto.name),
        icon: dto.icon,
        colour: dto.colour,
        parentId: dto.parentId ?? null,
        parent: dto.parentId ? { id: dto.parentId } : null,
      });
      return repository.save(entity);
    });
  }

  async createDefaultCategoriesForUser(userId: string): Promise<Category[]> {
    return this.withUserMutation(userId, async (manager, repository) => {
      const existing = await repository.find({
        where: { user_id: userId },
        order: { name: 'ASC' },
      });
      if (existing.length > 0) {
        this.logger.warn(
          `User ${userId} already has categories, skipping default seeding`,
        );
        return existing;
      }

      const newCategories: Category[] = [];
      for (const category of defaultCategories) {
        const entity = repository.create({
          user_id: userId,
          name: category.name,
          icon: category.icon,
          colour: category.color,
        });
        const dbEntity = await repository.save(entity);
        newCategories.push(dbEntity);
        for (const subcategory of category.subcategories) {
          const subCategoryEntity = {
            user_id: userId,
            name: subcategory.name,
            icon: subcategory.icon,
            colour: subcategory.color,
            parentId: dbEntity.id,
            parent: dbEntity,
          };
          const subcategoriesDbEntity =
            await repository.save(subCategoryEntity);
          newCategories.push(subcategoriesDbEntity);
        }
      }

      return newCategories;
    });
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
    return this.withUserMutation(user_id, async (manager, repository) => {
      const category = await repository.findOne({
        where: { id: category_id, user_id },
      });
      if (!category) throw new NotFoundException();

      if (dto.parentId !== undefined) {
        await this.validateParent(
          repository,
          user_id,
          dto.parentId,
          category_id,
        );
        category.parentId = dto.parentId;
        category.parent = null;
        if (dto.parentId) category.parent = { id: dto.parentId } as Category;
      }
      if (dto.name !== undefined) category.name = this.categoryName(dto.name);
      category.icon = dto.icon ?? category.icon;
      category.colour = dto.colour ?? category.colour;
      return repository.save(category);
    });
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
    return this.withUserMutation(args.user_id, async (manager, repository) => {
      const category = await repository.findOne({
        where: { id: args.category_id, user_id: args.user_id },
      });
      if (!category) throw new NotFoundException();
      if (await this.hasChildren(repository, args.user_id, category.id)) {
        throw new ConflictException(
          'Move or delete the subcategories in this category first.',
        );
      }
      // Removing a budget's last category would silently broaden its scope.
      if (
        await manager.getRepository(Budget).exists({
          where: { user_id: args.user_id, categories: { id: category.id } },
        })
      ) {
        throw new ConflictException(
          'Remove this category from its budgets before deleting it.',
        );
      }
      // Rules store an ID without a foreign key; prevent dangling targets.
      if (
        await manager.getRepository(CategorizationRule).exists({
          where: { userId: args.user_id, resultCategoryId: category.id },
        })
      ) {
        throw new ConflictException(
          'Update or delete the rules using this category before deleting it.',
        );
      }
      // Transaction.category uses SET NULL, so transactions are preserved.
      await repository.remove(category);
      category.id = args.category_id;
      return category;
    });
  }

  private categoryName(name: string): string {
    if (typeof name !== 'string' || !name.trim()) {
      throw new BadRequestException('Enter a category name.');
    }
    return name.trim();
  }

  private hasChildren(
    repository: Repository<Category>,
    user_id: string,
    id: string,
  ) {
    // Legacy categories can have only parentId populated. Check both mappings.
    return repository.exists({
      where: [
        { user_id, parentId: id },
        { user_id, parent: { id } },
      ],
    });
  }

  private async validateParent(
    repository: Repository<Category>,
    user_id: string,
    parentId?: string | null,
    categoryId?: string,
  ) {
    if (!parentId) return;
    if (parentId === categoryId) {
      throw new BadRequestException('A category cannot be its own parent.');
    }
    const parent = await repository.findOne({
      where: { id: parentId, user_id },
    });
    if (!parent) throw new NotFoundException('Parent category not found.');
    if (parent.parentId) {
      throw new BadRequestException('Choose a top-level parent category.');
    }
    if (
      categoryId &&
      (await this.hasChildren(repository, user_id, categoryId))
    ) {
      throw new ConflictException('Move the subcategories first.');
    }
  }

  private withUserMutation<T>(
    user_id: string,
    operation: (
      manager: EntityManager,
      repository: Repository<Category>,
    ) => Promise<T>,
  ): Promise<T> {
    return this.categoryRepository.manager.transaction(async (manager) => {
      // Serialize hierarchy edits for this user, including create vs delete.
      await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
        `categories:${user_id}`,
      ]);
      return operation(manager, manager.getRepository(Category));
    });
  }
}
