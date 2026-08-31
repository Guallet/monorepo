import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from './email.service.js';

@Injectable()
export class EmailEventListener {
  constructor(private readonly emailService: EmailService) {}

  @OnEvent('auth.email.password-reset')
  async handlePasswordReset(payload: {
    to: string;
    url: string;
    userName: string;
  }) {
    await this.emailService.sendPasswordResetEmail(payload);
  }

  @OnEvent('auth.email.otp')
  async handleOtp(payload: { to: string; otp: string; type: string }) {
    await this.emailService.sendAuthOtpEmail(payload);
  }

  @OnEvent('auth.email.magic-link')
  async handleMagicLink(payload: { to: string; url: string }) {
    await this.emailService.sendAuthMagicLinkEmail(payload);
  }
}
