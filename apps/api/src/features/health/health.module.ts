import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller.js';
import { HealthService } from './health.service.js';
import { HEALTH_CHECK_QUEUE } from './health.constants.js';

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
