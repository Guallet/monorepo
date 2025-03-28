import { Account } from 'src/accounts/entities/account.entity';
import { Category } from 'src/categories/entities/category.entity';
import { BaseDbEntity } from 'src/core/baseDbEntity';
import { NordigenTransactionDto } from 'src/nordigen/dto/nordigen-transaction.dto';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { TransactionMetadata } from './transaction-metadata.model';

@Entity('transactions')
export class Transaction extends BaseDbEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  notes: string;

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
  metadata: TransactionMetadata;

  // relations
  @ManyToOne(() => Account, (account) => account.transactions)
  account: Relation<Account>;

  @Column({ nullable: true })
  accountId: string;

  @ManyToOne(() => Category, (category) => category.transactions, {
    onDelete: 'SET NULL',
  })
  category: Category;

  @Column({ nullable: true })
  categoryId: string;

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
    entity.date = nordigenTransaction.bookingDateTime;

    entity.description = nordigenTransaction.remittanceInformationUnstructured;

    return entity;
  }
}
