import { BaseDbEntity } from '../../../database/BaseDbEntity.js';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AiAgent } from './ai-agent.entity.js';
import { AiChatMessage } from './ai-chat-message.entity.js';
import type { Relation } from 'typeorm';

@Entity('ai_chat_sessions')
export class AiChatSession extends BaseDbEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  user_id: string;

  @Column({ type: 'uuid' })
  agent_id: string;

  @ManyToOne(() => AiAgent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agent_id' })
  agent: Relation<AiAgent>;

  @Column({ type: 'text' })
  title: string;

  @OneToMany(() => AiChatMessage, (message) => message.session)
  messages: AiChatMessage[];
}
