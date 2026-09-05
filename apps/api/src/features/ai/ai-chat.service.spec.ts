import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { AiChatService as AiChatServiceType } from './ai-chat.service.js';
import { AiCredentialEncryptionService } from './ai-credential-encryption.service.js';
import { AiFinancialContextService } from './ai-financial-context.service.js';
import { AiAgent } from './entities/ai-agent.entity.js';
import { AiChatMessage } from './entities/ai-chat-message.entity.js';
import { AiChatSession } from './entities/ai-chat-session.entity.js';
import { AiProvider } from './entities/ai-provider.enum.js';
import { vi, type Mock } from 'vitest';

vi.mock('ai', () => ({
  streamText: vi.fn(),
}));

vi.mock('@ai-sdk/openai-compatible', () => ({
  createOpenAICompatible: vi.fn(() => ({
    chatModel: vi.fn((modelId: string) => ({ modelId })),
  })),
}));

const { streamText } = await import('ai');
const { AiChatService } = await import('./ai-chat.service.js');

describe('AiChatService', () => {
  let service: AiChatServiceType;

  const mockSessionRepository = {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn((value: object) => value),
    save: vi.fn(),
    remove: vi.fn(),
    update: vi.fn(),
  };

  const mockMessageRepository = {
    find: vi.fn(),
    findOne: vi.fn(),
    count: vi.fn(),
    create: vi.fn((value: object) => value),
    save: vi.fn(),
    delete: vi.fn(),
  };

  const mockAgentRepository = {
    findOne: vi.fn(),
  };

  const mockCredentialEncryption = {
    decrypt: vi.fn(() => 'decrypted-token'),
  };

  const mockFinancialContext = {
    buildSummary: vi.fn(() => Promise.resolve('{"accounts":[]}')),
  };

  const userId = 'user-123';
  const now = new Date('2026-06-11T12:00:00.000Z');

  const session = {
    id: 'session-1',
    user_id: userId,
    agent_id: 'agent-1',
    title: 'New chat',
    created_at: now,
    updated_at: now,
    agent: {
      id: 'agent-1',
      name: 'Categoriser',
      model_id: 'gpt-4.1-mini',
      custom_prompt: 'Be concise.',
      connection: {
        provider: AiProvider.OPENAI,
        encrypted_token: 'encrypted:token',
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiChatService,
        {
          provide: getRepositoryToken(AiChatSession),
          useValue: mockSessionRepository,
        },
        {
          provide: getRepositoryToken(AiChatMessage),
          useValue: mockMessageRepository,
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
          provide: AiFinancialContextService,
          useValue: mockFinancialContext,
        },
      ],
    }).compile();

    service = module.get<AiChatServiceType>(AiChatService);
    vi.clearAllMocks();
    mockFinancialContext.buildSummary.mockResolvedValue('{"accounts":[]}');
    mockCredentialEncryption.decrypt.mockReturnValue('decrypted-token');
  });

  it('throws NotFoundException when creating a session for another user agent', async () => {
    mockAgentRepository.findOne.mockResolvedValue(null);

    await expect(
      service.createSession({ userId, agentId: 'other-user-agent' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws NotFoundException when reading messages of another user session', async () => {
    mockSessionRepository.findOne.mockResolvedValue(null);

    await expect(
      service.findMessages({ userId, sessionId: 'foreign-session' }),
    ).rejects.toThrow(NotFoundException);

    expect(mockSessionRepository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'foreign-session', user_id: userId },
      }),
    );
  });

  it('deletes the session messages together with the session', async () => {
    mockSessionRepository.findOne.mockResolvedValue(session);

    await service.deleteSession({ userId, sessionId: session.id });

    expect(mockMessageRepository.delete).toHaveBeenCalledWith({
      user_id: userId,
      session_id: session.id,
    });
    expect(mockSessionRepository.remove).toHaveBeenCalledWith(session);
  });

  it('assembles the system prompt as policy, then data block, then custom prompt', () => {
    const prompt = service.buildSystemPrompt({
      summary: '{"accounts":[]}',
      customPrompt: 'Answer in Spanish.',
    });

    const policyIndex = prompt.indexOf('personal finance assistant');
    const dataIndex = prompt.indexOf('<financial_data>');
    const customIndex = prompt.indexOf('Answer in Spanish.');

    expect(policyIndex).toBeGreaterThanOrEqual(0);
    expect(dataIndex).toBeGreaterThan(policyIndex);
    expect(customIndex).toBeGreaterThan(dataIndex);
    expect(prompt).toContain('must not override the rules above');
  });

  it('omits the custom prompt section when the agent has none', () => {
    const prompt = service.buildSystemPrompt({
      summary: '{}',
      customPrompt: null,
    });

    expect(prompt).not.toContain('User customization');
  });

  it('streams a reply without tools, persisting the user message and titling the session', async () => {
    mockSessionRepository.findOne.mockResolvedValue({ ...session });
    mockMessageRepository.count.mockResolvedValue(0);
    mockMessageRepository.find.mockResolvedValue([
      {
        role: 'user',
        content: 'What did I spend on groceries?',
        created_at: now,
      },
    ]);
    const streamResult = { pipeTextStreamToResponse: vi.fn() };
    (streamText as Mock).mockReturnValue(streamResult);

    const result = await service.streamReply({
      userId,
      sessionId: session.id,
      content: 'What did I spend on groceries?',
    });

    expect(result).toBe(streamResult);
    expect(mockMessageRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'user',
        content: 'What did I spend on groceries?',
        session_id: session.id,
      }),
    );
    expect(mockSessionRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'What did I spend on groceries?' }),
    );
    expect(mockCredentialEncryption.decrypt).toHaveBeenCalledWith(
      'encrypted:token',
    );

    const options = (streamText as Mock).mock.calls[0][0];
    expect(options.tools).toBeUndefined();
    expect(options.maxOutputTokens).toBe(1500);
    expect(options.system).toContain('<financial_data>');
    expect(options.messages).toEqual([
      { role: 'user', content: 'What did I spend on groceries?' },
    ]);
  });

  it('persists the assistant message only when the stream finishes', async () => {
    mockSessionRepository.findOne.mockResolvedValue({ ...session });
    mockMessageRepository.count.mockResolvedValue(2);
    mockMessageRepository.find.mockResolvedValue([]);
    (streamText as Mock).mockReturnValue({});

    await service.streamReply({
      userId,
      sessionId: session.id,
      content: 'And last month?',
    });

    const assistantSaves = mockMessageRepository.save.mock.calls.filter(
      ([message]) => message.role === 'assistant',
    );
    expect(assistantSaves).toHaveLength(0);

    const options = (streamText as Mock).mock.calls[0][0];
    await options.onFinish({ text: 'You spent £200.' });

    expect(mockMessageRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'assistant',
        content: 'You spent £200.',
        session_id: session.id,
      }),
    );
  });
});
