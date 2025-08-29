import { GualletClientImpl } from "./../GualletClient";
import {
  CreateUserRequest,
  UpdateUserSettingsRequest,
  User,
  UserSettings,
} from "./user.models";

const USERS_PATH = "users";

export class UserApi {
  constructor(private readonly client: GualletClientImpl) {}

  async getUserDetails(): Promise<User> {
    return await this.client.get<User>({ path: USERS_PATH });
  }

  async getUserSettings(): Promise<UserSettings> {
    return await this.client.get<UserSettings>({
      path: `${USERS_PATH}/settings`,
    });
  }

  async updateUserSettings(
    request: UpdateUserSettingsRequest
  ): Promise<UserSettings> {
    return await this.client.patch<UserSettings, UpdateUserSettingsRequest>({
      path: `${USERS_PATH}/settings`,
      payload: request,
    });
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
