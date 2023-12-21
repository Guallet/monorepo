import { getCurrentUserToken } from "@/core/auth/auth.helper";

export async function get<TDto>(path: string): Promise<TDto> {
  const access_token = await getCurrentUserToken();
  const response = await fetch(`${import.meta.env.VITE_API_URL}/${path}`, {
    method: "GET",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
      "Access-Control-Allow-Origin": "*",
    },
  });

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
      "Access-Control-Allow-Origin": "*",
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
      "Access-Control-Allow-Origin": "*",
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
      "Access-Control-Allow-Origin": "*",
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
      "Access-Control-Allow-Origin": "*",
    },
  });

  return (await response.json()) as TDto;
}
