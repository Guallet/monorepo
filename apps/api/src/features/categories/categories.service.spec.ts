import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Budget } from '../budgets/entities/budget.entity';
import { CategorizationRule } from '../rules/entities/categorization-rule.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const mockCategoryRepository = {
    find: vi.fn(),
    findOne: vi.fn(),
    findOneBy: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    remove: vi.fn(),
    exists: vi.fn(),
    manager: { transaction: vi.fn() },
  };

  const budgetRepository = { exists: vi.fn() };
  const ruleRepository = { exists: vi.fn() };
  const manager = {
    query: vi.fn(),
    getRepository: vi.fn((entity) => {
      if (entity === Budget) return budgetRepository;
      if (entity === CategorizationRule) return ruleRepository;
      return mockCategoryRepository;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);

    // Clear all mocks before each test
    vi.resetAllMocks();
    manager.getRepository.mockImplementation((entity) => {
      if (entity === Budget) return budgetRepository;
      if (entity === CategorizationRule) return ruleRepository;
      return mockCategoryRepository;
    });
    mockCategoryRepository.manager.transaction.mockImplementation((operation) =>
      operation(manager),
    );
    mockCategoryRepository.exists.mockResolvedValue(false);
    budgetRepository.exists.mockResolvedValue(false);
    ruleRepository.exists.mockResolvedValue(false);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new category', async () => {
      const userId = 'user-123';
      const dto: CreateCategoryDto = {
        name: 'Food',
        icon: '🍔',
        colour: '#FF5733',
        parentId: null,
      };

      const mockCategory = {
        id: 'cat-1',
        user_id: userId,
        name: dto.name,
        icon: dto.icon,
        colour: dto.colour,
      };

      mockCategoryRepository.findOne.mockResolvedValue({
        id: dto.parentId,
        user_id: userId,
        parentId: null,
      });
      mockCategoryRepository.create.mockReturnValue(mockCategory);
      mockCategoryRepository.save.mockResolvedValue(mockCategory);

      const result = await service.create({ user_id: userId, dto });

      expect(result).toEqual(mockCategory);
      expect(mockCategoryRepository.create).toHaveBeenCalledWith({
        user_id: userId,
        name: dto.name,
        icon: dto.icon,
        colour: dto.colour,
        parentId: null,
        parent: null,
      });
      expect(mockCategoryRepository.save).toHaveBeenCalledWith(mockCategory);
    });

    it('should create a category with parent', async () => {
      const userId = 'user-123';
      const dto: CreateCategoryDto = {
        name: 'Groceries',
        icon: '🛒',
        colour: '#FF33A1',
        parentId: 'parent-cat-1',
      };

      const mockCategory = {
        id: 'cat-1',
        user_id: userId,
        name: dto.name,
        icon: dto.icon,
        colour: dto.colour,
        parentId: dto.parentId,
      };

      mockCategoryRepository.findOne.mockResolvedValue({
        id: dto.parentId,
        user_id: userId,
        parentId: null,
      });
      mockCategoryRepository.create.mockReturnValue(mockCategory);
      mockCategoryRepository.save.mockResolvedValue(mockCategory);

      const result = await service.create({ user_id: userId, dto });

      expect(result).toEqual(mockCategory);
      expect(mockCategoryRepository.create).toHaveBeenCalledWith({
        user_id: userId,
        name: dto.name,
        icon: dto.icon,
        colour: dto.colour,
        parentId: dto.parentId,
        parent: { id: dto.parentId },
      });
    });
  });

  describe('createDefaultCategoriesForUser', () => {
    it('should create default categories when user has none', async () => {
      const userId = 'user-123';
      const mockCategory = {
        id: 'cat-1',
        user_id: userId,
        name: 'Test Category',
        icon: '🎯',
        colour: '#000000',
      };

      // No existing categories
      mockCategoryRepository.find.mockResolvedValue([]);
      mockCategoryRepository.create.mockReturnValue(mockCategory);
      mockCategoryRepository.save.mockResolvedValue(mockCategory);

      const result = await service.createDefaultCategoriesForUser(userId);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(mockCategoryRepository.create).toHaveBeenCalled();
      expect(mockCategoryRepository.save).toHaveBeenCalled();
    });

    it('should skip seeding and return existing categories when user already has categories', async () => {
      const userId = 'user-123';
      const existingCategories = [
        {
          id: 'cat-1',
          user_id: userId,
          name: 'Food',
          icon: '🍔',
          colour: '#FF5733',
        },
      ];

      mockCategoryRepository.find.mockResolvedValue(existingCategories);

      const result = await service.createDefaultCategoriesForUser(userId);

      expect(result).toEqual(existingCategories);
      expect(mockCategoryRepository.create).not.toHaveBeenCalled();
      expect(mockCategoryRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      const mockCategories = [
        {
          id: 'cat-1',
          user_id: 'user-1',
          name: 'Food',
          icon: '🍔',
          colour: '#FF5733',
        },
        {
          id: 'cat-2',
          user_id: 'user-2',
          name: 'Transport',
          icon: '🚗',
          colour: '#33FF57',
        },
      ];

      mockCategoryRepository.find.mockResolvedValue(mockCategories);

      const result = await service.findAll();

      expect(result).toEqual(mockCategories);
      expect(mockCategoryRepository.find).toHaveBeenCalled();
    });
  });

  describe('findAllUserCategories', () => {
    it('should return all categories for a user', async () => {
      const userId = 'user-123';
      const mockCategories = [
        {
          id: 'cat-1',
          user_id: userId,
          name: 'Food',
          icon: '🍔',
          colour: '#FF5733',
        },
        {
          id: 'cat-2',
          user_id: userId,
          name: 'Transport',
          icon: '🚗',
          colour: '#33FF57',
        },
      ];

      mockCategoryRepository.find.mockResolvedValue(mockCategories);

      const result = await service.findAllUserCategories(userId);

      expect(result).toEqual(mockCategories);
      expect(mockCategoryRepository.find).toHaveBeenCalledWith({
        where: { user_id: userId },
        order: { name: 'ASC' },
      });
    });

    it('should return empty array when user has no categories', async () => {
      const userId = 'user-123';
      mockCategoryRepository.find.mockResolvedValue([]);

      const result = await service.findAllUserCategories(userId);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      const categoryId = 'cat-1';
      const mockCategory = {
        id: categoryId,
        user_id: 'user-123',
        name: 'Food',
        icon: '🍔',
        colour: '#FF5733',
      };

      mockCategoryRepository.findOneBy.mockResolvedValue(mockCategory);

      const result = await service.findOne(categoryId);

      expect(result).toEqual(mockCategory);
      expect(mockCategoryRepository.findOneBy).toHaveBeenCalledWith({
        id: categoryId,
      });
    });
  });

  describe('findUserCategory', () => {
    it('should return a specific user category', async () => {
      const userId = 'user-123';
      const categoryId = 'cat-1';
      const mockCategory = {
        id: categoryId,
        user_id: userId,
        name: 'Food',
        icon: '🍔',
        colour: '#FF5733',
      };

      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);

      const result = await service.findUserCategory({
        user_id: userId,
        id: categoryId,
      });

      expect(result).toEqual(mockCategory);
      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryId, user_id: userId },
      });
    });

    it('should return null when category not found', async () => {
      const userId = 'user-123';
      const categoryId = 'non-existent';

      mockCategoryRepository.findOne.mockResolvedValue(null);

      const result = await service.findUserCategory({
        user_id: userId,
        id: categoryId,
      });

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const userId = 'user-123';
      const categoryId = 'cat-1';
      const dto: UpdateCategoryDto = {
        name: 'Updated Food',
        icon: '🍕',
      };

      const existingCategory = {
        id: categoryId,
        user_id: userId,
        name: 'Food',
        icon: '🍔',
        colour: '#FF5733',
        parentId: null,
      };

      const updatedCategory = {
        ...existingCategory,
        name: dto.name,
        icon: dto.icon,
      };

      mockCategoryRepository.findOne.mockResolvedValue(existingCategory);
      mockCategoryRepository.save.mockResolvedValue(updatedCategory);

      const result = await service.update({
        user_id: userId,
        category_id: categoryId,
        dto,
      });

      expect(result).toEqual(updatedCategory);
      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryId, user_id: userId },
      });
      expect(mockCategoryRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when category not found', async () => {
      const userId = 'user-123';
      const categoryId = 'non-existent';
      const dto: UpdateCategoryDto = {
        name: 'Updated',
      };

      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update({ user_id: userId, category_id: categoryId, dto }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a category by id', async () => {
      const categoryId = 'cat-1';
      const mockCategory = {
        id: categoryId,
        user_id: 'user-123',
        name: 'Food',
        icon: '🍔',
        colour: '#FF5733',
      };

      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockCategoryRepository.remove.mockResolvedValue(mockCategory);

      const result = await service.remove(categoryId);

      expect(result).toEqual(mockCategory);
      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
      expect(mockCategoryRepository.remove).toHaveBeenCalledWith(mockCategory);
    });

    it('should throw NotFoundException when category not found', async () => {
      const categoryId = 'non-existent';
      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(categoryId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeUserCategory', () => {
    it('should remove a user category', async () => {
      const userId = 'user-123';
      const categoryId = 'cat-1';
      const mockCategory = {
        id: categoryId,
        user_id: userId,
        name: 'Food',
        icon: '🍔',
        colour: '#FF5733',
      };

      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockCategoryRepository.remove.mockResolvedValue(mockCategory);

      const result = await service.removeUserCategory({
        user_id: userId,
        category_id: categoryId,
      });

      expect(result).toEqual(mockCategory);
      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryId, user_id: userId },
      });
      expect(mockCategoryRepository.remove).toHaveBeenCalledWith(mockCategory);
    });

    it('should throw NotFoundException when category not found', async () => {
      const userId = 'user-123';
      const categoryId = 'non-existent';

      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(
        service.removeUserCategory({
          user_id: userId,
          category_id: categoryId,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
  describe('hierarchy safeguards', () => {
    const root = { id: 'root', user_id: 'user', name: 'Food', parentId: null };

    it('clears the scalar and relation parent when moving a child to None', async () => {
      mockCategoryRepository.findOne.mockResolvedValue({
        ...root,
        id: 'child',
        parentId: 'root',
      });
      await service.update({
        user_id: 'user',
        category_id: 'child',
        dto: { parentId: null },
      });
      expect(mockCategoryRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ parentId: null, parent: null }),
      );
    });

    it('retains the existing parent when parentId is omitted', async () => {
      mockCategoryRepository.findOne.mockResolvedValue({
        ...root,
        id: 'child',
        parentId: 'root',
      });
      await service.update({
        user_id: 'user',
        category_id: 'child',
        dto: { name: 'Updated' },
      });
      expect(mockCategoryRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ parentId: 'root' }),
      );
    });

    it('rejects another user’s parent', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(null);
      await expect(
        service.create({
          user_id: 'user',
          dto: {
            name: 'Child',
            icon: 'IconTag',
            colour: '#005EB8',
            parentId: 'other-user-parent',
          },
        }),
      ).rejects.toThrow(NotFoundException);
      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'other-user-parent', user_id: 'user' },
      });
      expect(mockCategoryRepository.save).not.toHaveBeenCalled();
    });

    it('rejects a category as its own parent', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(root);
      await expect(
        service.update({
          user_id: 'user',
          category_id: 'root',
          dto: { parentId: 'root' },
        }),
      ).rejects.toThrow(BadRequestException);
      expect(mockCategoryRepository.save).not.toHaveBeenCalled();
    });

    it('rejects nesting under a subcategory', async () => {
      mockCategoryRepository.findOne.mockResolvedValue({
        ...root,
        parentId: 'another-root',
      });
      await expect(
        service.create({
          user_id: 'user',
          dto: {
            name: 'Child',
            icon: 'IconTag',
            colour: '#005EB8',
            parentId: 'root',
          },
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('requires moving children before reparenting their category', async () => {
      mockCategoryRepository.findOne
        .mockResolvedValueOnce(root)
        .mockResolvedValueOnce({ ...root, id: 'destination' });
      mockCategoryRepository.exists.mockResolvedValue(true);
      await expect(
        service.update({
          user_id: 'user',
          category_id: 'root',
          dto: { parentId: 'destination' },
        }),
      ).rejects.toThrow(ConflictException);
      expect(mockCategoryRepository.save).not.toHaveBeenCalled();
    });

    it('blocks deleting a parent and checks both legacy parent mappings', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(root);
      mockCategoryRepository.exists.mockResolvedValue(true);
      await expect(
        service.removeUserCategory({ user_id: 'user', category_id: 'root' }),
      ).rejects.toThrow('Move or delete the subcategories');
      expect(mockCategoryRepository.exists).toHaveBeenCalledWith({
        where: [
          { user_id: 'user', parentId: 'root' },
          { user_id: 'user', parent: { id: 'root' } },
        ],
      });
      expect(mockCategoryRepository.remove).not.toHaveBeenCalled();
    });

    it('blocks deleting categories referenced by budgets', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(root);
      budgetRepository.exists.mockResolvedValue(true);
      await expect(
        service.removeUserCategory({ user_id: 'user', category_id: 'root' }),
      ).rejects.toThrow('Remove this category from its budgets');
      expect(budgetRepository.exists).toHaveBeenCalledWith({
        where: { user_id: 'user', categories: { id: 'root' } },
      });
      expect(mockCategoryRepository.remove).not.toHaveBeenCalled();
    });

    it('blocks deleting categories referenced by rules', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(root);
      ruleRepository.exists.mockResolvedValue(true);
      await expect(
        service.removeUserCategory({ user_id: 'user', category_id: 'root' }),
      ).rejects.toThrow('Update or delete the rules');
      expect(ruleRepository.exists).toHaveBeenCalledWith({
        where: { userId: 'user', resultCategoryId: 'root' },
      });
      expect(mockCategoryRepository.remove).not.toHaveBeenCalled();
    });

    it('serializes category mutations for the same user', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(root);
      await service.removeUserCategory({
        user_id: 'user',
        category_id: 'root',
      });
      expect(manager.query).toHaveBeenCalledWith(
        'SELECT pg_advisory_xact_lock(hashtext($1))',
        ['categories:user'],
      );
      expect(mockCategoryRepository.remove).toHaveBeenCalledWith(root);
    });

    it('rejects whitespace-only names', async () => {
      await expect(
        service.create({
          user_id: 'user',
          dto: { name: '   ', icon: 'IconTag', colour: '#005EB8' },
        }),
      ).rejects.toThrow(BadRequestException);
      expect(mockCategoryRepository.save).not.toHaveBeenCalled();
    });
  });
});
