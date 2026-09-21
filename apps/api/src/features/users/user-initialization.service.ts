import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CategoriesService } from '../categories/categories.service';
import { EmailService } from '../email/email.service';
import { UsersService } from './users.service';

@Injectable()
export class UserInitializationService {
  private readonly logger = new Logger(UserInitializationService.name);

  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
  ) {}

  @OnEvent('user.created')
  async handleUserCreated(payload: { userId: string }): Promise<void> {
    try {
      await this.categoriesService.createDefaultCategoriesForUser(
        payload.userId,
      );
      this.logger.log(
        `Default categories initialized for user ${payload.userId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to initialize default categories for user ${payload.userId}`,
        error,
      );
    }

    try {
      const user = await this.usersService.findUserData(payload.userId);
      if (!user || !user.email) {
        this.logger.warn(
          `User ${payload.userId} not found while sending welcome email`,
        );
        return;
      }

      await this.emailService.sendWelcomeEmail({
        to: user.email,
        userName: user.name || 'there',
      });
      this.logger.log(`Welcome email sent for user ${payload.userId}`);
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email for user ${payload.userId}`,
        error,
      );
    }
  }
}
