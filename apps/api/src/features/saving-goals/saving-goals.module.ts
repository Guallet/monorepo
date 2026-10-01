import { Module } from '@nestjs/common';
import { SavingGoalsService } from './saving-goals.service';
import { SavingGoalsController } from './saving-goals.controller';
import { SavingGoal } from './entities/saving-goal.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../accounts/entities/account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SavingGoal, Account])],
  controllers: [SavingGoalsController],
  providers: [SavingGoalsService],
  exports: [SavingGoalsService],
})
export class SavingGoalsModule {}
