import { Transaction } from '../../transactions/entities/transaction.entity';
import { User } from '../../users/entities/user.entity';
import {
  ForeignKey,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseDbEntity } from 'src/database/BaseDbEntity';

// This durable work ledger is also the transactional outbox. Redis is delivery,
// not the source of truth: unfinished rows are always eligible for redispatch.
@Entity('classification_work')
@Index(['user_id', 'status', 'available_at'])
export class ClassificationWork extends BaseDbEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ForeignKey(() => User, 'id', {
    name: 'classification_work_owner',
    onDelete: 'CASCADE',
  })
  @Column('text')
  user_id: string;
  @Index() @Column('uuid') run_id: string;
  @ForeignKey(() => Transaction, 'id', {
    name: 'classification_work_transaction',
    onDelete: 'CASCADE',
  })
  @Column('uuid')
  transaction_id: string;
  @Column() transaction_revision: number;
  @Column('text', { default: 'queued' }) status:
    | 'queued'
    | 'suggested'
    | 'abstained'
    | 'skipped'
    | 'failed';
  @Column({ default: 0 }) attempts: number;
  @Column('timestamptz', { default: () => 'CURRENT_TIMESTAMP' })
  available_at: Date;
  @Column('text', { nullable: true }) error_code: string | null;
  @Column('int', { nullable: true }) latency_ms: number | null;
}
