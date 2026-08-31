import { Controller } from '@nestjs/common';
import { NordigenService } from './nordigen.service.js';

@Controller('nordigen')
export class NordigenController {
  constructor(private readonly nordigenService: NordigenService) {}
}
