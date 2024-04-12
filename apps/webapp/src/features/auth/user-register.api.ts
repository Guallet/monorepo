import { post } from "@/core/api/fetchHelper";
import { User } from "@guallet/api-client";

export type CreateUserRequest = {
  name: string;
  email: string;
  profile_src: string;
};

export async function registerUser(dto: CreateUserRequest): Promise<User> {
  const queryPath = `users`;
  return await post<User, CreateUserRequest>(queryPath, dto);
}
