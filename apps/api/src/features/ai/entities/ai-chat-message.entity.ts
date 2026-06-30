import { BaseDbEntity } from 'src/database/BaseDbEntity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AiChatSession } from './ai-chat-session.entity';

export type AiChatMessageRole = 'user' | 'assistant';

@Entity('ai_chat_messages')
export class AiChatMessage extends BaseDbEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  user_id: string;

  @Column({ type: 'uuid' })
  session_id: string;

  @ManyToOne(() => AiChatSession, (session) => session.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session: AiChatSession;

  @Column({ type: 'text' })
  role: AiChatMessageRole;

  @Column({ type: 'text' })
  content: string;
}
