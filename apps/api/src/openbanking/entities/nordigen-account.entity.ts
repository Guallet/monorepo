import { ExternalCashAccountType1Code } from 'src/nordigen/dto/ExternalCashAccountType1Code.helper';
import {
  NordigenAccountDto,
  NordigenAccountMetadataDto,
  NordigenAccountStatus,
} from 'src/nordigen/dto/nordigen-account.dto';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('nordigen_accounts')
export class NordigenAccount {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: true })
  resource_id?: string;

  @Column({ nullable: true })
  created?: Date;

  @Column({ nullable: true })
  last_accessed?: Date;

  @Column({ nullable: true })
  last_refreshed?: Date;

  @Column({ nullable: true })
  iban?: string;

  @Column({ nullable: false })
  institution_id?: string;

  @Column({ nullable: true })
  status?: string;

  @Column({ nullable: true })
  bic?: string;

  @Column({ nullable: true })
  owner_name?: string;

  //metadata
  @Column({ nullable: true })
  metadata_status?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata_raw?: NordigenAccountMetadataDto;

  //details
  @Column({ type: 'jsonb', nullable: true })
  details_raw?: NordigenAccountDto;

  @Column({ nullable: true })
  currency?: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  product?: string;

  // @Column({ nullable: true })
  @Column({
    type: 'enum',
    enum: ExternalCashAccountType1Code,
    default: ExternalCashAccountType1Code.UNKNOWN,
    nullable: true,
  })
  cashAccountType?: ExternalCashAccountType1Code;

  @Column({ nullable: true })
  maskedPan?: string;

  @Column({ nullable: true })
  details?: string;

  // Relations
  @Column({ nullable: true })
  linked_account_id?: string;

  // other
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
