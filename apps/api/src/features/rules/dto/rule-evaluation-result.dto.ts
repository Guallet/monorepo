import { ApiProperty } from '@nestjs/swagger';

export class RuleEvaluationResultDto {
  /**
   * The category ID assigned to the transaction, if any
   */
  @ApiProperty({ nullable: true })
  categoryId: string | null;

  /**
   * The ID of the rule that matched the transaction, if any
   */
  @ApiProperty({ nullable: true })
  matchedRuleId: string | null;
}
