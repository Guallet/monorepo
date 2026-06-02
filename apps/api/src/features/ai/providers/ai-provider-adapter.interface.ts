import { AiModelDto } from '../dto/ai-model.dto';

export interface AiProviderAdapter {
  listModels(apiToken: string): Promise<AiModelDto[]>;
}
