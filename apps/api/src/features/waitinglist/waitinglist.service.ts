import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WaitingList } from './waitinglist.entity';

@Injectable()
export class WaitingListService {
  private readonly logger = new Logger(WaitingListService.name);

  constructor(
    @InjectRepository(WaitingList)
    private readonly waitingListRepository: Repository<WaitingList>,
  ) {}

  async addEmail(email: string): Promise<void> {
    try {
      const dbEntity = await this.waitingListRepository.findOne({
        where: { email },
      });
      if (dbEntity) {
        this.logger.warn(`Email ${email} already exists in the waiting list.`);
        return;
      }
      // Create a new entry in the waiting list
      const entry = this.waitingListRepository.create({ email });
      await this.waitingListRepository.save(entry);
    } catch (error) {
      this.logger.error(
        `Failed to add email to waiting list: ${error.message}`,
      );
    }
  }
}
