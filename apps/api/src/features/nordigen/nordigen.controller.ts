import { Controller } from '@nestjs/common';
import { NordigenService } from './nordigen.service';

@Controller('nordigen')
export class NordigenController {
  constructor(private readonly nordigenService: NordigenService) {}
}
