import { Controller, Get } from '@nestjs/common';
import { HealthCheck } from '@nestjs/terminus';
import { HealthService } from './health.service.js';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

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
