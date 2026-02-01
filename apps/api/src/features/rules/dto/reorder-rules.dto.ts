import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayMaxSize } from 'class-validator';

const MAX_CONDITIONS_PER_RULE = 50;
const MAX_RULES_PER_USER = 1000;

export class ReorderRulesDto {
  @ApiProperty({
    description: 'Array of rule IDs in the desired order',
    example: ['uuid-1', 'uuid-2', 'uuid-3'],
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
  })
  @IsArray()
  @ArrayMaxSize(MAX_CONDITIONS_PER_RULE, {
    message: `Too many conditions. Maximum allowed: ${MAX_CONDITIONS_PER_RULE}`,
  })
  conditionIds: string[];
}
