import { ApiProperty } from '@nestjs/swagger';
import { SavingGoal } from '../entities/saving-goal.entity';

export class SavingGoalDto {
  @ApiProperty({ description: 'The id for the saving goal' })
  id: string;

  @ApiProperty({ description: 'The name of the saving goal' })
  name: string;

  @ApiProperty({
    required: false,
    description: 'The description of the saving goal',
    nullable: true,
  })
  description?: string;

  @ApiProperty({ description: 'The target amount to be saved' })
  targetAmount: number;

  @ApiProperty({
    required: false,
    description: 'The target date for the saving goal',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  targetDate?: Date | null;

  @ApiProperty({
    description: 'The account ids used as source for the saving goal',
    type: [String],
  })
  accounts: string[];

  @ApiProperty({
    description: 'Currency of the linked accounts',
    type: String,
    required: false,
    nullable: true,
  })
  currency?: string | null;

  @ApiProperty({
    description: 'The current amount saved (sum of linked account balances)',
  })
  currentAmount: number;

  @ApiProperty({
    description: 'Progress towards the goal as a percentage (0-100)',
  })
  progressPercentage: number;

  @ApiProperty({
    description: 'Whether the goal has been reached',
  })
  isCompleted: boolean;

  @ApiProperty({
    description:
      'Whether the target date has passed without completing the goal',
  })
  isOverdue: boolean;

  @ApiProperty({
    description: 'Amount still needed to reach the target',
  })
  remainingAmount: number;

  @ApiProperty({
    description:
      'Days remaining until the target date, negative if overdue, null if no target date',
    nullable: true,
    type: Number,
  })
  daysRemaining: number | null;

  static fromDomain(
    domain: SavingGoal,
    currentAmount = 0,
    currency: string | null = null,
  ): SavingGoalDto {
    const targetAmount = domain.target_amount;
    const progressPercentage =
      targetAmount > 0
        ? Math.min(100, Math.max(0, (currentAmount / targetAmount) * 100))
        : 0;
    const isCompleted = progressPercentage >= 100;

    const now = new Date();
    const targetDate = domain.target_date ?? null;
    // Deadlines are calendar dates in the API's UTC date representation.
    const today = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
    );
    const targetDay = targetDate
      ? Date.UTC(
          targetDate.getUTCFullYear(),
          targetDate.getUTCMonth(),
          targetDate.getUTCDate(),
        )
      : null;
    const daysRemaining =
      targetDay === null ? null : (targetDay - today) / (1000 * 60 * 60 * 24);
    const isOverdue =
      daysRemaining !== null && daysRemaining < 0 && !isCompleted;

    return {
      id: domain.id,
      name: domain.name,
      description: domain.description,
      targetAmount: targetAmount,
      targetDate: domain.target_date,
      accounts: domain.accounts,
      currency,
      currentAmount: currentAmount,
      progressPercentage: progressPercentage,
      isCompleted: isCompleted,
      isOverdue: isOverdue,
      remainingAmount: Math.max(0, targetAmount - currentAmount),
      daysRemaining: daysRemaining,
    };
  }
}
