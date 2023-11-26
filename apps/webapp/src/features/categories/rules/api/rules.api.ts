import { get } from "../../../../core/api/fetchHelper";

export async function loadRules(): Promise<RuleDto[]> {
  return await get<RuleDto[]>("rules");
}

export type RuleDto = {
  id: string;
  order: number;
  name: string;
  description: string;
  conditions: RuleConditionsDto[];
  resultCategoryId: string;
};

export type RuleConditionsDto = {
  field: string;
  operator: string;
  value: string;
};
