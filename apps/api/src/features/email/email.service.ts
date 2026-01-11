import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        'RESEND_API_KEY not configured. Email functionality will be disabled.',
      );
    }
    this.resend = new Resend(apiKey);
  }

  async sendImportCompletionEmail({
    to,
    userName,
    processedCount,
    failedCount,
  }: {
    to: string;
    userName: string;
    processedCount: number;
    failedCount: number;
  }): Promise<void> {
    try {
      const totalCount = processedCount + failedCount;
      const subject = 'CSV Import Complete';
      const html = this.generateImportCompletionEmailHtml({
        userName,
        processedCount,
        failedCount,
        totalCount,
      });

      const { error } = await this.resend.emails.send({
        from: this.configService.get<string>(
          'EMAIL_FROM',
          'Guallet <noreply@guallet.io>',
        ),
        to,
        subject,
        html,
      });

      if (error === null) {
        this.logger.log(`Import completion email sent to ${to}`);
      } else {
        this.logger.error('Resend API error:', error);
        // TODO: Notify the admin or take other actions as needed
      }
    } catch (error) {
      this.logger.error(
        `Failed to send import completion email to ${to}`,
        error,
      );
      // Don't throw - email failure shouldn't fail the entire import
    }
  }

  private generateImportCompletionEmailHtml(args: {
    userName: string;
    processedCount: number;
    failedCount: number;
    totalCount: number;
  }): string {
    const { userName, processedCount, failedCount, totalCount } = args;
    const status =
      failedCount === 0
        ? 'successfully completed'
        : 'completed with some errors';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; }
            .stats { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .stat-row { display: flex; justify-content: space-between; margin: 10px 0; }
            .success { color: #4CAF50; font-weight: bold; }
            .error { color: #f44336; font-weight: bold; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CSV Import Complete</h1>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              <p>Your CSV import has ${status}.</p>
              
              <div class="stats">
                <h3>Import Summary</h3>
                <div class="stat-row">
                  <span>Total transactions:</span>
                  <span>${totalCount}</span>
                </div>
                <div class="stat-row">
                  <span>Successfully imported:</span>
                  <span class="success">${processedCount}</span>
                </div>
                ${
                  failedCount > 0
                    ? `
                <div class="stat-row">
                  <span>Failed:</span>
                  <span class="error">${failedCount}</span>
                </div>
                `
                    : ''
                }
              </div>
              
              <p>You can now view your imported transactions in your Guallet account.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Guallet. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  async sendImportErrorEmail(args: {
    to: string;
    userName: string;
    errorMessage: string;
  }): Promise<void> {
    const { to, userName, errorMessage } = args;

    try {
      const subject = 'CSV Import Failed';
      const html = this.generateImportErrorEmailHtml({
        userName,
        errorMessage,
      });

      const { error } = await this.resend.emails.send({
        from: this.configService.get<string>(
          'EMAIL_FROM',
          'Guallet <noreply@guallet.io>',
        ),
        to,
        subject,
        html,
      });

      if (error === null) {
        this.logger.log(`Import error email sent to ${to}`);
      } else {
        this.logger.error('Resend API error:', error);
        // TODO: Notify the admin or take other actions as needed
      }
    } catch (error) {
      this.logger.error(`Failed to send import error email to ${to}`, error);
    }
  }

  private generateImportErrorEmailHtml(args: {
    userName: string;
    errorMessage: string;
  }): string {
    const { userName, errorMessage } = args;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f44336; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; }
            .error-box { background-color: #ffebee; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #f44336; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CSV Import Failed</h1>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              <p>Unfortunately, your CSV import could not be completed due to an error.</p>
              
              <div class="error-box">
                <strong>Error Details:</strong>
                <p>${errorMessage}</p>
              </div>
              
              <p>Please check your CSV file and try again. If the problem persists, please contact support.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Guallet. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
