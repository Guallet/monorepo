import { Module } from '@nestjs/common';
import { SavingGoalsService } from './saving-goals.service.js';
import { SavingGoalsController } from './saving-goals.controller.js';
import { SavingGoal } from './entities/saving-goal.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([SavingGoal])],
  controllers: [SavingGoalsController],
  providers: [SavingGoalsService],
  exports: [SavingGoalsService],
})
export class SavingGoalsModule {}
