import { ApiProperty } from '@nestjs/swagger';
import { SavingGoal } from '../entities/saving-goal.entity';

export class SavingGoalDto {
  @ApiProperty({
    description: 'The id for the saving goal',
  })
  id: string;

  @ApiProperty({ description: 'The name of the saving goal' })
  name: string;

  @ApiProperty({
    description: 'The description of the saving goal',
    nullable: true,
  })
  description?: string;

  @ApiProperty({ description: 'The target amount to be saved' })
  targetAmount: number;

  @ApiProperty({
    description: 'The target date for the saving goal',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  targetDate?: Date;

  @ApiProperty({
    description: 'The account ids used as source for the saving goal',
    type: [String],
  })
  accounts: string[];

  @ApiProperty({
    description: 'The current amount saved (sum of linked account balances)',
  })
  currentAmount: number;

  @ApiProperty({
    description: 'Progress towards the goal as a percentage (0-100)',
  })
  progressPercentage: number;

  @ApiProperty({ description: 'Whether the goal has been reached' })
  isCompleted: boolean;

  @ApiProperty({
    description:
      'Whether the target date has passed without completing the goal',
  })
  isOverdue: boolean;

  @ApiProperty({ description: 'Amount still needed to reach the target' })
  remainingAmount: number;

  @ApiProperty({
    description:
      'Days remaining until the target date, negative if overdue, null if no target date',
    nullable: true,
  })
  daysRemaining: number | null;

  static fromDomain(domain: SavingGoal): SavingGoalDto {
    // TODO: compute currentAmount from linked account balances
    const currentAmount = 0;
    const targetAmount = domain.target_amount;
    const progressPercentage =
      targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
    const isCompleted = progressPercentage >= 100;

    const now = new Date();
    const targetDate = domain.target_date ?? null;
    const isOverdue = targetDate !== null && targetDate < now && !isCompleted;
    const daysRemaining = targetDate
      ? Math.ceil(
          (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        )
      : null;

    return {
      id: domain.id,
      name: domain.name,
      description: domain.description,
      targetAmount: targetAmount,
      targetDate: domain.target_date,
      accounts: domain.accounts,
      currentAmount: currentAmount,
      progressPercentage: progressPercentage,
      isCompleted: isCompleted,
      isOverdue: isOverdue,
      remainingAmount: Math.max(0, targetAmount - currentAmount),
      daysRemaining: daysRemaining,
    };
  }
}
