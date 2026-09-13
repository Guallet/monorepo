import { ApiProperty } from '@nestjs/swagger';
import {
  AiChatMessage,
  AiChatMessageRole,
} from '../entities/ai-chat-message.entity';

export class AiChatMessageDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  sessionId: string;
  @ApiProperty({ enum: ['user', 'assistant'] })
  role: AiChatMessageRole;
  @ApiProperty()
  content: string;
  @ApiProperty()
  createdAt: string;

  static fromDomain(domain: AiChatMessage): AiChatMessageDto {
    return {
      id: domain.id,
      sessionId: domain.session_id,
      role: domain.role,
      content: domain.content,
      createdAt: domain.created_at.toISOString(),
    };
  }
}
