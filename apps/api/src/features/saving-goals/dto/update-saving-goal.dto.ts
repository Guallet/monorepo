import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  ArrayNotEmpty,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class UpdateSavingGoalDto {
  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  targetAmount?: number;

  @ApiProperty({ required: false, format: 'date-time', nullable: true })
  @IsOptional()
  @IsDateString()
  targetDate?: string;

  @ApiProperty({ required: false, minimum: 0, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;

  @ApiProperty({
    required: false,
    type: 'array',
    items: { type: 'string', format: 'uuid' },
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(undefined, { each: true })
  accounts?: string[];
}
