import { supabase } from "@/auth/supabase";

// TODO: Remove this file and use the gualletClient/hooks instead
export async function getRawResponse(path: string): Promise<Response> {
  const access_token = await getCurrentUserToken();
  return await fetch(`${import.meta.env.VITE_API_URL}/${path}`, {
    method: "GET",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
  });
}

export async function get<TDto>(path: string): Promise<TDto> {
  const access_token = await getCurrentUserToken();
  const response = await fetch(`${import.meta.env.VITE_API_URL}/${path}`, {
    method: "GET",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
  });

  handleHttpErrors(response);

  return (await response.json()) as TDto;
}

export async function post<TDto, TPayload>(
  path: string,
  payload: TPayload
): Promise<TDto> {
  const access_token = await getCurrentUserToken();
  const response = await fetch(`${import.meta.env.VITE_API_URL}/${path}`, {
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

export async function put<TDto, TPayload>(
  path: string,
  payload: TPayload
): Promise<TDto> {
  const access_token = await getCurrentUserToken();
  const response = await fetch(`${import.meta.env.VITE_API_URL}/${path}`, {
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

export async function patch<TDto, TPartialPayload>(
  path: string,
  payload: TPartialPayload
): Promise<TDto> {
  const access_token = await getCurrentUserToken();
  const response = await fetch(`${import.meta.env.VITE_API_URL}/${path}`, {
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

export async function fetch_delete<TDto>(path: string): Promise<TDto> {
  const access_token = await getCurrentUserToken();
  const response = await fetch(`${import.meta.env.VITE_API_URL}/${path}`, {
    method: "DELETE",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
  });

  return (await response.json()) as TDto;
}

function handleHttpErrors(response: Response) {
  if (!response.ok) {
    throw new ApiError(response.statusText, response.status);
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

async function getCurrentUserToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? "";
}
