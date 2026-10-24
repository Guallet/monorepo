import {
  Column,
  Entity,
  ForeignKey,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseDbEntity } from 'src/database/BaseDbEntity';
import { User } from '../../users/entities/user.entity';
import type {
  BankProviderId,
  ProviderAccount,
} from '../providers/bank-provider.interface';

@Entity('bank_connections')
@Index('bank_connections_owner_provider_unique', ['user_id', 'provider_id'], {
  unique: true,
})
export class BankConnection extends BaseDbEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  @ForeignKey(() => User, 'id', {
    name: 'bank_connections_owner',
    onDelete: 'CASCADE',
  })
  user_id: string;

  @Column({ type: 'text' })
  provider_id: BankProviderId;

  // API-key providers encrypt the key directly; Nordigen encrypts the secret pair.
  // This retains existing ciphertext during migration, without needing the key in SQL.
  @Column({ type: 'text', select: false })
  encrypted_credentials: string;

  @Column({ type: 'text', nullable: true })
  credential_hint: string | null;

  @Column({ type: 'integer', default: 1 })
  credential_version: number;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  accounts: ProviderAccount[];

  @Column({ type: 'timestamp', nullable: true })
  accounts_refreshed_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  last_synced_at: Date | null;
}
