import { AiModelDto } from '../dto/ai-model.dto';

export interface AiProviderAdapter {
  validateApiToken(apiToken: string): Promise<void>;
  listModels(apiToken: string): Promise<AiModelDto[]>;
}
