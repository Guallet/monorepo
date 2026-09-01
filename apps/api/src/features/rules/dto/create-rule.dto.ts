import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  ArrayMaxSize,
} from 'class-validator';
import { MAX_CONDITIONS_PER_RULE } from '../constants.js';

export class CreateConditionDto {
  @ApiProperty({
    description: 'The transaction field to evaluate',
    example: 'description',
  })
  @IsString()
  @IsNotEmpty()
  field: string;

  @ApiProperty({
    description: 'The operator to use for evaluation',
    example: 'contains',
  })
  @IsString()
  @IsNotEmpty()
  operator: string;

  @ApiProperty({
    description: 'The value to compare against',
    example: 'Sainsbury',
  })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({
    required: false,
    description: 'The order of the condition within the rule',
    example: 0,
  })
  @IsNumber()
  @IsOptional()
  order?: number;
}

export class CreateRuleDto {
  @ApiProperty({
    description: 'The name of the rule',
    example: 'Grocery stores',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    required: false,
    description: 'A description of what the rule does',
    example: 'Categorize grocery store transactions',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The category ID to assign when the rule matches',
    example: 'uuid-category-id',
  })
  @IsString()
  @IsNotEmpty()
  resultCategoryId: string;

  @ApiProperty({
    description:
      'The conditions to evaluate; how many must match depends on conditionLogic ("and": all must match, "or": at least one must match)',
    type: [CreateConditionDto],
  })
  @IsArray()
  @ArrayMaxSize(MAX_CONDITIONS_PER_RULE, {
    message: `Too many conditions. Maximum allowed: ${MAX_CONDITIONS_PER_RULE}`,
  })
  @ValidateNested({ each: true })
  @Type(() => CreateConditionDto)
  conditions: CreateConditionDto[];

  @ApiProperty({
    required: false,
    description:
      'Logic for combining conditions: "and" (all must match) or "or" (at least one must match)',
    example: 'and',
    default: 'and',
    enum: ['and', 'or'],
  })
  @IsString()
  @IsOptional()
  conditionLogic?: 'and' | 'or';

  @ApiProperty({
    required: false,
    description: 'The order of the rule (lower numbers are evaluated first)',
    example: 0,
  })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiProperty({
    required: false,
    description: 'Whether the rule is active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
