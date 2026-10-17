import { Account } from 'src/features/accounts/entities/account.entity';
import { Category } from 'src/features/categories/entities/category.entity';
import { BaseDbEntity } from 'src/database/BaseDbEntity';
import { NordigenTransactionDto } from 'src/features/nordigen/dto/nordigen-transaction.dto';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { TransactionMetadata } from './transaction-metadata.model';

function parseNordigenDate(value: string | undefined, transactionId: string): Date {
  const invalidDate = () =>
    new Error(
      `Nordigen transaction ${transactionId} has no valid bookingDateTime or bookingDate`,
    );

  if (!value) throw invalidDate();

  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnlyMatch) {
    const [, yearText, monthText, dayText] = dateOnlyMatch;
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      throw invalidDate();
    }
    return date;
  }

  const timestampDate = new Date(value);
  if (!/^\d{4}-\d{2}-\d{2}T/.test(value) || Number.isNaN(timestampDate.getTime())) {
    throw invalidDate();
  }
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  const calendarDate = new Date(Date.UTC(year, month - 1, day));
  if (
    calendarDate.getUTCFullYear() !== year ||
    calendarDate.getUTCMonth() !== month - 1 ||
    calendarDate.getUTCDate() !== day
  ) {
    throw invalidDate();
  }
  return timestampDate;
}

@Entity('transactions')
export class Transaction extends BaseDbEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'decimal' })
  amount: number;

  @Column()
  currency: string;

  @Column()
  date: Date;

  @Index()
  @Column({ nullable: true, unique: true })
  // NOTE: In theory, we don't need this as it's already in the metadata
  // but it's useful for improving performance and make queries easier
  externalId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: TransactionMetadata | null;

  // relations
  @ManyToOne(() => Account, (account) => account.transactions)
  account: Relation<Account>;

  @Column({ nullable: true })
  accountId: string;

  @ManyToOne(() => Category, (category) => category.transactions, {
    onDelete: 'SET NULL',
  })
  category: Relation<Category>;

  @Column({ type: 'uuid', nullable: true })
  categoryId: string | null;

  // Mappers
  static fromNordigenDto(
    account_id: string,
    nordigenTransaction: NordigenTransactionDto,
  ) {
    const entity = new Transaction();
    entity.metadata = {
      provider: 'nordigen',
      data: nordigenTransaction,
    };
    entity.externalId = nordigenTransaction.transactionId;
    entity.amount = Number(nordigenTransaction.transactionAmount.amount);
    entity.currency = nordigenTransaction.transactionAmount.currency;
    entity.accountId = account_id;
    entity.date = parseNordigenDate(
      nordigenTransaction.bookingDateTime ?? nordigenTransaction.bookingDate,
      nordigenTransaction.transactionId,
    );

    entity.description = nordigenTransaction.remittanceInformationUnstructured;

    return entity;
  }
}
