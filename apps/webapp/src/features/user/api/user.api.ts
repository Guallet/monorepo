import { get } from "../../../core/api/fetchHelper";

export interface UserDto {
  name: string;
  email: string;
  profile_src: string;
}

export async function getUserDetails(): Promise<UserDto> {
  const queryPath = `users`;
  return await get<UserDto>(queryPath);
}
