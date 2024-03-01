import { AccountDto } from "accounts";

export class GualletClient {
  private baseUrl: string;
  private getTokenFunction: () => Promise<string | null>;

  static createClient(args: {
    baseUrl: string;
    getTokenFunction: () => Promise<string | null>;
  }): GualletClient {
    return new GualletClient({
      baseUrl: args.baseUrl,
      getTokenFunction: args.getTokenFunction,
    });
  }

  constructor(args: {
    baseUrl: string;
    getTokenFunction: () => Promise<string | null>;
  }) {
    this.baseUrl = args.baseUrl;
    this.getTokenFunction = args.getTokenFunction;
  }

  accounts = {
    loadAccounts: async () => {
      return await this.get<AccountDto[]>("accounts");
    },
  };

  async get<TDto>(path: string): Promise<TDto> {
    const access_token = await this.getTokenFunction();
    const response = await fetch(`${this.baseUrl}/${path}`, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });

    this.handleHttpErrors(response);

    return (await response.json()) as TDto;
  }

  async post<TDto, TPayload>(path: string, payload: TPayload): Promise<TDto> {
    const access_token = await this.getTokenFunction();
    const response = await fetch(`${this.baseUrl}/${path}`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify(payload),
    });

    return (await response.json()) as TDto;
  }

  async put<TDto, TPayload>(path: string, payload: TPayload): Promise<TDto> {
    const access_token = await this.getTokenFunction();
    const response = await fetch(`${this.baseUrl}/${path}`, {
      method: "PUT",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify(payload),
    });

    return (await response.json()) as TDto;
  }

  async patch<TDto, TPartialPayload>(
    path: string,
    payload: TPartialPayload
  ): Promise<TDto> {
    const access_token = await this.getTokenFunction();
    const response = await fetch(`${this.baseUrl}/${path}`, {
      method: "PATCH",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify(payload),
    });

    return (await response.json()) as TDto;
  }

  async fetch_delete<TDto>(path: string): Promise<TDto> {
    const access_token = await this.getTokenFunction();
    const response = await fetch(`${this.baseUrl}/${path}`, {
      method: "DELETE",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });

    return (await response.json()) as TDto;
  }

  async getRawResponse(path: string): Promise<Response> {
    const access_token = await this.getTokenFunction();
    return await fetch(`${this.baseUrl}/${path}`, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
  }

  private handleHttpErrors(response: Response) {
    if (!response.ok) {
      throw new ApiError(response.statusText, response.status);
    }
  }
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}
