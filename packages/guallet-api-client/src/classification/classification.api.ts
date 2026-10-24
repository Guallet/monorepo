import { GualletClientImpl } from '../GualletClient';
import {
  DecisionConnectionDto,
  CreateDecisionConnectionRequest,
  UpdateDecisionConnectionRequest,
  DecisionTestDto,
  ClassificationRunDto,
  ClassificationRunRequest,
  ClassificationStatsDto,
} from './classification.models';
export class ClassificationApi {
  constructor(private readonly client: GualletClientImpl) {}
  getConnections() {
    return this.client.get<DecisionConnectionDto[]>({
      path: 'decision-connections',
    });
  }
  createConnection(payload: CreateDecisionConnectionRequest) {
    return this.client.post<
      DecisionConnectionDto,
      CreateDecisionConnectionRequest
    >({ path: 'decision-connections', payload });
  }
  updateConnection(payload: UpdateDecisionConnectionRequest) {
    return this.client.patch<
      DecisionConnectionDto,
      UpdateDecisionConnectionRequest
    >({ path: 'decision-connections', payload });
  }
  deleteConnection() {
    return this.client.fetch_delete<void>({ path: 'decision-connections' });
  }
  testConnection(payload?: CreateDecisionConnectionRequest) {
    return this.client.post<
      DecisionTestDto,
      CreateDecisionConnectionRequest | undefined
    >({
      path: payload
        ? 'decision-connections/test'
        : 'decision-connections/test-saved',
      payload,
    });
  }
  run(payload: ClassificationRunRequest) {
    return this.client.post<ClassificationRunDto, ClassificationRunRequest>({
      path: 'classification/run',
      payload,
    });
  }
  getRun(id: string) {
    return this.client.get<ClassificationRunDto>({
      path: `classification/runs/${id}`,
    });
  }
  dismiss(id: string) {
    return this.client.post<void, Record<string, never>>({
      path: `classification/suggestions/${id}/dismiss`,
      payload: {},
    });
  }
  stats() {
    return this.client.get<ClassificationStatsDto>({
      path: 'classification/stats',
    });
  }
}
