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

      if (error) {
        this.logger.error('Resend API error:', error);
        // TODO: Notify the admin or take other actions as needed
      } else {
        this.logger.log(`Import completion email sent to ${to}`);
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
                ${failedCount > 0
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

      if (error) {
        this.logger.error('Resend API error:', error);
        // TODO: Notify the admin or take other actions as needed
      } else {
        this.logger.log(`Import error email sent to ${to}`);
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

  async sendNordigenCredentialsErrorEmail(args: {
    to: string;
    userName: string;
  }): Promise<void> {
    const { to, userName } = args;

    try {
      const subject = "Nordigen Credentials Error";
      const html = this.generateNordigenCredentialsErrorEmailHtml({ userName });

      const { error } = await this.resend.emails.send({
        from: this.configService.get<string>(
          "EMAIL_FROM",
          "Guallet <noreply@guallet.io>"
        ),
        to,
        subject,
        html,
      });

      if (error === null) {
        this.logger.log(`Nordigen credentials error email sent to ${to}`);
      } else {
        this.logger.error("Resend API error:", error);
      }
    } catch (error) {
      this.logger.error(
        `Failed to send Nordigen credentials error email to ${to}`,
        error
      );
    }
  }

  private generateNordigenCredentialsErrorEmailHtml(args: {
    userName: string;
  }): string {
    const { userName } = args;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #ff9800; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; }
            .warning-box { background-color: #fff3e0; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #ff9800; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Nordigen Credentials Error</h1>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              <p>We were unable to sync your bank accounts because there was an issue with your Nordigen credentials.</p>
              
              <div class="warning-box">
                <strong>What you can do:</strong>
                <ul>
                  <li>Check that your Nordigen Secret ID and Secret Key are correct</li>
                  <li>Make sure your Nordigen API access is still active</li>
                  <li>Update your credentials in the Settings page</li>
                </ul>
              </div>
              
              <p>Once you've updated your credentials, your accounts will be synced automatically during the next scheduled sync.</p>
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
    try {
      const subject = "Your Data Export is Ready";
      const html = this.generateExportCompletionEmailHtml({
        userName,
        transactionCount,
      });

      const { error } = await this.resend.emails.send({
        from: this.configService.get<string>(
          "EMAIL_FROM",
          "Guallet <noreply@guallet.io>"
        ),
        to,
        subject,
        html,
        attachments: [
          {
            filename: `guallet-export-${new Date().toISOString().split("T")[0]}.csv`,
            content: Buffer.from(csvContent).toString("base64"),
          },
        ],
      });

      if (error) {
        this.logger.error("Resend API error:", error);
      } else {
        this.logger.log(`Export completion email sent to ${to}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to send export completion email to ${to}`,
        error
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
    const { to, userName, errorMessage } = args;

    try {
      const subject = "Data Export Failed";
      const html = this.generateExportErrorEmailHtml({
        userName,
        errorMessage,
      });

      const { error } = await this.resend.emails.send({
        from: this.configService.get<string>(
          "EMAIL_FROM",
          "Guallet <noreply@guallet.io>"
        ),
        to,
        subject,
        html,
      });

      if (error) {
        this.logger.error("Resend API error:", error);
      } else {
        this.logger.log(`Export error email sent to ${to}`);
      }
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
