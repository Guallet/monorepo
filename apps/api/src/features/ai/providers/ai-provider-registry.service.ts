import { BadRequestException, Injectable } from '@nestjs/common';
import { AiProvider } from '../entities/ai-provider.enum.js';
import { AiProviderAdapter } from './ai-provider-adapter.interface.js';
import { OpenAiModelsAdapter } from './openai-models.adapter.js';
import { OpenRouterModelsAdapter } from './openrouter-models.adapter.js';
import { VercelAiGatewayModelsAdapter } from './vercel-ai-gateway-models.adapter.js';

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
