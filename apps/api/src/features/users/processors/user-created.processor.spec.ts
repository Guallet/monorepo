/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { CategoriesService } from '../../categories/categories.service';
import { EmailService } from '../../email/email.service';
import { UsersService } from '../users.service';
import { UserCreatedProcessor } from './user-created.processor';
import { User } from '../entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import {
  USER_CREATED_EVENT,
  UserCreatedEventPayload,
} from '../users-events.constants';

describe('UserCreatedProcessor', () => {
  let processor: UserCreatedProcessor;
  let usersService: jest.Mocked<UsersService>;
  let categoriesService: jest.Mocked<CategoriesService>;
  let emailService: jest.Mocked<EmailService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserCreatedProcessor,
        {
          provide: UsersService,
          useValue: {
            findUserData: jest.fn(),
          },
        },
        {
          provide: CategoriesService,
          useValue: {
            findAllUserCategories: jest.fn(),
            createDefaultCategoriesForUser: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendWelcomeEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    processor = module.get(UserCreatedProcessor);
    usersService = module.get(UsersService);
    categoriesService = module.get(CategoriesService);
    emailService = module.get(EmailService);

    jest.clearAllMocks();
  });

  it('should seed default categories and send welcome email for a new user', async () => {
    usersService.findUserData.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      name: 'Test User',
    } as User);
    categoriesService.findAllUserCategories.mockResolvedValue([]);
    categoriesService.createDefaultCategoriesForUser.mockResolvedValue([]);

    const job: Partial<Job<UserCreatedEventPayload>> = {
      id: 'job-1',
      name: USER_CREATED_EVENT,
      data: { userId: 'user-1' },
    };

    await processor.process(job as Job<UserCreatedEventPayload>);

    expect(
      categoriesService.createDefaultCategoriesForUser,
    ).toHaveBeenCalledWith('user-1');
    expect(emailService.sendWelcomeEmail).toHaveBeenCalledWith({
      to: 'user@example.com',
      userName: 'Test User',
    });
  });

  it('should skip creating categories when user already has them', async () => {
    usersService.findUserData.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      name: 'Test User',
    } as User);
    categoriesService.findAllUserCategories.mockResolvedValue([
      { id: 'c1' },
    ] as Category[]);

    const job: Partial<Job<UserCreatedEventPayload>> = {
      id: 'job-2',
      name: USER_CREATED_EVENT,
      data: { userId: 'user-1' },
    };

    await processor.process(job as Job<UserCreatedEventPayload>);

    expect(
      categoriesService.createDefaultCategoriesForUser,
    ).not.toHaveBeenCalled();
    expect(emailService.sendWelcomeEmail).toHaveBeenCalled();
  });

  it('should skip processing for unsupported event names', async () => {
    const job: Partial<Job<UserCreatedEventPayload>> = {
      id: 'job-3',
      name: 'other.event',
      data: { userId: 'user-1' },
    };

    await processor.process(job as Job<UserCreatedEventPayload>);

    expect(usersService.findUserData).not.toHaveBeenCalled();
    expect(
      categoriesService.createDefaultCategoriesForUser,
    ).not.toHaveBeenCalled();
    expect(emailService.sendWelcomeEmail).not.toHaveBeenCalled();
  });
});
