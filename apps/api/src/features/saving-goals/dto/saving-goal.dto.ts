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
  })
  targetDate: Date;

  @ApiProperty({
    description: 'The account ids used as source for the saving goal',
    type: [String],
  })
  accounts: string[];

  static fromDomain(domain: SavingGoal): SavingGoalDto {
    return {
      id: domain.id,
      name: domain.name,
      targetAmount: domain.target_amount,
      targetDate: domain.target_date,
      accounts: domain.accounts,
    };
  }
}
