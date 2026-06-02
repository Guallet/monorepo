export const AI_PROVIDERS = [
  'openai',
  'openrouter',
  'vercel_ai_gateway',
] as const;

export type AiProvider = (typeof AI_PROVIDERS)[number];

export type AiProviderConnectionDto = {
  id: string;
  provider: AiProvider;
  displayName: string;
  hasToken: boolean;
  tokenHint: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateAiProviderConnectionRequest = {
  provider: AiProvider;
  displayName: string;
  apiToken: string;
};

export type UpdateAiProviderConnectionRequest = {
  displayName?: string;
  apiToken?: string;
};

export type AiModelDto = {
  id: string;
  name: string;
  provider?: string;
  description?: string;
  contextLength?: number;
  inputModalities?: string[];
  outputModalities?: string[];
};

export type AiAgentDto = {
  id: string;
  connectionId: string;
  connectionDisplayName: string;
  provider: AiProvider;
  name: string;
  modelId: string;
  modelName: string | null;
  customPrompt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateAiAgentRequest = {
  connectionId: string;
  name: string;
  modelId: string;
  modelName?: string;
  customPrompt?: string;
};

export type UpdateAiAgentRequest = {
  connectionId?: string;
  name?: string;
  modelId?: string;
  modelName?: string;
  customPrompt?: string;
};
