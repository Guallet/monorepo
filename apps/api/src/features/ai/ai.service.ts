import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiAgentDto } from './dto/ai-agent.dto';
import { AiModelDto } from './dto/ai-model.dto';
import { AiProviderConnectionDto } from './dto/ai-provider-connection.dto';
import { CreateAiAgentDto } from './dto/create-ai-agent.dto';
import { CreateAiProviderConnectionDto } from './dto/create-ai-provider-connection.dto';
import { UpdateAiAgentDto } from './dto/update-ai-agent.dto';
import { UpdateAiProviderConnectionDto } from './dto/update-ai-provider-connection.dto';
import { AiAgent } from './entities/ai-agent.entity';
import { AiProviderConnection } from './entities/ai-provider-connection.entity';
import { AiCredentialEncryptionService } from './ai-credential-encryption.service';
import { AiProviderRegistryService } from './providers/ai-provider-registry.service';
import { ProviderModelListError } from './providers/provider-model-list.error';

@Injectable()
export class AiService {
  constructor(
    @InjectRepository(AiProviderConnection)
    private readonly connectionRepository: Repository<AiProviderConnection>,
    @InjectRepository(AiAgent)
    private readonly agentRepository: Repository<AiAgent>,
    private readonly credentialEncryption: AiCredentialEncryptionService,
    private readonly providerRegistry: AiProviderRegistryService,
  ) {}

  async findProviderConnections(
    userId: string,
  ): Promise<AiProviderConnectionDto[]> {
    const connections = await this.connectionRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });

    return connections.map((connection) =>
      AiProviderConnectionDto.fromDomain(connection),
    );
  }

  async createProviderConnection({
    userId,
    dto,
  }: {
    userId: string;
    dto: CreateAiProviderConnectionDto;
  }): Promise<AiProviderConnectionDto> {
    const connection = this.connectionRepository.create({
      user_id: userId,
      provider: dto.provider,
      display_name: dto.displayName,
      encrypted_token: this.credentialEncryption.encrypt(dto.apiToken),
      token_hint: this.createTokenHint(dto.apiToken),
    });

    return AiProviderConnectionDto.fromDomain(
      await this.connectionRepository.save(connection),
    );
  }

  async updateProviderConnection({
    userId,
    connectionId,
    dto,
  }: {
    userId: string;
    connectionId: string;
    dto: UpdateAiProviderConnectionDto;
  }): Promise<AiProviderConnectionDto> {
    const connection = await this.findProviderConnectionForUser({
      userId,
      connectionId,
    });

    connection.display_name = dto.displayName ?? connection.display_name;

    if (dto.apiToken !== undefined) {
      connection.encrypted_token = this.credentialEncryption.encrypt(
        dto.apiToken,
      );
      connection.token_hint = this.createTokenHint(dto.apiToken);
    }

    return AiProviderConnectionDto.fromDomain(
      await this.connectionRepository.save(connection),
    );
  }

  async deleteProviderConnection({
    userId,
    connectionId,
  }: {
    userId: string;
    connectionId: string;
  }): Promise<AiProviderConnectionDto> {
    const connection = await this.findProviderConnectionForUser({
      userId,
      connectionId,
    });
    await this.agentRepository.delete({
      user_id: userId,
      connection_id: connectionId,
    });
    const removed = await this.connectionRepository.remove(connection);
    return AiProviderConnectionDto.fromDomain(removed);
  }

  async listModels({
    userId,
    connectionId,
  }: {
    userId: string;
    connectionId: string;
  }): Promise<AiModelDto[]> {
    const connection = await this.findProviderConnectionForUser({
      userId,
      connectionId,
    });
    const adapter = this.providerRegistry.getAdapter(connection.provider);
    const apiToken = this.credentialEncryption.decrypt(
      connection.encrypted_token,
    );

    try {
      return await adapter.listModels(apiToken);
    } catch (error) {
      if (error instanceof ProviderModelListError) {
        throw new BadGatewayException(error.message);
      }
      throw error;
    }
  }

  async findAgents(userId: string): Promise<AiAgentDto[]> {
    const agents = await this.agentRepository.find({
      relations: { connection: true },
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });

    return agents.map((agent) => AiAgentDto.fromDomain(agent));
  }

  async createAgent({
    userId,
    dto,
  }: {
    userId: string;
    dto: CreateAiAgentDto;
  }): Promise<AiAgentDto> {
    const connection = await this.findProviderConnectionForUser({
      userId,
      connectionId: dto.connectionId,
    });

    const agent = this.agentRepository.create({
      user_id: userId,
      connection_id: connection.id,
      connection,
      name: dto.name,
      model_id: dto.modelId,
      model_name: dto.modelName ?? null,
      custom_prompt: dto.customPrompt ?? null,
    });

    return AiAgentDto.fromDomain(await this.agentRepository.save(agent));
  }

  async updateAgent({
    userId,
    agentId,
    dto,
  }: {
    userId: string;
    agentId: string;
    dto: UpdateAiAgentDto;
  }): Promise<AiAgentDto> {
    const agent = await this.findAgentForUser({ userId, agentId });

    if (dto.connectionId !== undefined) {
      const connection = await this.findProviderConnectionForUser({
        userId,
        connectionId: dto.connectionId,
      });
      agent.connection = connection;
      agent.connection_id = connection.id;
    }

    agent.name = dto.name ?? agent.name;
    agent.model_id = dto.modelId ?? agent.model_id;
    agent.model_name =
      dto.modelName !== undefined ? dto.modelName : agent.model_name;
    agent.custom_prompt =
      dto.customPrompt !== undefined ? dto.customPrompt : agent.custom_prompt;

    return AiAgentDto.fromDomain(await this.agentRepository.save(agent));
  }

  async deleteAgent({
    userId,
    agentId,
  }: {
    userId: string;
    agentId: string;
  }): Promise<AiAgentDto> {
    const agent = await this.findAgentForUser({ userId, agentId });
    const removed = await this.agentRepository.remove(agent);
    return AiAgentDto.fromDomain(removed);
  }

  private async findProviderConnectionForUser({
    userId,
    connectionId,
  }: {
    userId: string;
    connectionId: string;
  }): Promise<AiProviderConnection> {
    const connection = await this.connectionRepository.findOne({
      where: { id: connectionId, user_id: userId },
    });

    if (!connection) {
      throw new NotFoundException('AI provider connection not found');
    }

    return connection;
  }

  private async findAgentForUser({
    userId,
    agentId,
  }: {
    userId: string;
    agentId: string;
  }): Promise<AiAgent> {
    const agent = await this.agentRepository.findOne({
      relations: { connection: true },
      where: { id: agentId, user_id: userId },
    });

    if (!agent) {
      throw new NotFoundException('AI agent not found');
    }

    return agent;
  }

  private createTokenHint(apiToken: string): string {
    if (apiToken.length <= 4) {
      return 'set';
    }
    return `...${apiToken.slice(-4)}`;
  }
}
