import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { BaseDbEntity } from 'src/database/BaseDbEntity';
import { User } from 'src/features/users/entities/user.entity';

@Entity('user_credentials')
@Index('user_credentials_owner_key_unique', ['user_id', 'key'], {
  unique: true,
})
export class UserCredential extends BaseDbEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  user_id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'user_credentials_owner',
  })
  user: Relation<User>;

  @Column({ type: 'text' })
  key: string;

  @Column({ type: 'text', select: false })
  encrypted_credentials: string;

  @Column({ type: 'text', nullable: true })
  hint: string | null;

  @Column({ type: 'integer', default: 1 })
  version: number;
}
