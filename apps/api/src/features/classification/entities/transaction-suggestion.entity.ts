import { Category } from '../../categories/entities/category.entity';
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

export type SuggestionStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'dismissed'
  | 'superseded';
@Entity('transaction_suggestions')
@Index(['transaction_id'], { unique: true, where: "status = 'pending'" })
export class TransactionSuggestion extends BaseDbEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index()
  @ForeignKey(() => User, 'id', {
    name: 'suggestion_owner',
    onDelete: 'CASCADE',
  })
  @Column('text')
  user_id: string;
  @ForeignKey(() => Transaction, 'id', {
    name: 'suggestion_transaction',
    onDelete: 'CASCADE',
  })
  @Column('uuid')
  transaction_id: string;
  @Column('text') source: 'rule' | 'decision_api';
  @Column('uuid', { nullable: true }) rule_id: string | null;
  @Column('uuid', { nullable: true }) connection_id: string | null;
  @ForeignKey(() => Category, 'id', {
    name: 'suggestion_category',
    onDelete: 'SET NULL',
  })
  @Column('uuid', { nullable: true })
  suggested_category_id: string | null;
  @Column('double precision', { nullable: true }) confidence: number | null;
  @Column('text', { default: 'pending' }) status: SuggestionStatus;
  @Column('text') fingerprint: string;
  @Column('uuid', { nullable: true }) resolved_category_id: string | null;
  @Column('timestamptz', { nullable: true }) resolved_at: Date | null;
}
