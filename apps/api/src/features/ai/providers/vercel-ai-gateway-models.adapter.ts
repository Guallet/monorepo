import { AiModelDto } from '../dto/ai-model.dto';
import { AiProviderAdapter } from './ai-provider-adapter.interface';
import { fetchProviderJson } from './provider-rest.util';

type VercelAiGatewayModelsResponse = {
  data?: Array<{
    id: string;
    name?: string;
    description?: string;
    type?: string;
    context_window?: number;
    max_tokens?: number;
  }>;
};

export class VercelAiGatewayModelsAdapter implements AiProviderAdapter {
  async validateApiToken(apiToken: string): Promise<void> {
    await fetchProviderJson<{ credits?: unknown }>({
      url: 'https://ai-gateway.vercel.sh/v1/credits',
      apiToken,
    });
  }

  async listModels(apiToken: string): Promise<AiModelDto[]> {
    const response = await fetchProviderJson<VercelAiGatewayModelsResponse>({
      url: 'https://ai-gateway.vercel.sh/v1/models',
      apiToken,
    });

    return (response.data ?? []).map((model) => ({
      id: model.id,
      name: model.name ?? model.id,
      provider: model.type,
      description: model.description,
      contextLength: model.context_window,
      inputModalities: ['text'],
      outputModalities: ['text'],
    }));
  }
}
