import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSavingGoalDto } from './dto/create-saving-goal.dto';
import { UpdateSavingGoalDto } from './dto/update-saving-goal.dto';
import { SavingGoal } from './entities/saving-goal.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Account } from '../accounts/entities/account.entity';
import { SavingGoalDto } from './dto/saving-goal.dto';

@Injectable()
export class SavingGoalsService {
  constructor(
    @InjectRepository(SavingGoal)
    private readonly repository: Repository<SavingGoal>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  private async ownedAccounts(
    userId: string,
    ids: string[],
  ): Promise<Account[]> {
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length === 0 || uniqueIds.length !== ids.length) {
      throw new BadRequestException(
        'Select at least one unique linked account',
      );
    }
    const accounts = await this.accountRepository.find({
      where: { user_id: userId, id: In(uniqueIds) },
    });
    if (accounts.length !== uniqueIds.length) {
      throw new BadRequestException('Select accounts that belong to you');
    }
    if (new Set(accounts.map((account) => account.currency)).size !== 1) {
      throw new BadRequestException(
        'Linked accounts must use the same currency',
      );
    }
    return accounts;
  }

  async toDto(goal: SavingGoal, userId: string): Promise<SavingGoalDto> {
    const accounts = await this.accountRepository.find({
      where: { user_id: userId, id: In(goal.accounts) },
    });
    const currency = accounts[0]?.currency ?? null;
    // Existing goals may have lost a linked account. Never include another user's balance.
    const currentAmount = accounts
      .filter((account) => account.currency === currency)
      .reduce((sum, account) => sum + Number(account.balance), 0);
    return SavingGoalDto.fromDomain(goal, currentAmount, currency);
  }

  async create({
    userId,
    request,
  }: {
    userId: string;
    request: CreateSavingGoalDto;
  }): Promise<SavingGoal> {
    await this.ownedAccounts(userId, request.accounts);
    const savingGoal = this.repository.create({
      userId: userId,
      name: request.name,
      description: request.description,
      target_amount: request.targetAmount,
      target_date: request.targetDate
        ? new Date(request.targetDate)
        : undefined,
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
    if (request.accounts) await this.ownedAccounts(userId, request.accounts);
    if (request.name !== undefined) goal.name = request.name;
    if (request.description !== undefined)
      goal.description = request.description;
    if (request.targetAmount !== undefined)
      goal.target_amount = request.targetAmount;
    if (request.targetDate !== undefined) {
      goal.target_date = request.targetDate
        ? new Date(request.targetDate)
        : null;
    }
    if (request.accounts !== undefined) goal.accounts = request.accounts;
    if (request.priority !== undefined) goal.priority = request.priority;
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
