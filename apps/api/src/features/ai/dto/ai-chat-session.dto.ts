import { ApiProperty } from '@nestjs/swagger';
import { AiChatSession } from '../entities/ai-chat-session.entity';

export class AiChatSessionDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  agentId: string;
  @ApiProperty()
  agentName: string;
  @ApiProperty()
  title: string;
  @ApiProperty()
  createdAt: string;
  @ApiProperty()
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
