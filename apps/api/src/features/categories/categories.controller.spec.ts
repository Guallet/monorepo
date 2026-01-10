import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { NotFoundException } from '@nestjs/common';
import { UserPrincipal } from 'src/auth/user-principal';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoriesController', () => {
  let controller: CategoriesController;

  const mockCategoriesService = {
    findAllUserCategories: jest.fn(),
    findUserCategory: jest.fn(),
    create: jest.fn(),
    createDefaultCategoriesForUser: jest.fn(),
    update: jest.fn(),
    removeUserCategory: jest.fn(),
  };

  const mockUser: UserPrincipal = new UserPrincipal(
    'user-123',
    'test@example.com',
    [],
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all user categories', async () => {
      const mockCategories: Partial<Category>[] = [
        {
          id: 'cat-1',
          user_id: mockUser.id,
          name: 'Food',
          icon: '🍔',
          colour: '#FF5733',
        },
        {
          id: 'cat-2',
          user_id: mockUser.id,
          name: 'Transport',
          icon: '🚗',
          colour: '#33FF57',
        },
      ];

      mockCategoriesService.findAllUserCategories.mockResolvedValue(
        mockCategories,
      );

      const result = await controller.findAll(mockUser);

      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(mockCategoriesService.findAllUserCategories).toHaveBeenCalledWith(
        mockUser.id,
      );
    });

    it('should return empty array when user has no categories', async () => {
      mockCategoriesService.findAllUserCategories.mockResolvedValue([]);

      const result = await controller.findAll(mockUser);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a specific category', async () => {
      const categoryId = 'cat-1';
      const mockCategory: Partial<Category> = {
        id: categoryId,
        user_id: mockUser.id,
        name: 'Food',
        icon: '🍔',
        colour: '#FF5733',
      };

      mockCategoriesService.findUserCategory.mockResolvedValue(mockCategory);

      const result = await controller.findOne(mockUser, categoryId);

      expect(result).toBeDefined();
      expect(mockCategoriesService.findUserCategory).toHaveBeenCalledWith({
        id: categoryId,
        user_id: mockUser.id,
      });
    });

    it('should throw NotFoundException when category not found', async () => {
      const categoryId = 'non-existent';
      mockCategoriesService.findUserCategory.mockResolvedValue(null);

      await expect(
        controller.findOne(mockUser, categoryId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new category', async () => {
      const createDto: CreateCategoryDto = {
        name: 'Shopping',
        icon: '🛍️',
        colour: '#3357FF',
        parentId: null,
      };

      const mockCategory: Partial<Category> = {
        id: 'cat-1',
        user_id: mockUser.id,
        name: createDto.name,
        icon: createDto.icon,
        colour: createDto.colour,
      };

      mockCategoriesService.create.mockResolvedValue(mockCategory);

      const result = await controller.create(mockUser, createDto);

      expect(result).toBeDefined();
      expect(mockCategoriesService.create).toHaveBeenCalledWith({
        user_id: mockUser.id,
        dto: createDto,
      });
    });

    it('should create a category with parent', async () => {
      const createDto: CreateCategoryDto = {
        name: 'Groceries',
        icon: '🛒',
        colour: '#FF33A1',
        parentId: 'parent-cat-1',
      };

      const mockCategory: Partial<Category> = {
        id: 'cat-1',
        user_id: mockUser.id,
        name: createDto.name,
        icon: createDto.icon,
        colour: createDto.colour,
        parentId: createDto.parentId ?? undefined,
      };

      mockCategoriesService.create.mockResolvedValue(mockCategory);

      const result = await controller.create(mockUser, createDto);

      expect(result).toBeDefined();
      expect(mockCategoriesService.create).toHaveBeenCalledWith({
        user_id: mockUser.id,
        dto: createDto,
      });
    });
  });

  describe('createDefaultCategoriesForUser', () => {
    it('should create default categories for user', async () => {
      const mockDefaultCategories: Partial<Category>[] = [
        {
          id: 'cat-1',
          user_id: mockUser.id,
          name: 'Food',
          icon: '🍔',
          colour: '#FF5733',
        },
        {
          id: 'cat-2',
          user_id: mockUser.id,
          name: 'Transport',
          icon: '🚗',
          colour: '#33FF57',
        },
      ];

      mockCategoriesService.createDefaultCategoriesForUser.mockResolvedValue(
        mockDefaultCategories,
      );

      const result = await controller.createDefaultCategoriesForUser(mockUser);

      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(
        mockCategoriesService.createDefaultCategoriesForUser,
      ).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const categoryId = 'cat-1';
      const updateDto: UpdateCategoryDto = {
        name: 'Updated Food',
        icon: '🍕',
      };

      const mockUpdatedCategory: Partial<Category> = {
        id: categoryId,
        user_id: mockUser.id,
        name: updateDto.name,
        icon: updateDto.icon,
        colour: '#FF5733',
      };

      mockCategoriesService.update.mockResolvedValue(mockUpdatedCategory);

      const result = await controller.update(mockUser, categoryId, updateDto);

      expect(result).toBeDefined();
      expect(mockCategoriesService.update).toHaveBeenCalledWith({
        user_id: mockUser.id,
        category_id: categoryId,
        dto: updateDto,
      });
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      const categoryId = 'cat-1';
      const mockCategory: Partial<Category> = {
        id: categoryId,
        user_id: mockUser.id,
        name: 'Food',
        icon: '🍔',
        colour: '#FF5733',
      };

      mockCategoriesService.removeUserCategory.mockResolvedValue(mockCategory);

      const result = await controller.remove(mockUser, categoryId);

      expect(result).toBeDefined();
      expect(mockCategoriesService.removeUserCategory).toHaveBeenCalledWith({
        user_id: mockUser.id,
        category_id: categoryId,
      });
    });
  });
});
