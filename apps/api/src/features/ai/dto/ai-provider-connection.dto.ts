import { AiProviderConnection } from '../entities/ai-provider-connection.entity.js';
import { AiProvider } from '../entities/ai-provider.enum.js';
import { ApiProperty } from '@nestjs/swagger';

export class AiProviderConnectionDto {
  @ApiProperty({ format: 'uuid' })
  id: string;
  @ApiProperty({ enum: AiProvider })
  provider: AiProvider;
  @ApiProperty()
  displayName: string;
  @ApiProperty()
  hasToken: boolean;
  @ApiProperty({ nullable: true })
  tokenHint: string | null;
  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: string;
  @ApiProperty({ type: String, format: 'date-time' })
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
