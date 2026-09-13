import { ApiProperty } from '@nestjs/swagger';
import { AiProviderConnection } from '../entities/ai-provider-connection.entity';
import { AiProvider } from '../entities/ai-provider.enum';

export class AiProviderConnectionDto {
  @ApiProperty()
  id: string;
  @ApiProperty({ enum: ['openai', 'openrouter', 'vercel_ai_gateway'] })
  provider: AiProvider;
  @ApiProperty()
  displayName: string;
  @ApiProperty()
  hasToken: boolean;
  @ApiProperty({ nullable: true })
  tokenHint: string | null;
  @ApiProperty()
  createdAt: string;
  @ApiProperty()
  updatedAt: string;

  static fromDomain(domain: AiProviderConnection): AiProviderConnectionDto {
    return {
      id: domain.id,
      provider: domain.provider,
      displayName: domain.display_name,
      hasToken: Boolean(domain.encrypted_token),
      tokenHint: domain.token_hint,
      createdAt: domain.created_at.toISOString(),
      updatedAt: domain.updated_at.toISOString(),
    };
  }
}
