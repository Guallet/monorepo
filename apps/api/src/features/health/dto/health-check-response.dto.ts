import { ApiProperty } from '@nestjs/swagger';
import type { HealthCheckResult } from '@nestjs/terminus';

export class HealthCheckResponseDto {
  @ApiProperty({ enum: ['error', 'ok', 'degraded', 'shutting_down'] })
  status: HealthCheckResult['status'];

  @ApiProperty({ required: false, type: Object, additionalProperties: true })
  info?: object;

  @ApiProperty({ required: false, type: Object, additionalProperties: true })
  error?: object;

  @ApiProperty({ type: Object, additionalProperties: true })
  details: object;

  static fromResult(result: HealthCheckResult): HealthCheckResponseDto {
    return {
      status: result.status,
      info: result.info,
      error: result.error,
      details: result.details,
    };
  }
}
