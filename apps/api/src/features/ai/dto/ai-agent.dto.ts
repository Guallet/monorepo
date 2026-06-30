import { AiAgent } from '../entities/ai-agent.entity';
import { AiProvider } from '../entities/ai-provider.enum';

export class AiAgentDto {
  id: string;
  connectionId: string;
  connectionDisplayName: string;
  provider: AiProvider;
  name: string;
  modelId: string;
  modelName: string | null;
  customPrompt: string | null;
  createdAt: string;
  updatedAt: string;

  static fromDomain(domain: AiAgent): AiAgentDto {
    return {
      id: domain.id,
      connectionId: domain.connection_id,
      connectionDisplayName: domain.connection?.display_name ?? '',
      provider: domain.connection.provider,
      name: domain.name,
      modelId: domain.model_id,
      modelName: domain.model_name,
      customPrompt: domain.custom_prompt,
      createdAt: domain.created_at.toISOString(),
      updatedAt: domain.updated_at.toISOString(),
    };
  }
}
