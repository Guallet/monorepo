import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { OpenbankingService } from './openbanking.service';
import { BankJobData, OPENBANKING_QUEUE } from './openbanking.jobs';
@Processor(OPENBANKING_QUEUE, { concurrency: 4 })
export class OpenbankingProcessor extends WorkerHost {
  constructor(private readonly service: OpenbankingService) {
    super();
  }
  async process(job: Job<BankJobData>) {
    try {
      return await this.service.process(job.data);
    } catch {
      throw new Error('Bank provider operation failed');
    }
  }
}
