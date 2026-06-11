import {
  AiChatMessage,
  AiChatMessageRole,
} from '../entities/ai-chat-message.entity';

export class AiChatMessageDto {
  id: string;
  sessionId: string;
  role: AiChatMessageRole;
  content: string;
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
