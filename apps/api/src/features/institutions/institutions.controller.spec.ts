import { Test, TestingModule } from '@nestjs/testing';
import { InstitutionsController } from './institutions.controller.js';
import { InstitutionsService } from './institutions.service.js';
import { NotFoundException } from '@nestjs/common';
import { UserPrincipal } from '../../auth/user-principal.js';
import { Institution } from './entities/institution.entity.js';
import { CreateInstitutionRequest } from './dto/create-institution-request.dto.js';
import { UpdateInstitutionRequest } from './dto/update-institution-request.dto.js';

describe('InstitutionsController', () => {
  let controller: InstitutionsController;

  const mockInstitutionsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUser: UserPrincipal = new UserPrincipal(
    'user-123',
    'test@example.com',
    [],
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstitutionsController],
      providers: [
        {
          provide: InstitutionsService,
          useValue: mockInstitutionsService,
        },
      ],
    }).compile();

    controller = module.get<InstitutionsController>(InstitutionsController);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserInstitutions', () => {
    it('should return all user institutions', async () => {
      const mockInstitutions: Partial<Institution>[] = [
        {
          id: 'inst-1',
          user_id: mockUser.id,
          name: 'Bank A',
          image_src: 'http://example.com/logo.png',
          countries: ['GB'],
        },
        {
          id: 'inst-2',
          user_id: mockUser.id,
          name: 'Bank B',
          image_src: 'http://example.com/logo2.png',
          countries: ['US'],
        },
      ];

      mockInstitutionsService.findAll.mockResolvedValue(mockInstitutions);

      const result = await controller.getUserInstitutions(mockUser);

      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(mockInstitutionsService.findAll).toHaveBeenCalledWith({
        user_id: mockUser.id,
      });
    });

    it('should return empty array when user has no institutions', async () => {
      mockInstitutionsService.findAll.mockResolvedValue([]);

      const result = await controller.getUserInstitutions(mockUser);

      expect(result).toEqual([]);
    });
  });

  describe('getInstitution', () => {
    it('should return a specific institution', async () => {
      const institutionId = 'inst-1';
      const mockInstitution: Partial<Institution> = {
        id: institutionId,
        user_id: mockUser.id,
        name: 'Bank A',
        image_src: 'http://example.com/logo.png',
        countries: ['GB'],
      };

      mockInstitutionsService.findOne.mockResolvedValue(mockInstitution);

      const result = await controller.getInstitution(mockUser, institutionId);

      expect(result).toBeDefined();
      expect(mockInstitutionsService.findOne).toHaveBeenCalledWith({
        id: institutionId,
        user_id: mockUser.id,
      });
    });

    it('should throw NotFoundException when institution not found', async () => {
      const institutionId = 'non-existent';
      mockInstitutionsService.findOne.mockResolvedValue(null);

      await expect(
        controller.getInstitution(mockUser, institutionId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new institution', async () => {
      const createDto: CreateInstitutionRequest = {
        name: 'New Bank',
        image_src: 'http://example.com/newbank.png',
        country: 'GB',
      };

      const mockInstitution: Partial<Institution> = {
        id: 'inst-1',
        user_id: mockUser.id,
        name: createDto.name,
        image_src: createDto.image_src,
        countries: createDto.country ? [createDto.country] : [],
      };

      mockInstitutionsService.create.mockResolvedValue(mockInstitution);

      const result = await controller.create(mockUser, createDto);

      expect(result).toBeDefined();
      expect(mockInstitutionsService.create).toHaveBeenCalledWith({
        dto: createDto,
        user_id: mockUser.id,
      });
    });

    it('should create institution without country', async () => {
      const createDto: CreateInstitutionRequest = {
        name: 'New Bank',
        image_src: 'http://example.com/newbank.png',
      };

      const mockInstitution: Partial<Institution> = {
        id: 'inst-1',
        user_id: mockUser.id,
        name: createDto.name,
        image_src: createDto.image_src,
        countries: [],
      };

      mockInstitutionsService.create.mockResolvedValue(mockInstitution);

      const result = await controller.create(mockUser, createDto);

      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update an institution', async () => {
      const institutionId = 'inst-1';
      const updateDto: UpdateInstitutionRequest = {
        name: 'Updated Bank',
        image_src: 'http://example.com/updated.png',
      };

      const mockInstitution: Partial<Institution> = {
        id: institutionId,
        user_id: mockUser.id,
        name: updateDto.name,
        image_src: updateDto.image_src,
        countries: ['GB'],
      };

      mockInstitutionsService.update.mockResolvedValue(mockInstitution);

      const result = await controller.update(
        mockUser,
        institutionId,
        updateDto,
      );

      expect(result).toBeDefined();
      expect(mockInstitutionsService.update).toHaveBeenCalledWith({
        id: institutionId,
        dto: updateDto,
        user_id: mockUser.id,
      });
    });
  });

  describe('remove', () => {
    it('should remove an institution', async () => {
      const institutionId = 'inst-1';
      const mockInstitution: Partial<Institution> = {
        id: institutionId,
        user_id: mockUser.id,
        name: 'Bank A',
        image_src: 'http://example.com/logo.png',
        countries: ['GB'],
      };

      mockInstitutionsService.remove.mockResolvedValue(mockInstitution);

      const result = await controller.remove(mockUser, institutionId);

      expect(result).toBeDefined();
      expect(mockInstitutionsService.remove).toHaveBeenCalledWith({
        id: institutionId,
        user_id: mockUser.id,
      });
    });
  });
});
