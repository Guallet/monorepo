import { getCurrentUserToken } from "../auth/auth.helper";

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
