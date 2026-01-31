import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import * as Handlebars from 'handlebars';
import * as fs from 'node:fs';
import * as path from 'node:path';

interface SendEmailOptions {
  to: string;
  subject: string;
  template: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: Record<string, any>;
  attachments?: nodemailer.SendMailOptions['attachments'];
}

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;
  private readonly templatesDir = path.join(__dirname, 'templates');
  private readonly compiledTemplates: Map<string, Handlebars.TemplateDelegate> =
    new Map();
  private defaultFrom: string;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.initializeTransport();
    this.loadTemplates();
    this.defaultFrom = this.configService.get<string>(
      'EMAIL_FROM',
      'Guallet <noreply@guallet.io>',
    );
  }

  private initializeTransport() {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT', 465);
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');
    const smtpSecure = this.configService.get<boolean>('SMTP_SECURE', true);

    if (!smtpHost) {
      this.logger.warn(
        'SMTP_HOST not configured. Email functionality will be disabled.',
      );
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
   * Load and compile all handlebars templates
   */
  private loadTemplates(): void {
    if (!fs.existsSync(this.templatesDir)) {
      this.logger.warn(`Templates directory not found: ${this.templatesDir}`);
      return;
    }

    const files = fs
      .readdirSync(this.templatesDir)
      .filter((file) => file.endsWith('.hbs'));

    for (const templateFile of files) {
      try {
        const templatePath = path.join(this.templatesDir, templateFile);
        const templateContent = fs.readFileSync(templatePath, 'utf-8');
        const templateName = templateFile.replace('.hbs', '');
        this.compiledTemplates.set(
          templateName,
          Handlebars.compile(templateContent),
        );
      } catch (error) {
        this.logger.error(`Failed to load template ${templateFile}: ${error}`);
      }
    }
    this.logger.log(`Loaded ${this.compiledTemplates.size} email templates`);
  }

  /**
   * Render a template with the provided data
   */
  private renderTemplate(
    templateName: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: Record<string, any>,
  ): string {
    const template = this.compiledTemplates.get(templateName);
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }
    return template(data);
  }

  private async sendEmail(options: SendEmailOptions): Promise<void> {
    if (!this.transporter) {
      this.logger.warn('Email not sent - SMTP not configured');
      return;
    }

    const { to, subject, template, context, attachments } = options;

    try {
      const html = this.renderTemplate(template, context);

      await this.transporter.sendMail({
        from: this.defaultFrom,
        to,
        subject,
        html,
        attachments,
      });

      this.logger.log(`${template} email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send ${template} email to ${to}`, error);
      // We don't throw here to avoid failing calling processes
    }
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
    const totalCount = processedCount + failedCount;
    await this.sendEmail({
      to,
      subject: 'CSV Import Complete',
      template: 'import-completion',
      context: {
        userName,
        processedCount,
        failedCount,
        totalCount,
        status:
          failedCount === 0
            ? 'successfully completed'
            : 'completed with some errors',
        showFailedCount: failedCount > 0,
        year: new Date().getFullYear(),
      },
    });
  }

  async sendImportErrorEmail({
    to,
    userName,
    errorMessage,
  }: {
    to: string;
    userName: string;
    errorMessage: string;
  }): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'CSV Import Failed',
      template: 'import-error',
      context: {
        userName,
        errorMessage,
        year: new Date().getFullYear(),
      },
    });
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
    await this.sendEmail({
      to,
      subject: 'Your Data Export is Ready',
      template: 'export-completion',
      context: {
        userName,
        transactionCount,
        year: new Date().getFullYear(),
      },
      attachments: [
        {
          filename: `guallet-export-${new Date().toISOString().split('T')[0]}.csv`,
          content: csvContent,
        },
      ],
    });
  }

  async sendExportErrorEmail({
    to,
    userName,
    errorMessage,
  }: {
    to: string;
    userName: string;
    errorMessage: string;
  }): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Data Export Failed',
      template: 'export-error',
      context: {
        userName,
        errorMessage,
        year: new Date().getFullYear(),
      },
    });
  }

  async sendNordigenCredentialsErrorEmail(args: {
    to: string;
    userName: string;
  }): Promise<void> {
    const { to, userName } = args;
    await this.sendEmail({
      to,
      subject: 'Nordigen Credentials Error',
      template: 'nordigen-credentials-error',
      context: {
        userName,
        year: new Date().getFullYear(),
      },
    });
  }
}
