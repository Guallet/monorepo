import { Module } from '@nestjs/common';
import { EmailService } from './email.service.js';
import { EmailEventListener } from './email-event.listener.js';

@Module({
  providers: [EmailService, EmailEventListener],
  exports: [EmailService],
})
export class EmailModule {}
