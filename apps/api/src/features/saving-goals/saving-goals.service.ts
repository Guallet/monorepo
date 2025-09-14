import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateSavingGoalDto } from './dto/create-saving-goal.dto';
import { UpdateSavingGoalDto } from './dto/update-saving-goal.dto';
import { SavingGoal } from './entities/saving-goal.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SavingGoalsService {
  private readonly logger = new Logger(SavingGoalsService.name);

  constructor(
    @InjectRepository(SavingGoal)
    private readonly repository: Repository<SavingGoal>,
  ) {}

  async create({
    userId,
    request,
  }: {
    userId: string;
    request: CreateSavingGoalDto;
  }): Promise<SavingGoal> {
    const savingGoal = this.repository.create({
      userId: userId,
      name: request.name,
      description: request.description,
      target_amount: request.targetAmount,
      target_date: request.targetDate,
      accounts: request.accounts,
      priority: request.priority,
    });
    return await this.repository.save(savingGoal);
  }

  async findAllUserSavingGoals({
    userId,
  }: {
    userId: string;
  }): Promise<SavingGoal[]> {
    return await this.repository.find({ where: { userId } });
  }

  async findByIdForUser({
    id,
    userId,
  }: {
    id: string;
    userId: string;
  }): Promise<SavingGoal> {
    const goal = await this.repository.findOne({
      where: { id: id, userId: userId },
    });
    if (!goal) {
      throw new NotFoundException('Saving goal not found');
    }
    return goal;
  }

  async findById(id: string): Promise<SavingGoal> {
    const goal = await this.repository.findOne({
      where: { id },
    });
    if (!goal) {
      throw new NotFoundException('Saving goal not found');
    }
    return goal;
  }

  async update({
    userId,
    savingGoalId,
    request,
  }: {
    userId: string;
    savingGoalId: string;
    request: UpdateSavingGoalDto;
  }): Promise<SavingGoal> {
    const goal = await this.findByIdForUser({ id: savingGoalId, userId });
    if (!goal) {
      throw new NotFoundException('Saving goal not found');
    }

    this.repository.merge(goal, request);
    return await this.repository.save(goal);
  }

  async remove({
    userId,
    id,
  }: {
    userId: string;
    id: string;
  }): Promise<SavingGoal> {
    const goal = await this.findByIdForUser({ id, userId });
    if (!goal) {
      throw new NotFoundException('Saving goal not found');
    }
    return await this.repository.remove(goal);
  }
}
