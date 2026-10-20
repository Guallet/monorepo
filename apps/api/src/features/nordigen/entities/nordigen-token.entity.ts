import { BaseDbEntity } from 'src/database/BaseDbEntity';
import {
  Column,
  Entity,
  ForeignKey,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/features/users/entities/user.entity';

// @Entity({ schema: 'nordigen' })
@Entity()
@Index('UQ_nordigen_token_user_id', ['user_id'], { unique: true })
export class NordigenToken extends BaseDbEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  @ForeignKey(() => User, 'id', {
    name: 'FK_nordigen_token_user',
    onDelete: 'CASCADE',
  })
  user_id: string;

  @Column({ type: 'text' })
  access: string;

  @Column({ type: 'text' })
  refresh: string;

  @Column()
  access_expires_on: Date;

  @Column()
  refresh_expires_on: Date;
}
