import { Controller, Post, Body } from '@nestjs/common';
import { WaitingListService } from './waitinglist.service';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

@Controller('waitinglist')
export class WaitingListController {
  constructor(private readonly waitingListService: WaitingListService) {}

  @AllowAnonymous()
  @Post()
  async addEmail(@Body('email') email: string) {
    return this.waitingListService.addEmail(email);
  }
}
