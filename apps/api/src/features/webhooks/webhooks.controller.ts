import { Controller, Logger } from '@nestjs/common';
import { WebhooksService } from './webhooks.service.js';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);
  constructor(private readonly webhooksService: WebhooksService) {}

  // Ideas for new webhooks?
}
