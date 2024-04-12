import { GualletClient } from "./../GualletClient";
import { CreateUserRequest, User } from "./user.models";

const USERS_PATH = "users";

export class UserApi {
  constructor(private client: GualletClient) {}

  async getUserDetails(): Promise<User> {
    return await this.client.get<User>(USERS_PATH);
  }

  async deleteUserAccount(): Promise<User> {
    return await this.client.fetch_delete<User>(USERS_PATH);
  }

  async registerUser(dto: CreateUserRequest): Promise<User> {
    return await this.client.post<User, CreateUserRequest>(USERS_PATH, dto);
  }
}
