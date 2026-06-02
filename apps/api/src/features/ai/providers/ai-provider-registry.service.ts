import { BadRequestException, Injectable } from '@nestjs/common';
import { AiProvider } from '../entities/ai-provider.enum';
import { AiProviderAdapter } from './ai-provider-adapter.interface';
import { OpenAiModelsAdapter } from './openai-models.adapter';
import { OpenRouterModelsAdapter } from './openrouter-models.adapter';
import { VercelAiGatewayModelsAdapter } from './vercel-ai-gateway-models.adapter';

@Injectable()
export class AiProviderRegistryService {
  private readonly adapters: Record<AiProvider, AiProviderAdapter> = {
    [AiProvider.OPENAI]: new OpenAiModelsAdapter(),
    [AiProvider.OPENROUTER]: new OpenRouterModelsAdapter(),
    [AiProvider.VERCEL_AI_GATEWAY]: new VercelAiGatewayModelsAdapter(),
  };

  getAdapter(provider: AiProvider): AiProviderAdapter {
    const adapter = this.adapters[provider];
    if (!adapter) {
      throw new BadRequestException(`Unsupported AI provider: ${provider}`);
    }
    return adapter;
  }
}
