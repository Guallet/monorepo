import { AiAgent } from '../entities/ai-agent.entity.js';
import { AiProvider } from '../entities/ai-provider.enum.js';
import { ApiProperty } from '@nestjs/swagger';

export class AiAgentDto {
  @ApiProperty({ format: 'uuid' })
  id: string;
  @ApiProperty({ format: 'uuid' })
  connectionId: string;
  @ApiProperty()
  connectionDisplayName: string;
  @ApiProperty({ enum: AiProvider })
  provider: AiProvider;
  @ApiProperty()
  name: string;
  @ApiProperty()
  modelId: string;
  @ApiProperty({ nullable: true })
  modelName: string | null;
  @ApiProperty({ nullable: true })
  customPrompt: string | null;
  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: string;
  @ApiProperty({ type: String, format: 'date-time' })
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
