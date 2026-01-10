import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';

export class ReorderRulesDto {
  @ApiProperty({
    description: 'Array of rule IDs in the desired order',
    example: ['uuid-1', 'uuid-2', 'uuid-3'],
  })
  @IsArray()
  ruleIds: string[];
}

export class ReorderConditionsDto {
  @ApiProperty({
    description: 'Array of condition IDs in the desired order',
    example: ['uuid-1', 'uuid-2', 'uuid-3'],
  })
  @IsArray()
  conditionIds: string[];
}
