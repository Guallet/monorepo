import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { BaseDbEntity } from 'src/database/BaseDbEntity';
import { User } from '../../users/entities/user.entity';
import { BankConnection } from './bank-connection.entity';

@Entity('bank_authorizations')
export class BankAuthorization extends BaseDbEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  user_id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'bank_authorizations_owner',
  })
  user: Relation<User>;

  @Column({ type: 'uuid' })
  connection_id: string;

  @ManyToOne(() => BankConnection, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'connection_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'bank_authorizations_connection',
  })
  connection: Relation<BankConnection>;

  @Column({ type: 'text' })
  remote_id: string;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  account_ids: string[];

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date | null;

  @Column({ type: 'timestamp' })
  expires_at: Date;
}
