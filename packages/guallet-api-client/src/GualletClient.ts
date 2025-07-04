import { AdminApi } from "./admin";
import { AccountsApi } from "./accounts";
import { BudgetsApi } from "./budgets";
import { CategoriesApi } from "./categories";
import { ConnectionsApi } from "./connections";
import { InstitutionsApi } from "./institutions";
import { TransactionsApi } from "./transactions";
import { UserApi } from "./user";

export interface GualletClient {
  admin: AdminApi;
  accounts: AccountsApi;
  categories: CategoriesApi;
  connections: ConnectionsApi;
  institutions: InstitutionsApi;
  transactions: TransactionsApi;
  budgets: BudgetsApi;
  user: UserApi;
}

export interface TokenHelper {
  getAccessToken(): Promise<string | null>;
}
/**
 * Creates an instance of GualletClient.
 *
 * @remarks
 * This function is used to create a new GualletClient instance with the provided configuration.
 *
 * @param args - The configuration object for the client.
 * @param args.baseUrl - The base URL for the API.
 * @param args.storage - The storage mechanism for tokens.
 * @param args.tokenHelper - The helper for managing tokens.
 *
 * @returns A new instance of GualletClient.
 *
 * @note This function is necessary due to the current use of Supabase.
 *       It should be removed when Supabase is replaced.
 */
export function createClient({
  baseUrl,
  tokenHelper,
}: {
  baseUrl: string;
  tokenHelper: TokenHelper;
}): GualletClient {
  return new GualletClientImpl({
    baseUrl: baseUrl,
    tokenHelper: tokenHelper,
  });
}

export class GualletClientImpl implements GualletClient {
  private readonly baseUrl: string;
  private readonly tokenHelper: TokenHelper;

  admin: AdminApi;
  accounts: AccountsApi;
  categories: CategoriesApi;
  connections: ConnectionsApi;
  institutions: InstitutionsApi;
  transactions: TransactionsApi;
  budgets: BudgetsApi;
  user: UserApi;

  constructor({
    baseUrl,
    tokenHelper,
  }: {
    baseUrl: string;
    tokenHelper: TokenHelper;
  }) {
    this.baseUrl = baseUrl;
    this.tokenHelper = tokenHelper;

    this.admin = new AdminApi(this);
    this.accounts = new AccountsApi(this);
    this.categories = new CategoriesApi(this);
    this.connections = new ConnectionsApi(this);
    this.institutions = new InstitutionsApi(this);
    this.transactions = new TransactionsApi(this);
    this.budgets = new BudgetsApi(this);
    this.user = new UserApi(this);
  }

  async get<TDto>({
    path,
    options,
  }: {
    path: string;
    options?: RequestInit;
  }): Promise<TDto> {
    return await this.executeRequest<TDto>({
      method: "GET",
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
      method: "POST",
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
      method: "PUT",
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
      method: "PATCH",
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
      method: "DELETE",
      path,
      options,
    });
  }

  async getRawResponse({ path }: { path: string }): Promise<Response> {
    const access_token = await this.tokenHelper.getAccessToken();
    return await fetch(`${this.baseUrl}/${path}`, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        ...(access_token && { Authorization: `Bearer ${access_token}` }),
      },
      ...(access_token && { credentials: "include" }),
    });
  }

  private async executeRequest<TDto, TRequest = any>({
    method,
    path,
    payload,
    options,
  }: {
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    path: string;
    payload?: TRequest;
    options?: RequestInit;
  }): Promise<TDto> {
    const access_token = await this.tokenHelper.getAccessToken();

    const requestOptions: RequestInit = {
      ...options,
      method: method,
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        ...(access_token && { Authorization: `Bearer ${access_token}` }),
      },
      ...(access_token && { credentials: "include" }),
    };

    if (payload) {
      requestOptions.body = JSON.stringify(payload);
    }

    const response = await fetch(`${this.baseUrl}/${path}`, requestOptions);
    this.handleHttpErrors(response);
    const json = await response.json();
    return json as TDto;
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
    public status: number
  ) {
    super(message);
  }
}
