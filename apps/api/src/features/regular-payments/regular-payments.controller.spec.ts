import { Test, TestingModule } from '@nestjs/testing';
import { RegularPaymentsController } from './regular-payments.controller';
import { RegularPaymentsService } from './regular-payments.service';
import { UserPrincipal } from 'src/auth/user-principal';
import { CreateRegularPaymentDto } from './dto/create-regular-payment.dto';
import { UpdateRegularPaymentDto } from './dto/update-regular-payment.dto';
import {
  RecurrenceCadence,
  RecurringPaymentType,
  RegularPayment,
} from './entities/regular-payment.entity';

describe('RegularPaymentsController', () => {
  let controller: RegularPaymentsController;

  const mockRegularPaymentsService = {
    findUserRegularPayments: jest.fn(),
    findUserRegularPayment: jest.fn(),
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
      controllers: [RegularPaymentsController],
      providers: [
        {
          provide: RegularPaymentsService,
          useValue: mockRegularPaymentsService,
        },
      ],
    }).compile();

    controller = module.get<RegularPaymentsController>(
      RegularPaymentsController,
    );

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all user regular payments', async () => {
      const mockPayments: Partial<RegularPayment>[] = [
        {
          id: 'payment-1',
          user_id: mockUser.id,
          name: 'Netflix',
          amount: 12.99,
          currency: 'GBP',
          type: RecurringPaymentType.SUBSCRIPTION,
          cadence: RecurrenceCadence.MONTHLY,
          startDate: new Date('2024-01-15'),
          imageUrl: 'https://example.com/netflix.png',
        },
        {
          id: 'payment-2',
          user_id: mockUser.id,
          name: 'Spotify',
          amount: 9.99,
          currency: 'GBP',
          type: RecurringPaymentType.SUBSCRIPTION,
          cadence: RecurrenceCadence.MONTHLY,
          startDate: new Date('2024-01-10'),
        },
      ];

      mockRegularPaymentsService.findUserRegularPayments.mockResolvedValue(
        mockPayments,
      );

      const result = await controller.findAll(mockUser);

      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].name).toBe('Netflix');
      expect(result[1].name).toBe('Spotify');
      expect(
        mockRegularPaymentsService.findUserRegularPayments,
      ).toHaveBeenCalledWith(mockUser.id);
    });

    it('should return empty array when user has no regular payments', async () => {
      mockRegularPaymentsService.findUserRegularPayments.mockResolvedValue([]);

      const result = await controller.findAll(mockUser);

      expect(result).toEqual([]);
      expect(
        mockRegularPaymentsService.findUserRegularPayments,
      ).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('findOne', () => {
    it('should return a specific regular payment', async () => {
      const paymentId = 'payment-1';
      const mockPayment: Partial<RegularPayment> = {
        id: paymentId,
        user_id: mockUser.id,
        name: 'Netflix',
        amount: 12.99,
        currency: 'GBP',
        type: RecurringPaymentType.SUBSCRIPTION,
        cadence: RecurrenceCadence.MONTHLY,
        startDate: new Date('2024-01-15'),
      };

      mockRegularPaymentsService.findUserRegularPayment.mockResolvedValue(
        mockPayment,
      );

      const result = await controller.findOne(mockUser, paymentId);

      expect(result).toBeDefined();
      expect(result.id).toBe(paymentId);
      expect(result.name).toBe('Netflix');
      expect(
        mockRegularPaymentsService.findUserRegularPayment,
      ).toHaveBeenCalledWith({
        userId: mockUser.id,
        id: paymentId,
      });
    });
  });

  describe('create', () => {
    it('should create a new regular payment', async () => {
      const createDto: CreateRegularPaymentDto = {
        name: 'Netflix',
        amount: 12.99,
        currency: 'GBP',
        type: RecurringPaymentType.SUBSCRIPTION,
        cadence: RecurrenceCadence.MONTHLY,
        startDate: '2024-01-15',
        imageUrl: 'https://example.com/netflix.png',
      };

      const mockPayment: Partial<RegularPayment> = {
        id: 'payment-1',
        user_id: mockUser.id,
        name: createDto.name,
        amount: createDto.amount,
        currency: createDto.currency,
        type: createDto.type,
        cadence: createDto.cadence,
        startDate: new Date(createDto.startDate),
        imageUrl: createDto.imageUrl,
      };

      mockRegularPaymentsService.create.mockResolvedValue(mockPayment);

      const result = await controller.create(mockUser, createDto);

      expect(result).toBeDefined();
      expect(result.name).toBe('Netflix');
      expect(result.amount).toBe(12.99);
      expect(mockRegularPaymentsService.create).toHaveBeenCalledWith({
        userId: mockUser.id,
        createRegularPaymentDto: createDto,
      });
    });

    it('should create a regular payment with category', async () => {
      const createDto: CreateRegularPaymentDto = {
        name: 'Rent',
        amount: 1200,
        currency: 'GBP',
        type: RecurringPaymentType.REGULAR_PAYMENT,
        cadence: RecurrenceCadence.MONTHLY,
        startDate: '2024-01-01',
        categoryId: 'category-1',
      };

      const mockPayment: Partial<RegularPayment> = {
        id: 'payment-1',
        user_id: mockUser.id,
        name: createDto.name,
        amount: createDto.amount,
        currency: createDto.currency,
        type: createDto.type,
        cadence: createDto.cadence,
        startDate: new Date(createDto.startDate),
        categoryId: createDto.categoryId,
      };

      mockRegularPaymentsService.create.mockResolvedValue(mockPayment);

      const result = await controller.create(mockUser, createDto);

      expect(result).toBeDefined();
      expect(result.name).toBe('Rent');
      expect(mockRegularPaymentsService.create).toHaveBeenCalledWith({
        userId: mockUser.id,
        createRegularPaymentDto: createDto,
      });
    });
  });

  describe('update', () => {
    it('should update a regular payment', async () => {
      const paymentId = 'payment-1';
      const updateDto: UpdateRegularPaymentDto = {
        name: 'Netflix Premium',
        amount: 15.99,
      };

      const mockUpdatedPayment: Partial<RegularPayment> = {
        id: paymentId,
        user_id: mockUser.id,
        name: 'Netflix Premium',
        amount: 15.99,
        currency: 'GBP',
        type: RecurringPaymentType.SUBSCRIPTION,
        cadence: RecurrenceCadence.MONTHLY,
        startDate: new Date('2024-01-15'),
      };

      mockRegularPaymentsService.update.mockResolvedValue(mockUpdatedPayment);

      const result = await controller.update(mockUser, paymentId, updateDto);

      expect(result).toBeDefined();
      expect(result.name).toBe('Netflix Premium');
      expect(result.amount).toBe(15.99);
      expect(mockRegularPaymentsService.update).toHaveBeenCalledWith({
        userId: mockUser.id,
        id: paymentId,
        dto: updateDto,
      });
    });

    it('should update only specified fields', async () => {
      const paymentId = 'payment-1';
      const updateDto: UpdateRegularPaymentDto = {
        amount: 19.99,
      };

      const mockUpdatedPayment: Partial<RegularPayment> = {
        id: paymentId,
        user_id: mockUser.id,
        name: 'Netflix',
        amount: 19.99,
        currency: 'GBP',
        type: RecurringPaymentType.SUBSCRIPTION,
        cadence: RecurrenceCadence.MONTHLY,
        startDate: new Date('2024-01-15'),
      };

      mockRegularPaymentsService.update.mockResolvedValue(mockUpdatedPayment);

      const result = await controller.update(mockUser, paymentId, updateDto);

      expect(result).toBeDefined();
      expect(result.amount).toBe(19.99);
      expect(mockRegularPaymentsService.update).toHaveBeenCalledWith({
        userId: mockUser.id,
        id: paymentId,
        dto: updateDto,
      });
    });
  });

  describe('remove', () => {
    it('should delete a regular payment', async () => {
      const paymentId = 'payment-1';
      const mockDeletedPayment: Partial<RegularPayment> = {
        id: paymentId,
        user_id: mockUser.id,
        name: 'Netflix',
        amount: 12.99,
        currency: 'GBP',
        type: RecurringPaymentType.SUBSCRIPTION,
        cadence: RecurrenceCadence.MONTHLY,
        startDate: new Date('2024-01-15'),
      };

      mockRegularPaymentsService.remove.mockResolvedValue(mockDeletedPayment);

      const result = await controller.remove(mockUser, paymentId);

      expect(result).toBeDefined();
      expect(result.id).toBe(paymentId);
      expect(mockRegularPaymentsService.remove).toHaveBeenCalledWith({
        userId: mockUser.id,
        id: paymentId,
      });
    });
  });
});
