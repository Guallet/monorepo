import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const mockCategoryRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
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
    jest.clearAllMocks();
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

      mockCategoryRepository.create.mockReturnValue(mockCategory);
      mockCategoryRepository.save.mockResolvedValue(mockCategory);

      const result = await service.create({ user_id: userId, dto });

      expect(result).toEqual(mockCategory);
      expect(mockCategoryRepository.create).toHaveBeenCalledWith({
        user_id: userId,
        name: dto.name,
        icon: dto.icon,
        colour: dto.colour,
        parentId: undefined,
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
      });
    });
  });

  describe('createDefaultCategoriesForUser', () => {
    it('should create default categories for user', async () => {
      const userId = 'user-123';
      const mockCategory = {
        id: 'cat-1',
        user_id: userId,
        name: 'Test Category',
        icon: '🎯',
        colour: '#000000',
      };

      mockCategoryRepository.create.mockReturnValue(mockCategory);
      mockCategoryRepository.save.mockResolvedValue(mockCategory);

      const result = await service.createDefaultCategoriesForUser(userId);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(mockCategoryRepository.create).toHaveBeenCalled();
      expect(mockCategoryRepository.save).toHaveBeenCalled();
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
});
