import { AiChatSession } from '../entities/ai-chat-session.entity.js';
import { ApiProperty } from '@nestjs/swagger';

export class AiChatSessionDto {
  @ApiProperty({ format: 'uuid' })
  id: string;
  @ApiProperty({ format: 'uuid' })
  agentId: string;
  @ApiProperty()
  agentName: string;
  @ApiProperty()
  title: string;
  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: string;
  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: string;

  static fromDomain(domain: AiChatSession): AiChatSessionDto {
    return {
      id: domain.id,
      agentId: domain.agent_id,
      agentName: domain.agent?.name ?? '',
      title: domain.title,
      createdAt: domain.created_at.toISOString(),
      updatedAt: domain.updated_at.toISOString(),
    };
  }
}
