import { Account } from 'src/accounts/entities/account.entity';
import { Category } from 'src/categories/entities/category.entity';
import { NordigenTransactionDto } from 'src/nordigen/dto/transaction.dto';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nordigen_id: string;

  @Column()
  original_desciption: string;

  @Column({ nullable: true })
  desciption: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ type: 'decimal' })
  amount: number;

  @Column()
  currency: string;

  @Column()
  date: Date;

  // relations
  @ManyToOne(() => Account, (account) => account.transactions)
  account: Account;

  @ManyToOne(() => Category, (category) => category.transactions, {
    onDelete: 'SET NULL',
  })
  category: Category;

  // other
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}

export function transactionFromNordigen(
  nordigenTransaction: NordigenTransactionDto,
  account: Account,
): Transaction {
  const entity = new Transaction();
  entity.nordigen_id = nordigenTransaction.transactionId;
  entity.amount = Number(nordigenTransaction.transactionAmount.amount);
  entity.currency = nordigenTransaction.transactionAmount.currency;
  entity.account = account;
  entity.date = nordigenTransaction.bookingDate;

  entity.original_desciption =
    nordigenTransaction.remittanceInformationUnstructured;
  return entity;
}
