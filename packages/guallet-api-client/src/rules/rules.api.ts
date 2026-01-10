import { GualletClientImpl } from "./../GualletClient";
import {
  CreateRuleRequest,
  FieldDefinitionsResponse,
  ReorderConditionsRequest,
  ReorderRulesRequest,
  RuleDto,
  UpdateRuleRequest,
} from "./rules.models";

const RULES_PATH = "rules";

export class RulesApi {
  constructor(private readonly client: GualletClientImpl) {}

  async getAll(): Promise<RuleDto[]> {
    return await this.client.get<RuleDto[]>({ path: RULES_PATH });
  }

  async get(id: string): Promise<RuleDto> {
    return await this.client.get<RuleDto>({
      path: `${RULES_PATH}/${id}`,
    });
  }

  async getFieldDefinitions(): Promise<FieldDefinitionsResponse> {
    return await this.client.get<FieldDefinitionsResponse>({
      path: `${RULES_PATH}/fields`,
    });
  }

  async create(request: CreateRuleRequest): Promise<RuleDto> {
    return await this.client.post<RuleDto, CreateRuleRequest>({
      path: RULES_PATH,
      payload: request,
    });
  }

  async update({
    id,
    dto,
  }: {
    id: string;
    dto: UpdateRuleRequest;
  }): Promise<RuleDto> {
    return await this.client.patch<RuleDto, UpdateRuleRequest>({
      path: `${RULES_PATH}/${id}`,
      payload: dto,
    });
  }

  async delete(id: string): Promise<void> {
    await this.client.fetch_delete<void>({
      path: `${RULES_PATH}/${id}`,
    });
  }

  async reorder(ruleIds: string[]): Promise<RuleDto[]> {
    return await this.client.post<RuleDto[], ReorderRulesRequest>({
      path: `${RULES_PATH}/reorder`,
      payload: { ruleIds },
    });
  }

  async reorderConditions({
    ruleId,
    conditionIds,
  }: {
    ruleId: string;
    conditionIds: string[];
  }): Promise<RuleDto> {
    return await this.client.post<RuleDto, ReorderConditionsRequest>({
      path: `${RULES_PATH}/${ruleId}/conditions/reorder`,
      payload: { conditionIds },
    });
  }
}
