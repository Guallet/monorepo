import { AccountType } from './accountType.model.js';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Institution } from '../../../features/institutions/entities/institution.entity.js';
import { Transaction } from '../../../features/transactions/entities/transaction.entity.js';
import type { Relation } from 'typeorm';
import {
  CreditCardProperties,
  CurrentAccountProperties,
  LoanAccountProperties,
  MortgageAccountProperties,
  SavingAccountProperties,
} from './account-properties.model.js';
import { AccountSource } from './accountSource.model.js';
import { BaseDbEntity } from '../../../database/BaseDbEntity.js';

@Entity('accounts')
export class Account extends BaseDbEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  name: string;

  @Column({ type: 'decimal' })
  balance: number;

  @Column()
  // @Field()
  currency: string;

  @Column({
    type: 'enum',
    enum: AccountType,
    default: AccountType.UNKNOWN,
  })
  type: AccountType;

  @Column({
    type: 'enum',
    enum: AccountSource,
    default: AccountSource.UNKNOWN,
  })
  source: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  source_name: string;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  public properties:
    | null
    | CurrentAccountProperties
    | CreditCardProperties
    | SavingAccountProperties
    | MortgageAccountProperties
    | LoanAccountProperties;

  // relations
  @OneToMany(() => Transaction, (transaction) => transaction.account, {
    onDelete: 'CASCADE',
  })
  transactions: Transaction[];

  @ManyToOne(() => Institution, (institution) => institution.accounts)
  institution: Relation<Institution>;

  @Column({ nullable: true })
  institutionId: string | null;
}
