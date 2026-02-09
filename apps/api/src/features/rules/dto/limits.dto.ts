import { ApiProperty } from '@nestjs/swagger';
import {
  MAX_CONDITIONS_PER_RULE,
  MAX_RULES_PER_USER,
  TOO_MANY_CONDITIONS_MESSAGE,
  TOO_MANY_RULES_MESSAGE,
} from '../constants';

export class LimitsDto {
  @ApiProperty({
    description: 'Maximum number of conditions permitted per rule',
    example: MAX_CONDITIONS_PER_RULE,
  })
  maxConditionsPerRule: number;

  @ApiProperty({
    description: 'Maximum number of rules permitted per user',
    example: MAX_RULES_PER_USER,
  })
  maxRulesPerUser: number;

  @ApiProperty({
    description: 'Error message returned when conditions exceed max',
    example: TOO_MANY_CONDITIONS_MESSAGE,
  })
  tooManyConditionsMessage: string;

  @ApiProperty({
    description: 'Error message returned when rules exceed max',
    example: TOO_MANY_RULES_MESSAGE,
  })
  tooManyRulesMessage: string;
}
