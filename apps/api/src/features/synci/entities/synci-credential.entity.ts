import { BaseDbEntity } from 'src/database/BaseDbEntity';
import {
  Column,
  Entity,
  ForeignKey,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/features/users/entities/user.entity';

@Entity('synci_credentials')
@Index('synci_credentials_user_id_unique', ['user_id'], { unique: true })
export class SynciCredential extends BaseDbEntity {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_synci_credentials',
  })
  id: string;

  @Column({ type: 'text' })
  @ForeignKey(() => User, 'id', {
    name: 'synci_credential_owner',
    onDelete: 'CASCADE',
  })
  user_id: string;

  @Column({ type: 'text', select: false })
  encrypted_api_key: string;

  @Column({ type: 'text' })
  api_key_hint: string;
}
