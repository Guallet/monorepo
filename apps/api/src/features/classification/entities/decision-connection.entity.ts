import { User } from '../../users/entities/user.entity';
import {
  Check,
  ForeignKey,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseDbEntity } from 'src/database/BaseDbEntity';

@Entity('decision_connections')
@Check(
  'decision_thresholds',
  'min_confidence BETWEEN 0 AND 1 AND min_margin BETWEEN 0 AND 1',
)
export class DecisionConnection extends BaseDbEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index({ unique: true })
  @ForeignKey(() => User, 'id', {
    name: 'decision_connection_owner',
    onDelete: 'CASCADE',
  })
  @Column('text')
  user_id: string;
  @Column('text') display_name: string;
  @Column('text') base_url: string;
  @Column('text', { default: 'jev-latest' }) model: string;
  @Column('text', { default: 'none' }) auth_type:
    | 'none'
    | 'bearer'
    | 'header'
    | 'basic';
  @Column('text', { nullable: true }) auth_header_name: string | null;
  @Column('text', { nullable: true, select: false }) encrypted_credentials:
    | string
    | null;
  @Column('text', { nullable: true }) credential_hint: string | null;
  @Column({ default: 1 }) revision: number;
  @Column('double precision', { default: 0.7 }) min_confidence: number;
  @Column('double precision', { default: 0.1 }) min_margin: number;
  @Column({ default: false }) send_notes: boolean;
  @Column({ default: false }) is_active: boolean;
  @Column('text', { nullable: true }) last_test_status: string | null;
  @Column('timestamptz', { nullable: true }) last_test_at: Date | null;
}
