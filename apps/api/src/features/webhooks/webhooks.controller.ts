import { Controller, Post, Body, Logger, HttpCode } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { Public } from 'src/auth/is-public.decorator';
import { SupabaseWebhookUserPayload } from './dto/userWebhookPayload.supabase.dto';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('user')
  @Public()
  @HttpCode(202)
  create(@Body() payload: SupabaseWebhookUserPayload) {
    this.logger.log('Received supabase user webhook', payload);

    // switch (payload.type) {
    //   case 'user.created':
    //     try {
    //       this.logger.debug(`Creating user ${payload.data.id} from webhook`);

    //       const payloadData = payload.data as UserCreatedData;

    //       const emailAddress =
    //         payloadData.email_addresses.find(
    //           (x) => x.id === payloadData.primary_email_address_id,
    //         )?.email_address ?? payloadData.email_addresses[0].email_address;

    //       await this.userService.createUser({
    //         id: payloadData.id,
    //         email: emailAddress,
    //         name: `${payloadData.first_name} ${payloadData.last_name}`,
    //         avatar_url: payloadData.profile_image_url,
    //       });
    //     } catch (e) {
    //       this.logger.error(`Failed to create user from webhook: ${e}`);
    //     }

    //     break;
    //   case 'user.deleted':
    //     try {
    //       this.logger.debug(`Deleting user ${payload.data.id} from webhook`);
    //       const payloadData = payload.data as UserDeletedData;
    //       await this.userService.delete(payloadData.id);
    //     } catch (e) {
    //       this.logger.error(`Failed to delete user from webhook: ${e}`);
    //     }
    //     break;
    //   case 'user.updated':
    //     try {
    //       this.logger.debug(`Updating user ${payload.data.id} from webhook`);
    //       const payloadData = payload.data as UserUpdatedData;
    //       const emailAddress =
    //         payloadData.email_addresses.find(
    //           (x) => x.id === payloadData.primary_email_address_id,
    //         )?.email_address ?? payloadData.email_addresses[0].email_address;

    //       await this.userService.updateUser({
    //         user_id: payloadData.id,
    //         dto: {
    //           email: emailAddress,
    //           name: `${payloadData.first_name} ${payloadData.last_name}`,
    //           profile_src: payloadData.profile_image_url,
    //         },
    //       });
    //     } catch (e) {
    //       this.logger.error(`Failed to delete user from webhook: ${e}`);
    //     }
    //     break;
    //   default:
    //     this.logger.warn(
    //       `Auth Webhook unhandled event type received: ${payload.type}`,
    //     );
    //     break;
    // }
  }
}
