import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { HEALTH_CHECK_QUEUE } from './health.constants';

@Module({
  imports: [
    TerminusModule,
    BullModule.registerQueue({
      name: HEALTH_CHECK_QUEUE,
    }),
  ],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
