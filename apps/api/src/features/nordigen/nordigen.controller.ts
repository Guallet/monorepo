import { Controller } from '@nestjs/common';
import { NordigenService } from './nordigen.service.js';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Nordigen')
@Controller('nordigen')
export class NordigenController {
  constructor(private readonly nordigenService: NordigenService) {}
}
