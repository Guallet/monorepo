import { Account } from 'src/accounts/entities/account.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ExternalCashAccountType1Code } from '../helpers/ExternalCashAccountType1Code.helper';

// @Entity({ schema: 'nordigen' })
@Entity()
export class NordigenAccount {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: true })
  resource_id: string;

  @Column({ nullable: true })
  created: Date;

  @Column({ nullable: true })
  last_accessed: Date;

  @Column({ nullable: true })
  last_refreshed: Date;

  @Column({ nullable: true })
  iban: string;

  @Column({ nullable: false })
  institution_id: string;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  bic: string;

  @Column({ nullable: true })
  owner_name: string;

  //metadata
  //details
  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  product: string;

  // @Column({ nullable: true })
  @Column({
    type: 'enum',
    enum: ExternalCashAccountType1Code,
    default: ExternalCashAccountType1Code.UNKNOW,
  })
  cashAccountType: ExternalCashAccountType1Code;

  @Column({ nullable: true })
  maskedPan: string;

  @Column({ nullable: true })
  details: string;
  //balances
  //transactions

  // Relations
  @OneToOne(() => Account, (account) => account.nordigenAccount, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  account: Account;

  // other
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
