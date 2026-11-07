import { BaseDbEntity } from 'src/database/BaseDbEntity';
import { Account } from '../../accounts/entities/account.entity';
import { User } from '../../users/entities/user.entity';
import {
  Column,
  Entity,
  ForeignKey,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { BankProviderId } from '../providers/bank-provider.interface';

@Entity('connected_accounts')
@Index(
  'connected_accounts_owner_provider_remote_unique',
  ['user_id', 'provider', 'remote_account_id'],
  { unique: true },
)
export class ConnectedAccount extends BaseDbEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  @ForeignKey(() => User, 'id', {
    name: 'connected_accounts_owner',
    onDelete: 'CASCADE',
  })
  user_id: string;

  @Column({ type: 'text' })
  provider: BankProviderId;

  // BankSync uses the opaque [bankId, accountId] identifier shared by the API.
  @Column({ type: 'text' })
  remote_account_id: string;

  @Column({ type: 'text', nullable: true })
  remote_connection_id: string | null;

  @Column({ type: 'uuid' })
  @ForeignKey(() => Account, 'id', {
    name: 'connected_accounts_account',
    onDelete: 'CASCADE',
  })
  guallet_account_id: string;

  @Column({ type: 'boolean', default: true })
  is_linked: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  last_synced_at: Date | null;

  // Original provider account payload. Legacy links have no saved response.
  @Column({ type: 'jsonb', nullable: true, select: false })
  raw: Record<string, unknown> | null;
}
