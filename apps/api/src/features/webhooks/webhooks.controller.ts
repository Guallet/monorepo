import {
  Controller,
  Post,
  Body,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { Public } from 'src/auth/is-public.decorator';
import { SupabaseWebhookUserPayload } from './dto/userWebhookPayload.supabase.dto';
import { BetterAuthWebhookUserPayload } from './dto/userWebhookPayload.better-auth.dto';
import { UsersService } from 'src/features/users/users.service';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);
  constructor(
    private readonly webhooksService: WebhooksService,
    private readonly userService: UsersService,
  ) {}

  /**
   * Webhook endpoint for Better Auth user events
   */
  @Post('auth/user')
  @Public()
  @HttpCode(HttpStatus.ACCEPTED)
  async handleBetterAuthUserWebhook(
    @Body() payload: BetterAuthWebhookUserPayload,
  ): Promise<void> {
    this.logger.log('Received Better Auth user webhook', payload);

    const { type, data } = payload;

    switch (type) {
      case 'user.created':
        try {
          this.logger.debug(
            `Creating user ${data.id} from Better Auth webhook`,
          );
          const userEntity = await this.userService.upsertUser({
            id: data.id,
            email: data.email,
            name: data.name ?? '',
            avatar_url: data.image ?? '',
          });
          this.logger.log(
            `User ${userEntity.id} created from Better Auth webhook`,
            userEntity.email,
          );
        } catch (e) {
          this.logger.error(`Failed to create user from webhook: ${e}`);
        }
        break;

      case 'user.updated':
        try {
          this.logger.debug(`Updating user ${data.id} from webhook`);
          await this.userService.upsertUser({
            id: data.id,
            email: data.email,
            name: data.name,
            avatar_url: data.image,
          });
        } catch (e) {
          this.logger.error(`Failed to update user from webhook: ${e}`);
        }
        break;

      case 'user.deleted':
        try {
          this.logger.debug(`Deleting user ${data.id} from webhook`);
          await this.userService.removeUser(data.id, {
            deleteFromAuthService: false,
          });
        } catch (e) {
          this.logger.error(`Failed to delete user from webhook: ${e}`);
        }
        break;

      default:
        this.logger.warn(
          `Auth Webhook unhandled event type received: ${type as string}`,
        );
        break;
    }
  }

  /**
   * Legacy webhook endpoint for Supabase user events
   * @deprecated Use /webhooks/auth/user instead
   */
  @Post('user')
  @Public()
  @HttpCode(HttpStatus.ACCEPTED)
  async create(@Body() payload: SupabaseWebhookUserPayload): Promise<void> {
    this.logger.log('Received supabase user webhook (legacy)', payload);

    switch (payload.type) {
      case 'INSERT':
        try {
          const payloadData = payload.record;
          if (payloadData === null || payloadData === undefined) {
            this.logger.error('Payload data is null or bad format', payload);
            return;
          }

          this.logger.debug(
            `Creating user ${payloadData.id} from supabase webhook`,
          );
          const { id, email, raw_user_meta_data } = payloadData;

          let name = '';
          let avatarUrl = '';
          if (raw_user_meta_data) {
            name = raw_user_meta_data.full_name ?? raw_user_meta_data.name;
            avatarUrl =
              raw_user_meta_data.avatar_url ?? raw_user_meta_data.picture ?? '';
          }

          const userEntity = await this.userService.upsertUser({
            id: id,
            email: email,
            name: name,
            avatar_url: avatarUrl,
          });
          this.logger.log(
            `User ${userEntity.id} created from supabase webhook`,
            userEntity.email,
          );
        } catch (e) {
          this.logger.error(`Failed to create user from webhook: ${e}`);
        }

        break;
      case 'DELETE':
        try {
          const payloadData = payload.old_record;
          if (payloadData === null || payloadData === undefined) {
            this.logger.error('Payload data is null or bad format', payload);
            return;
          }

          this.logger.debug(`Deleting user ${payloadData.id} from webhook`);

          await this.userService.removeUser(payloadData.id, {
            deleteFromAuthService: false,
          });
        } catch (e) {
          this.logger.error(`Failed to delete user from webhook: ${e}`);
        }
        break;
      case 'UPDATE':
        // No idea why Supabase sends UPDATE when it's a new user registered via Google
        try {
          const payloadData = payload.record;
          if (payloadData === null || payloadData === undefined) {
            this.logger.error('Payload data is null or bad format', payload);
            return;
          }

          const { id, email, raw_user_meta_data } = payloadData;
          this.logger.debug(`Updating user ${payloadData.id} from webhook`);

          await this.userService.upsertUser({
            id: id,
            email: email,
            name:
              raw_user_meta_data?.full_name ??
              raw_user_meta_data?.name ??
              undefined,
            avatar_url:
              raw_user_meta_data?.avatar_url ??
              raw_user_meta_data?.picture ??
              undefined,
          });
        } catch (e) {
          this.logger.error(`Failed to update user from webhook: ${e}`);
        }
        break;
      default:
        this.logger.warn(
          `Auth Webhook unhandled event type received: ${payload.type as string}`,
        );
        break;
    }
  }
}
