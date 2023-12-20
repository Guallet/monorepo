import { post } from "../../core/api/fetchHelper";
import { UserDto } from "../user/api/user.api";

export type CreateUserRequest = {
  name: string;
  email: string;
  profile_src: string;
};

export async function registerUser(dto: CreateUserRequest): Promise<UserDto> {
  const queryPath = `users`;
  return await post<UserDto, CreateUserRequest>(queryPath, dto);
}
