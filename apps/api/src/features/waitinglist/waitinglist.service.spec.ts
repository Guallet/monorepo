import { Test, TestingModule } from '@nestjs/testing';
import { WaitingListService } from './waitinglist.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WaitingList } from './waitinglist.entity';

describe('WaitingListService', () => {
  let service: WaitingListService;

  const mockWaitingListRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WaitingListService,
        {
          provide: getRepositoryToken(WaitingList),
          useValue: mockWaitingListRepository,
        },
      ],
    }).compile();

    service = module.get<WaitingListService>(WaitingListService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addEmail', () => {
    it('should add a new email to the waiting list', async () => {
      const email = 'newuser@example.com';
      const mockEntry = { id: '1', email };

      mockWaitingListRepository.findOne.mockResolvedValue(null);
      mockWaitingListRepository.create.mockReturnValue(mockEntry);
      mockWaitingListRepository.save.mockResolvedValue(mockEntry);

      await service.addEmail(email);

      expect(mockWaitingListRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(mockWaitingListRepository.create).toHaveBeenCalledWith({ email });
      expect(mockWaitingListRepository.save).toHaveBeenCalledWith(mockEntry);
    });

    it('should not add duplicate email to the waiting list', async () => {
      const email = 'existing@example.com';
      const existingEntry = { id: '1', email };

      mockWaitingListRepository.findOne.mockResolvedValue(existingEntry);

      await service.addEmail(email);

      expect(mockWaitingListRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(mockWaitingListRepository.create).not.toHaveBeenCalled();
      expect(mockWaitingListRepository.save).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const email = 'error@example.com';
      const error = new Error('Database error');

      mockWaitingListRepository.findOne.mockRejectedValue(error);

      // Should not throw, just log the error
      await expect(service.addEmail(email)).resolves.not.toThrow();
    });
  });
});
