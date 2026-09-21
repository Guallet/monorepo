import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class UserInitializationService {
  private readonly logger = new Logger(UserInitializationService.name);

  constructor(private readonly categoriesService: CategoriesService) {}

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
  }
}
