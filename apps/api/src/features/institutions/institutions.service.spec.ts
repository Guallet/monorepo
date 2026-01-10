import { Test, TestingModule } from '@nestjs/testing';
import { InstitutionsService } from './institutions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Institution } from './entities/institution.entity';
import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CreateInstitutionRequest } from './dto/create-institution-request.dto';
import { UpdateInstitutionRequest } from './dto/update-institution-request.dto';

describe('InstitutionsService', () => {
  let service: InstitutionsService;

  const mockInstitutionRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    upsert: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstitutionsService,
        {
          provide: getRepositoryToken(Institution),
          useValue: mockInstitutionRepository,
        },
      ],
    }).compile();

    service = module.get<InstitutionsService>(InstitutionsService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all institutions for a user including common ones', async () => {
      const userId = 'user-123';
      const mockInstitutions = [
        {
          id: 'inst-1',
          user_id: userId,
          name: 'User Bank',
          image_src: 'http://example.com/logo.png',
          countries: ['GB'],
        },
        {
          id: 'inst-2',
          user_id: null,
          name: 'Common Bank',
          image_src: 'http://example.com/logo2.png',
          countries: ['US'],
        },
      ];

      mockInstitutionRepository.find.mockResolvedValue(mockInstitutions);

      const result = await service.findAll({ user_id: userId });

      expect(result).toEqual(mockInstitutions);
      expect(mockInstitutionRepository.find).toHaveBeenCalled();
    });

    it('should return empty array when no institutions found', async () => {
      const userId = 'user-123';
      mockInstitutionRepository.find.mockResolvedValue([]);

      const result = await service.findAll({ user_id: userId });

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a user institution', async () => {
      const userId = 'user-123';
      const institutionId = 'inst-1';
      const mockInstitution = {
        id: institutionId,
        user_id: userId,
        name: 'Bank A',
        image_src: 'http://example.com/logo.png',
        countries: ['GB'],
      };

      mockInstitutionRepository.findOne.mockResolvedValue(mockInstitution);

      const result = await service.findOne({ id: institutionId, user_id: userId });

      expect(result).toEqual(mockInstitution);
      expect(mockInstitutionRepository.findOne).toHaveBeenCalledWith({
        where: { id: institutionId },
      });
    });

    it('should return a common institution (null user_id)', async () => {
      const userId = 'user-123';
      const institutionId = 'inst-1';
      const mockInstitution = {
        id: institutionId,
        user_id: null,
        name: 'Common Bank',
        image_src: 'http://example.com/logo.png',
        countries: ['GB'],
      };

      mockInstitutionRepository.findOne.mockResolvedValue(mockInstitution);

      const result = await service.findOne({ id: institutionId, user_id: userId });

      expect(result).toEqual(mockInstitution);
    });

    it('should throw NotFoundException when institution not found', async () => {
      const userId = 'user-123';
      const institutionId = 'non-existent';

      mockInstitutionRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne({ id: institutionId, user_id: userId }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when accessing another user institution', async () => {
      const userId = 'user-123';
      const institutionId = 'inst-1';
      const mockInstitution = {
        id: institutionId,
        user_id: 'other-user',
        name: 'Bank A',
      };

      mockInstitutionRepository.findOne.mockResolvedValue(mockInstitution);

      await expect(
        service.findOne({ id: institutionId, user_id: userId }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneById', () => {
    it('should return an institution by id', async () => {
      const institutionId = 'inst-1';
      const mockInstitution = {
        id: institutionId,
        user_id: 'user-123',
        name: 'Bank A',
      };

      mockInstitutionRepository.findOne.mockResolvedValue(mockInstitution);

      const result = await service.findOneById(institutionId);

      expect(result).toEqual(mockInstitution);
      expect(mockInstitutionRepository.findOne).toHaveBeenCalledWith({
        where: { id: institutionId },
      });
    });

    it('should throw NotFoundException when institution not found', async () => {
      const institutionId = 'non-existent';
      mockInstitutionRepository.findOne.mockResolvedValue(null);

      await expect(service.findOneById(institutionId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOneByNordigenId', () => {
    it('should return an institution by nordigen id', async () => {
      const nordigenId = 'nordigen-123';
      const mockInstitution = {
        id: 'inst-1',
        nordigen_id: nordigenId,
        name: 'Bank A',
      };

      mockInstitutionRepository.findOne.mockResolvedValue(mockInstitution);

      const result = await service.findOneByNordigenId(nordigenId);

      expect(result).toEqual(mockInstitution);
      expect(mockInstitutionRepository.findOne).toHaveBeenCalledWith({
        where: { nordigen_id: nordigenId },
      });
    });

    it('should throw NotFoundException when institution not found', async () => {
      const nordigenId = 'non-existent';
      mockInstitutionRepository.findOne.mockResolvedValue(null);

      await expect(service.findOneByNordigenId(nordigenId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new institution', async () => {
      const userId = 'user-123';
      const dto: CreateInstitutionRequest = {
        name: 'New Bank',
        image_src: 'http://example.com/logo.png',
        country: 'GB',
      };

      const mockInstitution = {
        id: 'inst-1',
        user_id: userId,
        name: dto.name,
        image_src: dto.image_src,
        countries: [dto.country],
      };

      mockInstitutionRepository.create.mockReturnValue(mockInstitution);
      mockInstitutionRepository.save.mockResolvedValue(mockInstitution);

      const result = await service.create({ user_id: userId, dto });

      expect(result).toEqual(mockInstitution);
      expect(mockInstitutionRepository.create).toHaveBeenCalledWith({
        name: dto.name,
        image_src: dto.image_src,
        countries: [dto.country],
        user_id: userId,
      });
      expect(mockInstitutionRepository.save).toHaveBeenCalledWith(mockInstitution);
    });

    it('should create institution without country', async () => {
      const userId = 'user-123';
      const dto: CreateInstitutionRequest = {
        name: 'New Bank',
        image_src: 'http://example.com/logo.png',
      };

      const mockInstitution = {
        id: 'inst-1',
        user_id: userId,
        name: dto.name,
        image_src: dto.image_src,
        countries: [],
      };

      mockInstitutionRepository.create.mockReturnValue(mockInstitution);
      mockInstitutionRepository.save.mockResolvedValue(mockInstitution);

      const result = await service.create({ user_id: userId, dto });

      expect(result).toEqual(mockInstitution);
      expect(mockInstitutionRepository.create).toHaveBeenCalledWith({
        name: dto.name,
        image_src: dto.image_src,
        countries: [],
        user_id: userId,
      });
    });
  });

  describe('update', () => {
    it('should update an institution', async () => {
      const userId = 'user-123';
      const institutionId = 'inst-1';
      const dto: UpdateInstitutionRequest = {
        name: 'Updated Bank',
        image_src: 'http://example.com/updated.png',
      };

      const existingInstitution = {
        id: institutionId,
        user_id: userId,
        name: 'Old Bank',
        image_src: 'http://example.com/old.png',
        countries: ['GB'],
      };

      const updatedInstitution = {
        ...existingInstitution,
        name: dto.name,
        image_src: dto.image_src,
      };

      mockInstitutionRepository.findOne.mockResolvedValue(existingInstitution);
      mockInstitutionRepository.save.mockResolvedValue(updatedInstitution);

      const result = await service.update({ id: institutionId, dto, user_id: userId });

      expect(result).toEqual(updatedInstitution);
      expect(mockInstitutionRepository.save).toHaveBeenCalled();
    });

    it('should add country to institution', async () => {
      const userId = 'user-123';
      const institutionId = 'inst-1';
      const dto: UpdateInstitutionRequest = {
        country: 'US',
      };

      const existingInstitution = {
        id: institutionId,
        user_id: userId,
        name: 'Bank',
        image_src: 'http://example.com/logo.png',
        countries: ['GB'],
      };

      mockInstitutionRepository.findOne.mockResolvedValue(existingInstitution);
      mockInstitutionRepository.save.mockResolvedValue({
        ...existingInstitution,
        countries: ['GB', 'US'],
      });

      const result = await service.update({ id: institutionId, dto, user_id: userId });

      expect(result.countries).toContain('US');
      expect(result.countries).toContain('GB');
    });

    it('should throw ForbiddenException when updating system institution', async () => {
      const userId = 'user-123';
      const institutionId = 'inst-1';
      const dto: UpdateInstitutionRequest = {
        name: 'Updated',
      };

      const systemInstitution = {
        id: institutionId,
        user_id: null,
        name: 'System Bank',
        image_src: 'http://example.com/logo.png',
        countries: ['GB'],
      };

      mockInstitutionRepository.findOne.mockResolvedValue(systemInstitution);

      await expect(
        service.update({ id: institutionId, dto, user_id: userId }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when institution not found', async () => {
      const userId = 'user-123';
      const institutionId = 'non-existent';
      const dto: UpdateInstitutionRequest = {
        name: 'Updated',
      };

      mockInstitutionRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update({ id: institutionId, dto, user_id: userId }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an institution', async () => {
      const userId = 'user-123';
      const institutionId = 'inst-1';

      const mockInstitution = {
        id: institutionId,
        user_id: userId,
        name: 'Bank A',
        image_src: 'http://example.com/logo.png',
        countries: ['GB'],
      };

      mockInstitutionRepository.findOne.mockResolvedValue(mockInstitution);
      mockInstitutionRepository.remove.mockResolvedValue({ ...mockInstitution, id: undefined });

      const result = await service.remove({ id: institutionId, user_id: userId });

      expect(result).toBeDefined();
      expect(result.id).toBe(institutionId);
      expect(mockInstitutionRepository.remove).toHaveBeenCalledWith(mockInstitution);
    });

    it('should throw ForbiddenException when deleting system institution', async () => {
      const userId = 'user-123';
      const institutionId = 'inst-1';

      const systemInstitution = {
        id: institutionId,
        user_id: null,
        name: 'System Bank',
      };

      mockInstitutionRepository.findOne.mockResolvedValue(systemInstitution);

      await expect(
        service.remove({ id: institutionId, user_id: userId }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when institution not found', async () => {
      const userId = 'user-123';
      const institutionId = 'non-existent';

      mockInstitutionRepository.findOne.mockResolvedValue(null);

      await expect(
        service.remove({ id: institutionId, user_id: userId }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('saveAll', () => {
    it('should upsert multiple institutions', async () => {
      const institutions = [
        { id: 'inst-1', name: 'Bank A', nordigen_id: 'nord-1' },
        { id: 'inst-2', name: 'Bank B', nordigen_id: 'nord-2' },
      ] as Institution[];

      mockInstitutionRepository.upsert.mockResolvedValue(undefined);

      const result = await service.saveAll(institutions);

      expect(result).toEqual(institutions);
      expect(mockInstitutionRepository.upsert).toHaveBeenCalledWith(
        institutions,
        ['nordigen_id'],
      );
    });
  });
});
