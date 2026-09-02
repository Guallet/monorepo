import type {
  AiChatMessage,
  AiChatMessageRole,
} from '../entities/ai-chat-message.entity.js';
import { ApiProperty } from '@nestjs/swagger';

export class AiChatMessageDto {
  @ApiProperty({ format: 'uuid' })
  id: string;
  @ApiProperty({ format: 'uuid' })
  sessionId: string;
  @ApiProperty({ enum: ['user', 'assistant'] })
  role: AiChatMessageRole;
  @ApiProperty()
  content: string;
  @ApiProperty({ type: String, format: 'date-time' })
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
