export type DecisionAuthType = 'none' | 'bearer' | 'header' | 'basic';
export type DecisionConnectionDto = {
  id: string;
  displayName: string;
  baseUrl: string;
  model: string;
  authType: DecisionAuthType;
  authHeaderName: string | null;
  hasCredentials: boolean;
  credentialHint: string | null;
  minConfidence: number;
  minMargin: number;
  sendNotes: boolean;
  isActive: boolean;
  lastTestStatus: string | null;
  lastTestAt: string | null;
};
export type CreateDecisionConnectionRequest = {
  displayName: string;
  baseUrl: string;
  model?: string;
  authType?: DecisionAuthType;
  authHeaderName?: string;
  apiKey?: string;
  headerValue?: string;
  clientId?: string;
  clientSecret?: string;
  minConfidence?: number;
  minMargin?: number;
  sendNotes?: boolean;
  isActive?: boolean;
};
export type UpdateDecisionConnectionRequest =
  Partial<CreateDecisionConnectionRequest>;
export type DecisionTestDto = { ok: boolean; status: string };
export type ClassificationRunRequest =
  | { scope: 'inbox'; transactionIds?: never }
  | { transactionIds: string[]; scope?: never };
export type ClassificationRunDto = {
  runId: string;
  queued: number;
  processed: number;
  suggested: number;
  abstained: number;
  skipped: number;
  failed: number;
  complete: boolean;
};
export type ClassificationStatsDto = {
  accepted: number;
  rejected: number;
  dismissed: number;
  acceptanceRate: number | null;
};
export type TransactionSuggestionDto = {
  id: string;
  source: 'rule' | 'decision_api';
  categoryId: string;
  confidence: number | null;
  ruleId: string | null;
};
