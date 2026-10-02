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

  private precision(code: string): number {
    // Use ISO currency metadata supplied by ICU, including its fallback for legacy codes.
    return (
      new Intl.NumberFormat('en', {
        style: 'currency',
        currency: code,
      }).resolvedOptions().maximumFractionDigits ?? 0
    );
  }

  /** Convert decimal input to integer minor units without binary-float addition. */
  private minorUnits(
    amount: number | string,
    precision: number,
    exact = false,
  ): bigint {
    const text = String(amount);
    const match = /^(-?)(\d+)(?:\.(\d+))?(?:e([+-]?\d+))?$/i.exec(text);
    if (!match) throw new BadRequestException('Invalid monetary amount');
    const fraction = match[3] ?? '';
    const coefficient = BigInt(match[2] + fraction);
    const scale = precision + Number(match[4] ?? 0) - fraction.length;
    let units: bigint;
    if (scale >= 0) {
      units = coefficient * 10n ** BigInt(scale);
    } else {
      const divisor = 10n ** BigInt(-scale);
      const remainder = coefficient % divisor;
      if (exact && remainder !== 0n) {
        throw new BadRequestException(
          `Target amount must have no more than ${precision} decimal places`,
        );
      }
      units = coefficient / divisor;
      if (remainder * 2n >= divisor) units += 1n;
    }
    return match[1] ? -units : units;
  }

  private validateTarget(amount: number, code: string): void {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Target amount must be positive');
    }
    this.minorUnits(amount, this.precision(code), true);
  }

  /** Load user-owned accounts once for an entire goal response. */
  async toDtos(goals: SavingGoal[], userId: string): Promise<SavingGoalDto[]> {
    const ids = [...new Set(goals.flatMap((goal) => goal.accounts))];
    const accounts = ids.length
      ? await this.accountRepository.find({
          where: { user_id: userId, id: In(ids) },
        })
      : [];
    const byId = new Map(accounts.map((account) => [account.id, account]));
    return goals.map((goal) => {
      const linked = [...new Set(goal.accounts)].flatMap((id) => {
        const account = byId.get(id);
        return account ? [account] : [];
      });
      if (new Set(linked.map((account) => account.currency)).size > 1) {
        throw new BadRequestException(
          'Linked accounts must use the same currency',
        );
      }
      const code = linked[0]?.currency ?? null;
      if (!code) return SavingGoalDto.fromDomain(goal, 0, null);
      const precision = this.precision(code);
      const total = linked.reduce(
        (sum, account) => sum + this.minorUnits(account.balance, precision),
        0n,
      );
      const factor = 10 ** precision;
      const dto = SavingGoalDto.fromDomain(goal, Number(total) / factor, code);
      const remaining = this.minorUnits(goal.target_amount, precision) - total;
      dto.remainingAmount = Number(remaining > 0n ? remaining : 0n) / factor;
      return dto;
    });
  }

  async toDto(goal: SavingGoal, userId: string): Promise<SavingGoalDto> {
    return (await this.toDtos([goal], userId))[0];
  }

  async create({
    userId,
    request,
  }: {
    userId: string;
    request: CreateSavingGoalDto;
  }): Promise<SavingGoal> {
    const accounts = await this.ownedAccounts(userId, request.accounts);
    this.validateTarget(request.targetAmount, accounts[0].currency);
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
    if (request.accounts !== undefined || request.targetAmount !== undefined) {
      const accounts = await this.ownedAccounts(
        userId,
        request.accounts ?? goal.accounts,
      );
      this.validateTarget(
        request.targetAmount ?? goal.target_amount,
        accounts[0].currency,
      );
    }
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
