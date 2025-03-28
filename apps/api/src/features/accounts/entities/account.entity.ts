import { AccountType } from './accountType.model';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Institution } from 'src/features/institutions/entities/institution.entity';
import { Transaction } from 'src/features/transactions/entities/transaction.entity';
import {
  CreditCardProperties,
  CurrentAccountProperties,
  SavingAccountProperties,
} from './account-properties.model';
import { AccountSource } from './accountSource.model';
import { BaseDbEntity } from 'src/database/BaseDbEntity';

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
    | CurrentAccountProperties
    | CreditCardProperties
    | SavingAccountProperties;

  // relations
  @OneToMany(() => Transaction, (transaction) => transaction.account, {
    onDelete: 'CASCADE',
  })
  transactions: Transaction[];

  @ManyToOne(() => Institution, (institution) => institution.accounts)
  institution: Institution;

  @Column({ nullable: true })
  institutionId: string;
}
