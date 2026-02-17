import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { TransactionsService } from '../../transactions/transactions.service';
import { EmailService } from '../../email/email.service';
import { UsersService } from '../../users/users.service';
import { OfeExportRequestDto } from '../dto/ofe-export-request.dto';
import { AccountsService } from '../../accounts/accounts.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationType } from '../../notifications/entities/notification.entity';

export const OFE_EXPORT_QUEUE = 'ofe-export';
export const OFE_EXPORT_JOB = 'process-ofe-export';

export interface OfeExportJobData {
  userId: string;
  dto: OfeExportRequestDto;
}

@Processor(OFE_EXPORT_QUEUE)
export class OfeExportProcessor extends WorkerHost {
  private readonly logger = new Logger(OfeExportProcessor.name);

  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly accountsService: AccountsService,
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {
    super();
  }

  async process(
    job: Job<OfeExportJobData>,
  ): Promise<{ transactionCount: number }> {
    const { userId, dto } = job.data;
    this.logger.log(`Processing OFE export job ${job.id} for user ${userId}`);

    try {
      const startDate = dto.startDate ? new Date(dto.startDate) : undefined;
      const endDate = dto.endDate ? new Date(dto.endDate) : undefined;

      if (startDate) startDate.setHours(0, 0, 0, 0);
      if (endDate) endDate.setHours(23, 59, 59, 999);

      const accounts = await this.accountsService.findAllUserAccounts(userId);
      const accountNames = new Map(accounts.map((a) => [a.id, a.name]));

      const transactions =
        await this.transactionsService.getAllUserTransactionsForExport({
          userId,
          accounts: dto.accounts,
          startDate,
          endDate,
        });

      const ofeContent = this.generateOfeContent(transactions, accountNames);

      await this.sendExportEmail(userId, ofeContent, transactions.length);
      await this.sendUserNotification(userId, false);

      this.logger.log(
        `OFE export job ${job.id} completed. Exported ${transactions.length} transactions.`,
      );

      return { transactionCount: transactions.length };
    } catch (error) {
      this.logger.error(
        `Error in OFE export job ${job.id} for user ${userId}`,
        error,
      );
      await this.sendErrorEmail(
        userId,
        error instanceof Error ? error.message : String(error),
      );
      await this.sendUserNotification(userId, true);
      throw error;
    }
  }

  private generateOfeContent(
    transactions: Array<{
      id: string;
      accountId: string;
      description: string;
      notes?: string;
      amount: number;
      currency: string;
      date: Date;
    }>,
    accountNames: Map<string, string>,
  ): string {
    const dtServer = this.formatOfeDate(new Date());
    const currency = transactions[0]?.currency || 'GBP';
    const stmtTrns = transactions
      .map((tx) => {
        const amount = tx.amount.toFixed(2);
        const trnType = tx.amount < 0 ? 'DEBIT' : 'CREDIT';
        const description = this.escapeOfe(tx.description || '');
        const memo = this.escapeOfe(tx.notes || '');
        const accountName = this.escapeOfe(
          accountNames.get(tx.accountId) || '',
        );
        return `<STMTTRN><TRNTYPE>${trnType}</TRNTYPE><DTPOSTED>${this.formatOfeDate(tx.date)}</DTPOSTED><TRNAMT>${amount}</TRNAMT><FITID>${tx.id}</FITID><NAME>${description}</NAME><MEMO>${memo}</MEMO><ACCTNAME>${accountName}</ACCTNAME></STMTTRN>`;
      })
      .join('');

    return [
      'OFXHEADER:100',
      'DATA:OFXSGML',
      'VERSION:102',
      'SECURITY:NONE',
      'ENCODING:USASCII',
      'CHARSET:1252',
      'COMPRESSION:NONE',
      'OLDFILEUID:NONE',
      'NEWFILEUID:NONE',
      '',
      `<OFX>
<SIGNONMSGSRSV1><SONRS><STATUS><CODE>0</CODE><SEVERITY>INFO</SEVERITY></STATUS><DTSERVER>${dtServer}</DTSERVER><LANGUAGE>ENG</LANGUAGE></SONRS></SIGNONMSGSRSV1>
<BANKMSGSRSV1><STMTTRNRS><TRNUID>1</TRNUID><STATUS><CODE>0</CODE><SEVERITY>INFO</SEVERITY></STATUS><STMTRS><CURDEF>${currency}</CURDEF><BANKACCTFROM><BANKID>GUALLET</BANKID><ACCTID>EXPORT</ACCTID><ACCTTYPE>CHECKING</ACCTTYPE></BANKACCTFROM><BANKTRANLIST>${stmtTrns}</BANKTRANLIST></STMTRS></STMTTRNRS></BANKMSGSRSV1>
</OFX>`,
    ].join('\n');
  }

  private formatOfeDate(date: Date): string {
    const year = date.getUTCFullYear();
    const month = `${date.getUTCMonth() + 1}`.padStart(2, '0');
    const day = `${date.getUTCDate()}`.padStart(2, '0');
    const hours = `${date.getUTCHours()}`.padStart(2, '0');
    const minutes = `${date.getUTCMinutes()}`.padStart(2, '0');
    const seconds = `${date.getUTCSeconds()}`.padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  private escapeOfe(value: string): string {
    return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
  }

  private async sendExportEmail(
    userId: string,
    ofeContent: string,
    transactionCount: number,
  ): Promise<void> {
    const user = await this.usersService.findUserData(userId);
    if (!user?.email) {
      return;
    }

    await this.emailService.sendExportCompletionEmail({
      to: user.email,
      userName: user.name || 'User',
      transactionCount,
      attachmentContent: ofeContent,
      attachmentFilename: `guallet-export-${new Date().toISOString().split('T')[0]}.ofx`,
      exportFormatLabel: 'OFX',
    });
  }

  private async sendErrorEmail(
    userId: string,
    errorMessage: string,
  ): Promise<void> {
    const user = await this.usersService.findUserData(userId);
    if (!user?.email) {
      return;
    }

    await this.emailService.sendExportErrorEmail({
      to: user.email,
      userName: user.name || 'User',
      errorMessage,
    });
  }

  private async sendUserNotification(
    userId: string,
    isError: boolean,
  ): Promise<void> {
    await this.notificationsService.createSystemNotification({
      userId,
      message: isError
        ? 'Export data finished with error'
        : 'Export data finished successfully',
      icon: isError ? '⚠️' : '🔔',
      type: isError ? NotificationType.IMPORTANT : NotificationType.INFO,
    });
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<OfeExportJobData>) {
    this.logger.log(`Job ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<OfeExportJobData>, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`);
  }
}
