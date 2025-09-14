import { ApiProperty } from '@nestjs/swagger';

export class CreateSavingGoalDto {
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
    nullable: true,
  })
  targetDate?: Date;

  @ApiProperty({
    description:
      'The priority of the saving goal (higher number means higher priority)',
    nullable: true,
  })
  priority?: number;

  @ApiProperty({
    description: 'The account ids used as source for the saving goal',
  })
  accounts: string[];
}
