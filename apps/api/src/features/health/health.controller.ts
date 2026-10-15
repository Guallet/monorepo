import { ApiOperation, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { HealthCheck } from '@nestjs/terminus';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @ApiOperation({ summary: 'check' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      required: ['status', 'info', 'error', 'details'],
      properties: {
        status: { type: 'string', enum: ['ok', 'error', 'shutting_down'] },
        info: { type: 'object', nullable: true, additionalProperties: true },
        error: { type: 'object', nullable: true, additionalProperties: true },
        details: { type: 'object', additionalProperties: true },
      },
    },
  })
  @AllowAnonymous()
  @Get()
  @HealthCheck()
  check() {
    return this.healthService.check();
  }
}
