import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WaitingList } from './waitinglist.entity';
import { WaitingListService } from './waitinglist.service';
import { WaitingListController } from './waitinglist.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WaitingList])],
  providers: [WaitingListService],
  controllers: [WaitingListController],
})
export class WaitingListModule {}
