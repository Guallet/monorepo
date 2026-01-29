import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { Public } from 'src/auth/is-public.decorator';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  check() {
    return this.healthService.check();
  }
}
