import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { AiChatSession } from './entities/ai-chat-session.entity.js';

export const CHAT_RETENTION_DAYS = 30;

@Injectable()
export class AiChatRetentionService {
  private readonly logger = new Logger(AiChatRetentionService.name);

  constructor(
    @InjectRepository(AiChatSession)
    private readonly sessionRepository: Repository<AiChatSession>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_4AM, {
    name: 'ai-chat-retention',
  })
  async purgeExpiredSessions(): Promise<void> {
    const result = await this.deleteSessionsOlderThan(this.retentionCutoff());
    if (result > 0) {
      this.logger.log(`Deleted ${result} expired AI chat sessions`);
    }
  }

  retentionCutoff(now: Date = new Date()): Date {
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - CHAT_RETENTION_DAYS);
    return cutoff;
  }

  private async deleteSessionsOlderThan(cutoff: Date): Promise<number> {
    // Messages are removed via the session FK cascade.
    const result = await this.sessionRepository.delete({
      updated_at: LessThan(cutoff),
    });
    return result.affected ?? 0;
  }
}
