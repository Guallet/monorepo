import { AiModelDto } from '../dto/ai-model.dto.js';
import { AiProviderAdapter } from './ai-provider-adapter.interface.js';
import { fetchProviderJson } from './provider-rest.util.js';

type OpenAiModelsResponse = {
  data?: Array<{
    id: string;
    owned_by?: string;
  }>;
};

export class OpenAiModelsAdapter implements AiProviderAdapter {
  async validateApiToken(apiToken: string): Promise<void> {
    await fetchProviderJson<OpenAiModelsResponse>({
      url: 'https://api.openai.com/v1/models',
      apiToken,
    });
  }

  async listModels(apiToken: string): Promise<AiModelDto[]> {
    const response = await fetchProviderJson<OpenAiModelsResponse>({
      url: 'https://api.openai.com/v1/models',
      apiToken,
    });

    return (response.data ?? []).map((model) => ({
      id: model.id,
      name: model.id,
      provider: model.owned_by,
      inputModalities: ['text'],
      outputModalities: ['text'],
    }));
  }
}
