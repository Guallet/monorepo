import { fetch_delete, get, patch, post } from "@/api/fetchHelper";

// Types
export interface RuleConditionDto {
  id: string;
  field: string;
  operator: string;
  value: string;
  order: number;
}

export interface RuleDto {
  id: string;
  name: string;
  description: string | null;
  resultCategoryId: string;
  order: number;
  isActive: boolean;
  conditionLogic: "and" | "or";
  conditions: RuleConditionDto[];
}

export interface CreateConditionRequest {
  field: string;
  operator: string;
  value: string;
  order?: number;
}

export interface CreateRuleRequest {
  name: string;
  description?: string;
  resultCategoryId: string;
  conditions: CreateConditionRequest[];
  conditionLogic?: "and" | "or";
  order?: number;
  isActive?: boolean;
}

export interface UpdateRuleRequest {
  name?: string;
  description?: string;
  resultCategoryId?: string;
  conditions?: CreateConditionRequest[];
  conditionLogic?: "and" | "or";
  order?: number;
  isActive?: boolean;
}

export interface FieldDefinition {
  name: string;
  label: string;
  type: string;
  operators: { value: string; label: string }[];
}

export interface FieldDefinitionsResponse {
  fields: FieldDefinition[];
}

export interface EvaluationResult {
  matched: boolean;
  categoryId: string | null;
  matchedRuleId: string | null;
}

// API Functions
export async function loadRules(): Promise<RuleDto[]> {
  return await get<RuleDto[]>("rules");
}

export async function loadRule(id: string): Promise<RuleDto> {
  return await get<RuleDto>(`rules/${id}`);
}

export async function loadFieldDefinitions(): Promise<FieldDefinitionsResponse> {
  return await get<FieldDefinitionsResponse>("rules/fields");
}

export async function createRule(data: CreateRuleRequest): Promise<RuleDto> {
  return await post<RuleDto, CreateRuleRequest>("rules", data);
}

export async function updateRule(
  id: string,
  data: UpdateRuleRequest
): Promise<RuleDto> {
  return await patch<RuleDto, UpdateRuleRequest>(`rules/${id}`, data);
}

export async function deleteRule(id: string): Promise<void> {
  await fetch_delete<void>(`rules/${id}`);
}

export async function reorderRules(ruleIds: string[]): Promise<RuleDto[]> {
  return await post<RuleDto[], { ruleIds: string[] }>("rules/reorder", {
    ruleIds,
  });
}

export async function reorderConditions(
  ruleId: string,
  conditionIds: string[]
): Promise<RuleDto> {
  return await post<RuleDto, { conditionIds: string[] }>(
    `rules/${ruleId}/conditions/reorder`,
    { conditionIds }
  );
}
