import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LessThan } from 'typeorm';
import { AiChatRetentionService } from './ai-chat-retention.service.js';
import { AiChatSession } from './entities/ai-chat-session.entity.js';

describe('AiChatRetentionService', () => {
  let service: AiChatRetentionService;

  const mockSessionRepository = {
    delete: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiChatRetentionService,
        {
          provide: getRepositoryToken(AiChatSession),
          useValue: mockSessionRepository,
        },
      ],
    }).compile();

    service = module.get<AiChatRetentionService>(AiChatRetentionService);
    vi.clearAllMocks();
  });

  it('computes a cutoff 30 days in the past', () => {
    const cutoff = service.retentionCutoff(new Date('2026-06-11T12:00:00Z'));

    expect(cutoff.toISOString()).toBe('2026-05-12T12:00:00.000Z');
  });

  it('deletes sessions not updated within the retention window', async () => {
    mockSessionRepository.delete.mockResolvedValue({ affected: 3 });

    await service.purgeExpiredSessions();

    expect(mockSessionRepository.delete).toHaveBeenCalledWith({
      updated_at: LessThan(expect.any(Date) as unknown as Date),
    });
  });
});
