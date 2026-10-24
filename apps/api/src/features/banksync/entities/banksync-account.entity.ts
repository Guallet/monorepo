import { BaseDbEntity } from 'src/database/BaseDbEntity';
import { Account } from 'src/features/accounts/entities/account.entity';
import { User } from 'src/features/users/entities/user.entity';
import {
  Column,
  Entity,
  ForeignKey,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('banksync_accounts')
@Index(
  'banksync_accounts_user_remote_unique',
  ['user_id', 'remote_bank_id', 'remote_account_id'],
  { unique: true },
)
export class BankSyncAccount extends BaseDbEntity {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_banksync_accounts',
  })
  id: string;

  @Column({ type: 'text' })
  @ForeignKey(() => User, 'id', {
    name: 'banksync_accounts_owner',
    onDelete: 'CASCADE',
  })
  user_id: string;

  @Column({ type: 'text' })
  remote_bank_id: string;

  @Column({ type: 'text' })
  remote_account_id: string;

  @Column({ type: 'uuid' })
  @ForeignKey(() => Account, 'id', {
    name: 'banksync_accounts_guallet_account',
    onDelete: 'CASCADE',
  })
  guallet_account_id: string;

  @Column({ type: 'boolean', default: true })
  is_linked: boolean;

  @Column({ type: 'timestamp', nullable: true })
  last_synced_at: Date | null;
}
