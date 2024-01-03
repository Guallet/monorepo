import { fetch_delete, get } from "@/core/api/fetchHelper";

export interface UserDto {
  name: string;
  email: string;
  profile_src: string;
}

export async function getUserDetails(): Promise<UserDto> {
  const queryPath = `users`;
  return await get<UserDto>(queryPath);
}

export async function deleteUserAccount(): Promise<UserDto> {
  return await fetch_delete<UserDto>(`users`);
}
