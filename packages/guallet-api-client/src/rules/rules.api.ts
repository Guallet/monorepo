import { RuleDto, CreateRuleRequest, UpdateRuleRequest } from './rules.models';
import { GualletClientImpl } from './../GualletClient';

const RULES_PATH = 'rules';

export class RulesApi {
  constructor(private readonly client: GualletClientImpl) {}

  async getAll(): Promise<RuleDto[]> {
    return await this.client.get<RuleDto[]>({
      path: RULES_PATH,
    });
  }

  async get(id: string): Promise<RuleDto> {
    return await this.client.get<RuleDto>({
      path: `${RULES_PATH}/${id}`,
    });
  }

  async create(rule: CreateRuleRequest): Promise<RuleDto> {
    return await this.client.post<RuleDto, CreateRuleRequest>({
      path: RULES_PATH,
      payload: rule,
    });
  }

  async update(id: string, rule: UpdateRuleRequest): Promise<RuleDto> {
    return await this.client.patch<RuleDto, UpdateRuleRequest>({
      path: `${RULES_PATH}/${id}`,
      payload: rule,
    });
  }

  async delete(id: string): Promise<void> {
    return await this.client.fetch_delete({
      path: `${RULES_PATH}/${id}`,
    });
  }
}
