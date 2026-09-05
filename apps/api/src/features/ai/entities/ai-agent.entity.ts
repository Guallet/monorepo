import { BaseDbEntity } from '../../../database/BaseDbEntity.js';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AiProviderConnection } from './ai-provider-connection.entity.js';
import type { Relation } from 'typeorm';

@Entity('ai_agents')
export class AiAgent extends BaseDbEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  user_id: string;

  @Column({ type: 'uuid' })
  connection_id: string;

  @ManyToOne(() => AiProviderConnection, (connection) => connection.agents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'connection_id' })
  connection: Relation<AiProviderConnection>;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  model_id: string;

  @Column({ type: 'text', nullable: true })
  model_name: string | null;

  @Column({ type: 'text', nullable: true })
  custom_prompt: string | null;
}
