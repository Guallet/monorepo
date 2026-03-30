import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailEventListener } from './email-event.listener';

@Module({
  providers: [EmailService, EmailEventListener],
  exports: [EmailService],
})
export class EmailModule {}
