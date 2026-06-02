import { AiModelDto } from '../dto/ai-model.dto';
import { AiProviderAdapter } from './ai-provider-adapter.interface';
import { fetchProviderJson } from './provider-rest.util';

type OpenAiModelsResponse = {
  data?: Array<{
    id: string;
    owned_by?: string;
  }>;
};

export class OpenAiModelsAdapter implements AiProviderAdapter {
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
