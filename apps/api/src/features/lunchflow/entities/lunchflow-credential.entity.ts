import { BaseDbEntity } from 'src/database/BaseDbEntity';
import {
  Column,
  Entity,
  ForeignKey,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/features/users/entities/user.entity';

@Entity('lunchflow_credentials')
@Index('lunchflow_credentials_user_id_unique', ['user_id'], { unique: true })
export class LunchFlowCredential extends BaseDbEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  @ForeignKey(() => User, 'id', {
    name: 'lunchflow_credential_owner',
    onDelete: 'CASCADE',
  })
  user_id: string;

  @Column({ type: 'text', select: false })
  encrypted_api_key: string;

  @Column({ type: 'text' })
  api_key_hint: string;
}
