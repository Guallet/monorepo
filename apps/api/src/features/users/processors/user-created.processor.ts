import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { CategoriesService } from '../../categories/categories.service';
import { EmailService } from '../../email/email.service';
import { UsersService } from '../users.service';
import {
  USER_CREATED_EVENT,
  USER_EVENTS_QUEUE,
  UserCreatedEventPayload,
} from '../users-events.constants';

@Processor(USER_EVENTS_QUEUE)
export class UserCreatedProcessor extends WorkerHost {
  private readonly logger = new Logger(UserCreatedProcessor.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly categoriesService: CategoriesService,
    private readonly emailService: EmailService,
  ) {
    super();
  }

  async process(job: Job<UserCreatedEventPayload>): Promise<void> {
    if (job.name !== USER_CREATED_EVENT) {
      this.logger.warn(`Ignoring unsupported job name: ${job.name}`);
      return;
    }

    const { userId } = job.data;
    this.logger.log(`Processing ${USER_CREATED_EVENT} for user ${userId}`);

    const user = await this.usersService.findUserData(userId);
    if (!user) {
      this.logger.warn(`User ${userId} not found while processing event`);
      return;
    }

    const existingCategories =
      await this.categoriesService.findAllUserCategories(userId);
    if (existingCategories.length === 0) {
      await this.categoriesService.createDefaultCategoriesForUser(userId);
      this.logger.log(`Default categories created for user ${userId}`);
    } else {
      this.logger.log(`User ${userId} already has categories, skipping seed`);
    }

    if (!user.email) {
      this.logger.warn(`User ${userId} has no email, skipping welcome email`);
      return;
    }

    await this.emailService.sendWelcomeEmail({
      to: user.email,
      userName: user.name || 'there',
    });

    this.logger.log(`Welcome email sent for user ${userId}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<UserCreatedEventPayload>, error: Error) {
    this.logger.error(
      `Job ${job.id} (${job.name}) failed: ${error.message}`,
      error,
    );
  }
}
