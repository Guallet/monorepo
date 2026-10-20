import { BaseDbEntity } from 'src/database/BaseDbEntity';
import { User } from 'src/features/users/entities/user.entity';
import {
  Column,
  Entity,
  ForeignKey,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('banksync_credentials')
@Index('banksync_credentials_user_id_unique', ['user_id'], { unique: true })
export class BankSyncCredential extends BaseDbEntity {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_banksync_credentials',
  })
  id: string;

  @Column({ type: 'text' })
  @ForeignKey(() => User, 'id', {
    name: 'banksync_credential_owner',
    onDelete: 'CASCADE',
  })
  user_id: string;

  @Column({ type: 'text', select: false })
  encrypted_api_key: string;

  @Column({ type: 'text' })
  api_key_hint: string;
}
