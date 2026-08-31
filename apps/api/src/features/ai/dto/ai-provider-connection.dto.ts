import { AiProviderConnection } from '../entities/ai-provider-connection.entity.js';
import { AiProvider } from '../entities/ai-provider.enum.js';

export class AiProviderConnectionDto {
  id: string;
  provider: AiProvider;
  displayName: string;
  hasToken: boolean;
  tokenHint: string | null;
  createdAt: string;
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
