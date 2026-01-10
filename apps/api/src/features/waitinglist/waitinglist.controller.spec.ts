import { Test, TestingModule } from '@nestjs/testing';
import { WaitingListController } from './waitinglist.controller';
import { WaitingListService } from './waitinglist.service';

describe('WaitingListController', () => {
  let controller: WaitingListController;

  const mockWaitingListService = {
    addEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WaitingListController],
      providers: [
        {
          provide: WaitingListService,
          useValue: mockWaitingListService,
        },
      ],
    }).compile();

    controller = module.get<WaitingListController>(WaitingListController);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addEmail', () => {
    it('should add an email to the waiting list', async () => {
      const email = 'test@example.com';
      mockWaitingListService.addEmail.mockResolvedValue(undefined);

      await controller.addEmail(email);

      expect(mockWaitingListService.addEmail).toHaveBeenCalledWith(email);
      expect(mockWaitingListService.addEmail).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple email additions', async () => {
      const emails = ['test1@example.com', 'test2@example.com'];
      mockWaitingListService.addEmail.mockResolvedValue(undefined);

      for (const email of emails) {
        await controller.addEmail(email);
      }

      expect(mockWaitingListService.addEmail).toHaveBeenCalledTimes(2);
      expect(mockWaitingListService.addEmail).toHaveBeenCalledWith(
        emails[0],
      );
      expect(mockWaitingListService.addEmail).toHaveBeenCalledWith(
        emails[1],
      );
    });
  });
});
