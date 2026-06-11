import { BaseDbEntity } from 'src/database/BaseDbEntity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AiAgent } from './ai-agent.entity';
import { AiChatMessage } from './ai-chat-message.entity';

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
  agent: AiAgent;

  @Column({ type: 'text' })
  title: string;

  @OneToMany(() => AiChatMessage, (message) => message.session)
  messages: AiChatMessage[];
}
