import { Controller, Post, Body } from '@nestjs/common';
import { WaitingListService } from './waitinglist.service';
import { Public } from 'src/auth/is-public.decorator';

@Controller('waitinglist')
export class WaitingListController {
  constructor(private readonly waitingListService: WaitingListService) {}

  @Public()
  @Post()
  async addEmail(@Body('email') email: string) {
    return this.waitingListService.addEmail(email);
  }
}
