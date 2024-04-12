export interface User {
  name: string;
  email: string;
  profile_src: string;
}

export type CreateUserRequest = {
  name: string;
  email: string;
  profile_src: string;
};
