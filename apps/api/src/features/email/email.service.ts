import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: Transporter | null;

  constructor(private readonly configService: ConfigService) {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT', 587);
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');
    const smtpSecure = this.configService.get<boolean>('SMTP_SECURE', false);

    if (!smtpHost) {
      this.logger.warn(
        'SMTP_HOST not configured. Email functionality will be disabled.',
      );
      this.transporter = null;
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth:
        smtpUser && smtpPass
          ? {
              user: smtpUser,
              pass: smtpPass,
            }
          : undefined,
    });
  }

  /**
   * Escapes HTML special characters to prevent HTML injection
   */
  private escapeHtml(text: string): string {
    const htmlEscapeMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    };
    return text.replaceAll(/[&<>"'/]/g, (char) => htmlEscapeMap[char] || char);
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
    if (!this.transporter) {
      this.logger.warn('Email not sent - SMTP not configured');
      return;
    }

    try {
      const totalCount = processedCount + failedCount;
      const subject = 'CSV Import Complete';
      const html = this.generateImportCompletionEmailHtml({
        userName,
        processedCount,
        failedCount,
        totalCount,
      });

      await this.transporter.sendMail({
        from: this.configService.get<string>(
          'EMAIL_FROM',
          'Guallet <noreply@guallet.io>',
        ),
        to,
        subject,
        html,
      });

      this.logger.log(`Import completion email sent to ${to}`);
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
    const escapedUserName = this.escapeHtml(userName);
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
              <p>Hello ${escapedUserName},</p>
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
    if (!this.transporter) {
      this.logger.warn('Email not sent - SMTP not configured');
      return;
    }

    const { to, userName, errorMessage } = args;

    try {
      const subject = 'CSV Import Failed';
      const html = this.generateImportErrorEmailHtml({
        userName,
        errorMessage,
      });

      await this.transporter.sendMail({
        from: this.configService.get<string>(
          'EMAIL_FROM',
          'Guallet <noreply@guallet.io>',
        ),
        to,
        subject,
        html,
      });

      this.logger.log(`Import error email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send import error email to ${to}`, error);
    }
  }

  private generateImportErrorEmailHtml(args: {
    userName: string;
    errorMessage: string;
  }): string {
    const { userName, errorMessage } = args;
    const escapedUserName = this.escapeHtml(userName);
    const escapedErrorMessage = this.escapeHtml(errorMessage);

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
              <p>Hello ${escapedUserName},</p>
              <p>Unfortunately, your CSV import could not be completed due to an error.</p>
              
              <div class="error-box">
                <strong>Error Details:</strong>
                <p>${escapedErrorMessage}</p>
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

  async sendExportCompletionEmail({
    to,
    userName,
    transactionCount,
    csvContent,
  }: {
    to: string;
    userName: string;
    transactionCount: number;
    csvContent: string;
  }): Promise<void> {
    if (!this.transporter) {
      this.logger.warn('Email not sent - SMTP not configured');
      return;
    }

    try {
      const subject = 'Your Data Export is Ready';
      const html = this.generateExportCompletionEmailHtml({
        userName,
        transactionCount,
      });

      await this.transporter.sendMail({
        from: this.configService.get<string>(
          'EMAIL_FROM',
          'Guallet <noreply@guallet.io>',
        ),
        to,
        subject,
        html,
        attachments: [
          {
            filename: `guallet-export-${new Date().toISOString().split('T')[0]}.csv`,
            content: csvContent,
          },
        ],
      });

      this.logger.log(`Export completion email sent to ${to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send export completion email to ${to}`,
        error,
      );
    }
  }

  private generateExportCompletionEmailHtml(args: {
    userName: string;
    transactionCount: number;
  }): string {
    const { userName, transactionCount } = args;
    const escapedUserName = this.escapeHtml(userName);

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
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Data Export is Ready</h1>
            </div>
            <div class="content">
              <p>Hello ${escapedUserName},</p>
              <p>Your data export has been completed successfully.</p>
              
              <div class="stats">
                <h3>Export Summary</h3>
                <div class="stat-row">
                  <span>Total transactions exported:</span>
                  <span class="success">${transactionCount}</span>
                </div>
              </div>
              
              <p>Your CSV file is attached to this email. You can open it with any spreadsheet application like Microsoft Excel, Google Sheets, or LibreOffice Calc.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Guallet. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  async sendExportErrorEmail(args: {
    to: string;
    userName: string;
    errorMessage: string;
  }): Promise<void> {
    if (!this.transporter) {
      this.logger.warn('Email not sent - SMTP not configured');
      return;
    }

    const { to, userName, errorMessage } = args;

    try {
      const subject = 'Data Export Failed';
      const html = this.generateExportErrorEmailHtml({
        userName,
        errorMessage,
      });

      await this.transporter.sendMail({
        from: this.configService.get<string>(
          'EMAIL_FROM',
          'Guallet <noreply@guallet.io>',
        ),
        to,
        subject,
        html,
      });

      this.logger.log(`Export error email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send export error email to ${to}`, error);
    }
  }

  private generateExportErrorEmailHtml(args: {
    userName: string;
    errorMessage: string;
  }): string {
    const { userName, errorMessage } = args;
    const escapedUserName = this.escapeHtml(userName);
    const escapedErrorMessage = this.escapeHtml(errorMessage);

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
              <h1>Data Export Failed</h1>
            </div>
            <div class="content">
              <p>Hello ${escapedUserName},</p>
              <p>Unfortunately, your data export could not be completed due to an error.</p>
              
              <div class="error-box">
                <strong>Error Details:</strong>
                <p>${escapedErrorMessage}</p>
              </div>
              
              <p>Please try again later. If the problem persists, please contact support.</p>
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
