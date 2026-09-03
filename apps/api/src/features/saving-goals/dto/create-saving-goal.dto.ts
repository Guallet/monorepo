import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsArray,
  IsUUID,
  IsInt,
  Min,
  ArrayNotEmpty,
} from 'class-validator';

export class CreateSavingGoalDto {
  @ApiProperty({ description: 'The name of the saving goal' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    required: false,
    description: 'The description of the saving goal',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'The target amount to be saved', minimum: 0 })
  @IsNumber()
  @Min(0)
  targetAmount: number;

  @ApiProperty({
    required: false,
    description: 'The target date for the saving goal',
    nullable: true,
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  targetDate?: string;

  @ApiProperty({
    required: false,
    description:
      'The priority of the saving goal (higher number means higher priority)',
    nullable: true,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;

  @ApiProperty({
    description: 'The account ids used as source for the saving goal',
    type: 'array',
    minItems: 1,
    items: { type: 'string', format: 'uuid' },
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(undefined, { each: true })
  accounts: string[];
}
