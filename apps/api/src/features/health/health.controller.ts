import { Controller, Get } from '@nestjs/common';
import { HealthCheck } from '@nestjs/terminus';
import { HealthService } from './health.service.js';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthCheckResponseDto } from './dto/health-check-response.dto.js';

@Controller('health')
@ApiTags('Health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @AllowAnonymous()
  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check API and dependency health' })
  @ApiOkResponse({ type: HealthCheckResponseDto })
  async check(): Promise<HealthCheckResponseDto> {
    const result = await this.healthService.check();
    return HealthCheckResponseDto.fromResult(result);
  }
}
