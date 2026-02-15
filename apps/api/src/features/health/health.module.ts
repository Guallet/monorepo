import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { HEALTH_CHECK_QUEUE } from './health.constants';

@Module({
  imports: [
    BullModule.registerQueue({
      name: HEALTH_CHECK_QUEUE,
    }),
  ],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
