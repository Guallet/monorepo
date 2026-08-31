import {
  BadGatewayException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AiCredentialEncryptionService } from './ai-credential-encryption.service.js';
import { AiService } from './ai.service.js';
import { AiAgent } from './entities/ai-agent.entity.js';
import { AiProviderConnection } from './entities/ai-provider-connection.entity.js';
import { AiProvider } from './entities/ai-provider.enum.js';
import { AiProviderRegistryService } from './providers/ai-provider-registry.service.js';
import { ProviderModelListError } from './providers/provider-model-list.error.js';

describe('AiService', () => {
  let service: AiService;

  const mockConnectionRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockAgentRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    delete: jest.fn(),
  };

  const mockCredentialEncryption = {
    encrypt: jest.fn((value: string) => `encrypted:${value}`),
    decrypt: jest.fn((value: string) => value.replace('encrypted:', '')),
  };

  const mockAdapter = {
    validateApiToken: jest.fn(),
    listModels: jest.fn(),
  };

  const mockProviderRegistry = {
    getAdapter: jest.fn().mockReturnValue(mockAdapter),
  };

  const userId = 'user-123';
  const now = new Date('2026-06-02T12:00:00.000Z');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: getRepositoryToken(AiProviderConnection),
          useValue: mockConnectionRepository,
        },
        {
          provide: getRepositoryToken(AiAgent),
          useValue: mockAgentRepository,
        },
        {
          provide: AiCredentialEncryptionService,
          useValue: mockCredentialEncryption,
        },
        {
          provide: AiProviderRegistryService,
          useValue: mockProviderRegistry,
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    jest.clearAllMocks();
    mockProviderRegistry.getAdapter.mockReturnValue(mockAdapter);
    mockAdapter.validateApiToken.mockResolvedValue(undefined);
  });

  it('creates provider connections with encrypted tokens and masked DTOs', async () => {
    const createdConnection = {
      id: 'connection-1',
      user_id: userId,
      provider: AiProvider.OPENAI,
      display_name: 'OpenAI',
      encrypted_token: 'encrypted:sk-test-1234',
      token_hint: '...1234',
      created_at: now,
      updated_at: now,
    };
    mockConnectionRepository.create.mockReturnValue(createdConnection);
    mockConnectionRepository.save.mockResolvedValue(createdConnection);

    const result = await service.createProviderConnection({
      userId,
      dto: {
        provider: AiProvider.OPENAI,
        displayName: 'OpenAI',
        apiToken: 'sk-test-1234',
      },
    });

    expect(mockProviderRegistry.getAdapter).toHaveBeenCalledWith(
      AiProvider.OPENAI,
    );
    expect(mockAdapter.validateApiToken).toHaveBeenCalledWith('sk-test-1234');
    expect(mockCredentialEncryption.encrypt).toHaveBeenCalledWith(
      'sk-test-1234',
    );
    expect(mockConnectionRepository.create).toHaveBeenCalledWith({
      user_id: userId,
      provider: AiProvider.OPENAI,
      display_name: 'OpenAI',
      encrypted_token: 'encrypted:sk-test-1234',
      token_hint: '...1234',
    });
    expect(result).toEqual({
      id: 'connection-1',
      provider: AiProvider.OPENAI,
      displayName: 'OpenAI',
      hasToken: true,
      tokenHint: '...1234',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
  });

  it('rejects provider connections when the API token is not valid', async () => {
    mockAdapter.validateApiToken.mockRejectedValue(
      new ProviderModelListError('Provider returned 401', 401),
    );

    await expect(
      service.createProviderConnection({
        userId,
        dto: {
          provider: AiProvider.OPENAI,
          displayName: 'OpenAI',
          apiToken: 'invalid-token',
        },
      }),
    ).rejects.toThrow(BadRequestException);

    expect(mockCredentialEncryption.encrypt).not.toHaveBeenCalled();
    expect(mockConnectionRepository.create).not.toHaveBeenCalled();
    expect(mockConnectionRepository.save).not.toHaveBeenCalled();
  });

  it('does not update stored tokens when replacement token validation fails', async () => {
    mockConnectionRepository.findOne.mockResolvedValue({
      id: 'connection-1',
      user_id: userId,
      provider: AiProvider.OPENAI,
      display_name: 'OpenAI',
      encrypted_token: 'encrypted:old-token',
      token_hint: '...oken',
    });
    mockAdapter.validateApiToken.mockRejectedValue(
      new ProviderModelListError('Provider returned 403', 403),
    );

    await expect(
      service.updateProviderConnection({
        userId,
        connectionId: 'connection-1',
        dto: {
          apiToken: 'invalid-token',
        },
      }),
    ).rejects.toThrow(BadRequestException);

    expect(mockCredentialEncryption.encrypt).not.toHaveBeenCalled();
    expect(mockConnectionRepository.save).not.toHaveBeenCalled();
  });

  it('lists models through the provider adapter using the decrypted token', async () => {
    mockConnectionRepository.findOne.mockResolvedValue({
      id: 'connection-1',
      user_id: userId,
      provider: AiProvider.OPENROUTER,
      encrypted_token: 'encrypted:openrouter-token',
    });
    mockAdapter.listModels.mockResolvedValue([
      { id: 'openai/gpt-4.1', name: 'GPT-4.1' },
    ]);

    const result = await service.listModels({
      userId,
      connectionId: 'connection-1',
    });

    expect(mockConnectionRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'connection-1', user_id: userId },
    });
    expect(mockProviderRegistry.getAdapter).toHaveBeenCalledWith(
      AiProvider.OPENROUTER,
    );
    expect(mockCredentialEncryption.decrypt).toHaveBeenCalledWith(
      'encrypted:openrouter-token',
    );
    expect(mockAdapter.listModels).toHaveBeenCalledWith('openrouter-token');
    expect(result).toEqual([{ id: 'openai/gpt-4.1', name: 'GPT-4.1' }]);
  });

  it('converts provider model-list failures to BadGatewayException', async () => {
    mockConnectionRepository.findOne.mockResolvedValue({
      id: 'connection-1',
      user_id: userId,
      provider: AiProvider.OPENAI,
      encrypted_token: 'encrypted:openai-token',
    });
    mockAdapter.listModels.mockRejectedValue(
      new ProviderModelListError('Provider returned 401', 401),
    );

    await expect(
      service.listModels({ userId, connectionId: 'connection-1' }),
    ).rejects.toThrow(BadGatewayException);
  });

  it('creates agents only after validating the connection belongs to the user', async () => {
    const connection = {
      id: 'connection-1',
      user_id: userId,
      provider: AiProvider.OPENAI,
      display_name: 'OpenAI',
    };
    const agent = {
      id: 'agent-1',
      user_id: userId,
      connection_id: 'connection-1',
      connection,
      name: 'Categoriser',
      model_id: 'gpt-4.1-mini',
      model_name: 'GPT-4.1 mini',
      custom_prompt: 'Help with transactions',
      created_at: now,
      updated_at: now,
    };
    mockConnectionRepository.findOne.mockResolvedValue(connection);
    mockAgentRepository.create.mockReturnValue(agent);
    mockAgentRepository.save.mockResolvedValue(agent);

    const result = await service.createAgent({
      userId,
      dto: {
        connectionId: 'connection-1',
        name: 'Categoriser',
        modelId: 'gpt-4.1-mini',
        modelName: 'GPT-4.1 mini',
        customPrompt: 'Help with transactions',
      },
    });

    expect(mockConnectionRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'connection-1', user_id: userId },
    });
    expect(result).toMatchObject({
      id: 'agent-1',
      connectionId: 'connection-1',
      connectionDisplayName: 'OpenAI',
      provider: AiProvider.OPENAI,
      name: 'Categoriser',
    });
  });

  it('throws NotFoundException when creating an agent for another user connection', async () => {
    mockConnectionRepository.findOne.mockResolvedValue(null);

    await expect(
      service.createAgent({
        userId,
        dto: {
          connectionId: 'other-user-connection',
          name: 'Categoriser',
          modelId: 'gpt-4.1-mini',
        },
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('deletes dependent agents when deleting a provider connection', async () => {
    const connection = {
      id: 'connection-1',
      user_id: userId,
      provider: AiProvider.OPENAI,
      display_name: 'OpenAI',
      encrypted_token: 'encrypted:token',
      token_hint: '...oken',
      created_at: now,
      updated_at: now,
    };
    mockConnectionRepository.findOne.mockResolvedValue(connection);
    mockConnectionRepository.remove.mockResolvedValue(connection);

    await service.deleteProviderConnection({
      userId,
      connectionId: 'connection-1',
    });

    expect(mockAgentRepository.delete).toHaveBeenCalledWith({
      user_id: userId,
      connection_id: 'connection-1',
    });
    expect(mockConnectionRepository.remove).toHaveBeenCalledWith(connection);
  });
});
