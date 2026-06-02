import { GualletClientImpl } from '../GualletClient';
import {
  AiAgentDto,
  AiModelDto,
  AiProviderConnectionDto,
  CreateAiAgentRequest,
  CreateAiProviderConnectionRequest,
  UpdateAiAgentRequest,
  UpdateAiProviderConnectionRequest,
} from './ai.models';

const AI_PATH = 'ai';
const PROVIDER_CONNECTIONS_PATH = `${AI_PATH}/provider-connections`;
const AGENTS_PATH = `${AI_PATH}/agents`;

export class AiApi {
  constructor(private readonly client: GualletClientImpl) {}

  async getProviderConnections(): Promise<AiProviderConnectionDto[]> {
    return await this.client.get<AiProviderConnectionDto[]>({
      path: PROVIDER_CONNECTIONS_PATH,
    });
  }

  async createProviderConnection(
    request: CreateAiProviderConnectionRequest,
  ): Promise<AiProviderConnectionDto> {
    return await this.client.post<
      AiProviderConnectionDto,
      CreateAiProviderConnectionRequest
    >({
      path: PROVIDER_CONNECTIONS_PATH,
      payload: request,
    });
  }

  async updateProviderConnection({
    id,
    request,
  }: {
    id: string;
    request: UpdateAiProviderConnectionRequest;
  }): Promise<AiProviderConnectionDto> {
    return await this.client.patch<
      AiProviderConnectionDto,
      UpdateAiProviderConnectionRequest
    >({
      path: `${PROVIDER_CONNECTIONS_PATH}/${id}`,
      payload: request,
    });
  }

  async deleteProviderConnection(id: string): Promise<AiProviderConnectionDto> {
    return await this.client.fetch_delete<AiProviderConnectionDto>({
      path: `${PROVIDER_CONNECTIONS_PATH}/${id}`,
    });
  }

  async getModels(connectionId: string): Promise<AiModelDto[]> {
    return await this.client.get<AiModelDto[]>({
      path: `${PROVIDER_CONNECTIONS_PATH}/${connectionId}/models`,
    });
  }

  async getAgents(): Promise<AiAgentDto[]> {
    return await this.client.get<AiAgentDto[]>({ path: AGENTS_PATH });
  }

  async createAgent(request: CreateAiAgentRequest): Promise<AiAgentDto> {
    return await this.client.post<AiAgentDto, CreateAiAgentRequest>({
      path: AGENTS_PATH,
      payload: request,
    });
  }

  async updateAgent({
    id,
    request,
  }: {
    id: string;
    request: UpdateAiAgentRequest;
  }): Promise<AiAgentDto> {
    return await this.client.patch<AiAgentDto, UpdateAiAgentRequest>({
      path: `${AGENTS_PATH}/${id}`,
      payload: request,
    });
  }

  async deleteAgent(id: string): Promise<AiAgentDto> {
    return await this.client.fetch_delete<AiAgentDto>({
      path: `${AGENTS_PATH}/${id}`,
    });
  }
}
