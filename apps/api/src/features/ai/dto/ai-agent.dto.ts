import { ApiProperty } from '@nestjs/swagger';
import { AiAgent } from '../entities/ai-agent.entity';
import { AiProvider } from '../entities/ai-provider.enum';

export class AiAgentDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  connectionId: string;
  @ApiProperty()
  connectionDisplayName: string;
  @ApiProperty({ enum: ['openai', 'openrouter', 'vercel_ai_gateway'] })
  provider: AiProvider;
  @ApiProperty()
  name: string;
  @ApiProperty()
  modelId: string;
  @ApiProperty({ nullable: true })
  modelName: string | null;
  @ApiProperty({ nullable: true })
  customPrompt: string | null;
  @ApiProperty()
  createdAt: string;
  @ApiProperty()
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
