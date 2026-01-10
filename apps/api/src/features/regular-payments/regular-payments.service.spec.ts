import { Test, TestingModule } from '@nestjs/testing';
import { RegularPaymentsService } from './regular-payments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from '../categories/entities/category.entity';
import {
  RecurrenceCadence,
  RecurringPaymentType,
  RegularPayment,
} from './entities/regular-payment.entity';
import { CreateRegularPaymentDto } from './dto/create-regular-payment.dto';
import { UpdateRegularPaymentDto } from './dto/update-regular-payment.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('RegularPaymentsService', () => {
  let service: RegularPaymentsService;

  const mockRegularPaymentRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockCategoryRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegularPaymentsService,
        {
          provide: getRepositoryToken(RegularPayment),
          useValue: mockRegularPaymentRepository,
        },
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<RegularPaymentsService>(RegularPaymentsService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new regular payment without category', async () => {
      const userId = 'user-123';
      const createDto: CreateRegularPaymentDto = {
        name: 'Netflix',
        amount: 12.99,
        currency: 'GBP',
        type: RecurringPaymentType.SUBSCRIPTION,
        cadence: RecurrenceCadence.MONTHLY,
        imageUrl: 'https://example.com/netflix.png',
      };

      const savedPayment: Partial<RegularPayment> = {
        id: 'payment-1',
        user_id: userId,
        ...createDto,
      };

      mockRegularPaymentRepository.save.mockResolvedValue(savedPayment);

      const result = await service.create({
        userId,
        createRegularPaymentDto: createDto,
      });

      expect(result).toEqual(savedPayment);
      expect(mockRegularPaymentRepository.save).toHaveBeenCalledWith({
        user_id: userId,
        amount: createDto.amount,
        cadence: createDto.cadence,
        currency: createDto.currency,
        name: createDto.name,
        type: createDto.type,
        imageUrl: createDto.imageUrl,
        category: undefined,
      });
    });

    it('should create a new regular payment with category', async () => {
      const userId = 'user-123';
      const createDto: CreateRegularPaymentDto = {
        name: 'Rent',
        amount: 1200,
        currency: 'GBP',
        type: RecurringPaymentType.REGULAR_PAYMENT,
        cadence: RecurrenceCadence.MONTHLY,
        categoryId: 'category-1',
      };

      const mockCategory: Partial<Category> = {
        id: 'category-1',
        user_id: userId,
        name: 'Housing',
      };

      const savedPayment: Partial<RegularPayment> = {
        id: 'payment-1',
        user_id: userId,
        ...createDto,
      };

      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockRegularPaymentRepository.save.mockResolvedValue(savedPayment);

      const result = await service.create({
        userId,
        createRegularPaymentDto: createDto,
      });

      expect(result).toEqual(savedPayment);
      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: {
          user_id: userId,
          id: 'category-1',
        },
      });
      expect(mockRegularPaymentRepository.save).toHaveBeenCalledWith({
        user_id: userId,
        amount: createDto.amount,
        cadence: createDto.cadence,
        currency: createDto.currency,
        name: createDto.name,
        type: createDto.type,
        imageUrl: createDto.imageUrl,
        category: { id: 'category-1' },
      });
    });

    it('should throw BadRequestException when creating with invalid category', async () => {
      const userId = 'user-123';
      const createDto: CreateRegularPaymentDto = {
        name: 'Rent',
        amount: 1200,
        currency: 'GBP',
        type: RecurringPaymentType.REGULAR_PAYMENT,
        cadence: RecurrenceCadence.MONTHLY,
        categoryId: 'invalid-category',
      };

      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create({
          userId,
          createRegularPaymentDto: createDto,
        }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.create({
          userId,
          createRegularPaymentDto: createDto,
        }),
      ).rejects.toThrow('Invalid Category ID: Category not found');

      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: {
          user_id: userId,
          id: 'invalid-category',
        },
      });
      expect(mockRegularPaymentRepository.save).not.toHaveBeenCalled();
    });

    it('should create a regular income', async () => {
      const userId = 'user-123';
      const createDto: CreateRegularPaymentDto = {
        name: 'Salary',
        amount: 3000,
        currency: 'GBP',
        type: RecurringPaymentType.REGULAR_INCOME,
        cadence: RecurrenceCadence.MONTHLY,
      };

      const savedPayment: Partial<RegularPayment> = {
        id: 'payment-1',
        user_id: userId,
        ...createDto,
      };

      mockRegularPaymentRepository.save.mockResolvedValue(savedPayment);

      const result = await service.create({
        userId,
        createRegularPaymentDto: createDto,
      });

      expect(result).toEqual(savedPayment);
      expect(result.type).toBe(RecurringPaymentType.REGULAR_INCOME);
    });
  });

  describe('findUserRegularPayments', () => {
    it('should return all regular payments for a user', async () => {
      const userId = 'user-123';
      const mockPayments: Partial<RegularPayment>[] = [
        {
          id: 'payment-1',
          user_id: userId,
          name: 'Netflix',
          amount: 12.99,
          currency: 'GBP',
          type: RecurringPaymentType.SUBSCRIPTION,
          cadence: RecurrenceCadence.MONTHLY,
        },
        {
          id: 'payment-2',
          user_id: userId,
          name: 'Spotify',
          amount: 9.99,
          currency: 'GBP',
          type: RecurringPaymentType.SUBSCRIPTION,
          cadence: RecurrenceCadence.MONTHLY,
        },
      ];

      mockRegularPaymentRepository.find.mockResolvedValue(mockPayments);

      const result = await service.findUserRegularPayments(userId);

      expect(result).toEqual(mockPayments);
      expect(mockRegularPaymentRepository.find).toHaveBeenCalledWith({
        where: { user_id: userId },
        relations: {
          category: true,
        },
      });
    });

    it('should return empty array when user has no regular payments', async () => {
      const userId = 'user-123';
      mockRegularPaymentRepository.find.mockResolvedValue([]);

      const result = await service.findUserRegularPayments(userId);

      expect(result).toEqual([]);
    });
  });

  describe('findUserRegularPayment', () => {
    it('should return a specific regular payment', async () => {
      const userId = 'user-123';
      const paymentId = 'payment-1';
      const mockPayment: Partial<RegularPayment> = {
        id: paymentId,
        user_id: userId,
        name: 'Netflix',
        amount: 12.99,
        currency: 'GBP',
        type: RecurringPaymentType.SUBSCRIPTION,
        cadence: RecurrenceCadence.MONTHLY,
      };

      mockRegularPaymentRepository.findOne.mockResolvedValue(mockPayment);

      const result = await service.findUserRegularPayment({
        userId,
        id: paymentId,
      });

      expect(result).toEqual(mockPayment);
      expect(mockRegularPaymentRepository.findOne).toHaveBeenCalledWith({
        where: { user_id: userId, id: paymentId },
        relations: {
          category: true,
        },
      });
    });

    it('should throw NotFoundException when payment does not exist', async () => {
      const userId = 'user-123';
      const paymentId = 'non-existent';

      mockRegularPaymentRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findUserRegularPayment({ userId, id: paymentId }),
      ).rejects.toThrow(NotFoundException);

      await expect(
        service.findUserRegularPayment({ userId, id: paymentId }),
      ).rejects.toThrow('Regular payment not found');
    });
  });

  describe('update', () => {
    it('should update a regular payment', async () => {
      const userId = 'user-123';
      const paymentId = 'payment-1';
      const updateDto: UpdateRegularPaymentDto = {
        name: 'Netflix Premium',
        amount: 15.99,
      };

      const existingPayment: Partial<RegularPayment> = {
        id: paymentId,
        user_id: userId,
        name: 'Netflix',
        amount: 12.99,
        currency: 'GBP',
        type: RecurringPaymentType.SUBSCRIPTION,
        cadence: RecurrenceCadence.MONTHLY,
      };

      const updatedPayment: Partial<RegularPayment> = {
        ...existingPayment,
        name: 'Netflix Premium',
        amount: 15.99,
      };

      mockRegularPaymentRepository.findOne.mockResolvedValue(existingPayment);
      mockRegularPaymentRepository.save.mockResolvedValue(updatedPayment);

      const result = await service.update({
        userId,
        id: paymentId,
        dto: updateDto,
      });

      expect(result).toEqual(updatedPayment);
      expect(mockRegularPaymentRepository.findOne).toHaveBeenCalledWith({
        where: { user_id: userId, id: paymentId },
      });
    });

    it('should throw NotFoundException when payment does not exist', async () => {
      const userId = 'user-123';
      const paymentId = 'non-existent';
      const updateDto: UpdateRegularPaymentDto = {
        name: 'Updated Name',
      };

      mockRegularPaymentRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update({ userId, id: paymentId, dto: updateDto }),
      ).rejects.toThrow(NotFoundException);

      await expect(
        service.update({ userId, id: paymentId, dto: updateDto }),
      ).rejects.toThrow('Regular payment not found');
    });

    it('should update category when categoryId is provided', async () => {
      const userId = 'user-123';
      const paymentId = 'payment-1';
      const updateDto: UpdateRegularPaymentDto = {
        categoryId: 'category-2',
      };

      const existingPayment: Partial<RegularPayment> = {
        id: paymentId,
        user_id: userId,
        name: 'Netflix',
        amount: 12.99,
        currency: 'GBP',
        type: RecurringPaymentType.SUBSCRIPTION,
        cadence: RecurrenceCadence.MONTHLY,
        categoryId: 'category-1',
      };

      const mockCategory: Partial<Category> = {
        id: 'category-2',
        user_id: userId,
        name: 'Entertainment',
      };

      const updatedPayment: Partial<RegularPayment> = {
        ...existingPayment,
        categoryId: 'category-2',
      };

      mockRegularPaymentRepository.findOne.mockResolvedValue(existingPayment);
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockRegularPaymentRepository.save.mockResolvedValue(updatedPayment);

      const result = await service.update({
        userId,
        id: paymentId,
        dto: updateDto,
      });

      expect(result.categoryId).toBe('category-2');
      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: {
          user_id: userId,
          id: 'category-2',
        },
      });
    });

    it('should throw BadRequestException when category does not exist', async () => {
      const userId = 'user-123';
      const paymentId = 'payment-1';
      const updateDto: UpdateRegularPaymentDto = {
        categoryId: 'invalid-category',
      };

      const existingPayment: Partial<RegularPayment> = {
        id: paymentId,
        user_id: userId,
        name: 'Netflix',
        amount: 12.99,
        currency: 'GBP',
        type: RecurringPaymentType.SUBSCRIPTION,
        cadence: RecurrenceCadence.MONTHLY,
        categoryId: 'category-1',
      };

      mockRegularPaymentRepository.findOne.mockResolvedValue(existingPayment);
      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update({ userId, id: paymentId, dto: updateDto }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.update({ userId, id: paymentId, dto: updateDto }),
      ).rejects.toThrow('Invalid Category ID: Category not found');
    });

    it('should not validate category when categoryId is not changed', async () => {
      const userId = 'user-123';
      const paymentId = 'payment-1';
      const updateDto: UpdateRegularPaymentDto = {
        name: 'Netflix Premium',
        categoryId: 'category-1', // Same as existing
      };

      const existingPayment: Partial<RegularPayment> = {
        id: paymentId,
        user_id: userId,
        name: 'Netflix',
        amount: 12.99,
        currency: 'GBP',
        type: RecurringPaymentType.SUBSCRIPTION,
        cadence: RecurrenceCadence.MONTHLY,
        categoryId: 'category-1',
      };

      const updatedPayment: Partial<RegularPayment> = {
        ...existingPayment,
        name: 'Netflix Premium',
      };

      mockRegularPaymentRepository.findOne.mockResolvedValue(existingPayment);
      mockRegularPaymentRepository.save.mockResolvedValue(updatedPayment);

      const result = await service.update({
        userId,
        id: paymentId,
        dto: updateDto,
      });

      expect(result.name).toBe('Netflix Premium');
      expect(mockCategoryRepository.findOne).not.toHaveBeenCalled();
    });

    it('should update multiple fields at once', async () => {
      const userId = 'user-123';
      const paymentId = 'payment-1';
      const updateDto: UpdateRegularPaymentDto = {
        name: 'Netflix Premium',
        amount: 19.99,
        currency: 'USD',
        cadence: RecurrenceCadence.YEARLY,
      };

      const existingPayment: Partial<RegularPayment> = {
        id: paymentId,
        user_id: userId,
        name: 'Netflix',
        amount: 12.99,
        currency: 'GBP',
        type: RecurringPaymentType.SUBSCRIPTION,
        cadence: RecurrenceCadence.MONTHLY,
      };

      const updatedPayment: Partial<RegularPayment> = {
        id: paymentId,
        user_id: userId,
        name: 'Netflix Premium',
        amount: 19.99,
        currency: 'USD',
        type: RecurringPaymentType.SUBSCRIPTION,
        cadence: RecurrenceCadence.YEARLY,
      };

      mockRegularPaymentRepository.findOne.mockResolvedValue(existingPayment);
      mockRegularPaymentRepository.save.mockResolvedValue(updatedPayment);

      const result = await service.update({
        userId,
        id: paymentId,
        dto: updateDto,
      });

      expect(result.name).toBe('Netflix Premium');
      expect(result.amount).toBe(19.99);
      expect(result.currency).toBe('USD');
      expect(result.cadence).toBe(RecurrenceCadence.YEARLY);
    });
  });

  describe('remove', () => {
    it('should remove a regular payment', async () => {
      const userId = 'user-123';
      const paymentId = 'payment-1';
      const mockPayment: Partial<RegularPayment> = {
        id: paymentId,
        user_id: userId,
        name: 'Netflix',
        amount: 12.99,
        currency: 'GBP',
        type: RecurringPaymentType.SUBSCRIPTION,
        cadence: RecurrenceCadence.MONTHLY,
      };

      mockRegularPaymentRepository.findOne.mockResolvedValue(mockPayment);
      mockRegularPaymentRepository.remove.mockResolvedValue(mockPayment);

      const result = await service.remove({ userId, id: paymentId });

      expect(result).toEqual(mockPayment);
      expect(mockRegularPaymentRepository.remove).toHaveBeenCalledWith(
        mockPayment,
      );
    });

    it('should throw NotFoundException when payment does not exist', async () => {
      const userId = 'user-123';
      const paymentId = 'non-existent';

      mockRegularPaymentRepository.findOne.mockResolvedValue(null);

      await expect(service.remove({ userId, id: paymentId })).rejects.toThrow(
        NotFoundException,
      );

      await expect(service.remove({ userId, id: paymentId })).rejects.toThrow(
        'Regular payment not found',
      );
    });
  });
});
