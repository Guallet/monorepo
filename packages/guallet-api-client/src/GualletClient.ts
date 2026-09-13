import { AdminApi } from './admin';
import { AccountsApi } from './accounts';
import { BudgetsApi } from './budgets';
import { CategoriesApi } from './categories';
import { ConnectionsApi } from './connections';
import { InstitutionsApi } from './institutions';
import { TransactionsApi } from './transactions';
import { UserApi } from './user';
import { SavingGoalsApi } from './savingGoals';
import { SubscriptionsApi } from './subscriptions';
import { DataImporterApi } from './data-importer';
import { DataExporterApi } from './data-exporter';
import { NotificationsApi } from './notifications';
import { ReportsApi } from './reports';
import { RulesApi } from './rules';
import { AiApi } from './ai';

export interface GualletClient {
  admin: AdminApi;
  accounts: AccountsApi;
  categories: CategoriesApi;
  connections: ConnectionsApi;
  institutions: InstitutionsApi;
  transactions: TransactionsApi;
  budgets: BudgetsApi;
  user: UserApi;
  savingGoals: SavingGoalsApi;
  subscriptions: SubscriptionsApi;
  dataImporter: DataImporterApi;
  dataExporter: DataExporterApi;
  notifications: NotificationsApi;
  reports: ReportsApi;
  rules: RulesApi;
  ai: AiApi;
}

export interface CookieHelper {
  getCookie(): Promise<string | null> | string | null;
}
/**
 * Creates an instance of GualletClient.
 *
 * @remarks
 * This function is used to create a new GualletClient instance with the provided configuration.
 *
 * @param args - The configuration object for the client.
 * @param args.baseUrl - The base URL for the API.
 * @param args.cookieHelper - The helper for reading a stored session cookie.
 *
 * @returns A new instance of GualletClient.
 *
 */
export function createClient({
  baseUrl,
  cookieHelper,
}: {
  baseUrl: string;
  cookieHelper?: CookieHelper;
}): GualletClient {
  return new GualletClientImpl({
    baseUrl: baseUrl,
    cookieHelper: cookieHelper,
  });
}

export class GualletClientImpl implements GualletClient {
  private readonly baseUrl: string;
  private readonly cookieHelper?: CookieHelper;

  admin: AdminApi;
  accounts: AccountsApi;
  categories: CategoriesApi;
  connections: ConnectionsApi;
  institutions: InstitutionsApi;
  transactions: TransactionsApi;
  budgets: BudgetsApi;
  user: UserApi;
  savingGoals: SavingGoalsApi;
  subscriptions: SubscriptionsApi;
  dataImporter: DataImporterApi;
  dataExporter: DataExporterApi;
  notifications: NotificationsApi;
  reports: ReportsApi;
  rules: RulesApi;
  ai: AiApi;

  constructor({
    baseUrl,
    cookieHelper,
  }: {
    baseUrl: string;
    cookieHelper?: CookieHelper;
  }) {
    this.baseUrl = baseUrl;
    this.cookieHelper = cookieHelper;

    this.admin = new AdminApi(this);
    this.accounts = new AccountsApi(this);
    this.categories = new CategoriesApi(this);
    this.connections = new ConnectionsApi(this);
    this.institutions = new InstitutionsApi(this);
    this.transactions = new TransactionsApi(this);
    this.budgets = new BudgetsApi(this);
    this.user = new UserApi(this);
    this.savingGoals = new SavingGoalsApi(this);
    this.subscriptions = new SubscriptionsApi(this);
    this.dataImporter = new DataImporterApi(this);
    this.dataExporter = new DataExporterApi(this);
    this.notifications = new NotificationsApi(this);
    this.reports = new ReportsApi(this);
    this.rules = new RulesApi(this);
    this.ai = new AiApi(this);
  }

  async get<TDto>({
    path,
    options,
  }: {
    path: string;
    options?: RequestInit;
  }): Promise<TDto> {
    return await this.executeRequest<TDto>({
      method: 'GET',
      path,
      options,
    });
  }

  async post<TDto, TPayload>({
    path,
    payload,
    options,
  }: {
    path: string;
    payload: TPayload;
    options?: RequestInit;
  }): Promise<TDto> {
    return await this.executeRequest<TDto, TPayload>({
      method: 'POST',
      path,
      payload,
      options,
    });
  }

  async put<TDto, TPayload>({
    path,
    payload,
    options,
  }: {
    path: string;
    payload: TPayload;
    options?: RequestInit;
  }): Promise<TDto> {
    return await this.executeRequest<TDto, TPayload>({
      method: 'PUT',
      path,
      payload,
      options,
    });
  }

  async patch<TDto, TPartialPayload>({
    path,
    payload,
    options,
  }: {
    path: string;
    payload: TPartialPayload;
    options?: RequestInit;
  }): Promise<TDto> {
    return await this.executeRequest<TDto, TPartialPayload>({
      method: 'PATCH',
      path,
      payload,
      options,
    });
  }

  async fetch_delete<TDto>({
    path,
    options,
  }: {
    path: string;
    options?: RequestInit;
  }): Promise<TDto> {
    return await this.executeRequest<TDto>({
      method: 'DELETE',
      path,
      options,
    });
  }

  async getRawResponse({ path }: { path: string }): Promise<Response> {
    const headers = await this.getAuthHeaders();
    return await fetch(`${this.baseUrl}/${path}`, {
      method: 'GET',
      mode: 'cors',
      headers,
      credentials: 'include',
    });
  }

  // Used for endpoints that stream their response body (e.g. AI chat); the
  // JSON helpers above consume the body, so callers get the raw Response.
  async postRawResponse<TPayload>({
    path,
    payload,
    signal,
  }: {
    path: string;
    payload: TPayload;
    signal?: AbortSignal;
  }): Promise<Response> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/${path}`, {
      method: 'POST',
      mode: 'cors',
      headers,
      credentials: 'include',
      body: JSON.stringify(payload),
      signal,
    });
    this.handleHttpErrors(response);
    return response;
  }

  private async executeRequest<TDto, TRequest = any>({
    method,
    path,
    payload,
    options,
  }: {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    path: string;
    payload?: TRequest;
    options?: RequestInit;
  }): Promise<TDto> {
    const headers = await this.getAuthHeaders(options?.headers);

    const requestOptions: RequestInit = {
      ...options,
      method: method,
      mode: 'cors',
      headers,
      credentials: 'include',
    };

    if (payload) {
      requestOptions.body = JSON.stringify(payload);
    }

    const response = await fetch(`${this.baseUrl}/${path}`, requestOptions);
    this.handleHttpErrors(response);
    const json = await response.json();
    return json as TDto;
  }

  private async getAuthHeaders(requestHeaders?: HeadersInit): Promise<Headers> {
    const headers = new Headers(requestHeaders);
    headers.set('Content-Type', 'application/json');

    const cookie = await this.cookieHelper?.getCookie();
    if (cookie) {
      headers.set('cookie', cookie);
      return headers;
    }

    return headers;
  }

  private handleHttpErrors(response: Response) {
    if (!response.ok) {
      throw new ApiError(response.statusText, response.status);
    }
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
