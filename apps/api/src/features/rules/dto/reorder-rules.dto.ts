import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayMaxSize } from 'class-validator';
import { MAX_RULES_PER_USER, MAX_CONDITIONS_PER_RULE } from '../constants.js';

export class ReorderRulesDto {
  @ApiProperty({
    description: 'Array of rule IDs in the desired order',
    example: ['uuid-1', 'uuid-2', 'uuid-3'],
    type: [String],
    maxItems: MAX_RULES_PER_USER,
  })
  @IsArray()
  @ArrayMaxSize(MAX_RULES_PER_USER, {
    message: `Too many rules. Maximum allowed: ${MAX_RULES_PER_USER}`,
  })
  ruleIds: string[];
}

export class ReorderConditionsDto {
  @ApiProperty({
    description: 'Array of condition IDs in the desired order',
    example: ['uuid-1', 'uuid-2', 'uuid-3'],
    type: [String],
    maxItems: MAX_CONDITIONS_PER_RULE,
  })
  @IsArray()
  @ArrayMaxSize(MAX_CONDITIONS_PER_RULE, {
    message: `Too many conditions. Maximum allowed: ${MAX_CONDITIONS_PER_RULE}`,
  })
  conditionIds: string[];
}
