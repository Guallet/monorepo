import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NordigenKeysService } from './nordigen-keys.service';
import { NordigenKey } from './entities/nordigen-key.entity';
import { NordigenKeyAccount } from './entities/nordigen-key-account.entity';
import { Account } from '../accounts/entities/account.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { NordigenUserService } from '../nordigen/nordigen-user.service';

describe('NordigenKeysService', () => {
  let service: NordigenKeysService;

  const mockKeyRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockKeyAccountRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockAccountRepository = {
    find: jest.fn(),
  };

  const mockNordigenUserService = {
    getAccessToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NordigenKeysService,
        {
          provide: getRepositoryToken(NordigenKey),
          useValue: mockKeyRepository,
        },
        {
          provide: getRepositoryToken(NordigenKeyAccount),
          useValue: mockKeyAccountRepository,
        },
        {
          provide: getRepositoryToken(Account),
          useValue: mockAccountRepository,
        },
        {
          provide: NordigenUserService,
          useValue: mockNordigenUserService,
        },
      ],
    }).compile();

    service = module.get<NordigenKeysService>(NordigenKeysService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllByUser', () => {
    it('should return all keys for a user', async () => {
      const userId = 'user-123';
      const mockKeys = [
        { id: 'key-1', user_id: userId, name: 'Key 1', linkedAccounts: [] },
        { id: 'key-2', user_id: userId, name: 'Key 2', linkedAccounts: [] },
      ];

      mockKeyRepository.find.mockResolvedValue(mockKeys);

      const result = await service.findAllByUser(userId);

      expect(result).toEqual(mockKeys);
      expect(mockKeyRepository.find).toHaveBeenCalledWith({
        where: { user_id: userId },
        relations: ['linkedAccounts'],
      });
    });
  });

  describe('findById', () => {
    it('should return a key by id', async () => {
      const userId = 'user-123';
      const keyId = 'key-123';
      const mockKey = {
        id: keyId,
        user_id: userId,
        name: 'My Key',
        linkedAccounts: [],
      };

      mockKeyRepository.findOne.mockResolvedValue(mockKey);

      const result = await service.findById(userId, keyId);

      expect(result).toEqual(mockKey);
    });

    it('should throw NotFoundException if key not found', async () => {
      mockKeyRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findById('user-123', 'non-existent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new key', async () => {
      const userId = 'user-123';
      const dto = {
        name: 'My Key',
        secret_id: 'secret-id',
        secret_key: 'secret-key',
      };
      const createdKey = {
        id: 'key-123',
        ...dto,
        user_id: userId,
        linkedAccounts: [],
      };

      mockKeyRepository.create.mockReturnValue(createdKey);
      mockKeyRepository.save.mockResolvedValue(createdKey);
      mockKeyRepository.findOne.mockResolvedValue(createdKey);
      mockNordigenUserService.getAccessToken.mockResolvedValue('access-token');

      const result = await service.create(userId, dto);

      expect(result).toEqual(createdKey);
      expect(mockNordigenUserService.getAccessToken).toHaveBeenCalledWith({
        secretId: dto.secret_id,
        secretKey: dto.secret_key,
      });
      expect(mockKeyRepository.create).toHaveBeenCalledWith({
        user_id: userId,
        name: dto.name,
        secret_id: dto.secret_id,
        secret_key: dto.secret_key,
      });
    });

    it('should throw BadRequestException if credentials are invalid', async () => {
      const userId = 'user-123';
      const dto = {
        name: 'My Key',
        secret_id: 'invalid-id',
        secret_key: 'invalid-key',
      };

      mockNordigenUserService.getAccessToken.mockRejectedValue(
        new Error('Invalid credentials'),
      );

      await expect(service.create(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockKeyRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a key', async () => {
      const userId = 'user-123';
      const keyId = 'key-123';
      const dto = { name: 'Updated Name' };
      const existingKey = {
        id: keyId,
        user_id: userId,
        name: 'Old Name',
        secret_id: 'sid',
        secret_key: 'sk',
      };
      const updatedKey = { ...existingKey, name: 'Updated Name' };

      mockKeyRepository.findOne.mockResolvedValue(existingKey);
      mockKeyRepository.save.mockResolvedValue(updatedKey);

      const result = await service.update(userId, keyId, dto);

      expect(result).toEqual(updatedKey);
      expect(mockKeyRepository.save).toHaveBeenCalled();
    });

    it('should validate credentials if updating secrets', async () => {
      const userId = 'user-123';
      const keyId = 'key-123';
      const dto = { secret_id: 'new-sid', secret_key: 'new-sk' };
      const existingKey = {
        id: keyId,
        user_id: userId,
        name: 'Name',
        secret_id: 'old-sid',
        secret_key: 'old-sk',
      };

      mockKeyRepository.findOne.mockResolvedValue(existingKey);
      mockNordigenUserService.getAccessToken.mockResolvedValue('token');
      mockKeyRepository.save.mockResolvedValue({ ...existingKey, ...dto });

      await service.update(userId, keyId, dto);

      expect(mockNordigenUserService.getAccessToken).toHaveBeenCalledWith({
        secretId: 'new-sid',
        secretKey: 'new-sk',
      });
    });

    it('should throw BadRequestException if new credentials are invalid', async () => {
      const userId = 'user-123';
      const keyId = 'key-123';
      const dto = { secret_id: 'invalid-sid' };
      const existingKey = {
        id: keyId,
        user_id: userId,
        name: 'Name',
        secret_id: 'old-sid',
        secret_key: 'old-sk',
      };

      mockKeyRepository.findOne.mockResolvedValue(existingKey);
      mockNordigenUserService.getAccessToken.mockRejectedValue(
        new Error('Invalid'),
      );

      await expect(service.update(userId, keyId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a key', async () => {
      const userId = 'user-123';
      const keyId = 'key-123';
      const mockKey = { id: keyId, user_id: userId };

      mockKeyRepository.findOne.mockResolvedValue(mockKey);
      mockKeyRepository.remove.mockResolvedValue(mockKey);

      await service.delete(userId, keyId);

      expect(mockKeyRepository.remove).toHaveBeenCalledWith(mockKey);
    });
  });

  describe('linkAccounts', () => {
    it('should link accounts to a key', async () => {
      const userId = 'user-123';
      const keyId = 'key-123';
      const accountIds = ['account-1', 'account-2'];
      const mockKey = { id: keyId, user_id: userId, linkedAccounts: [] };
      const mockAccounts = [
        { id: 'account-1', user_id: userId },
        { id: 'account-2', user_id: userId },
      ];

      mockKeyRepository.findOne.mockResolvedValue(mockKey);
      mockAccountRepository.find.mockResolvedValue(mockAccounts);
      mockKeyAccountRepository.delete.mockResolvedValue({});
      mockKeyAccountRepository.create.mockImplementation(
        (data: unknown) => data,
      );
      mockKeyAccountRepository.save.mockResolvedValue([]);

      const result = await service.linkAccounts(userId, keyId, accountIds);

      expect(result).toEqual(mockKey);
    });

    it('should throw BadRequestException if some accounts do not exist', async () => {
      const userId = 'user-123';
      const keyId = 'key-123';
      const accountIds = ['account-1', 'account-2'];
      const mockKey = { id: keyId, user_id: userId, linkedAccounts: [] };
      const mockAccounts = [{ id: 'account-1', user_id: userId }];

      mockKeyRepository.findOne.mockResolvedValue(mockKey);
      mockAccountRepository.find.mockResolvedValue(mockAccounts);

      await expect(
        service.linkAccounts(userId, keyId, accountIds),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
