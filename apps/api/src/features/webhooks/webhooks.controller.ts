import { Controller, Logger } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { UsersService } from 'src/features/users/users.service';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);
  constructor(
    private readonly webhooksService: WebhooksService,
    private readonly userService: UsersService,
  ) {}

  // Ideas for new webhooks?
}
