import { BaseDbEntity } from 'src/database/BaseDbEntity';
import {
  Column,
  Entity,
  ForeignKey,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/features/users/entities/user.entity';

@Entity('nordigen_credentials')
@Index('UQ_nordigen_credentials_user_id', ['user_id'], { unique: true })
export class NordigenCredentials extends BaseDbEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  @ForeignKey(() => User, 'id', {
    name: 'FK_nordigen_credentials_user',
    onDelete: 'CASCADE',
  })
  user_id: string;

  @Column({ type: 'text', select: false })
  encrypted_credentials: string;

  @Column({ type: 'text', nullable: true })
  credential_hint: string | null;
}
