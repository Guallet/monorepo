import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { HealthCheck } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @AllowAnonymous()
  @Get()
  @HealthCheck()
  check() {
    return this.healthService.check();
  }
}
