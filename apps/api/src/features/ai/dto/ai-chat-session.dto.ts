import { AiChatSession } from '../entities/ai-chat-session.entity.js';

export class AiChatSessionDto {
  id: string;
  agentId: string;
  agentName: string;
  title: string;
  createdAt: string;
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
