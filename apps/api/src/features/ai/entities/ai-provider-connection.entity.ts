import { BaseDbEntity } from '../../../database/BaseDbEntity.js';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AiAgent } from './ai-agent.entity.js';
import { AiProvider } from './ai-provider.enum.js';

@Entity('ai_provider_connections')
export class AiProviderConnection extends BaseDbEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  user_id: string;

  @Column({
    type: 'enum',
    enum: AiProvider,
  })
  provider: AiProvider;

  @Column({ type: 'text' })
  display_name: string;

  @Column({ type: 'text' })
  encrypted_token: string;

  @Column({ type: 'text', nullable: true })
  token_hint: string | null;

  @OneToMany(() => AiAgent, (agent) => agent.connection)
  agents: AiAgent[];
}
