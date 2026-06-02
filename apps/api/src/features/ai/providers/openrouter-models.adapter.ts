import { AiModelDto } from '../dto/ai-model.dto';
import { AiProviderAdapter } from './ai-provider-adapter.interface';
import { fetchProviderJson } from './provider-rest.util';

type OpenRouterModelsResponse = {
  data?: Array<{
    id: string;
    name?: string;
    description?: string;
    context_length?: number;
    architecture?: {
      input_modalities?: string[];
      output_modalities?: string[];
    };
    top_provider?: {
      context_length?: number;
    };
  }>;
};

export class OpenRouterModelsAdapter implements AiProviderAdapter {
  async listModels(apiToken: string): Promise<AiModelDto[]> {
    const response = await fetchProviderJson<OpenRouterModelsResponse>({
      url: 'https://openrouter.ai/api/v1/models?output_modalities=text',
      apiToken,
    });

    return (response.data ?? []).map((model) => ({
      id: model.id,
      name: model.name ?? model.id,
      description: model.description,
      contextLength:
        model.context_length ?? model.top_provider?.context_length ?? undefined,
      inputModalities: model.architecture?.input_modalities,
      outputModalities: model.architecture?.output_modalities,
    }));
  }
}
