import { GualletClientImpl } from "./../GualletClient";
import { CreateUserRequest, User } from "./user.models";

const USERS_PATH = "users";

export class UserApi {
  constructor(private readonly client: GualletClientImpl) {}

  async getUserDetails(): Promise<User> {
    return await this.client.get<User>({ path: USERS_PATH });
  }

  async deleteUserAccount(): Promise<User> {
    return await this.client.fetch_delete<User>({ path: USERS_PATH });
  }

  async registerUser(dto: CreateUserRequest): Promise<User> {
    return await this.client.post<User, CreateUserRequest>({
      path: USERS_PATH,
      payload: dto,
    });
  }
}
