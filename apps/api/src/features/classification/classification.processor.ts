import { hash } from './classification.logic';
import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Interval, Cron } from '@nestjs/schedule';
import { Job, Queue } from 'bullmq';
import { DataSource } from 'typeorm';
import { CLASSIFICATION_QUEUE } from './classification-limits.service';
import { ClassificationService } from './classification.service';

@Injectable()
export class ClassificationDispatcher {
  private readonly logger = new Logger(ClassificationDispatcher.name);
  private running = false;
  constructor(
    private readonly db: DataSource,
    @InjectQueue(CLASSIFICATION_QUEUE) private readonly queue: Queue,
  ) {}
  @Interval(5000)
  async dispatch() {
    if (this.running) return;
    this.running = true;
    try {
      // One outstanding delivery per user. Re-dispatch until the durable ledger
      // is terminal; queue retention is never used as the idempotency guarantee.
      const rows: { id: string; user_id: string }[] = await this.db.query(
        `SELECT DISTINCT ON (w.user_id) w.id, w.user_id FROM classification_work w JOIN users u ON u.id=w.user_id AND u.deleted_at IS NULL WHERE w.status='queued' AND w.available_at <= now() ORDER BY w.user_id, w.created_at, w.id`,
      );
      await Promise.all(
        rows.map((row) =>
          this.queue.add(
            'classify',
            { userId: row.user_id, id: row.id },
            {
              jobId: `classification-${hash(row.user_id)}`,
              removeOnComplete: true,
              removeOnFail: true,
              attempts: 3,
              backoff: { type: 'exponential', delay: 5000 },
            },
          ),
        ),
      );
    } catch {
      this.logger.warn(
        'Classification dispatch unavailable; durable work retained',
      );
    } finally {
      this.running = false;
    }
  }
  @Cron('0 3 * * *')
  async retain() {
    await this.db.query(
      "DELETE FROM transaction_suggestions WHERE status <> 'pending' AND updated_at < now() - interval '12 months'",
    );
    await this.db.query(
      "DELETE FROM classification_work WHERE status <> 'queued' AND updated_at < now() - interval '12 months'",
    );
  }
}
@Processor(CLASSIFICATION_QUEUE, { concurrency: 2 })
export class ClassificationProcessor extends WorkerHost {
  constructor(private readonly service: ClassificationService) {
    super();
  }
  async process(job: Job<{ userId: string; id: string }>) {
    await this.service.processChunk(job.data);
  }
}
