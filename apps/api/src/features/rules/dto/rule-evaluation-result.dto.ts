export class RuleEvaluationResultDto {
  /**
   * The category ID assigned to the transaction, if any
   */
  categoryId: string | null;

  /**
   * The ID of the rule that matched the transaction, if any
   */
  matchedRuleId: string | null;
}
