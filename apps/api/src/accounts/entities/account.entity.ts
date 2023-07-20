import { Institution } from 'src/institutions/entities/insititution.entity';
import { NordigenAccount } from 'src/openbanking/entities/nordigenAccount.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AccountType {
  CURRENT_ACCOUNT = 'current-account',
  CREDIT_CARD = 'credit-card',
  SAVINGS = 'savings-account',
  INVESTMENT = 'investment',
  MORTGAGE = 'mortgage',
  LOAN = 'loan',
  PENSION = 'pension',
  UNKNOW = 'unknow',
}

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  name: string;

  @Column({ type: 'decimal' })
  balance: number;

  @Column()
  currency: string;

  @Column({
    type: 'enum',
    enum: AccountType,
    default: AccountType.UNKNOW,
  })
  type: AccountType;

  // relations
  @OneToOne(
    () => NordigenAccount,
    (nordigenAccount) => nordigenAccount.account,
    { onDelete: 'CASCADE' },
  ) // specify inverse side as a second parameter
  nordigenAccount: NordigenAccount;

  @OneToMany(() => Transaction, (transaction) => transaction.account, {
    onDelete: 'CASCADE',
  })
  transactions: Transaction[];

  @ManyToOne(() => Institution, (institution) => institution.accounts, {
    onDelete: 'NO ACTION',
  })
  institution: Institution;

  // other
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
